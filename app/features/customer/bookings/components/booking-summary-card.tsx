import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingTypeKey, shortTime } from '~/entities/booking/booking-format'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import type { BookingSummaryRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Avatar } from '~/shared/ui/avatar'
import { CopyButton } from '~/shared/ui/copy-button'
import { Icon } from '~/shared/ui/icon'

import type { BookingAction } from '../booking-groups'

const key = 'customer.myBookings.card' as const
const primaryCta =
  'relative z-10 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary shadow-xs transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const secondaryCta =
  'relative z-10 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold text-on-surface transition-[background-color,transform] hover:bg-surface-container-low active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * One booking: who is cared for and the status first, the copyable code, the next visit highlighted, progress and
 * total, then the action that fits the status ("Pay deposit", "Pay the rest", otherwise "View details"). The whole
 * card opens the booking.
 */
export function BookingSummaryCard({ booking, action }: { booking: BookingSummaryRecord; action: BookingAction }) {
  const { t } = useTranslation()
  const format = useFormat()
  const detail = `/customer/bookings/${booking.id}`
  const name = booking.recipientName ?? t(`${key}.patientFallback`)
  const total = booking.totalCount ?? 0
  const done = booking.completedCount ?? 0
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  const dates =
    booking.endDate && booking.endDate !== booking.startDate
      ? t(`${key}.dateRange`, { from: format.date(booking.startDate), to: format.date(booking.endDate) })
      : format.date(booking.startDate)
  const hours = booking.startTime ? `${shortTime(booking.startTime)}–${shortTime(booking.endTime)}` : ''

  return (
    <article
      className={`cc-lift group relative flex flex-col rounded-2xl border bg-surface-container-lowest shadow-[var(--shadow-card)] hover:border-brand-200 ${action ? 'border-caution/40' : 'border-outline-variant'}`}
    >
      <div className='flex items-start gap-3 p-4 sm:p-5'>
        <Avatar className='h-11 w-11 shrink-0 rounded-full text-sm' decorative name={name} />
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5'>
            <h2 className='min-w-0 text-base leading-snug font-semibold text-on-surface sm:text-lg'>
              <Link
                className='rounded after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                to={detail}
              >
                {name}
              </Link>
            </h2>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className='mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-on-surface-variant'>
            <span className='font-mono text-[13px] tabular-nums'>{booking.bookingCode}</span>
            <CopyButton className='relative z-10 -my-2 -ml-1.5 text-xs' compact value={booking.bookingCode} />
            <span>
              <span aria-hidden='true'>· </span>
              {t(bookingTypeKey(booking))}
            </span>
          </p>
        </div>
      </div>

      <dl className='grid gap-3 border-t border-outline-variant/70 px-4 py-4 text-sm sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-center sm:px-5'>
        <div
          className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${booking.nextOccurrenceAt ? 'bg-brand-50' : 'bg-surface-container-low'}`}
        >
          <Icon
            className={`mt-0.5 text-lg ${booking.nextOccurrenceAt ? 'text-primary' : 'text-on-surface-variant'}`}
            name='event_upcoming'
          />
          <div className='min-w-0'>
            <dt className='text-xs text-on-surface-variant'>{t(`${key}.next`)}</dt>
            <dd className='font-semibold text-on-surface tabular-nums'>
              {booking.nextOccurrenceAt ? format.dateTime(booking.nextOccurrenceAt) : t(`${key}.noNext`)}
            </dd>
          </div>
        </div>
        <div className='min-w-0'>
          <dt className='flex items-baseline justify-between gap-2 text-xs text-on-surface-variant'>
            {t(`${key}.progress`)}
            <span className='font-semibold text-on-surface tabular-nums'>
              {t(`${key}.progressValue`, { done, total })}
            </span>
          </dt>
          <dd aria-hidden='true' className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container'>
            <span
              className='block h-full rounded-full bg-primary transition-[width] duration-300'
              style={{ width: `${percent}%` }}
            />
          </dd>
          <dd className='mt-1.5 truncate text-xs text-on-surface-variant tabular-nums'>
            {hours ? `${dates} · ${hours}` : dates}
          </dd>
        </div>
        <div className='flex items-baseline justify-between gap-2 sm:block sm:text-right'>
          <dt className='text-xs text-on-surface-variant'>{t(`${key}.total`)}</dt>
          <dd className='text-base font-bold text-on-surface tabular-nums'>{format.money(booking.totalAmount)}</dd>
        </div>
      </dl>

      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/70 px-4 py-3 sm:px-5'>
        <p className='text-sm text-on-surface-variant'>
          {action === 'payDeposit'
            ? t(`${key}.hint.payDeposit`)
            : action === 'payRemaining'
              ? t(`${key}.hint.payRemaining`)
              : t(`${key}.hint.${booking.status}`)}
        </p>
        {action === 'payDeposit' ? (
          <Link className={primaryCta} to={`${detail}/deposit`}>
            <Icon className='text-lg' name='account_balance_wallet' />
            {t(`${key}.payDeposit`)}
          </Link>
        ) : action === 'payRemaining' ? (
          <Link className={primaryCta} to={detail}>
            <Icon className='text-lg' name='account_balance_wallet' />
            {t(`${key}.payRemaining`)}
          </Link>
        ) : (
          <Link className={secondaryCta} to={detail}>
            {t(`${key}.view`)}
            <Icon className='text-lg transition-transform group-hover:translate-x-0.5' name='arrow_forward' />
          </Link>
        )}
      </div>
    </article>
  )
}
