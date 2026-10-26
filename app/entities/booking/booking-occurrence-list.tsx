import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { formatClock, formatDateTime, formatMoney } from './booking-format'
import { OccurrenceStatusBadge } from './booking-status-badge'

export interface BookingOccurrenceListProps {
  occurrences: BookingOccurrenceRecord[]
  /** Resolves a ProviderService caregiver ID to a display name when the screen knows it. */
  caregiverName?: (caregiverId: string) => string | undefined
  renderActions?: (occurrence: BookingOccurrenceRecord) => ReactNode
}

/** The sessions of one booking, in order, with their own status, caregiver and price. */
export function BookingOccurrenceList({ occurrences, caregiverName, renderActions }: BookingOccurrenceListProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language

  if (occurrences.length === 0)
    return <p className='text-sm text-on-surface-variant'>{t('booking.occurrences.empty')}</p>

  return (
    <ol className='flex flex-col gap-2'>
      {[...occurrences]
        .sort((first, second) => first.occurrenceNo - second.occurrenceNo)
        .map((occurrence) => {
          const caregiver = occurrence.caregiverId
            ? (caregiverName?.(occurrence.caregiverId) ?? t('booking.occurrences.assigned'))
            : t('booking.occurrences.unassigned')
          return (
            <li
              className='grid gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'
              key={occurrence.id}
            >
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='font-semibold text-on-surface'>
                    {t('booking.occurrences.title', { number: occurrence.occurrenceNo })}
                    {' · '}
                    {formatDateTime(occurrence.startAt, language)}
                    {'–'}
                    {formatClock(occurrence.endAt, language)}
                  </p>
                  <OccurrenceStatusBadge status={occurrence.status} />
                  {occurrence.needsReassignment ? (
                    <span className='inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-800'>
                      <Icon className='text-sm' name='person_alert' />
                      {t('booking.occurrences.needsReassignment')}
                    </span>
                  ) : null}
                </div>
                <p className='mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant'>
                  <span className='inline-flex items-center gap-1'>
                    <Icon className='text-base text-primary' name='person' />
                    {caregiver}
                  </span>
                  {occurrence.priceAmount !== undefined ? (
                    <span>{formatMoney(occurrence.priceAmount, language)}</span>
                  ) : null}
                </p>
                {occurrence.cancelReason ? (
                  <p className='mt-1 text-xs text-on-surface-variant'>
                    {t('booking.occurrences.cancelReason', { reason: occurrence.cancelReason })}
                  </p>
                ) : null}
              </div>
              {renderActions ? <div className='flex flex-wrap gap-2'>{renderActions(occurrence)}</div> : null}
            </li>
          )
        })}
    </ol>
  )
}
