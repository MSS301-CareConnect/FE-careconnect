import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { WEEKDAYS } from '~/entities/booking/booking-format'

import type { useBookingForm } from '../hooks/use-booking-form'
import { BookingPanel, bookingField } from './booking-panel'

type Form = ReturnType<typeof useBookingForm>
const SCHEDULE_TYPES = ['ONE_TIME', 'DAILY', 'WEEKLY'] as const
const label = 'text-sm font-semibold text-[#1b2922]'

export function BookingScheduleSection({ form }: { form: Form }) {
  const { t } = useTranslation()
  const id = useId()
  const { schedule, updateSchedule } = form
  const repeating = schedule.scheduleType !== 'ONE_TIME'
  const invalidTime = Boolean(schedule.startTime && schedule.endTime && schedule.endTime <= schedule.startTime)
  const invalidRange = repeating && Boolean(schedule.endDate && schedule.endDate < schedule.startDate)

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
          <div className='mt-2 grid grid-cols-3 gap-1 rounded-xl bg-[#f2f6f1] p-1 sm:inline-grid'>
            {SCHEDULE_TYPES.map((type) => (
              <label
                className={`cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-[#075b31] ${schedule.scheduleType === type ? 'bg-[#075b31] text-white' : 'text-[#44594b] hover:bg-[#e8f0e8]'}`}
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

        <div className='grid gap-4 sm:grid-cols-2'>
          <label className={label}>
            {repeating ? t('customer.booking.schedule.startDate') : t('customer.booking.schedule.date')}
            <input
              className={bookingField}
              onChange={(event) => updateSchedule({ startDate: event.target.value })}
              type='date'
              value={schedule.startDate}
            />
          </label>
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
          <p className='-mt-2 text-sm text-[#ba1a1a]' id={`${id}-range`}>
            {t('customer.booking.schedule.invalidRange')}
          </p>
        ) : null}
        {invalidTime ? (
          <p className='-mt-2 text-sm text-[#ba1a1a]' id={`${id}-time`}>
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
                    className={`grid h-11 min-w-12 cursor-pointer place-items-center rounded-lg border px-3 text-sm font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-[#075b31] ${checked ? 'border-[#075b31] bg-[#075b31] text-white' : 'border-[#d5e0d5] bg-white text-[#44594b] hover:border-[#a8c2ad]'}`}
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
