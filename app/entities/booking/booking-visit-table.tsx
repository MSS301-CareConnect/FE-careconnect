import { useTranslation } from 'react-i18next'

import type { BookingItemRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { OccurrenceStatusBadge } from './booking-status-badge'
import { calcOccurrenceDurationMinutes, matchOccurrenceService } from './booking-occurrence-list'

/** A visit as the schedule shows it: a saved occurrence or a quoted slot of a booking still being made. */
export interface ScheduleVisit {
  id: string
  occurrenceNo?: number
  startAt: string
  endAt: string
  careServiceId?: string
  serviceName?: string
  priceAmount?: number
  serviceAddress?: string
  occurrence?: BookingOccurrenceRecord
}

export interface BookingVisitTableProps {
  visits: ScheduleVisit[]
  /** Calendar date (Vietnam time) of today — "Hôm nay" / "Ngày mai" labels. */
  today: string
  services?: BookingItemRecord[]
  caregiverName?: (caregiverId: string) => string | undefined
  onSelect?: (occurrence: BookingOccurrenceRecord) => void
  /** Hides status and caregiver: the visits of a booking being made or paid. */
  compact?: boolean
  /** False hides the service column (the visit detail names it); the "other address" note moves under the date. */
  showService?: boolean
}

/** Visits of a saved booking in occurrence order, as schedule rows. */
export function occurrenceVisits(occurrences: BookingOccurrenceRecord[] = []): ScheduleVisit[] {
  return [...occurrences]
    .sort((first, second) => first.startAt.localeCompare(second.startAt))
    .map((occurrence) => ({
      id: occurrence.id,
      occurrenceNo: occurrence.occurrenceNo,
      startAt: occurrence.startAt,
      endAt: occurrence.endAt,
      careServiceId: occurrence.careServiceId,
      priceAmount: occurrence.priceAmount,
      serviceAddress: occurrence.serviceAddress,
      occurrence
    }))
}

function monthOf(startAt: string) {
  return calendarDayOf(startAt).slice(0, 7)
}

/**
 * The visits of one booking as a table grouped by month (2026-11-09): full weekday and date, "08:00 – 10:00", length,
 * service, caregiver, status and price. Phones get one card per visit with the same facts.
 */
export function BookingVisitTable({
  visits,
  today,
  services,
  caregiverName,
  onSelect,
  compact = false,
  showService = true
}: BookingVisitTableProps) {
  const { t } = useTranslation()
  const format = useFormat()
  const months: { month: string; visits: ScheduleVisit[] }[] = []
  for (const visit of visits) {
    const month = monthOf(visit.startAt)
    const last = months.at(-1)
    if (last?.month === month) last.visits.push(visit)
    else months.push({ month, visits: [visit] })
  }

  function describe(visit: ScheduleVisit, index: number) {
    const day = calendarDayOf(visit.startAt)
    const relative = format.relativeDay(day, today)
    const occurrence = visit.occurrence
    const service =
      visit.serviceName ??
      (occurrence ? matchOccurrenceService(occurrence, services)?.serviceName : undefined) ??
      (visit.careServiceId
        ? services?.find((item) => item.careServiceId === visit.careServiceId)?.serviceName
        : undefined) ??
      t('bookingSchedule.table.allServices')
    const minutes = occurrence
      ? (calcOccurrenceDurationMinutes(occurrence) ?? 0)
      : Math.max(0, Math.round((Date.parse(visit.endAt) - Date.parse(visit.startAt)) / 60_000))
    const caregiver = !occurrence
      ? ''
      : occurrence.needsReassignment
        ? t('bookingSchedule.table.needsReassignment')
        : occurrence.caregiverId
          ? (caregiverName?.(occurrence.caregiverId) ?? t('bookingSchedule.table.assigned'))
          : t('bookingSchedule.table.unassigned')
    return {
      number: visit.occurrenceNo ?? index + 1,
      day,
      relative,
      dayLabel: format.longDayLabel(day),
      time: t('bookingSchedule.timeRange', { start: format.clock(visit.startAt), end: format.clock(visit.endAt) }),
      duration: format.duration(minutes),
      service,
      caregiver,
      price: visit.priceAmount !== undefined ? format.money(visit.priceAmount) : ''
    }
  }

  const rowButton = (visit: ScheduleVisit, number: number) =>
    onSelect && visit.occurrence ? (
      <button
        aria-label={t('bookingSchedule.table.view', { number })}
        className='grid h-9 w-9 place-items-center rounded-lg text-primary transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
        onClick={() => visit.occurrence && onSelect(visit.occurrence)}
        type='button'
      >
        <Icon className='text-lg' name='chevron_right' />
      </button>
    ) : null

  return (
    <div className='flex flex-col gap-5'>
      {months.map((group) => {
        const [year, month] = group.month.split('-')
        return (
          <section aria-label={t('bookingSchedule.calendar.month', { month, year })} key={group.month}>
            <h3 className='mb-2 flex items-baseline gap-2 text-sm font-bold text-on-surface'>
              {t('bookingSchedule.calendar.month', { month, year })}
              <span className='text-xs font-medium text-on-surface-variant'>
                {t('bookingSchedule.table.monthVisits', { count: group.visits.length })}
              </span>
            </h3>

            <div className='hidden overflow-hidden rounded-xl border border-outline-variant/60 md:block'>
              <table className='w-full text-left text-sm'>
                <caption className='sr-only'>
                  {t('bookingSchedule.table.caption', { count: group.visits.length })}
                </caption>
                <thead className='bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
                  <tr>
                    <th className='w-12 px-3 py-2.5' scope='col'>
                      {t('bookingSchedule.table.number')}
                    </th>
                    <th className='px-3 py-2.5' scope='col'>
                      {t('bookingSchedule.table.date')}
                    </th>
                    <th className='px-3 py-2.5' scope='col'>
                      {t('bookingSchedule.table.time')}
                    </th>
                    {showService ? (
                      <th className='px-3 py-2.5' scope='col'>
                        {t('bookingSchedule.table.service')}
                      </th>
                    ) : null}
                    {compact ? null : (
                      <>
                        <th className='px-3 py-2.5' scope='col'>
                          {t('bookingSchedule.table.caregiver')}
                        </th>
                        <th className='px-3 py-2.5' scope='col'>
                          {t('bookingSchedule.table.status')}
                        </th>
                      </>
                    )}
                    <th className='px-3 py-2.5 text-right' scope='col'>
                      {t('bookingSchedule.table.price')}
                    </th>
                    {onSelect ? (
                      <th className='w-12 px-2 py-2.5' scope='col'>
                        <span className='sr-only'>{t('bookingSchedule.table.actions')}</span>
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/50'>
                  {group.visits.map((visit, index) => {
                    const row = describe(visit, index)
                    const isToday = row.day === today
                    return (
                      <tr
                        className={`align-top ${isToday ? 'bg-brand-50/60' : 'bg-surface-container-lowest'}`}
                        key={visit.id}
                      >
                        <td className='px-3 py-3 font-semibold text-primary tabular-nums'>{row.number}</td>
                        <td className='px-3 py-3'>
                          <span className='block font-semibold text-on-surface'>{row.dayLabel}</span>
                          {row.relative ? (
                            <span className='text-xs font-semibold text-primary'>{row.relative}</span>
                          ) : null}
                          {!showService && visit.serviceAddress ? (
                            <span className='mt-0.5 flex items-start gap-1 text-xs font-medium text-primary'>
                              <Icon className='text-sm' name='home_pin' />
                              {t('bookingSchedule.table.otherAddress', { address: visit.serviceAddress })}
                            </span>
                          ) : null}
                        </td>
                        <td className='px-3 py-3 tabular-nums'>
                          <span className='block font-semibold text-on-surface'>{row.time}</span>
                          <span className='text-xs text-on-surface-variant'>{row.duration}</span>
                        </td>
                        {showService ? (
                          <td className='px-3 py-3 text-on-surface'>
                            {row.service}
                            {visit.serviceAddress ? (
                              <span className='mt-0.5 flex items-start gap-1 text-xs font-medium text-primary'>
                                <Icon className='text-sm' name='home_pin' />
                                {t('bookingSchedule.table.otherAddress', { address: visit.serviceAddress })}
                              </span>
                            ) : null}
                          </td>
                        ) : null}
                        {compact ? null : (
                          <>
                            <td className='px-3 py-3 text-on-surface-variant'>{row.caregiver}</td>
                            <td className='px-3 py-3'>
                              {visit.occurrence ? <OccurrenceStatusBadge status={visit.occurrence.status} /> : null}
                            </td>
                          </>
                        )}
                        <td className='px-3 py-3 text-right font-semibold text-on-surface tabular-nums'>{row.price}</td>
                        {onSelect ? <td className='px-2 py-2'>{rowButton(visit, row.number)}</td> : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ol className='flex flex-col gap-2 md:hidden'>
              {group.visits.map((visit, index) => {
                const row = describe(visit, index)
                return (
                  <li
                    className='flex items-start gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3'
                    key={visit.id}
                  >
                    <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-primary tabular-nums'>
                      {row.number}
                    </span>
                    <div className='min-w-0 flex-1 text-sm'>
                      <p className='font-semibold text-on-surface'>
                        {row.relative ? `${row.relative} · ` : ''}
                        {row.dayLabel}
                      </p>
                      <p className='text-on-surface tabular-nums'>
                        {row.time}
                        <span className='text-on-surface-variant'> · {row.duration}</span>
                      </p>
                      {showService ? <p className='truncate text-on-surface-variant'>{row.service}</p> : null}
                      {compact ? null : (
                        <div className='mt-1 flex flex-wrap items-center gap-2'>
                          {visit.occurrence ? <OccurrenceStatusBadge status={visit.occurrence.status} /> : null}
                          <span className='text-xs text-on-surface-variant'>{row.caregiver}</span>
                        </div>
                      )}
                    </div>
                    <div className='flex shrink-0 flex-col items-end gap-1'>
                      <span className='font-semibold text-on-surface tabular-nums'>{row.price}</span>
                      {rowButton(visit, row.number)}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
