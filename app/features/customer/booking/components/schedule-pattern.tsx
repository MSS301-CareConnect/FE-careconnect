import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { addMinutesToTime, useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import {
  MAX_CUSTOM_SLOTS,
  ruleDays,
  ruleIssuesOf,
  slotsFromPattern,
  type CustomSlot,
  type RecurrenceRule,
  type ServiceTime
} from '../hooks/schedule-slots'
import { serviceTimeIssues } from '../hooks/service-slots'
import type { BookingForm } from '../hooks/use-booking-form'
import { useCaregiverBusy, type BusyConflict } from '../hooks/use-caregiver-busy'
import { ScheduleRuleFields } from './schedule-rule-fields'
import { ScheduleServiceTimes } from './schedule-service-times'

/**
 * A daily / weekly pattern that builds visits on demand (2026-11-11): the days (frequency, weekdays, dates), then the
 * time of each chosen service, then a button. Nothing is built until the customer presses it. A visit that would be too
 * soon, or that overlaps another booking of the chosen caregiver or its travel buffer, blocks the button up front
 * (2026-11-11): the days in question show under the service, and the customer changes the time or the days, or builds
 * only the other visits.
 */
type Snag = 'tooEarly' | BusyConflict
const SNAGS: Snag[] = ['tooEarly', 'busy', 'buffer']

export function SchedulePattern({
  form,
  rule,
  onRuleChange,
  idPrefix,
  submitLabel,
  onSubmit,
  footer
}: {
  form: BookingForm
  rule: RecurrenceRule
  onRuleChange: (patch: Partial<RecurrenceRule>) => void
  idPrefix: string
  submitLabel: (count: number) => string
  onSubmit: (slots: CustomSlot[]) => void
  footer?: ReactNode
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const options = form.serviceOptions
  const [edited, setEdited] = useState<ServiceTime[]>([])
  // Each service starts right after the previous one; a service chosen later gets its own default.
  const starts = options.reduce<string[]>(
    (list, option, index) => [
      ...list,
      index === 0 ? '08:00' : addMinutesToTime(list[index - 1], form.defaultLength(options[index - 1]))
    ],
    []
  )
  const times = options.map(
    (option, index): ServiceTime =>
      edited.find((time) => time.careServiceId === option.careServiceId) ?? {
        careServiceId: option.careServiceId,
        startTime: starts[index],
        endTime: addMinutesToTime(starts[index], form.defaultLength(option)),
        enabled: true
      }
  )
  const ruleIssues = ruleIssuesOf(rule)
  const timeIssues = serviceTimeIssues(times, options)
  const noneChosen = !times.some((time) => time.enabled)
  const candidates = slotsFromPattern(rule, times)
  const tooMany = candidates.length > MAX_CUSTOM_SLOTS
  const busy = useCaregiverBusy(form.selectedCaregiverId || undefined, form.earliestDay, ruleDays(rule))
  const snagOf = (slot: CustomSlot): Snag | null =>
    form.isTooEarly(slot.date, slot.startTime) ? 'tooEarly' : busy.conflictOf(slot)
  const clean = candidates.filter((slot) => !snagOf(slot))
  const snagged = candidates.length - clean.length
  // Rules that no choice of visits can fix; snags can be fixed or skipped.
  const invalid =
    ruleIssues.invalidRange || ruleIssues.noWeekday || noneChosen || timeIssues.some(Boolean) || busy.checking
  const blocked = invalid || candidates.length === 0 || tooMany || snagged > 0
  const caregiver = form.chosenCaregiver?.fullName ?? ''
  const listDates = (dates: string[]) => {
    const shown = dates.slice(0, 3).map(format.shortDate).join(', ')
    return dates.length > 3
      ? t('customer.booking.schedule.pattern.moreDates', { dates: shown, count: dates.length - 3 })
      : shown
  }
  // Per service: the days its visit would be too soon, clash or sit inside the travel buffer.
  const notes = times.map((time) =>
    SNAGS.flatMap((kind) => {
      const dates = candidates
        .filter((slot) => slot.careServiceId === time.careServiceId && snagOf(slot) === kind)
        .map((slot) => slot.date)
      return dates.length === 0
        ? []
        : [
            t(`customer.booking.schedule.pattern.snag.${kind}`, {
              dates: listDates(dates),
              name: caregiver,
              buffer: format.duration(busy.bufferMinutes),
              duration: format.duration(form.noticeMinutes[form.schedule.bookingType])
            })
          ]
    })
  )

  function change(careServiceId: string, patch: Partial<ServiceTime>) {
    setEdited(times.map((time) => (time.careServiceId === careServiceId ? { ...time, ...patch } : time)))
  }

  return (
    <div className='flex flex-col gap-5'>
      <ScheduleRuleFields
        earliestDay={form.earliestDay}
        idPrefix={idPrefix}
        issues={ruleIssues}
        onChange={onRuleChange}
        rule={rule}
        tooEarlyReason={t('customer.booking.schedule.tooEarlyDay', {
          duration: format.duration(form.noticeMinutes[form.schedule.bookingType])
        })}
      />
      <ScheduleServiceTimes
        idPrefix={idPrefix}
        issues={timeIssues}
        noneChosen={noneChosen}
        notes={notes}
        onChange={change}
        options={options}
        times={times}
      />

      <div aria-live='polite' className='flex flex-col gap-2 text-sm'>
        {ruleIssues.noVisits && !ruleIssues.invalidRange && !ruleIssues.noWeekday ? (
          <p className='flex items-start gap-2 text-on-surface-variant'>
            <Icon className='text-lg' name='event_busy' />
            {t('customer.booking.schedule.recurring.noVisits')}
          </p>
        ) : candidates.length > 0 ? (
          <p className='flex items-start gap-2 text-on-surface-variant'>
            <Icon className='text-lg' name='event_available' />
            {t('customer.booking.schedule.pattern.preview', {
              count: candidates.length,
              days: ruleDays(rule).length
            })}
          </p>
        ) : null}
        {tooMany ? (
          <p className='flex items-start gap-2 text-error'>
            <Icon className='text-lg' name='error' />
            {t('customer.booking.schedule.pattern.tooMany', { max: MAX_CUSTOM_SLOTS })}
          </p>
        ) : null}
        {busy.checking ? (
          <p className='flex items-start gap-2 text-on-surface-variant'>
            <Icon className='text-lg' name='progress_activity' />
            {t('customer.booking.schedule.pattern.checking', { name: caregiver })}
          </p>
        ) : snagged > 0 ? (
          <p className='flex items-start gap-2 text-error' role='status'>
            <Icon className='text-lg' name='event_busy' />
            {t('customer.booking.schedule.pattern.blocked', { count: snagged })}
          </p>
        ) : null}
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Button
          disabled={blocked}
          leftIcon={<Icon className='text-lg' name='playlist_add' />}
          onClick={() => onSubmit(candidates)}
        >
          {submitLabel(candidates.length)}
        </Button>
        {snagged > 0 && clean.length > 0 && !invalid ? (
          <Button
            disabled={clean.length > MAX_CUSTOM_SLOTS}
            leftIcon={<Icon className='text-lg' name='rule' />}
            onClick={() => onSubmit(clean)}
            variant='outline'
          >
            {t('customer.booking.schedule.pattern.skip', { count: clean.length, skipped: snagged })}
          </Button>
        ) : null}
        {footer}
      </div>
    </div>
  )
}
