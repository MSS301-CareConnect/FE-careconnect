import { useTranslation } from 'react-i18next'

import type { BookingForm } from '../hooks/use-booking-form'
import { ScheduleDayList } from './schedule-day-list'
import { ScheduleQuickAdd } from './schedule-quick-add'

/** CUSTOM (spec §4): visits grouped by day, added a day at a time or many at once through quick add (2026-11-11). */
export function ScheduleCustom({ form }: { form: BookingForm }) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-5'>
      <ScheduleQuickAdd form={form} />
      <ScheduleDayList
        form={form}
        issues={form.slotIssues}
        legend={t('customer.booking.schedule.custom.legend')}
        list='slots'
        minDay={form.earliestDay}
        slots={form.schedule.slots}
      />
    </div>
  )
}
