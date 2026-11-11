import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { deadlineUrgency, isPastDeadline, type DeadlineUrgency } from '~/entities/booking/booking-deadline'
import { BookingDeadlineChip } from '~/entities/booking/booking-deadline-chip'
import { bookingTypeKey, formatDateTime, formatDay, formatMoney, shortTime } from '~/entities/booking/booking-format'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import type { BookingSummaryRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { useCenterCaregivers } from '../hooks/use-center-caregivers'
import type { ManagerBookingAction } from './manager-booking-action-dialog'

// The countdown chip carries the urgency; a row under an hour from its deadline also gets a faint tint.
const ROW_TINTS: Record<DeadlineUrgency | 'none', string> = {
  overdue: '',
  critical: 'bg-error-container/25',
  soon: '',
  normal: '',
  none: ''
}
const COLUMNS = ['booking', 'customer', 'schedule', 'deadline', 'actions'] as const

interface RowProps {
  booking: BookingSummaryRecord
  now: number
  onAction: (booking: BookingSummaryRecord, action: ManagerBookingAction) => void
}

/** The center's answer to a row: confirm or assign (primary) and reject; none once the deadline has passed. */
function rowActions(booking: BookingSummaryRecord, now: number): ManagerBookingAction[] {
  if (isPastDeadline(booking, now)) return []
  if (booking.status === 'PENDING_CENTER_CONFIRMATION') return ['accept', 'reject']
  if (booking.status === 'PENDING_CAREGIVER_ASSIGNMENT') return ['assign', 'reject']
  if (booking.status === 'PENDING_CAREGIVER_CONFIRMATION') return ['reject']
  return []
}

function urgencyOf(booking: BookingSummaryRecord, now: number) {
  return booking.deadlineAt ? deadlineUrgency(booking.deadlineAt, now) : 'none'
}

function Services({ booking }: { booking: BookingSummaryRecord }) {
  const { t } = useTranslation()
  const names = booking.serviceNames ?? []
  if (!names.length) return null
  return (
    <p className='truncate text-xs text-on-surface-variant'>
      {names[0]}
      {names.length > 1 ? ` ${t('centerManager.bookingManagement.moreServices', { count: names.length - 1 })}` : ''}
    </p>
  )
}

function Schedule({ booking }: { booking: BookingSummaryRecord }) {
  const { t, i18n } = useTranslation()
  return (
    <>
      <p className='font-medium text-on-surface tabular-nums'>
        {formatDay(booking.startDate, i18n.language)}
        {booking.endDate && booking.endDate !== booking.startDate
          ? ` – ${formatDay(booking.endDate, i18n.language)}`
          : ''}
      </p>
      <p className='text-xs text-on-surface-variant tabular-nums'>
        {t(bookingTypeKey(booking))}
        {booking.startTime ? ` · ${shortTime(booking.startTime)}–${shortTime(booking.endTime)}` : ''}
        {booking.totalCount ? ` · ${t('centerManager.bookingManagement.sessions', { count: booking.totalCount })}` : ''}
      </p>
    </>
  )
}

/** Running deadline as a countdown; bookings without one show the next visit instead. */
function Deadline({ booking, now }: { booking: BookingSummaryRecord; now: number }) {
  const { t, i18n } = useTranslation()
  if (booking.deadlineAt && booking.deadlineType) {
    return (
      <BookingDeadlineChip
        dueAt={booking.deadlineAt}
        now={now}
        prefix={t(`booking.deadline.types.${booking.deadlineType}`)}
      />
    )
  }
  if (booking.status === 'EXPIRED' && booking.expiredReason) {
    return <p className='text-xs text-on-surface-variant'>{t(`booking.expiredReason.${booking.expiredReason}`)}</p>
  }
  if (booking.nextOccurrenceAt) {
    const total = booking.totalCount ?? 0
    const done = booking.completedCount ?? 0
    return (
      <div className='text-xs text-on-surface-variant tabular-nums'>
        <p>
          {t('centerManager.bookingManagement.nextVisit', {
            time: formatDateTime(booking.nextOccurrenceAt, i18n.language)
          })}
        </p>
        <p className='mt-0.5'>{t('centerManager.bookingManagement.progress', { done, total })}</p>
        {total > 0 ? (
          <div aria-hidden='true' className='mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-surface-container'>
            <div
              className='h-full rounded-full bg-primary'
              style={{ width: `${Math.min(100, (done / total) * 100)}%` }}
            />
          </div>
        ) : null}
      </div>
    )
  }
  return <span className='text-xs text-outline'>{t('centerManager.bookingManagement.noDeadline')}</span>
}

function Actions({ booking, now, onAction }: RowProps) {
  const { t } = useTranslation()
  const key = 'centerManager.bookingManagement.actions' as const
  const actions = rowActions(booking, now)
  const primary = actions.find((action) => action !== 'reject')
  return (
    <div className='flex items-center justify-end gap-1.5 whitespace-nowrap'>
      {actions.includes('reject') ? (
        <Button onClick={() => onAction(booking, 'reject')} size='sm' variant='ghost'>
          {t(`${key}.reject`)}
        </Button>
      ) : null}
      {primary ? (
        <Button onClick={() => onAction(booking, primary)} size='sm'>
          {t(`${key}.${primary}`)}
        </Button>
      ) : null}
      {actions.length === 0 ? (
        <Link
          className='inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold whitespace-nowrap text-primary hover:bg-surface-container-low'
          to={`/center-manager/bookings/${booking.id}`}
        >
          {t(`${key}.open`)}
          <Icon className='text-base' name='chevron_right' />
        </Link>
      ) : null}
    </div>
  )
}

/**
 * Bookings as a table on wide screens and as cards on phones. The deadline chip shows how urgent each one is (red under
 * an hour, amber under six, grey once past and closing); rows under an hour also get a faint tint.
 */
export function ManagerBookingTable({
  bookings,
  now,
  onAction
}: {
  bookings: BookingSummaryRecord[]
  now: number
  onAction: RowProps['onAction']
}) {
  const { t, i18n } = useTranslation()
  const key = 'centerManager.bookingManagement' as const
  const caregiverName = useCenterCaregivers().nameOf

  return (
    <>
      <div className='hidden overflow-hidden rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest shadow-[var(--shadow-card)] @4xl:block'>
        <table className='w-full table-fixed text-left text-sm'>
          <caption className='sr-only'>{t(`${key}.title`)}</caption>
          <colgroup>
            <col className='w-[26%]' />
            <col className='w-[16%]' />
            <col className='w-[21%]' />
            <col className='w-[20%]' />
            <col className='w-[17%]' />
          </colgroup>
          <thead className='border-b border-outline-variant/50 bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
            <tr>
              {COLUMNS.map((column) => (
                <th className={`px-4 py-3 ${column === 'actions' ? 'text-right' : ''}`} key={column} scope='col'>
                  {t(`${key}.columns.${column}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-outline-variant/30'>
            {bookings.map((booking) => (
              <tr
                className={`align-middle transition-colors hover:bg-surface-container-low/60 ${ROW_TINTS[urgencyOf(booking, now)]} ${isPastDeadline(booking, now) ? 'text-on-surface-variant' : ''}`}
                key={booking.id}
              >
                <td className='px-4 py-3.5'>
                  <Link
                    className='block truncate font-semibold text-on-surface hover:text-primary hover:underline'
                    to={`/center-manager/bookings/${booking.id}`}
                  >
                    {booking.recipientName ?? `#${booking.bookingCode}`}
                  </Link>
                  <p className='truncate text-xs text-on-surface-variant tabular-nums'>#{booking.bookingCode}</p>
                  <Services booking={booking} />
                  <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                    <BookingStatusBadge status={booking.status} />
                    {booking.caregiverId ? (
                      <span className='inline-flex items-center gap-1 text-xs text-on-surface-variant'>
                        <Icon className='text-sm' name='person' />
                        {caregiverName(booking.caregiverId) ?? t('booking.occurrences.assigned')}
                      </span>
                    ) : booking.status.startsWith('PENDING') ? (
                      <span className='text-xs font-medium text-on-warning-container'>{t(`${key}.noCaregiver`)}</span>
                    ) : null}
                  </div>
                </td>
                <td className='px-4 py-3.5'>
                  <p className='truncate font-medium text-on-surface'>{booking.customer?.fullName ?? '—'}</p>
                  {booking.customer?.phoneNumber ? (
                    <a
                      title={t(`${key}.actions.call`)}
                      className='text-xs text-primary tabular-nums hover:underline'
                      href={`tel:${booking.customer.phoneNumber}`}
                    >
                      {booking.customer.phoneNumber}
                    </a>
                  ) : null}
                </td>
                <td className='px-4 py-3.5'>
                  <Schedule booking={booking} />
                  <p className='mt-0.5 text-xs font-semibold text-on-surface tabular-nums'>
                    {formatMoney(booking.totalAmount, i18n.language)}
                  </p>
                </td>
                <td className='px-4 py-3.5'>
                  <Deadline booking={booking} now={now} />
                </td>
                <td className='px-4 py-3.5'>
                  <Actions booking={booking} now={now} onAction={onAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className='grid gap-3 @2xl:grid-cols-2 @4xl:hidden'>
        {bookings.map((booking) => (
          <li
            className={`rounded-2xl border border-outline-variant/60 p-4 shadow-xs ${ROW_TINTS[urgencyOf(booking, now)] || 'bg-surface-container-lowest'}`}
            key={booking.id}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <Link
                  className='block truncate font-semibold text-on-surface hover:text-primary'
                  to={`/center-manager/bookings/${booking.id}`}
                >
                  {booking.recipientName ?? `#${booking.bookingCode}`}
                </Link>
                <p className='text-xs text-on-surface-variant tabular-nums'>#{booking.bookingCode}</p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className='mt-3 grid grid-cols-2 gap-3 text-sm'>
              <div className='min-w-0'>
                <p className='truncate font-medium'>{booking.customer?.fullName ?? '—'}</p>
                {booking.customer?.phoneNumber ? (
                  <a className='text-xs text-primary tabular-nums' href={`tel:${booking.customer.phoneNumber}`}>
                    {booking.customer.phoneNumber}
                  </a>
                ) : null}
              </div>
              <div className='min-w-0 text-right'>
                <p className='font-semibold tabular-nums'>{formatMoney(booking.totalAmount, i18n.language)}</p>
                <Services booking={booking} />
              </div>
              <div className='col-span-2'>
                <Schedule booking={booking} />
              </div>
            </div>
            <div className='mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/40 pt-3'>
              <Deadline booking={booking} now={now} />
              <Actions booking={booking} now={now} onAction={onAction} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
