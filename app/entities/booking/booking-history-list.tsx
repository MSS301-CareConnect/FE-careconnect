import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { BOOKING_STATUSES, OCCURRENCE_STATUSES, formatDateTime } from './booking-format'
import { bookingKeys, fetchBookingHistory } from './booking-api'
import { historyReason } from './booking-history-reason'

const EVENT_TYPES = [
  'BOOKING_STATUS_CHANGED',
  'OCCURRENCE_ACKNOWLEDGED',
  'OCCURRENCE_STATUS_CHANGED',
  'CAREGIVER_CHANGED',
  'NO_SHOW_REPORTED'
] as const
type EventType = (typeof EVENT_TYPES)[number]

function knownEvent(value: string): EventType | undefined {
  return EVENT_TYPES.find((item) => item === value)
}

function HistoryReasonText({ reason }: { reason?: string | null }) {
  const { t } = useTranslation()
  const shown = historyReason(reason)
  if (!shown) return null
  return (
    <p className='mt-1 text-sm text-on-surface-variant'>
      {shown.kind === 'depositReceived' ? t('booking.history.depositReceived') : shown.text}
    </p>
  )
}

/** Status changes and occurrence events of one booking, oldest first, from GET /bookings/{id}/history. */
export function BookingHistoryList({ bookingId }: { bookingId: string }) {
  const { t, i18n } = useTranslation()
  const history = useQuery({
    queryKey: bookingKeys.history(bookingId, 0),
    queryFn: () => fetchBookingHistory(bookingId),
    retry: false
  })

  function statusLabel(value: string | undefined) {
    const booking = BOOKING_STATUSES.find((item) => item === value)
    if (booking) return t(`booking.status.${booking}`)
    const occurrence = OCCURRENCE_STATUSES.find((item) => item === value)
    return occurrence ? t(`booking.occurrenceStatus.${occurrence}`) : (value ?? '')
  }

  if (history.isPending)
    return (
      <p className='text-sm text-on-surface-variant' role='status'>
        {t('booking.history.loading')}
      </p>
    )
  if (history.isError)
    return (
      <p className='text-sm text-error' role='alert'>
        {t('booking.history.error')}
      </p>
    )
  if (history.data.items.length === 0)
    return <p className='text-sm text-on-surface-variant'>{t('booking.history.empty')}</p>

  return (
    <ol className='flex flex-col gap-4'>
      {history.data.items.map((entry, index) => {
        const type = knownEvent(entry.eventType)
        return (
          <li className='grid grid-cols-[12px_minmax(0,1fr)] gap-3' key={`${entry.changedAt}-${index}`}>
            <span aria-hidden='true' className='mt-1.5 h-3 w-3 rounded-full bg-primary' />
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-on-surface'>
                {type ? t(`booking.history.events.${type}`) : t('booking.history.events.other')}
                {entry.toStatus ? (
                  <span className='font-normal text-on-surface-variant'>
                    {' · '}
                    {entry.fromStatus
                      ? t('booking.history.transition', {
                          from: statusLabel(entry.fromStatus),
                          to: statusLabel(entry.toStatus)
                        })
                      : statusLabel(entry.toStatus)}
                  </span>
                ) : null}
              </p>
              <p className='text-xs text-on-surface-variant'>{formatDateTime(entry.changedAt, i18n.language)}</p>
              <HistoryReasonText reason={entry.reason} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
