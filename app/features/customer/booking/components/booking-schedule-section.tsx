import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { WEEKDAYS } from '~/entities/booking/booking-format'

import type { useBookingForm } from '../hooks/use-booking-form'
import { BookingCustomSlots } from './booking-custom-slots'
import { BookingPanel, bookingField } from './booking-panel'
import { BookingShiftPicker } from './booking-shift-picker'

type Form = ReturnType<typeof useBookingForm>
const BOOKING_TYPES = ['SHIFT', 'RECURRING', 'CUSTOM'] as const
const FREQUENCIES = ['DAILY', 'WEEKLY'] as const
const MINUTES_PER_HOUR = 60
const label = 'text-sm font-semibold text-on-surface'
const segment = (active: boolean) =>
  `cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${active ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-primary-fixed/60'}`

/** Spec §4: SHIFT books one published caregiver shift, RECURRING repeats daily / weekly, CUSTOM lists its own visits. */
export function BookingScheduleSection({ form }: { form: Form }) {
  const { t } = useTranslation()
  const id = useId()
  const { schedule, updateSchedule } = form
  const policy = form.policy.data
  const recurring = schedule.bookingType === 'RECURRING'
  const invalidTime = Boolean(schedule.startTime && schedule.endTime && schedule.endTime <= schedule.startTime)
  const invalidRange = Boolean(schedule.endDate && schedule.endDate < schedule.startDate)

  return (
    <BookingPanel
      description={
        policy
          ? t('customer.booking.schedule.leadTime', {
              shift: policy.shiftMinAdvanceMinutes / MINUTES_PER_HOUR,
              recurring: policy.recurringMinAdvanceMinutes / MINUTES_PER_HOUR,
              custom: policy.customMinAdvanceMinutes / MINUTES_PER_HOUR
            })
          : t('customer.booking.schedule.leadTimeGeneric')
      }
      icon='calendar_month'
      id='booking-schedule'
      title={t('customer.booking.schedule.title')}
    >
      <div className='flex flex-col gap-5'>
        <fieldset>
          <legend className={label}>{t('customer.booking.schedule.type')}</legend>
          <div className='mt-2 grid grid-cols-3 gap-1 rounded-xl bg-surface-container p-1 sm:inline-grid'>
            {BOOKING_TYPES.map((type) => (
              <label className={segment(schedule.bookingType === type)} key={type}>
                <input
                  checked={schedule.bookingType === type}
                  className='sr-only'
                  name='bookingType'
                  onChange={() => updateSchedule({ bookingType: type })}
                  type='radio'
                />
                {t(`booking.bookingType.${type}`)}
              </label>
            ))}
          </div>
          <p className='mt-2 text-xs leading-5 text-on-surface-variant'>
            {t(`customer.booking.schedule.typeHint.${schedule.bookingType}`)}
          </p>
        </fieldset>

        {schedule.bookingType === 'SHIFT' ? <BookingShiftPicker form={form} /> : null}
        {schedule.bookingType === 'CUSTOM' ? <BookingCustomSlots form={form} /> : null}

        {recurring ? (
          <>
            <fieldset>
              <legend className={label}>{t('customer.booking.schedule.frequency')}</legend>
              <div className='mt-2 grid grid-cols-2 gap-1 rounded-xl bg-surface-container p-1 sm:inline-grid'>
                {FREQUENCIES.map((frequency) => (
                  <label className={segment(schedule.frequency === frequency)} key={frequency}>
                    <input
                      checked={schedule.frequency === frequency}
                      className='sr-only'
                      name='frequency'
                      onChange={() => updateSchedule({ frequency })}
                      type='radio'
                    />
                    {t(`booking.frequency.${frequency}`)}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className='grid gap-4 sm:grid-cols-2'>
              <label className={label}>
                {t('customer.booking.schedule.startDate')}
                <input
                  className={bookingField}
                  onChange={(event) => updateSchedule({ startDate: event.target.value })}
                  type='date'
                  value={schedule.startDate}
                />
              </label>
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
            {schedule.frequency === 'WEEKLY' ? (
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
          </>
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
