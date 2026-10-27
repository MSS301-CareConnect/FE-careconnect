import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import { fetchPayment, paymentErrorKey, paymentKeys, submitDemoPayment } from '~/entities/payment/payment-api'
import type { PaymentDemoResultRequestOutcome } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import {
  PaymentShell,
  paymentPanel,
  paymentStatusTone,
  primaryAction,
  secondaryAction
} from './components/payment-shell'

const CONFIRMATION_FAILED = 6205

function errorCode(error: unknown) {
  const info = typeof error === 'object' && error !== null && 'info' in error ? error.info : undefined
  return typeof info === 'object' && info !== null && 'code' in info ? info.code : undefined
}

/**
 * Stands in for the VNPay page during development. The dev server records the result and, on success,
 * confirms the deposit at BookingService the way PaymentService does after an IPN.
 */
export function PaymentGatewayPage({ paymentId }: { paymentId: string }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  useDocumentTitle(t('customer.payment.gateway.documentTitle'))

  const payment = useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => fetchPayment(paymentId),
    retry: false
  })
  const bookingId = payment.data?.bookingId ?? ''
  const booking = useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    enabled: Boolean(bookingId),
    retry: false
  })

  function finish(outcome: 'success' | 'failure') {
    void queryClient.invalidateQueries({ queryKey: paymentKeys.detail(paymentId) })
    void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    navigate(`/customer/payments/${paymentId}/${outcome}`, { replace: true })
  }
  const submit = useMutation({
    mutationFn: (outcome: PaymentDemoResultRequestOutcome) => submitDemoPayment(paymentId, outcome),
    onSuccess: (result) => finish(result.status === 'SUCCESS' ? 'success' : 'failure'),
    // BookingService refusing the deposit leaves the payment failed, which the failure page explains.
    onError: (error) => {
      if (errorCode(error) === CONFIRMATION_FAILED) finish('failure')
    }
  })

  const data = payment.data
  const pending = data?.status === 'PENDING'
  return (
    <PaymentShell
      bookingCode={booking.data?.bookingCode}
      bookingId={bookingId || undefined}
      crumb={t('customer.payment.gateway.title')}
      subtitle={t('customer.payment.gateway.subtitle')}
      title={t('customer.payment.gateway.title')}
    >
      {payment.isPending ? (
        <p className='text-sm text-[#637469]' role='status'>
          {t('customer.payment.loading')}
        </p>
      ) : null}
      {payment.isError ? (
        <p className='rounded-xl bg-[#fdecea] p-4 text-sm text-[#93000a]' role='alert'>
          {t(paymentErrorKey(payment.error))}
        </p>
      ) : null}

      {data ? (
        <section aria-labelledby='gateway-order' className={`${paymentPanel} mx-auto max-w-xl`}>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='flex items-center gap-2 text-lg font-bold' id='gateway-order'>
              <Icon className='text-[22px] text-[#075b31]' name='lock' />
              {t('customer.payment.gateway.merchantName')}
            </h2>
            <span className={`rounded-md px-2 py-1 text-xs font-bold ${paymentStatusTone[data.status]}`}>
              {t(`payment.status.${data.status}`)}
            </span>
          </div>
          <dl className='mt-5 flex flex-col gap-3 text-sm'>
            <div className='flex justify-between gap-3'>
              <dt className='text-[#637469]'>{t('customer.payment.gateway.merchant')}</dt>
              <dd className='font-semibold'>{t('customer.payment.gateway.merchantName')}</dd>
            </div>
            <div className='flex justify-between gap-3'>
              <dt className='text-[#637469]'>{t('customer.payment.gateway.orderInfo')}</dt>
              <dd className='text-right font-semibold'>
                {t('customer.payment.gateway.orderValue', { code: booking.data?.bookingCode ?? '' })}
              </dd>
            </div>
            <div className='flex justify-between gap-3'>
              <dt className='text-[#637469]'>{t('customer.payment.reference')}</dt>
              <dd className='font-semibold tabular-nums'>{data.id.slice(0, 8).toUpperCase()}</dd>
            </div>
            <div className='flex items-baseline justify-between gap-3 rounded-xl bg-[#f5f9f4] p-4'>
              <dt className='font-semibold'>{t('customer.payment.gateway.amount')}</dt>
              <dd className='text-3xl font-extrabold tracking-[-0.04em] text-[#075b31] tabular-nums'>
                {formatMoney(data.amount, language)}
              </dd>
            </div>
          </dl>
          {data.expiresAt && pending ? (
            <p className='mt-3 text-sm text-[#637469]'>
              {t('customer.payment.gateway.expiresAt', { time: formatDateTime(data.expiresAt, language) })}
            </p>
          ) : null}

          {submit.isError && errorCode(submit.error) !== CONFIRMATION_FAILED ? (
            <p className='mt-5 rounded-xl bg-[#fdecea] p-3 text-sm text-[#93000a]' role='alert'>
              {t(paymentErrorKey(submit.error))}
            </p>
          ) : null}

          {pending ? (
            <div className='mt-6 grid gap-3 sm:grid-cols-2'>
              <button
                className={primaryAction}
                disabled={submit.isPending}
                onClick={() => submit.mutate('SUCCESS')}
                type='button'
              >
                <Icon className='text-lg' name='check_circle' />
                {submit.isPending && submit.variables === 'SUCCESS'
                  ? t('customer.payment.gateway.processing')
                  : t('customer.payment.gateway.succeed')}
              </button>
              <button
                className={secondaryAction}
                disabled={submit.isPending}
                onClick={() => submit.mutate('FAILED')}
                type='button'
              >
                <Icon className='text-lg' name='cancel' />
                {submit.isPending && submit.variables === 'FAILED'
                  ? t('customer.payment.gateway.processing')
                  : t('customer.payment.gateway.fail')}
              </button>
            </div>
          ) : (
            <div className='mt-6 flex flex-col items-start gap-3'>
              <p className='text-sm text-[#5e7063]'>{t('customer.payment.gateway.ended')}</p>
              <Link
                className={secondaryAction}
                to={`/customer/payments/${paymentId}/${data.status === 'SUCCESS' ? 'success' : 'failure'}`}
              >
                {t('customer.payment.gateway.viewResult')}
              </Link>
            </div>
          )}
        </section>
      ) : null}
    </PaymentShell>
  )
}
