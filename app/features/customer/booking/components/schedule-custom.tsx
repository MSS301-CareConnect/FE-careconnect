import { useTranslation } from 'react-i18next'

import { addMinutesToTime, minutesBetween, useFormat } from '~/shared/lib/format'
import { DatePicker } from '~/shared/ui/date-picker'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { TimeSelect } from '~/shared/ui/time-select'

import { MAX_CUSTOM_SLOTS, type BookingForm } from '../hooks/use-booking-form'
import { minimumVisitMinutes } from './schedule-recurring'

const iconButton =
  'grid h-11 w-11 shrink-0 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'

/** CUSTOM (spec §4): one row per visit; errors (overlap, too soon) show on the row that has them. */
export function ScheduleCustom({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const { slots } = form.schedule
  const minimum = minimumVisitMinutes(form)
  const tooEarlyReason = t('customer.booking.schedule.tooEarlyDay', {
    duration: format.duration(form.noticeMinutes.CUSTOM)
  })

  return (
    <fieldset>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <legend className='text-sm font-semibold text-on-surface'>
          {t('customer.booking.schedule.custom.legend')}
        </legend>
        <span className='rounded-full bg-surface-container-low px-3 py-1 text-sm text-on-surface-variant tabular-nums'>
          {t('customer.booking.schedule.custom.counter', { count: slots.length, max: MAX_CUSTOM_SLOTS })}
        </span>
      </div>
      <ol className='flex flex-col gap-3'>
        {slots.map((slot, index) => {
          const issue = form.slotIssues[index]
          const errorId = `slot-${index}-error`
          const number = index + 1
          const length = minutesBetween(slot.startTime, slot.endTime)
          const message =
            issue === 'tooEarly'
              ? tooEarlyReason
              : issue === 'invalidTime'
                ? t('customer.booking.schedule.invalidTime')
                : issue === 'overlap'
                  ? t('customer.booking.schedule.custom.overlap')
                  : issue === 'missingDate'
                    ? t('customer.booking.schedule.custom.missingDate')
                    : null
          return (
            <li
              className={`cc-fade-up rounded-xl border p-3 sm:p-4 ${issue && issue !== 'missingDate' ? 'border-error/40 bg-error-container/30' : 'border-outline-variant bg-surface-container-lowest'}`}
              key={index}
            >
              <div className='flex flex-wrap items-end gap-3'>
                <span className='w-full text-xs font-semibold text-on-surface-variant sm:w-auto sm:self-center'>
                  {t('customer.booking.schedule.custom.visit', { number })}
                </span>
                <label className='min-w-40 flex-1 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.schedule.custom.date')}
                  <DatePicker
                    aria-describedby={message ? errorId : undefined}
                    aria-invalid={issue === 'tooEarly' || issue === 'overlap' || undefined}
                    className='mt-1'
                    disabledReason={tooEarlyReason}
                    min={form.earliestDay}
                    onChange={(date) => form.updateSlot(index, { date })}
                    value={slot.date}
                  />
                </label>
                <label className='w-28 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.schedule.custom.start')}
                  <TimeSelect
                    className='mt-1'
                    onChange={(startTime) =>
                      form.updateSlot(index, {
                        startTime,
                        endTime:
                          minutesBetween(startTime, slot.endTime) >= minimum
                            ? slot.endTime
                            : addMinutesToTime(startTime, minimum)
                      })
                    }
                    value={slot.startTime}
                  />
                </label>
                <label className='w-28 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.schedule.custom.end')}
                  <TimeSelect
                    aria-describedby={message ? errorId : undefined}
                    aria-invalid={issue === 'invalidTime' || undefined}
                    className='mt-1'
                    onChange={(endTime) => form.updateSlot(index, { endTime })}
                    value={slot.endTime}
                  />
                </label>
                <span className='min-w-16 pb-3 text-sm text-on-surface-variant tabular-nums'>
                  {format.duration(length)}
                </span>
                <span className='ml-auto flex gap-1'>
                  <button
                    aria-label={t('customer.booking.schedule.custom.duplicate', { number })}
                    className={iconButton}
                    disabled={slots.length >= MAX_CUSTOM_SLOTS}
                    onClick={() => form.duplicateSlot(index)}
                    title={t('customer.booking.schedule.custom.duplicate', { number })}
                    type='button'
                  >
                    <Icon name='content_copy' />
                  </button>
                  {slots.length > 1 ? (
                    <button
                      aria-label={t('customer.booking.schedule.custom.remove', { number })}
                      className={`${iconButton} hover:text-error`}
                      onClick={() => form.removeSlot(index)}
                      title={t('customer.booking.schedule.custom.remove', { number })}
                      type='button'
                    >
                      <Icon name='delete' />
                    </button>
                  ) : null}
                </span>
              </div>
              {message ? (
                <p className='mt-2 flex items-center gap-1.5 text-sm text-error' id={errorId}>
                  <Icon className='text-base' name='error' />
                  {message}
                </p>
              ) : null}
            </li>
          )
        })}
      </ol>
      {slots.length < MAX_CUSTOM_SLOTS ? (
        <Button
          className='mt-3'
          leftIcon={<Icon className='text-lg' name='add' />}
          onClick={form.addSlot}
          variant='outline'
        >
          {t('customer.booking.schedule.custom.add')}
        </Button>
      ) : null}
    </fieldset>
  )
}
