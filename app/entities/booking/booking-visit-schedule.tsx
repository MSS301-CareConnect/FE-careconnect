import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BookingItemRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { SegmentedControl } from '~/shared/ui/segmented-control'

import { BookingVisitCalendar } from './booking-visit-calendar'
import { BookingVisitTable, occurrenceVisits } from './booking-visit-table'

type ScheduleView = 'table' | 'calendar'

/**
 * Schedule of one booking (2026-11-09): a table grouped by month by default, or a month calendar. Both open the visit
 * through `onSelect`.
 */
export function BookingVisitSchedule({
  occurrences,
  today,
  services,
  caregiverName,
  onSelect
}: {
  occurrences: BookingOccurrenceRecord[]
  today: string
  services?: BookingItemRecord[]
  caregiverName?: (caregiverId: string) => string | undefined
  onSelect?: (occurrence: BookingOccurrenceRecord) => void
}) {
  const { t } = useTranslation()
  const [view, setView] = useState<ScheduleView>('table')
  const visits = occurrenceVisits(occurrences)

  return (
    <div className='flex flex-col gap-4'>
      <SegmentedControl
        className='self-start'
        legend={t('bookingSchedule.view.legend')}
        onChange={setView}
        options={[
          { value: 'table', label: t('bookingSchedule.view.table') },
          { value: 'calendar', label: t('bookingSchedule.view.calendar') }
        ]}
        value={view}
      />
      {view === 'table' ? (
        <BookingVisitTable
          caregiverName={caregiverName}
          onSelect={onSelect}
          services={services}
          today={today}
          visits={visits}
        />
      ) : (
        <BookingVisitCalendar onSelect={onSelect} today={today} visits={visits} />
      )}
    </div>
  )
}
