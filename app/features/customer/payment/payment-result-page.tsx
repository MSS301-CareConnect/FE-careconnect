import { useEffect, useState } from 'react'
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
type ResultState = 'pending' | 'success' | 'failure'
const POLL_MS = 2000
// The IPN normally lands within seconds; after this the page stops polling and points to the payments list.
const POLL_LIMIT_MS = 60_000

const stateIcon = {
  pending: { name: 'hourglass_top', className: 'text-info' },
  success: { name: 'check_circle', className: 'text-primary' },
  failure: { name: 'error', className: 'text-error' }
} as const

function failureReason(payment: PaymentRecord) {
  if (payment.status === 'EXPIRED' || payment.status === 'CANCELLED') return 'EXPIRED'
  if (payment.status === 'FAILED') return 'DECLINED'
  return 'UNKNOWN'
}

function resultState(payment: PaymentRecord): ResultState {
  if (payment.status === 'PENDING') return 'pending'
  return payment.status === 'SUCCESS' ? 'success' : 'failure'
}

/** Where the VNPay return lands; it polls the payment (the IPN records it) and shows the booking it paid for. */
export function PaymentResultPage({ paymentId, outcome }: { paymentId: string; outcome: PaymentOutcome }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const [timedOut, setTimedOut] = useState(false)

  const payment = useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => fetchPayment(paymentId),
    retry: false,
    // A real gateway can return before the IPN arrives, so a pending payment is read again until the limit.
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' && !timedOut ? POLL_MS : false)
  })
  const data = payment.data
  const waiting = data?.status === 'PENDING'
  useEffect(() => {
    if (!waiting || timedOut) return
    const timer = window.setTimeout(() => setTimedOut(true), POLL_LIMIT_MS)
    return () => window.clearTimeout(timer)
  }, [waiting, timedOut])

  const bookingId = data?.bookingId ?? ''
  const booking = useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    enabled: Boolean(bookingId),
    retry: false
  })

  // The status, not the gateway's return route, decides what the customer reads.
  const state: ResultState = data ? resultState(data) : outcome === 'success' ? 'pending' : 'failure'
  const remaining = data?.paymentType === 'REMAINING'
  const header =
    state === 'pending'
      ? { title: t('customer.payment.pending.title'), subtitle: t('customer.payment.pending.subtitle') }
      : state === 'success'
        ? remaining
          ? {
              title: t('customer.payment.success.invoiceTitle'),
              subtitle: t('customer.payment.success.invoiceSubtitle')
            }
          : { title: t('customer.payment.success.title'), subtitle: t('customer.payment.success.subtitle') }
        : {
            title: t('customer.payment.failure.title'),
            subtitle: remaining ? t('customer.payment.failure.invoiceSubtitle') : t('customer.payment.failure.subtitle')
          }
  useDocumentTitle(t(`customer.payment.${state}.documentTitle`))

  if (data && outcome === 'success' && state === 'failure')
    return <Navigate replace to={`/customer/payments/${paymentId}/failure`} />
  if (data && outcome === 'failure' && state === 'success')
    return <Navigate replace to={`/customer/payments/${paymentId}/success`} />

  const bookingLink = bookingId ? `/customer/bookings/${bookingId}` : '/customer/bookings'
  const canRetry = remaining || booking.data?.status === 'AWAITING_DEPOSIT'
  const retryLink = remaining ? '/customer/payments' : `/customer/bookings/${bookingId}/deposit`
  function checkAgain() {
    setTimedOut(false)
    void payment.refetch()
  }
  return (
    <PaymentShell
      bookingCode={booking.data?.bookingCode}
      bookingId={bookingId || undefined}
      crumb={header.title}
      subtitle={header.subtitle}
      title={header.title}
    >
      {payment.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.payment.loading')}
        </p>
      ) : null}
      {payment.isError ? (
        <p className='rounded-xl bg-error-container p-4 text-sm text-on-error-container' role='alert'>
          {t(paymentErrorKey(payment.error))}
        </p>
      ) : null}

      {data ? (
        <section aria-labelledby='payment-result' className={`${paymentPanel} mx-auto flex max-w-2xl flex-col gap-6`}>
          <div className='flex items-start gap-4'>
            <Icon className={`text-5xl ${stateIcon[state].className}`} filled name={stateIcon[state].name} />
            <div className='min-w-0' role={state === 'pending' ? 'status' : undefined}>
              <h2 className='text-xl font-bold' id='payment-result'>
                {state === 'pending'
                  ? timedOut
                    ? t('customer.payment.pending.timedOut')
                    : t('customer.payment.pending.waiting')
                  : t(`payment.status.${data.status}`)}
              </h2>
              <p className='mt-1 text-sm leading-6 text-on-surface-variant'>
                {state === 'pending'
                  ? timedOut
                    ? t('customer.payment.pending.timedOutHint')
                    : t('customer.payment.pending.hint')
                  : state === 'success'
                    ? data.paidAt
                      ? t('customer.payment.success.paidAt', { time: formatDateTime(data.paidAt, language) })
                      : null
                    : t(`customer.payment.failure.reasons.${failureReason(data)}`)}
              </p>
            </div>
          </div>

          <dl className='flex flex-col gap-3 rounded-xl bg-surface-container-low p-4 text-sm'>
            <div className='flex justify-between gap-3'>
              <dt className='text-on-surface-variant'>{t('customer.payment.amount')}</dt>
              <dd className='text-lg font-extrabold text-primary tabular-nums'>{formatMoney(data.amount, language)}</dd>
            </div>
            <div className='flex justify-between gap-3'>
              <dt className='text-on-surface-variant'>{t('customer.payment.reference')}</dt>
              <dd className='flex items-center gap-2 font-semibold tabular-nums'>
                {data.id.slice(0, 8).toUpperCase()}
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${paymentStatusTone[data.status]}`}>
                  {t(`payment.status.${data.status}`)}
                </span>
              </dd>
            </div>
            {booking.data ? (
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t('customer.payment.booking')}</dt>
                <dd className='flex items-center gap-2 font-semibold'>
                  #{booking.data.bookingCode}
                  <BookingStatusBadge status={booking.data.status} />
                </dd>
              </div>
            ) : null}
          </dl>

          {state === 'success' ? (
            <p className='text-sm leading-6 text-on-surface-variant'>
              <strong className='font-bold'>{t('customer.payment.success.next')}: </strong>
              {remaining ? t('customer.payment.success.invoicePaid') : t('customer.payment.success.nextSteps')}
            </p>
          ) : null}
          {state === 'failure' && canRetry ? (
            <p className='text-sm leading-6 text-on-surface-variant'>
              {remaining ? t('customer.payment.failure.invoiceRetryHint') : t('customer.payment.failure.retryHint')}
            </p>
          ) : null}

          <div className='flex flex-col gap-3 sm:flex-row'>
            {state === 'pending' && timedOut ? (
              <>
                <button className={primaryAction} onClick={checkAgain} type='button'>
                  {t('customer.payment.pending.checkAgain')}
                  <Icon className='text-lg' name='refresh' />
                </button>
                <Link className={secondaryAction} to='/customer/payments'>
                  {t('customer.payment.pending.toPayments')}
                </Link>
              </>
            ) : null}
            {state === 'failure' && canRetry ? (
              <Link className={primaryAction} to={retryLink}>
                {remaining ? t('customer.payment.failure.payInvoiceAgain') : t('customer.payment.failure.retry')}
                <Icon className='text-lg transition-transform duration-300 group-hover:translate-x-1' name='refresh' />
              </Link>
            ) : null}
            {state === 'success' ? (
              <Link className={primaryAction} to={bookingLink}>
                {t('customer.payment.success.view')}
                <Icon
                  className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                  name='arrow_forward'
                />
              </Link>
            ) : (
              <Link className={secondaryAction} to={bookingLink}>
                {t('customer.payment.backToBooking')}
              </Link>
            )}
          </div>
        </section>
      ) : null}
    </PaymentShell>
  )
}
