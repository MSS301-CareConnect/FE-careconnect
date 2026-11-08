import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'

import { bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { bookingTypeKey, formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import { fetchPayment, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import { AssignedCaregiverCard } from '~/entities/provider/assigned-caregiver-card'
import type { PaymentRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'

import {
  PaymentShell,
  paymentStatusTone,
  primaryAction,
  secondaryAction
} from './components/payment-shell'

export type PaymentOutcome = 'success' | 'failure'
type ResultState = 'pending' | 'success' | 'failure'
const POLL_MS = 2000
// The IPN normally lands within seconds; after this the page stops polling and points to the payments list.
const POLL_LIMIT_MS = 60_000

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

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
  const canRetry = remaining || booking.data?.status === 'AWAITING_INITIAL_PAYMENT'
  const retryLink = remaining ? '/customer/payments' : `/customer/bookings/${bookingId}/deposit`
  const serviceAddress =
    booking.data?.serviceAddress ||
    [
      booking.data?.recipientSnapshot?.addressLine,
      booking.data?.recipientSnapshot?.ward,
      booking.data?.recipientSnapshot?.district,
      booking.data?.recipientSnapshot?.province
    ]
      .filter(Boolean)
      .join(', ') ||
    undefined

  function checkAgain() {
    setTimedOut(false)
    void payment.refetch()
  }

  function copyToClipboard(key: string, text: string) {
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key)
        window.setTimeout(() => setCopiedKey(null), 2000)
      })
    }
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
        <div className='flex items-center justify-center py-16' role='status'>
          <div className='flex flex-col items-center gap-3 text-on-surface-variant'>
            <Icon className='text-4xl text-primary animate-spin' name='progress_activity' />
            <p className='text-sm'>{t('customer.payment.loading')}</p>
          </div>
        </div>
      ) : null}
      {payment.isError ? (
        <div className='mx-auto max-w-2xl rounded-2xl bg-error-container p-6 text-sm text-on-error-container shadow-sm' role='alert'>
          <div className='flex items-start gap-3'>
            <Icon className='text-2xl text-error' name='error' />
            <div>
              <p className='font-bold text-base'>{t(paymentErrorKey(payment.error))}</p>
            </div>
          </div>
        </div>
      ) : null}

      {data ? (
        <div className='mx-auto max-w-6xl'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-12 items-start'>
            {/* Left Column: Electronic Receipt & Payment Status */}
            <section
              aria-labelledby='payment-result'
              className='flex flex-col gap-6 rounded-3xl border border-outline-variant/60 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 lg:col-span-7'
            >
              {/* Status Header */}
              <div className='flex items-start gap-4 sm:gap-5' role={state === 'pending' ? 'status' : undefined}>
                {state === 'pending' ? (
                  <div className='relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-50 text-amber-600 shadow-sm'>
                    {timedOut ? (
                      <Icon className='text-3xl' filled name='schedule' />
                    ) : (
                      <>
                        <Icon className='text-3xl animate-[spin_4s_linear_infinite]' filled name='hourglass_top' />
                        <span className='absolute -bottom-1 -right-1 flex h-4 w-4'>
                          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75' />
                          <span className='relative inline-flex h-4 w-4 rounded-full bg-amber-500' />
                        </span>
                      </>
                    )}
                  </div>
                ) : state === 'success' ? (
                  <div className='flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-600 shadow-sm'>
                    <Icon className='text-3xl' filled name='check_circle' />
                  </div>
                ) : (
                  <div className='flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50 text-error shadow-sm'>
                    <Icon className='text-3xl' filled name='error' />
                  </div>
                )}

                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-on-surface' id='payment-result'>
                      {state === 'pending'
                        ? timedOut
                          ? t('customer.payment.pending.timedOut')
                          : t('customer.payment.pending.waiting')
                        : t(`payment.status.${data.status}`)}
                    </h2>
                    {state === 'success' ? (
                      <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800'>
                        <Icon className='text-sm' name='verified' />
                        {t('customer.payment.step1Title')}
                      </span>
                    ) : null}
                  </div>
                  <p className='mt-1.5 text-sm leading-6 text-on-surface-variant'>
                    {state === 'pending'
                      ? timedOut
                        ? t('customer.payment.pending.timedOutHint')
                        : t('customer.payment.pending.hint')
                      : state === 'success'
                        ? data.paidAt
                          ? t('customer.payment.success.paidAt', { time: formatDateTime(data.paidAt, language) })
                          : t('customer.payment.success.subtitle')
                        : t(`customer.payment.failure.reasons.${failureReason(data)}`)}
                  </p>
                </div>
              </div>

              {/* Hero Amount Banner */}
              <div className='flex flex-col gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-low/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
                <div>
                  <span className='text-xs font-semibold tracking-wider text-on-surface-variant uppercase'>
                    {t('customer.payment.amount')}
                  </span>
                  <div className='mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-primary tabular-nums'>
                    {formatMoney(data.amount, language)}
                  </div>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${paymentStatusTone[data.status]}`}
                  >
                    <span className='h-2 w-2 rounded-full bg-current opacity-80' />
                    {t(`payment.status.${data.status}`)}
                  </span>
                  <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface'>
                    {t(`customer.payment.paymentTypes.${data.paymentType ?? 'DEPOSIT'}`)}
                  </span>
                </div>
              </div>

              {/* Receipt Details Breakdown */}
              <dl className='divide-y divide-outline-variant/50 rounded-2xl border border-outline-variant/60 bg-white text-sm'>
                {/* Transaction Reference */}
                <div className='flex items-center justify-between p-4 sm:px-5'>
                  <dt className='flex items-center gap-2 text-on-surface-variant'>
                    <Icon className='text-base text-outline' name='receipt_long' />
                    <span>{t('customer.payment.reference')}</span>
                  </dt>
                  <dd className='flex items-center gap-2 font-mono font-semibold tabular-nums text-on-surface'>
                    <span>{data.id.slice(0, 8).toUpperCase()}</span>
                    <button
                      aria-label={t('customer.payment.copyCode')}
                      className='inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-sans text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors'
                      onClick={() => copyToClipboard('ref', data.id)}
                      title={t('customer.payment.copyCode')}
                      type='button'
                    >
                      <Icon className='text-sm' name={copiedKey === 'ref' ? 'check' : 'content_copy'} />
                      <span>{copiedKey === 'ref' ? t('customer.payment.copied') : t('customer.payment.copyCode')}</span>
                    </button>
                  </dd>
                </div>

                {/* Booking Reference */}
                {booking.data ? (
                  <div className='flex items-center justify-between p-4 sm:px-5'>
                    <dt className='flex items-center gap-2 text-on-surface-variant'>
                      <Icon className='text-base text-outline' name='calendar_month' />
                      <span>{t('customer.payment.booking')}</span>
                    </dt>
                    <dd className='flex items-center gap-2 font-semibold text-on-surface'>
                      <Link className='font-mono hover:text-primary hover:underline' to={bookingLink}>
                        #{booking.data.bookingCode}
                      </Link>
                      <button
                        aria-label={t('customer.payment.copyCode')}
                        className='inline-flex items-center rounded-md p-1 text-xs text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors'
                        onClick={() => copyToClipboard('booking', booking.data!.bookingCode)}
                        title={t('customer.payment.copyCode')}
                        type='button'
                      >
                        <Icon className='text-sm' name={copiedKey === 'booking' ? 'check' : 'content_copy'} />
                      </button>
                      <BookingStatusBadge status={booking.data.status} />
                    </dd>
                  </div>
                ) : null}

                {/* Payment Type */}
                <div className='flex items-center justify-between p-4 sm:px-5'>
                  <dt className='flex items-center gap-2 text-on-surface-variant'>
                    <Icon className='text-base text-outline' name='payments' />
                    <span>{t('customer.payment.paymentType')}</span>
                  </dt>
                  <dd className='font-medium text-on-surface'>
                    {t(`customer.payment.paymentTypes.${data.paymentType ?? 'DEPOSIT'}`)}
                  </dd>
                </div>

                {/* Method */}
                <div className='flex items-center justify-between p-4 sm:px-5'>
                  <dt className='flex items-center gap-2 text-on-surface-variant'>
                    <Icon className='text-base text-outline' name='account_balance_wallet' />
                    <span>{t('customer.payment.paymentMethod')}</span>
                  </dt>
                  <dd className='flex items-center gap-2 font-medium text-on-surface'>
                    <span className='rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700'>VNPay</span>
                    <span>{t('customer.payment.paymentMethodVnpay')}</span>
                  </dd>
                </div>

                {/* Time */}
                <div className='flex items-center justify-between p-4 sm:px-5'>
                  <dt className='flex items-center gap-2 text-on-surface-variant'>
                    <Icon className='text-base text-outline' name='schedule' />
                    <span>{t('customer.payment.paymentTime')}</span>
                  </dt>
                  <dd className='font-medium tabular-nums text-on-surface'>
                    {formatDateTime(data.paidAt || data.createdAt, language)}
                  </dd>
                </div>
              </dl>

              {/* Status Guidance Banner */}
              {state === 'success' ? (
                <div className='rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 text-sm'>
                  <div className='flex items-start gap-3'>
                    <Icon className='mt-0.5 text-xl text-primary shrink-0' name='verified' />
                    <p className='leading-6 text-on-surface'>
                      <strong className='font-bold'>{t('customer.payment.success.next')}: </strong>
                      {remaining ? t('customer.payment.success.invoicePaid') : t('customer.payment.success.nextSteps')}
                    </p>
                  </div>
                </div>
              ) : null}

              {state === 'failure' && canRetry ? (
                <div className='rounded-2xl border border-rose-200 bg-rose-50/60 p-4 sm:p-5 text-sm'>
                  <div className='flex items-start gap-3'>
                    <Icon className='mt-0.5 text-xl text-error shrink-0' name='help_outline' />
                    <p className='leading-6 text-on-surface'>
                      {remaining
                        ? t('customer.payment.failure.invoiceRetryHint')
                        : t('customer.payment.failure.retryHint')}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons Row */}
              <div className='flex flex-col gap-3 pt-2 sm:flex-row'>
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

            {/* Right Column: Care Overview, Next Steps, Support */}
            <div className='flex flex-col gap-6 lg:col-span-5'>
              {/* Care Overview Card */}
              <aside
                aria-labelledby='care-overview-title'
                className='flex flex-col gap-5 rounded-3xl border border-outline-variant/60 bg-white p-6 shadow-[var(--shadow-card)]'
              >
                <div className='flex items-center justify-between border-b border-outline-variant/50 pb-4'>
                  <h3 className='flex items-center gap-2 text-base font-bold text-on-surface' id='care-overview-title'>
                    <Icon className='text-xl text-primary' name='home_health' />
                    <span>{t('customer.payment.overviewTitle')}</span>
                  </h3>
                  {booking.data ? (
                    <span className='rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-primary'>
                      {t(bookingTypeKey(booking.data))}
                    </span>
                  ) : null}
                </div>

                {booking.data ? (
                  <div className='flex flex-col gap-4 text-sm'>
                    {/* Recipient */}
                    <div className='flex items-center gap-3 rounded-xl bg-surface-container-low/60 p-3.5'>
                      <Avatar
                        className='h-11 w-11 shrink-0 rounded-full text-sm'
                        decorative
                        name={booking.data.recipientSnapshot?.fullName ?? '—'}
                      />
                      <div className='min-w-0 flex-1'>
                        <p className='text-xs font-medium text-on-surface-variant'>{t('customer.payment.recipient')}</p>
                        <p className='truncate font-bold text-on-surface'>
                          {booking.data.recipientSnapshot?.fullName ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Caregiver */}
                    {booking.data.caregiverId ? (
                      <AssignedCaregiverCard
                        caregiverId={booking.data.caregiverId}
                        profileHref={`/customer/caregivers/${booking.data.caregiverId}`}
                      />
                    ) : (
                      <div className='flex items-center gap-3 rounded-xl border border-dashed border-outline-variant/80 p-3.5'>
                        <div className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-container-high text-on-surface-variant'>
                          <Icon className='text-xl' name='person_search' />
                        </div>
                        <div className='min-w-0'>
                          <p className='text-xs font-medium text-on-surface-variant'>{t('customer.payment.caregiver')}</p>
                          <p className='text-sm font-semibold text-on-surface'>
                            {t('customer.payment.caregiverWaiting')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Schedule & Address */}
                    <div className='space-y-3 rounded-xl bg-surface-container-low/60 p-3.5 text-xs text-on-surface-variant'>
                      <div className='flex items-start gap-2.5'>
                        <Icon className='mt-0.5 text-base text-primary shrink-0' name='event' />
                        <div className='min-w-0 flex-1'>
                          <p className='font-semibold text-on-surface'>
                            {booking.data.startDate ? formatDateTime(booking.data.startDate, language) : '—'}
                            {booking.data.startTime ? ` (${booking.data.startTime} - ${booking.data.endTime ?? ''})` : ''}
                          </p>
                          <p className='mt-0.5'>
                            {booking.data.occurrences?.length
                              ? `${booking.data.occurrences.length} buổi chăm sóc`
                              : 'Lịch chăm sóc tiêu chuẩn'}
                          </p>
                        </div>
                      </div>

                      {serviceAddress ? (
                        <div className='flex items-start gap-2.5 border-t border-outline-variant/40 pt-2'>
                          <Icon className='mt-0.5 text-base text-primary shrink-0' name='location_on' />
                          <p className='leading-5 text-on-surface'>{serviceAddress}</p>
                        </div>
                      ) : null}
                    </div>

                    {/* Total booking value */}
                    <div className='flex items-center justify-between border-t border-outline-variant/50 pt-3'>
                      <span className='text-xs font-semibold text-on-surface-variant'>
                        {t('customer.payment.totalBooking')}
                      </span>
                      <span className='text-base font-extrabold text-on-surface tabular-nums'>
                        {formatMoney(booking.data.totalAmount ?? data.amount, language)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className='py-6 text-center text-sm text-on-surface-variant'>
                    {t('customer.payment.loading')}
                  </div>
                )}
              </aside>

              {/* Next Steps Timeline Card */}
              <aside
                aria-labelledby='next-steps-title'
                className='flex flex-col gap-4 rounded-3xl border border-outline-variant/60 bg-white p-6 shadow-[var(--shadow-card)]'
              >
                <h3 className='flex items-center gap-2 border-b border-outline-variant/50 pb-3 text-base font-bold text-on-surface' id='next-steps-title'>
                  <Icon className='text-xl text-primary' name='alt_route' />
                  <span>{t('customer.payment.nextStepsTitle')}</span>
                </h3>
                <ol className='relative flex flex-col space-y-4 pl-1 text-sm'>
                  {/* Step 1 */}
                  <li className='relative flex gap-3.5'>
                    <span aria-hidden='true' className='absolute top-6 bottom-0 left-[11px] w-0.5 bg-outline-variant/60' />
                    <span
                      className={`relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        state === 'success'
                          ? 'bg-primary text-on-primary'
                          : 'bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {state === 'success' ? <Icon className='text-sm' name='check' /> : '1'}
                    </span>
                    <div className='min-w-0 flex-1 pb-1'>
                      <p className='font-bold text-on-surface'>{t('customer.payment.step1Title')}</p>
                      <p className='mt-0.5 text-xs leading-relaxed text-on-surface-variant'>
                        {t('customer.payment.step1Desc')}
                      </p>
                    </div>
                  </li>

                  {/* Step 2 */}
                  <li className='relative flex gap-3.5'>
                    <span aria-hidden='true' className='absolute top-6 bottom-0 left-[11px] w-0.5 bg-outline-variant/60' />
                    <span className='relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant'>
                      2
                    </span>
                    <div className='min-w-0 flex-1 pb-1'>
                      <p className='font-bold text-on-surface'>{t('customer.payment.step2Title')}</p>
                      <p className='mt-0.5 text-xs leading-relaxed text-on-surface-variant'>
                        {t('customer.payment.step2Desc')}
                      </p>
                    </div>
                  </li>

                  {/* Step 3 */}
                  <li className='relative flex gap-3.5'>
                    <span className='relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant'>
                      3
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='font-bold text-on-surface'>{t('customer.payment.step3Title')}</p>
                      <p className='mt-0.5 text-xs leading-relaxed text-on-surface-variant'>
                        {t('customer.payment.step3Desc')}
                      </p>
                    </div>
                  </li>
                </ol>
              </aside>

              {/* Support Card */}
              <div className='flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 p-4 text-xs text-on-surface-variant'>
                <div className='flex items-center gap-3'>
                  <div className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-primary'>
                    <Icon className='text-xl' name='support_agent' />
                  </div>
                  <div>
                    <p className='font-bold text-on-surface'>{t('customer.payment.supportTitle')}</p>
                    <p className='font-semibold text-primary'>{t('customer.payment.supportHotline')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PaymentShell>
  )
}
