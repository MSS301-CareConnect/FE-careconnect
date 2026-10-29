import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { bookingErrorKey, formatDateTime, formatDay, formatMoney, shortTime } from '~/entities/booking/booking-format'
import {
  paymentErrorKey,
  redirectToCheckout,
  startDepositCheckout,
  useDepositAmount
} from '~/entities/payment/payment-api'
import { RefundPolicySummary } from '~/entities/payment/refund-policy'
import { AssignedCaregiverCard } from '~/entities/provider/assigned-caregiver-card'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { PaymentShell, paymentPanel, primaryAction, secondaryAction } from './components/payment-shell'

/** Opens a VNPay deposit checkout for a booking awaiting its deposit and hands over to the VNPay page. */
export function DepositPage({ bookingId }: { bookingId: string }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const booking = useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    retry: false
  })
  // PaymentService keeps one live session per booking: opening again expires the previous one.
  const pay = useMutation({
    mutationFn: () => startDepositCheckout(bookingId),
    onSuccess: (checkout) => redirectToCheckout(checkout.checkoutUrl)
  })
  // PaymentService decides the charged amount when the session opens; this is what the customer sees first.
  const deposit = useDepositAmount(booking.data)
  useDocumentTitle(t('customer.payment.deposit.documentTitle', { code: booking.data?.bookingCode ?? '' }))

  const data = booking.data
  return (
    <PaymentShell
      bookingCode={data?.bookingCode}
      bookingId={bookingId}
      crumb={t('customer.payment.deposit.crumb')}
      subtitle={t('customer.payment.deposit.subtitle')}
      title={t('customer.payment.deposit.title')}
    >
      {booking.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.payment.loading')}
        </p>
      ) : null}
      {booking.isError ? (
        <p className='rounded-xl bg-error-container p-4 text-sm text-on-error-container' role='alert'>
          {t(bookingErrorKey(booking.error))}
        </p>
      ) : null}

      {data && data.status !== 'AWAITING_DEPOSIT' ? (
        <section className={`${paymentPanel} flex flex-col items-start gap-3`}>
          <h2 className='text-xl font-bold'>{t('customer.payment.deposit.notAwaiting')}</h2>
          <p className='text-sm text-on-surface-variant'>
            {t('customer.payment.deposit.notAwaitingHint', { status: t(`booking.status.${data.status}`) })}
          </p>
          <Link className={secondaryAction} to={`/customer/bookings/${bookingId}`}>
            {t('customer.payment.backToBooking')}
          </Link>
        </section>
      ) : null}

      {data && data.status === 'AWAITING_DEPOSIT' ? (
        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8'>
          <div className={`${paymentPanel} flex flex-col divide-y divide-outline-variant/60`}>
            <div className='pb-6'>
              <AssignedCaregiverCard
                caregiverId={data.caregiverId}
                profileHref={data.caregiverId ? `/customer/caregivers/${data.caregiverId}` : undefined}
              />
            </div>
            <div className='py-6'>
              <RefundPolicySummary centerId={data.centerId} />
            </div>
            <section aria-labelledby='deposit-method' className='pt-6'>
              <h2 className='flex items-center gap-2 text-lg font-bold' id='deposit-method'>
                <Icon className='text-[22px] text-primary' name='payments' />
                {t('customer.payment.deposit.method')}
              </h2>
              <p className='mt-1 text-sm leading-6 text-on-surface-variant'>
                {t('customer.payment.deposit.methodHint')}
              </p>
              {deposit.estimated ? (
                <p className='mt-3 text-sm leading-6 text-on-surface-variant'>
                  {t('customer.payment.deposit.exactAmount')}
                </p>
              ) : null}
              <p className='mt-5 flex items-start gap-2 rounded-xl bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant'>
                <Icon className='text-lg text-primary' name='verified_user' />
                {t('customer.payment.deposit.policy')}
              </p>
            </section>
          </div>

          <aside aria-labelledby='deposit-summary' className={`${paymentPanel} flex flex-col gap-5 lg:sticky lg:top-6`}>
            <div>
              <h2 className='text-sm font-semibold text-on-surface-variant' id='deposit-summary'>
                {deposit.estimated
                  ? t('customer.payment.deposit.amountEstimatedLabel')
                  : t('customer.payment.deposit.amountLabel')}
              </h2>
              <p className='mt-1 text-4xl font-extrabold tracking-[-0.045em] text-primary tabular-nums'>
                {deposit.amount !== undefined ? formatMoney(deposit.amount, language) : '—'}
              </p>
              {data.depositDueAt ? (
                <p className='mt-2 flex items-center gap-1.5 text-sm font-semibold text-warning'>
                  <Icon className='text-lg' name='schedule' />
                  {t('customer.payment.deposit.dueAt', { time: formatDateTime(data.depositDueAt, language) })}
                </p>
              ) : null}
            </div>

            <dl className='flex flex-col gap-2.5 rounded-xl bg-surface-container-low p-4 text-sm'>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t('customer.payment.deposit.patient')}</dt>
                <dd className='text-right font-semibold'>{data.recipientSnapshot?.fullName ?? '—'}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t('customer.payment.deposit.schedule')}</dt>
                <dd className='text-right font-semibold'>
                  {formatDay(data.startDate, language)}
                  {data.endDate && data.endDate !== data.startDate ? ` – ${formatDay(data.endDate, language)}` : ''}
                  <span className='block font-normal text-on-surface-variant'>
                    {shortTime(data.startTime)}–{shortTime(data.endTime)}
                  </span>
                </dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t('customer.payment.deposit.visits')}</dt>
                <dd className='font-semibold tabular-nums'>{data.occurrences?.length ?? 0}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t('customer.payment.deposit.total')}</dt>
                <dd className='font-semibold tabular-nums'>{formatMoney(data.totalAmount, language)}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t('customer.payment.deposit.remaining')}</dt>
                <dd className='font-semibold tabular-nums'>
                  {deposit.amount !== undefined
                    ? formatMoney(Math.max(0, (data.totalAmount ?? 0) - deposit.amount), language)
                    : '—'}
                </dd>
              </div>
            </dl>

            {pay.isError ? (
              <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
                {t(paymentErrorKey(pay.error))}
              </p>
            ) : null}
            <button
              className={primaryAction}
              disabled={pay.isPending || deposit.isPending}
              onClick={() => pay.mutate()}
              type='button'
            >
              {pay.isPending
                ? t('customer.payment.deposit.paying')
                : deposit.amount !== undefined && !deposit.estimated
                  ? t('customer.payment.deposit.pay', { amount: formatMoney(deposit.amount, language) })
                  : t('customer.payment.deposit.payNoAmount')}
              <Icon
                className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                name='arrow_forward'
              />
            </button>
            <Link
              className='text-center text-sm font-bold text-primary underline-offset-4 hover:underline'
              to={`/customer/bookings/${bookingId}`}
            >
              {t('customer.payment.backToBooking')}
            </Link>
          </aside>
        </div>
      ) : null}
    </PaymentShell>
  )
}
