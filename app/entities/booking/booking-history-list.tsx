import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'

import { BOOKING_STATUSES, OCCURRENCE_STATUSES, formatDateTime } from './booking-format'
import { bookingKeys, fetchBookingHistory } from './booking-api'
import { historyReason } from './booking-history-reason'

const EVENT_TYPES = [
  'BOOKING_STATUS_CHANGED',
  'OCCURRENCE_ACKNOWLEDGED',
  'OCCURRENCE_STATUS_CHANGED',
  'CAREGIVER_CHANGED',
  'NO_SHOW_REPORTED',
  'SERVICE_ADDRESS_CHANGED'
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
      {shown.kind === 'depositReceived'
        ? t('booking.history.depositReceived')
        : shown.kind === 'expired'
          ? t(`booking.expiredReason.${shown.code}`)
          : shown.text}
    </p>
  )
}

/**
 * Status changes and occurrence events of one booking, newest first (2026-11-12), from GET /bookings/{id}/history.
 * With `collapsedCount` only the latest entries show until "Show earlier" is pressed, so a long history does not
 * stretch the page.
 */
export function BookingHistoryList({ bookingId, collapsedCount }: { bookingId: string; collapsedCount?: number }) {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const history = useQuery({
    queryKey: bookingKeys.history(bookingId, page),
    queryFn: () => fetchBookingHistory(bookingId, page),
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

  // BookingService sends newest first; sorting here too keeps the order on a backend not rebuilt yet.
  const all = [...history.data.items].sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))
  const hiddenCount = collapsedCount && !expanded ? Math.max(0, all.length - collapsedCount) : 0
  const shown = hiddenCount > 0 ? all.slice(0, collapsedCount) : all
  const canCollapse = Boolean(collapsedCount && all.length > collapsedCount)

  return (
    <>
      <ol className='flex flex-col gap-4'>
        {shown.map((entry, index) => {
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
                {entry.newValue ? (
                  <p className='mt-1 text-sm text-on-surface'>
                    {t('booking.address.changedEvent', { from: entry.oldValue ?? '', to: entry.newValue })}
                  </p>
                ) : null}
                <HistoryReasonText reason={entry.reason} />
              </div>
            </li>
          )
        })}
      </ol>
      {canCollapse ? (
        <button
          aria-expanded={expanded}
          className='mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          onClick={() => setExpanded((value) => !value)}
          type='button'
        >
          <Icon className='text-lg' name={expanded ? 'expand_less' : 'expand_more'} />
          {expanded ? t('booking.history.showLess') : t('booking.history.showEarlier', { count: hiddenCount })}
        </button>
      ) : null}
      <Pagination className='mt-4' onPageChange={setPage} page={page} totalPages={history.data.totalPages ?? 0} />
    </>
  )
}
