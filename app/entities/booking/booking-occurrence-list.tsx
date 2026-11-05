import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { BookingItemRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'

import { formatClock, formatDateTime, formatMoney } from './booking-format'
import { OccurrenceStatusBadge } from './booking-status-badge'

export interface BookingOccurrenceListProps {
  occurrences: BookingOccurrenceRecord[]
  /** Resolves a ProviderService caregiver ID to a display name when the screen knows it. */
  caregiverName?: (caregiverId: string) => string | undefined
  renderActions?: (occurrence: BookingOccurrenceRecord) => ReactNode
  services?: BookingItemRecord[]
  onSelectOccurrence?: (occurrence: BookingOccurrenceRecord) => void
  pageSize?: number
}

/** Matches an occurrence to its care service if known */
export function matchOccurrenceService(
  occurrence: BookingOccurrenceRecord,
  services?: BookingItemRecord[]
): BookingItemRecord | undefined {
  if (!services || services.length === 0) return undefined
  if (occurrence.careServiceId) {
    const match = services.find((s) => s.careServiceId === occurrence.careServiceId)
    if (match) return match
  }
  if (services.length === 1) return services[0]
  if (occurrence.priceAmount !== undefined) {
    const matchByPrice = services.find(
      (s) => s.unitPrice === occurrence.priceAmount || s.totalPrice === occurrence.priceAmount
    )
    if (matchByPrice) return matchByPrice
  }
  return undefined
}

export function calcOccurrenceDurationMinutes(occurrence: BookingOccurrenceRecord): number | undefined {
  if (occurrence.durationMinutes && occurrence.durationMinutes > 0) {
    return occurrence.durationMinutes
  }
  if (occurrence.startAt && occurrence.endAt) {
    const diff = Math.round((new Date(occurrence.endAt).getTime() - new Date(occurrence.startAt).getTime()) / 60_000)
    if (diff > 0) return diff
  }
  return undefined
}

/** The sessions of one booking, in order, with their own status, caregiver and price. */
export function BookingOccurrenceList({
  occurrences,
  caregiverName,
  renderActions,
  services,
  onSelectOccurrence,
  pageSize = 6
}: BookingOccurrenceListProps) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const language = i18n.language
  const [page, setPage] = useState(0)

  if (occurrences.length === 0)
    return <p className='text-sm text-on-surface-variant'>{t('booking.occurrences.empty')}</p>

  const sorted = [...occurrences].sort((first, second) => first.occurrenceNo - second.occurrenceNo)
  const totalPages = Math.ceil(sorted.length / pageSize)
  const safePage = Math.min(page, Math.max(0, totalPages - 1))
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize)

  return (
    <div className='flex flex-col gap-3'>
      <ol className='flex flex-col gap-3'>
        {paged.map((occurrence) => {
          const caregiver = occurrence.caregiverId
            ? (caregiverName?.(occurrence.caregiverId) ?? t('booking.occurrences.assigned'))
            : t('booking.occurrences.unassigned')
          const service = matchOccurrenceService(occurrence, services)
          const durationMinutes = calcOccurrenceDurationMinutes(occurrence)

          return (
            <li
              className='grid gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5'
              key={occurrence.id}
            >
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='inline-flex items-center rounded-md border border-brand-100 bg-brand-50 px-2 py-0.5 text-xs font-bold text-primary tabular-nums'>
                    {t('booking.occurrences.title', { number: occurrence.occurrenceNo })}
                  </span>
                  <p className='font-semibold tabular-nums text-on-surface'>
                    {formatDateTime(occurrence.startAt, language)}
                    {'–'}
                    {formatClock(occurrence.endAt, language)}
                  </p>
                  {durationMinutes ? (
                    <span className='inline-flex items-center gap-1 rounded-md bg-surface-container-high px-2 py-0.5 text-xs font-medium text-on-surface-variant'>
                      <Icon className='text-xs' name='schedule' />
                      {format.duration(durationMinutes)}
                    </span>
                  ) : null}
                  <OccurrenceStatusBadge status={occurrence.status} />
                  {occurrence.needsReassignment ? (
                    <span className='inline-flex items-center gap-1 rounded-md border border-error/25 bg-error-container px-2 py-0.5 text-xs font-semibold text-on-error-container'>
                      <Icon className='text-sm' name='person_alert' />
                      {t('booking.occurrences.needsReassignment')}
                    </span>
                  ) : null}
                </div>

                {service ? (
                  <div className='mt-2 flex items-center gap-1.5 text-sm font-semibold text-on-surface'>
                    <Icon className='text-base text-primary' name='medical_services' />
                    <span>{service.serviceName}</span>
                    {service.planName ? (
                      <span className='rounded bg-surface-container-high px-1.5 py-0.5 text-xs font-normal text-on-surface-variant'>
                        {service.planName}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <p className='mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-variant'>
                  <span className='inline-flex items-center gap-1.5'>
                    <Icon className='text-base text-primary' name='person' />
                    {caregiver}
                  </span>
                  {occurrence.priceAmount !== undefined ? (
                    <span className='font-bold tabular-nums text-on-surface'>
                      {formatMoney(occurrence.priceAmount, language)}
                    </span>
                  ) : null}
                </p>

                {occurrence.serviceAddress ? (
                  <p className='mt-1.5 flex items-start gap-1.5 text-sm font-medium text-primary'>
                    <Icon className='mt-0.5 text-base' name='home_pin' />
                    {t('booking.occurrences.address', { address: occurrence.serviceAddress })}
                  </p>
                ) : null}

                {occurrence.cancelReason ? (
                  <p className='mt-1.5 text-xs text-error'>
                    {t('booking.occurrences.cancelReason', { reason: occurrence.cancelReason })}
                  </p>
                ) : null}
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                {onSelectOccurrence ? (
                  <button
                    className='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-primary shadow-2xs transition-all hover:border-primary hover:bg-primary/5 active:scale-95'
                    onClick={() => onSelectOccurrence(occurrence)}
                    type='button'
                  >
                    <Icon className='text-base' name='visibility' />
                    {t('booking.occurrences.viewDetail')}
                  </button>
                ) : null}
                {renderActions ? renderActions(occurrence) : null}
              </div>
            </li>
          )
        })}
      </ol>
      <Pagination
        className='mt-2'
        onPageChange={setPage}
        page={safePage}
        totalPages={totalPages}
      />
    </div>
  )
}
