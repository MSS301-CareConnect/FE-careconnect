import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { WEEKDAYS } from '~/entities/booking/booking-format'
import { Icon } from '~/shared/ui/icon'

import type { useBookingForm } from '../hooks/use-booking-form'
import { BookingPanel, bookingField } from './booking-panel'

type Form = ReturnType<typeof useBookingForm>
const SCHEDULE_TYPES = ['ONE_TIME', 'DAILY', 'WEEKLY'] as const
const label = 'text-sm font-semibold text-on-surface'

export function BookingScheduleSection({ form }: { form: Form }) {
  const { t } = useTranslation()
  const id = useId()
  const { schedule, updateSchedule } = form
  const repeating = schedule.scheduleType !== 'ONE_TIME'
  const invalidTime = Boolean(schedule.startTime && schedule.endTime && schedule.endTime <= schedule.startTime)
  const invalidRange = repeating && Boolean(schedule.endDate && schedule.endDate < schedule.startDate)
  const duplicateDate =
    !repeating && new Set(schedule.oneTimeDates.filter(Boolean)).size !== schedule.oneTimeDates.filter(Boolean).length

  return (
    <BookingPanel
      description={t('customer.booking.schedule.leadTime')}
      icon='calendar_month'
      id='booking-schedule'
      title={t('customer.booking.schedule.title')}
    >
      <div className='flex flex-col gap-5'>
        <fieldset>
          <legend className={label}>{t('customer.booking.schedule.type')}</legend>
          <div className='mt-2 grid grid-cols-3 gap-1 rounded-xl bg-surface-container p-1 sm:inline-grid'>
            {SCHEDULE_TYPES.map((type) => (
              <label
                className={`cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${schedule.scheduleType === type ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-primary-fixed/60'}`}
                key={type}
              >
                <input
                  checked={schedule.scheduleType === type}
                  className='sr-only'
                  name='scheduleType'
                  onChange={() => updateSchedule({ scheduleType: type })}
                  type='radio'
                />
                {t(`booking.scheduleType.${type}`)}
              </label>
            ))}
          </div>
        </fieldset>

        {!repeating ? (
          <div className='rounded-2xl border border-outline-variant/60 bg-surface-container-low p-4 sm:p-5'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <p className={label}>{t('customer.booking.schedule.selectedDates')}</p>
                <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.booking.schedule.dateLimit')}</p>
              </div>
              <span className='rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-primary'>
                {t('customer.booking.schedule.dateCount', { count: schedule.oneTimeDates.length })}
              </span>
            </div>
            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              {schedule.oneTimeDates.map((date, index) => (
                <div className='flex items-end gap-2' key={index}>
                  <label className={`${label} min-w-0 flex-1`}>
                    {t('customer.booking.schedule.visitDate', { number: index + 1 })}
                    <input
                      aria-invalid={Boolean(date && schedule.oneTimeDates.indexOf(date) !== index)}
                      className={bookingField}
                      onChange={(event) => form.updateOneTimeDate(index, event.target.value)}
                      type='date'
                      value={date}
                    />
                  </label>
                  {schedule.oneTimeDates.length > 1 ? (
                    <button
                      aria-label={t('customer.booking.schedule.removeDate', { number: index + 1 })}
                      className='mb-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-outline-variant text-on-surface-variant hover:border-error hover:text-error'
                      onClick={() => form.removeOneTimeDate(index)}
                      type='button'
                    >
                      <Icon name='close' />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            {duplicateDate ? (
              <p className='mt-2 text-sm text-error' role='alert'>
                {t('customer.booking.schedule.duplicateDate')}
              </p>
            ) : null}
            {schedule.oneTimeDates.length < 4 ? (
              <button
                className='mt-4 rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary-fixed'
                onClick={form.addOneTimeDate}
                type='button'
              >
                {t('customer.booking.schedule.addDate')}
              </button>
            ) : null}
            <p className='mt-3 text-xs leading-5 text-on-surface-variant'>
              {t('customer.booking.schedule.separateRequests')}
            </p>
          </div>
        ) : null}
        <div className='grid gap-4 sm:grid-cols-2'>
          {repeating ? (
            <label className={label}>
              {t('customer.booking.schedule.startDate')}
              <input
                className={bookingField}
                onChange={(event) => updateSchedule({ startDate: event.target.value })}
                type='date'
                value={schedule.startDate}
              />
            </label>
          ) : null}
          {repeating ? (
            <label className={label}>
              {t('customer.booking.schedule.endDate')}
              <input
                aria-describedby={invalidRange ? `${id}-range` : undefined}
                aria-invalid={invalidRange}
                className={bookingField}
                min={schedule.startDate}
                onChange={(event) => updateSchedule({ endDate: event.target.value })}
                type='date'
                value={schedule.endDate}
              />
            </label>
          ) : null}
          <label className={label}>
            {t('customer.booking.schedule.startTime')}
            <input
              className={bookingField}
              onChange={(event) => updateSchedule({ startTime: event.target.value })}
              step={900}
              type='time'
              value={schedule.startTime}
            />
          </label>
          <label className={label}>
            {t('customer.booking.schedule.endTime')}
            <input
              aria-describedby={invalidTime ? `${id}-time` : undefined}
              aria-invalid={invalidTime}
              className={bookingField}
              onChange={(event) => updateSchedule({ endTime: event.target.value })}
              step={900}
              type='time'
              value={schedule.endTime}
            />
          </label>
        </div>
        {invalidRange ? (
          <p className='-mt-2 text-sm text-error' id={`${id}-range`}>
            {t('customer.booking.schedule.invalidRange')}
          </p>
        ) : null}
        {invalidTime ? (
          <p className='-mt-2 text-sm text-error' id={`${id}-time`}>
            {t('customer.booking.schedule.invalidTime')}
          </p>
        ) : null}

        {schedule.scheduleType === 'WEEKLY' ? (
          <fieldset>
            <legend className={label}>{t('customer.booking.schedule.weekdays')}</legend>
            <div className='mt-2 flex flex-wrap gap-2'>
              {WEEKDAYS.map((day) => {
                const value = Number(day)
                const checked = schedule.daysOfWeek.includes(value)
                return (
                  <label
                    className={`grid h-11 min-w-12 cursor-pointer place-items-center rounded-xl border px-3 text-sm font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${checked ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-outline'}`}
                    key={day}
                  >
                    <input
                      checked={checked}
                      className='sr-only'
                      onChange={() =>
                        updateSchedule({
                          daysOfWeek: checked
                            ? schedule.daysOfWeek.filter((item) => item !== value)
                            : [...schedule.daysOfWeek, value]
                        })
                      }
                      type='checkbox'
                    />
                    {t(`booking.weekdays.${day}`)}
                  </label>
                )
              })}
            </div>
          </fieldset>
        ) : null}

        <label className={label}>
          {t('customer.booking.schedule.note')}
          <textarea
            className={bookingField}
            maxLength={2000}
            onChange={(event) => form.setCustomerNote(event.target.value)}
            placeholder={t('customer.booking.schedule.notePlaceholder')}
            rows={3}
            value={form.customerNote}
          />
        </label>
      </div>
    </BookingPanel>
  )
}
