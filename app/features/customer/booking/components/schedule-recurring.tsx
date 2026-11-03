import { useTranslation } from 'react-i18next'

import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import type { BookingForm } from '../hooks/use-booking-form'
import { ScheduleRuleFields } from './schedule-rule-fields'
import { ScheduleSlotList } from './schedule-slot-list'
import { minimumVisitMinutes } from './visit-duration'

/**
 * RECURRING (CR-1): the pattern builds the visit list, which stays editable like custom visits — change one visit's
 * time, drop a day off or add a visit within the dates. Once edited, changing the pattern no longer rebuilds the list.
 */
export function ScheduleRecurring({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const { schedule, recurringIssues: issues } = form
  const tooEarlyReason = t('customer.booking.schedule.tooEarlyDay', {
    duration: format.duration(form.noticeMinutes.RECURRING)
  })

  return (
    <div className='flex flex-col gap-6'>
      <ScheduleRuleFields
        earliestDay={form.earliestDay}
        idPrefix='recurring'
        issues={issues}
        minimumMinutes={minimumVisitMinutes(form)}
        onChange={form.updateSchedule}
        rule={schedule}
        tooEarlyReason={tooEarlyReason}
      />

      {schedule.recurringEdited ? (
        <div
          aria-live='polite'
          className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-sm text-on-surface'
        >
          <span className='flex items-start gap-2'>
            <Icon className='text-lg text-primary' name='edit_note' />
            {t('customer.booking.schedule.recurring.edited')}
          </span>
          <Button
            leftIcon={<Icon className='text-lg' name='restart_alt' />}
            onClick={form.regenerateRecurring}
            size='sm'
            variant='outline'
          >
            {t('customer.booking.schedule.recurring.regenerate')}
          </Button>
        </div>
      ) : null}

      {issues.noVisits && !schedule.recurringEdited ? (
        <p className='flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-on-surface-variant'>
          <Icon className='text-lg' name='event_busy' />
          {t('customer.booking.schedule.recurring.noVisits')}
        </p>
      ) : (
        <ScheduleSlotList
          form={form}
          hint={t('customer.booking.schedule.recurring.listHint')}
          issues={form.recurringSlotIssues}
          legend={t('customer.booking.schedule.recurring.listLegend')}
          list='recurringSlots'
          maxDay={schedule.endDate || undefined}
          minDay={schedule.startDate && schedule.startDate > form.earliestDay ? schedule.startDate : form.earliestDay}
          slots={schedule.recurringSlots}
        />
      )}
    </div>
  )
}
