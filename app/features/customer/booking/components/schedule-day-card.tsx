import { useTranslation } from 'react-i18next'

import { addMinutesToTime, minutesBetween, useFormat } from '~/shared/lib/format'
import { DatePicker } from '~/shared/ui/date-picker'
import { Icon } from '~/shared/ui/icon'
import { TimeSelect } from '~/shared/ui/time-select'

import { MAX_CUSTOM_SLOTS, type CustomSlot } from '../hooks/schedule-slots'
import { isFixedPlan, planEndTime } from '../hooks/service-slots'
import type { BookingForm, SlotIssue, SlotList } from '../hooks/use-booking-form'
import { minimumVisitMinutes } from './visit-duration'

const iconButton =
  'grid h-11 w-11 shrink-0 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'

/**
 * One day of the visit list (2026-11-11): the date (moving it moves every visit of the day), copy / remove the day,
 * then one row per service done that day with its own time, and a button for each chosen service the day does not do
 * yet. Errors (overlap, too soon, outside the dates, plan length, caregiver busy) show under the row that has them.
 */
export function ScheduleDayCard({
  form,
  list,
  date,
  indices,
  slots,
  issues,
  outliers,
  chosen,
  onToggle,
  minDay,
  maxDay
}: {
  form: BookingForm
  list: SlotList
  date: string
  indices: number[]
  slots: CustomSlot[]
  issues: (SlotIssue | null)[]
  outliers: ReadonlyMap<number, number>
  chosen: boolean
  onToggle: () => void
  minDay: string
  maxDay?: string
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const minimum = minimumVisitMinutes(form)
  const noticeType = list === 'recurringSlots' ? 'RECURRING' : 'CUSTOM'
  const tooEarlyReason = t('customer.booking.schedule.tooEarlyDay', {
    duration: format.duration(form.noticeMinutes[noticeType])
  })
  const caregiver = form.chosenCaregiver?.fullName ?? ''
  const buffer = format.duration(form.busy.bufferMinutes)
  const messages: Record<SlotIssue, string | null> = {
    tooEarly: tooEarlyReason,
    invalidTime: t('customer.booking.schedule.invalidTime'),
    overlap: t('customer.booking.schedule.custom.overlap'),
    missingDate: t('customer.booking.schedule.custom.missingDate'),
    outsideRange: t('customer.booking.schedule.recurring.outsideRange'),
    noService: t('customer.booking.schedule.custom.noService'),
    busy: t('customer.booking.schedule.busy.row', { name: caregiver }),
    buffer: t('customer.booking.schedule.busy.bufferRow', { name: caregiver, buffer }),
    unavailable: t('customer.booking.schedule.availability.row', { name: caregiver }),
    // Depends on the visit's plan: written per row below.
    planLength: null
  }
  const dayLabel = date ? format.dayLabel(date) : t('customer.booking.schedule.custom.missingDate')
  const dateInvalid = indices.some((index) => ['tooEarly', 'outsideRange'].includes(issues[index] ?? ''))
  const missing = form.multiService
    ? form.serviceOptions.filter(
        (option) => !indices.some((index) => slots[index].careServiceId === option.careServiceId)
      )
    : []
  const hasError = indices.some((index) => issues[index] && issues[index] !== 'missingDate')

  return (
    <li
      className={`cc-fade-up rounded-xl border p-3 sm:p-4 ${hasError ? 'border-error/40 bg-error-container/20' : chosen ? 'border-primary/50 bg-brand-50/50' : 'border-outline-variant bg-surface-container-lowest'}`}
    >
      <div className='flex flex-wrap items-end gap-3'>
        <label className='flex cursor-pointer items-center gap-2 self-center'>
          <input
            aria-label={t('customer.booking.schedule.bulk.choose', { day: dayLabel })}
            checked={chosen}
            className='h-5 w-5 accent-[var(--color-primary)]'
            onChange={onToggle}
            type='checkbox'
          />
        </label>
        <label className='min-w-40 flex-1 text-xs font-medium text-on-surface-variant'>
          {t('customer.booking.schedule.custom.date')}
          <DatePicker
            aria-invalid={dateInvalid || undefined}
            className='mt-1'
            disabledReason={tooEarlyReason}
            max={maxDay}
            min={minDay}
            onChange={(next) => form.moveDay(date, next, list)}
            value={date}
          />
        </label>
        <span className='pb-3 text-sm text-on-surface-variant'>
          {t('customer.booking.schedule.custom.dayVisits', { count: indices.length })}
        </span>
        <span className='ml-auto flex gap-1'>
          <button
            aria-label={t('customer.booking.schedule.custom.duplicateDay', { day: dayLabel })}
            className={iconButton}
            disabled={!date || slots.length + indices.length > MAX_CUSTOM_SLOTS}
            onClick={() => form.duplicateDay(date, list)}
            title={t('customer.booking.schedule.custom.duplicateDay', { day: dayLabel })}
            type='button'
          >
            <Icon name='content_copy' />
          </button>
          <button
            aria-label={t('customer.booking.schedule.custom.removeDay', { day: dayLabel })}
            className={`${iconButton} hover:text-error`}
            onClick={() => form.removeDay(date, list)}
            title={t('customer.booking.schedule.custom.removeDay', { day: dayLabel })}
            type='button'
          >
            <Icon name='delete' />
          </button>
        </span>
      </div>

      <ul className='mt-3 flex flex-col gap-2 border-t border-outline-variant/60 pt-3'>
        {indices.map((index, position) => {
          const slot = slots[index]
          // Column titles only on the first row of the day; later rows keep them for screen readers.
          const caption = position === 0 ? undefined : 'sr-only'
          const gap = position === 0 ? 'mt-1' : ''
          const issue = issues[index]
          const errorId = `${list}-${index}-error`
          const option = form.serviceOfSlot(slot.careServiceId)
          const name = option?.name ?? ''
          const planMessage =
            issue === 'planLength' && option?.plan?.durationMinutes
              ? t(
                  isFixedPlan(option.plan)
                    ? 'customer.booking.schedule.custom.planFixed'
                    : 'customer.booking.schedule.custom.planMinimum',
                  { plan: option.plan.planName, duration: format.duration(option.plan.durationMinutes) }
                )
              : null
          const message = issue && issue !== 'missingDate' ? (planMessage ?? messages[issue]) : null
          const length = minutesBetween(slot.startTime, slot.endTime)
          const usual = issue ? undefined : outliers.get(index)
          return (
            <li key={index}>
              <div className='flex flex-wrap items-end gap-3'>
                {form.multiService ? (
                  <label className='min-w-44 flex-1 text-xs font-medium text-on-surface-variant'>
                    <span className={caption}>{t('customer.booking.schedule.custom.service')}</span>
                    <select
                      aria-describedby={message ? errorId : undefined}
                      aria-invalid={issue === 'noService' || undefined}
                      className={`${gap} flex min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface`}
                      onChange={(event) =>
                        form.updateSlot(index, { careServiceId: event.target.value || undefined }, list)
                      }
                      value={option ? option.careServiceId : ''}
                    >
                      <option value=''>{t('customer.booking.schedule.custom.servicePlaceholder')}</option>
                      {form.serviceOptions.map((item) => (
                        <option key={item.careServiceId} value={item.careServiceId}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span className='min-w-44 flex-1 self-center text-sm font-medium text-on-surface'>{name}</span>
                )}
                <label className='w-28 text-xs font-medium text-on-surface-variant'>
                  <span className={caption}>{t('customer.booking.schedule.custom.start')}</span>
                  <TimeSelect
                    className={gap}
                    onChange={(startTime) =>
                      form.updateSlot(
                        index,
                        {
                          startTime,
                          endTime:
                            minutesBetween(startTime, slot.endTime) >= minimum
                              ? slot.endTime
                              : addMinutesToTime(startTime, minimum)
                        },
                        list
                      )
                    }
                    value={slot.startTime}
                  />
                </label>
                <label className='w-28 text-xs font-medium text-on-surface-variant'>
                  <span className={caption}>{t('customer.booking.schedule.custom.end')}</span>
                  <TimeSelect
                    aria-describedby={message ? errorId : undefined}
                    aria-invalid={issue === 'invalidTime' || undefined}
                    className={gap}
                    onChange={(endTime) => form.updateSlot(index, { endTime }, list)}
                    value={slot.endTime}
                  />
                </label>
                <span
                  className={`min-w-16 pb-3 text-sm tabular-nums ${usual ? 'font-semibold text-on-warning-container' : 'text-on-surface-variant'}`}
                >
                  {format.duration(length)}
                </span>
                <button
                  aria-label={t('customer.booking.schedule.custom.remove', { service: name, day: dayLabel })}
                  className={`${iconButton} hover:text-error`}
                  onClick={() => form.removeSlot(index, list)}
                  title={t('customer.booking.schedule.custom.remove', { service: name, day: dayLabel })}
                  type='button'
                >
                  <Icon name='close' />
                </button>
              </div>
              {usual ? (
                <p className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-warning-container'>
                  <span className='flex items-center gap-1.5'>
                    <Icon className='text-base' name='warning' />
                    {t('customer.booking.schedule.duration.rowDiffers', {
                      duration: format.duration(length),
                      usual: format.duration(usual)
                    })}
                  </span>
                  <button
                    className='font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
                    onClick={() => form.updateSlot(index, { endTime: addMinutesToTime(slot.startTime, usual) }, list)}
                    type='button'
                  >
                    {t('customer.booking.schedule.duration.fix', { usual: format.duration(usual) })}
                  </button>
                </p>
              ) : null}
              {message ? (
                <p className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-error' id={errorId}>
                  <span className='flex items-center gap-1.5'>
                    <Icon className='text-base' name='error' />
                    {message}
                  </span>
                  {planMessage && option?.plan && isFixedPlan(option.plan) ? (
                    <button
                      className='font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
                      onClick={() =>
                        form.updateSlot(index, { endTime: planEndTime(option.plan, slot.startTime) }, list)
                      }
                      type='button'
                    >
                      {t('customer.booking.schedule.custom.planFix', {
                        time: planEndTime(option.plan, slot.startTime)
                      })}
                    </button>
                  ) : null}
                </p>
              ) : !issue && form.noneFreeOf(slot) ? (
                <p className='mt-1 flex items-center gap-1.5 text-sm text-on-warning-container'>
                  <Icon className='text-base' name='person_search' />
                  {t('customer.booking.schedule.availability.noneFreeRow')}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>

      {missing.length > 0 && date ? (
        <div className='mt-2 flex flex-wrap gap-2'>
          {missing.map((option) => (
            <button
              className='inline-flex min-h-10 items-center gap-1.5 rounded-full border border-dashed border-outline-variant px-3 text-sm text-primary hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
              key={option.careServiceId}
              onClick={() => form.addServiceToDay(date, option.careServiceId, list)}
              type='button'
            >
              <Icon className='text-base' name='add' />
              {t('customer.booking.schedule.custom.addService', { service: option.name })}
            </button>
          ))}
        </div>
      ) : null}
    </li>
  )
}
