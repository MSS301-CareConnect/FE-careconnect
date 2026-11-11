import { useTranslation } from 'react-i18next'

import type { BookingForm } from '../hooks/use-booking-form'
import { ScheduleDayList } from './schedule-day-list'
import { SchedulePattern } from './schedule-pattern'

/**
 * RECURRING (2026-11-11): the pattern (days + a time per service) builds the visit list only when the customer presses
 * the button; the list, one card per day, stays editable — change a time, drop a day off, add a day within the dates.
 * Changing the pattern afterwards does not rebuild it; pressing the button again replaces it.
 */
export function ScheduleRecurring({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const { schedule } = form
  const existing = schedule.recurringSlots.length

  return (
    <div className='flex flex-col gap-6'>
      <SchedulePattern
        form={form}
        idPrefix='recurring'
        onRuleChange={form.updateSchedule}
        onSubmit={form.setRecurringSlots}
        rule={schedule}
        submitLabel={(count) =>
          existing > 0
            ? t('customer.booking.schedule.recurring.rebuild', { count, existing })
            : t('customer.booking.schedule.recurring.build', { count })
        }
      />

      {existing > 0 ? (
        <ScheduleDayList
          form={form}
          hint={t('customer.booking.schedule.recurring.listHint')}
          issues={form.recurringSlotIssues}
          legend={t('customer.booking.schedule.recurring.listLegend')}
          list='recurringSlots'
          maxDay={schedule.endDate || undefined}
          minDay={schedule.startDate && schedule.startDate > form.earliestDay ? schedule.startDate : form.earliestDay}
          slots={schedule.recurringSlots}
        />
      ) : null}
    </div>
  )
}
