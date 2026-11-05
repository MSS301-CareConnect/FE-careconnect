import { useTranslation } from 'react-i18next'

import type { BookingItemRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'

import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { visitMinutes, visitServiceName } from '../request-model'

/** One visit of a request: number, day, hours and length, its service and its price. */
export function RequestVisitRow({
  visit,
  services,
  index
}: {
  visit: BookingOccurrenceRecord
  services: BookingItemRecord[] | undefined
  index: number
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const money = useFormat().money
  const service = visitServiceName(visit, services) ?? t('caregiver.requests.allServices')

  return (
    <li className='grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-lg bg-surface-container-low px-3 py-2.5 text-sm'>
      <span className='row-span-2 grid h-8 min-w-8 place-items-center rounded-md bg-surface-container-lowest px-1.5 text-xs font-bold text-primary tabular-nums'>
        {visit.occurrenceNo || index + 1}
      </span>
      <span className='font-semibold text-on-surface tabular-nums'>
        {format.shortDay(calendarDayOf(visit.startAt))} · {format.clockRange(visit.startAt, visit.endAt)}
        <span className='font-normal text-on-surface-variant'> · {format.duration(visitMinutes(visit))}</span>
      </span>
      <span className='row-span-2 text-right font-semibold text-on-surface tabular-nums'>
        {visit.priceAmount !== undefined ? money(visit.priceAmount) : ''}
      </span>
      <span className='truncate text-on-surface-variant'>{service}</span>
    </li>
  )
}
