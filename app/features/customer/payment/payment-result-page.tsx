import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'

import { bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import { fetchPayment, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import type { PaymentRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import {
  PaymentShell,
  paymentPanel,
  paymentStatusTone,
  primaryAction,
  secondaryAction
} from './components/payment-shell'

export type PaymentOutcome = 'success' | 'failure'
const FAILURE_REASONS = ['CUSTOMER_DECLINED', 'BOOKING_NOT_CONFIRMABLE', 'EXPIRED', 'UNKNOWN'] as const
const POLL_MS = 2000

function failureReason(payment: PaymentRecord) {
  if (payment.status === 'EXPIRED') return 'EXPIRED'
  return FAILURE_REASONS.find((reason) => reason === payment.failureReason) ?? 'UNKNOWN'
}

/** Where the gateway returns the customer; it reads the payment and the booking it confirmed. */
export function PaymentResultPage({ paymentId, outcome }: { paymentId: string; outcome: PaymentOutcome }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const copy = outcome === 'success' ? 'success' : 'failure'
  useDocumentTitle(t(`customer.payment.${copy}.documentTitle`))

  const payment = useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => fetchPayment(paymentId),
    retry: false,
    // A real gateway can return before the IPN arrives, so a pending payment is read again.
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? POLL_MS : false)
  })
  const bookingId = payment.data?.bookingId ?? ''
  const booking = useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    enabled: Boolean(bookingId),
    retry: false
  })

  const data = payment.data
  if (data && outcome === 'success' && data.status !== 'SUCCESS' && data.status !== 'PENDING')
    return <Navigate replace to={`/customer/payments/${paymentId}/failure`} />
  if (data && outcome === 'failure' && data.status === 'SUCCESS')
    return <Navigate replace to={`/customer/payments/${paymentId}/success`} />

  const bookingLink = bookingId ? `/customer/bookings/${bookingId}` : '/customer/bookings'
  const canRetry = booking.data?.status === 'AWAITING_DEPOSIT'
  return (
    <PaymentShell
      bookingCode={booking.data?.bookingCode}
      bookingId={bookingId || undefined}
      crumb={t(`customer.payment.${copy}.title`)}
      subtitle={t(`customer.payment.${copy}.subtitle`)}
      title={t(`customer.payment.${copy}.title`)}
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
        <section aria-labelledby='payment-result' className={`${paymentPanel} mx-auto flex max-w-2xl flex-col gap-6`}>
          <div className='flex items-start gap-4'>
            <Icon
              className={`text-5xl ${outcome === 'success' ? 'text-[#075b31]' : 'text-[#ba1a1a]'}`}
              filled
              name={outcome === 'success' ? 'check_circle' : 'error'}
            />
            <div className='min-w-0'>
              <h2 className='text-xl font-bold' id='payment-result'>
                {data.status === 'PENDING' ? t('customer.payment.success.pending') : t(`payment.status.${data.status}`)}
              </h2>
              <p className='mt-1 text-sm leading-6 text-[#5e7063]'>
                {outcome === 'success'
                  ? data.paidAt
                    ? t('customer.payment.success.paidAt', { time: formatDateTime(data.paidAt, language) })
                    : null
                  : t(`customer.payment.failure.reasons.${failureReason(data)}`)}
              </p>
            </div>
          </div>

          <dl className='flex flex-col gap-3 rounded-xl bg-[#f5f9f4] p-4 text-sm'>
            <div className='flex justify-between gap-3'>
              <dt className='text-[#637469]'>{t('customer.payment.amount')}</dt>
              <dd className='text-lg font-extrabold text-[#075b31] tabular-nums'>
                {formatMoney(data.amount, language)}
              </dd>
            </div>
            <div className='flex justify-between gap-3'>
              <dt className='text-[#637469]'>{t('customer.payment.reference')}</dt>
              <dd className='flex items-center gap-2 font-semibold tabular-nums'>
                {data.id.slice(0, 8).toUpperCase()}
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${paymentStatusTone[data.status]}`}>
                  {t(`payment.status.${data.status}`)}
                </span>
              </dd>
            </div>
            {booking.data ? (
              <div className='flex justify-between gap-3'>
                <dt className='text-[#637469]'>{t('customer.payment.booking')}</dt>
                <dd className='flex items-center gap-2 font-semibold'>
                  #{booking.data.bookingCode}
                  <BookingStatusBadge status={booking.data.status} />
                </dd>
              </div>
            ) : null}
          </dl>

          {outcome === 'success' && data.status === 'SUCCESS' ? (
            <p className='text-sm leading-6 text-[#415548]'>
              <strong className='font-bold'>{t('customer.payment.success.next')}: </strong>
              {t('customer.payment.success.nextSteps')}
            </p>
          ) : null}
          {outcome === 'failure' && canRetry ? (
            <p className='text-sm leading-6 text-[#415548]'>{t('customer.payment.failure.retryHint')}</p>
          ) : null}

          <div className='flex flex-col gap-3 sm:flex-row'>
            {outcome === 'failure' && canRetry ? (
              <Link className={primaryAction} to={`/customer/bookings/${bookingId}/deposit`}>
                {t('customer.payment.failure.retry')}
                <Icon className='text-lg transition-transform duration-300 group-hover:translate-x-1' name='refresh' />
              </Link>
            ) : null}
            <Link className={outcome === 'success' ? primaryAction : secondaryAction} to={bookingLink}>
              {outcome === 'success' ? t('customer.payment.success.view') : t('customer.payment.backToBooking')}
              {outcome === 'success' ? (
                <Icon
                  className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                  name='arrow_forward'
                />
              ) : null}
            </Link>
          </div>
        </section>
      ) : null}
    </PaymentShell>
  )
}
