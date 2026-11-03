import { useTranslation } from 'react-i18next'

import type { BookingForm } from '../hooks/use-booking-form'
import { ScheduleQuickAdd } from './schedule-quick-add'
import { ScheduleSlotList } from './schedule-slot-list'

/** CUSTOM (spec §4): one row per visit, added by hand or many at once through quick add (CR-1). */
export function ScheduleCustom({ form }: { form: BookingForm }) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-5'>
      <ScheduleQuickAdd form={form} />
      <ScheduleSlotList
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
