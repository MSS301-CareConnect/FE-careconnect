import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { timeLeft } from '~/entities/booking/booking-deadline'
import { formatCountdown } from '~/entities/booking/hold-countdown'
import type { initialPaymentOf } from '~/entities/payment/payment-api'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { useServerClock } from '~/shared/lib/use-clock'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.payment.deposit' as const
const URGENT_MS = 3 * 60 * 60_000
// 2026-11-09: the 5-minute hold of a new booking counts down in mm:ss.
const SHORT_HOLD_MS = 15 * 60_000

/**
 * The amount paid now, the payment plan (initial payment now, the rest before the first visit — or everything at once
 * when the first visit is too close), the deadline with a countdown and the VNPay button.
 */
export function DepositSummary({
  booking,
  deposit,
  paying,
  error,
  onPay
}: {
  booking: BookingDetailRecord
  deposit: ReturnType<typeof initialPaymentOf>
  paying: boolean
  error?: string
  onPay: () => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const now = useServerClock(1_000)
  const full = deposit.percent === undefined || deposit.percent >= 100
  const msLeft = booking.depositDueAt ? new Date(booking.depositDueAt).getTime() - now : 0
  const left = booking.depositDueAt && msLeft > 0 ? timeLeft(booking.depositDueAt, now) : null
  const urgent = booking.depositDueAt ? msLeft < URGENT_MS : false
  const leftText = !booking.depositDueAt
    ? undefined
    : !left
      ? t(`${key}.timeUp`)
      : msLeft <= SHORT_HOLD_MS
        ? t('bookingSchedule.hold.leftLabel', { time: formatCountdown(msLeft) })
        : t(`${key}.timeLeft`, {
          time:
            left.days > 0
              ? t('customer.bookingDetail.lifecycle.leftDays', { days: left.days, hours: left.hours })
              : left.hours > 0
                ? t('customer.bookingDetail.lifecycle.leftHours', { hours: left.hours, minutes: left.minutes })
                : t('customer.bookingDetail.lifecycle.leftMinutes', { minutes: Math.max(1, left.minutes) })
        })
  const amount = deposit.amount !== undefined ? format.money(deposit.amount) : undefined

  return (
    <div className='flex flex-col gap-3 lg:sticky lg:top-24'>
      <aside
        aria-labelledby='deposit-summary'
        className='flex flex-col gap-5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'
      >
        <div>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h2 className='text-sm font-semibold text-on-surface-variant' id='deposit-summary'>
              {t(`${key}.summaryTitle`)}
            </h2>
            <span className='rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-primary'>
              {full ? t(`${key}.fullChip`) : t(`${key}.depositChip`, { percent: deposit.percent })}
            </span>
          </div>
          <p className='mt-1 text-[34px] leading-tight font-extrabold tracking-tight text-primary tabular-nums'>
            {amount ?? '—'}
          </p>
          {deposit.estimated ? <p className='text-xs text-on-surface-variant'>{t(`${key}.exactAmount`)}</p> : null}
          {leftText ? (
            <p
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${urgent ? 'bg-warning-container text-on-warning-container' : 'bg-surface-container-low text-on-surface-variant'}`}
            >
              <Icon className='text-sm' name='schedule' />
              {leftText}
            </p>
          ) : null}
        </div>

        <div>
          <h3 className='text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
            {t(`${key}.planTitle`)}
          </h3>
          <ol className='mt-3 flex flex-col'>
            <li className='relative flex gap-3 pb-4'>
              {full ? null : (
                <span aria-hidden='true' className='absolute top-7 bottom-0 left-[11px] w-0.5 bg-outline-variant' />
              )}
              <span className='relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-on-primary'>
                {1}
              </span>
              <span className='min-w-0 flex-1 text-sm'>
                <span className='flex justify-between gap-3 font-semibold text-on-surface'>
                  {t(`${key}.stepNow`)}
                  <span className='tabular-nums'>{amount ?? '—'}</span>
                </span>
                {booking.depositDueAt ? (
                  <span className='block text-xs text-on-surface-variant tabular-nums'>
                    {t(`${key}.stepNowDue`, { time: format.dateTime(booking.depositDueAt) })}
                  </span>
                ) : null}
              </span>
            </li>
            {full ? null : (
              <li className='flex gap-3'>
                <span className='mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-outline-variant bg-surface-container-lowest text-[11px] font-bold text-on-surface-variant'>
                  {2}
                </span>
                <span className='min-w-0 flex-1 text-sm'>
                  <span className='flex justify-between gap-3 font-semibold text-on-surface'>
                    {t(`${key}.stepRest`, { percent: 100 - (deposit.percent ?? 0) })}
                    <span className='tabular-nums'>
                      {deposit.remaining !== undefined ? format.money(deposit.remaining) : '—'}
                    </span>
                  </span>
                  {booking.remainingPaymentDueAt ? (
                    <span className='block text-xs text-on-surface-variant tabular-nums'>
                      {t(`${key}.stepRestDue`, { time: format.dateTime(booking.remainingPaymentDueAt) })}
                    </span>
                  ) : null}
                  <span className='block text-xs text-on-surface-variant'>{t(`${key}.stepRestHint`)}</span>
                </span>
              </li>
            )}
          </ol>
          <p className='mt-4 flex items-baseline justify-between gap-3 border-t border-outline-variant pt-3 text-sm'>
            <span className='text-on-surface-variant'>{t(`${key}.total`)}</span>
            <span className='font-bold text-on-surface tabular-nums'>{format.money(booking.totalAmount)}</span>
          </p>
        </div>

        <div className='flex items-start gap-3 rounded-xl border border-outline-variant/70 p-3.5'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-info-container text-info'>
            <Icon className='text-xl' name='qr_code_2' />
          </span>
          <span className='text-sm'>
            <span className='block font-semibold text-on-surface'>{t(`${key}.method`)}</span>
            <span className='block text-xs leading-5 text-on-surface-variant'>{t(`${key}.vnpay`)}</span>
          </span>
        </div>

        {error ? (
          <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
            {error}
          </p>
        ) : null}
        <div className='flex flex-col gap-2'>
          <button
            className='group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-outline'
            disabled={paying || (Boolean(booking.depositDueAt) && !left)}
            onClick={onPay}
            type='button'
          >
            {paying
              ? t(`${key}.paying`)
              : amount && !deposit.estimated
                ? t(`${key}.payVnpay`, { amount })
                : t(`${key}.payNoAmount`)}
            <Icon className='text-lg transition-transform duration-300 group-hover:translate-x-1' name='arrow_forward' />
          </button>
          <p className='flex items-center justify-center gap-1.5 text-center text-xs text-on-surface-variant'>
            <Icon className='text-sm' name='lock' />
            {t(`${key}.secure`)}
          </p>
        </div>
      </aside>

      {/* "Về lịch đặt" moved below the card for cleaner layout */}
      <Link
        className='inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-primary underline-offset-4 hover:underline transition-colors'
        to={`/customer/bookings/${booking.id}`}
      >
        <Icon className='text-lg' name='arrow_back' />
        <span>{t('customer.payment.backToBooking')}</span>
      </Link>
    </div>
  )
}
