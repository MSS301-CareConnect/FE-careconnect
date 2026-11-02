import { useTranslation } from 'react-i18next'

import { formatDay, shortTime } from '~/entities/booking/booking-format'

import type { useBookingForm } from '../hooks/use-booking-form'
import { useShiftSchedules } from '../hooks/use-shift-schedules'
import { bookingOption } from './booking-panel'

type Form = ReturnType<typeof useBookingForm>

/** SHIFT (spec §3 / §6): one SCHEDULED shift of the chosen caregiver; shifts a booking already holds are locked. */
export function BookingShiftPicker({ form }: { form: Form }) {
  const { t, i18n } = useTranslation()
  const caregiverId = form.selectedCaregiverId
  const { schedules, held, isHeld } = useShiftSchedules(caregiverId, true)

  if (!caregiverId)
    return (
      <p className='rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
        {t('customer.booking.schedule.shiftNeedsCaregiver')}
      </p>
    )
  if (schedules.isPending || held.isPending)
    return (
      <p className='text-sm text-on-surface-variant' role='status'>
        {t('customer.booking.schedule.shiftLoading')}
      </p>
    )
  if (schedules.isError || held.isError)
    return (
      <p className='text-sm text-error' role='alert'>
        {t('customer.booking.schedule.shiftError')}
      </p>
    )
  if (schedules.data.length === 0)
    return (
      <p className='rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
        {t('customer.booking.schedule.shiftEmpty')}
      </p>
    )

  return (
    <fieldset>
      <legend className='text-sm font-semibold text-on-surface'>{t('customer.booking.schedule.shiftChoose')}</legend>
      <div className='mt-2 grid gap-2 sm:grid-cols-2'>
        {schedules.data.map((schedule) => {
          const locked = isHeld(schedule)
          const checked = form.schedule.scheduleId === schedule.id
          return (
            <label
              className={`flex items-center justify-between gap-3 p-3 text-sm has-focus-visible:outline-2 has-focus-visible:outline-primary ${locked ? 'cursor-not-allowed rounded-xl border border-outline-variant/40 bg-surface-container text-on-surface-variant' : `cursor-pointer ${bookingOption(checked)}`}`}
              key={schedule.id}
            >
              <input
                checked={checked}
                className='sr-only'
                disabled={locked}
                name='caregiverSchedule'
                onChange={() => form.updateSchedule({ scheduleId: schedule.id })}
                type='radio'
              />
              <span className='font-semibold tabular-nums'>
                {t('customer.booking.schedule.shiftOption', {
                  date: formatDay(schedule.workDate, i18n.language),
                  start: shortTime(schedule.startTime),
                  end: shortTime(schedule.endTime)
                })}
              </span>
              {locked ? (
                <span className='text-xs font-semibold'>{t('customer.booking.schedule.shiftHeld')}</span>
              ) : null}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
