import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { WEEKDAYS } from '~/entities/booking/booking-format'
import { SectionCard } from '~/shared/ui/section-card'

import type { useBookingForm } from '../hooks/use-booking-form'

type Form = ReturnType<typeof useBookingForm>
const SCHEDULE_TYPES = ['ONE_TIME', 'DAILY', 'WEEKLY'] as const
const field =
  'mt-1 w-full rounded-lg border border-outline-variant/60 bg-white p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none'

export function BookingScheduleSection({ form }: { form: Form }) {
  const { t } = useTranslation()
  const id = useId()
  const { schedule, updateSchedule } = form
  const repeating = schedule.scheduleType !== 'ONE_TIME'
  const invalidTime = Boolean(schedule.startTime && schedule.endTime && schedule.endTime <= schedule.startTime)
  const invalidRange = repeating && Boolean(schedule.endDate && schedule.endDate < schedule.startDate)

  return (
    <SectionCard icon='calendar_month' title={t('customer.booking.schedule.title')}>
      <div className='flex flex-col gap-5'>
        <fieldset>
          <legend className='text-sm font-semibold text-on-surface'>{t('customer.booking.schedule.type')}</legend>
          <div className='mt-2 inline-flex flex-wrap gap-1 rounded-lg bg-surface-container-low p-1'>
            {SCHEDULE_TYPES.map((type) => (
              <label
                className={`cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${schedule.scheduleType === type ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
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
          <label className='text-sm font-semibold text-on-surface'>
            {repeating ? t('customer.booking.schedule.startDate') : t('customer.booking.schedule.date')}
            <input
              className={field}
              onChange={(event) => updateSchedule({ startDate: event.target.value })}
              type='date'
              value={schedule.startDate}
            />
          </label>
          {repeating ? (
            <label className='text-sm font-semibold text-on-surface'>
              {t('customer.booking.schedule.endDate')}
              <input
                aria-describedby={invalidRange ? `${id}-range` : undefined}
                aria-invalid={invalidRange}
                className={field}
                min={schedule.startDate}
                onChange={(event) => updateSchedule({ endDate: event.target.value })}
                type='date'
                value={schedule.endDate}
              />
            </label>
          ) : null}
          <label className='text-sm font-semibold text-on-surface'>
            {t('customer.booking.schedule.startTime')}
            <input
              className={field}
              onChange={(event) => updateSchedule({ startTime: event.target.value })}
              step={900}
              type='time'
              value={schedule.startTime}
            />
          </label>
          <label className='text-sm font-semibold text-on-surface'>
            {t('customer.booking.schedule.endTime')}
            <input
              aria-describedby={invalidTime ? `${id}-time` : undefined}
              aria-invalid={invalidTime}
              className={field}
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
            <legend className='text-sm font-semibold text-on-surface'>{t('customer.booking.schedule.weekdays')}</legend>
            <div className='mt-2 flex flex-wrap gap-2'>
              {WEEKDAYS.map((day) => {
                const value = Number(day)
                const checked = schedule.daysOfWeek.includes(value)
                return (
                  <label
                    className={`grid h-11 min-w-11 cursor-pointer place-items-center rounded-lg px-3 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${checked ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}
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

        <p className='text-xs text-on-surface-variant'>{t('customer.booking.schedule.leadTime')}</p>

        <label className='text-sm font-semibold text-on-surface'>
          {t('customer.booking.schedule.note')}
          <textarea
            className={field}
            maxLength={2000}
            onChange={(event) => form.setCustomerNote(event.target.value)}
            placeholder={t('customer.booking.schedule.notePlaceholder')}
            rows={3}
            value={form.customerNote}
          />
        </label>
      </div>
    </SectionCard>
  )
}
