import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { findOverlappingSlot, MAX_CUSTOM_SLOTS, type useBookingForm } from '../hooks/use-booking-form'
import { bookingField } from './booking-panel'

type Form = ReturnType<typeof useBookingForm>
const label = 'text-sm font-semibold text-on-surface'

/** CUSTOM (spec §4): each visit has its own date and time range; visits of one booking must not overlap (spec §6). */
export function BookingCustomSlots({ form }: { form: Form }) {
  const { t } = useTranslation()
  const { slots } = form.schedule
  const overlapping = findOverlappingSlot(slots)

  return (
    <div className='rounded-2xl border border-outline-variant/60 bg-surface-container-low p-4 sm:p-5'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <p className={label}>{t('customer.booking.schedule.customSlots')}</p>
          <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.booking.schedule.customHint')}</p>
        </div>
        <span className='rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-primary tabular-nums'>
          {t('customer.booking.schedule.slotCount', { count: slots.length, max: MAX_CUSTOM_SLOTS })}
        </span>
      </div>
      <ol className='mt-4 flex flex-col gap-3'>
        {slots.map((slot, index) => {
          const invalidTime = Boolean(slot.startTime && slot.endTime && slot.endTime <= slot.startTime)
          const overlap = index === overlapping
          return (
            <li className='flex flex-wrap items-end gap-2' key={index}>
              <span className='w-full text-xs font-bold text-on-surface-variant'>
                {t('customer.booking.schedule.slotLabel', { number: index + 1 })}
              </span>
              <label className={`${label} min-w-36 flex-1`}>
                {t('customer.booking.schedule.date')}
                <input
                  aria-invalid={overlap}
                  className={bookingField}
                  onChange={(event) => form.updateSlot(index, { date: event.target.value })}
                  type='date'
                  value={slot.date}
                />
              </label>
              <label className={`${label} w-32`}>
                {t('customer.booking.schedule.startTime')}
                <input
                  aria-invalid={overlap}
                  className={bookingField}
                  onChange={(event) => form.updateSlot(index, { startTime: event.target.value })}
                  step={900}
                  type='time'
                  value={slot.startTime}
                />
              </label>
              <label className={`${label} w-32`}>
                {t('customer.booking.schedule.endTime')}
                <input
                  aria-invalid={invalidTime || overlap}
                  className={bookingField}
                  onChange={(event) => form.updateSlot(index, { endTime: event.target.value })}
                  step={900}
                  type='time'
                  value={slot.endTime}
                />
              </label>
              {slots.length > 1 ? (
                <button
                  aria-label={t('customer.booking.schedule.removeSlot', { number: index + 1 })}
                  className='mb-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-outline-variant text-on-surface-variant hover:border-error hover:text-error'
                  onClick={() => form.removeSlot(index)}
                  type='button'
                >
                  <Icon name='close' />
                </button>
              ) : null}
              {invalidTime ? (
                <p className='w-full text-sm text-error'>{t('customer.booking.schedule.invalidTime')}</p>
              ) : null}
            </li>
          )
        })}
      </ol>
      {overlapping >= 0 ? (
        <p className='mt-2 text-sm text-error' role='alert'>
          {t('customer.booking.schedule.overlap', { number: overlapping + 1 })}
        </p>
      ) : null}
      {slots.length < MAX_CUSTOM_SLOTS ? (
        <button
          className='mt-4 rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary-fixed'
          onClick={form.addSlot}
          type='button'
        >
          {t('customer.booking.schedule.addSlot')}
        </button>
      ) : null}
    </div>
  )
}
