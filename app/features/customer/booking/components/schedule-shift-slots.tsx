import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { shortTime, vietnamInstant } from '~/entities/booking/booking-format'
import type { ProviderBookableScheduleRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { NumberStepper } from '~/shared/ui/number-stepper'

import type { BookingForm } from '../hooks/use-booking-form'
import { isFixedPlan, lengthOf, rangesOverlap, shiftWindows, type ServiceOption } from '../hooks/service-slots'
import type { BusyRange } from '../hooks/use-shift-schedules'

type WindowBlock = 'tooSoon' | 'booked' | 'buffer' | 'overlapPicked'

/**
 * The chosen shift split into time slots (2026-11-05). A slot lasts the length of the service's plan (DAY / SHIFT) or the
 * hours the customer sets (HOUR, at least the plan's minimum). The customer picks one or more slots per service; their
 * own slots may follow each other, while another booking of the caregiver keeps the travel buffer free around it.
 */
export function ScheduleShiftSlots({
  form,
  schedule,
  busy,
  bufferMinutes,
  earliest
}: {
  form: BookingForm
  schedule: ProviderBookableScheduleRecord
  busy: BusyRange[]
  bufferMinutes: number
  earliest: number
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const options = form.serviceOptions
  const [activeId, setActiveId] = useState('')
  const active = options.find((option) => option.careServiceId === activeId) ?? options[0]
  const [hourLengths, setHourLengths] = useState<Record<string, number | ''>>({})
  const shiftStart = shortTime(schedule.startTime)
  const shiftEnd = shortTime(schedule.endTime)
  const shiftHours = Math.floor(lengthOf({ startTime: shiftStart, endTime: shiftEnd }) / 60)
  const picked = form.shiftSlots
  const buffer = format.duration(bufferMinutes)

  if (!active) return null

  function lengthFor(option: ServiceOption) {
    if (isFixedPlan(option.plan)) return option.plan!.durationMinutes!
    const minimumHours = Math.max(1, Math.ceil((option.plan?.durationMinutes ?? 60) / 60))
    const chosen = hourLengths[option.careServiceId]
    const hours = chosen === '' || chosen === undefined ? Math.min(Math.max(minimumHours, 4), shiftHours) : chosen
    return Math.max(minimumHours, hours) * 60
  }

  const length = lengthFor(active)
  const windows = shiftWindows(shiftStart, shiftEnd, length, picked)
  const nameOf = (careServiceId: string) => options.find((option) => option.careServiceId === careServiceId)?.name ?? ''

  function blockOf(window: { startTime: string; endTime: string }): WindowBlock | null {
    if (Date.parse(vietnamInstant(schedule.workDate, window.startTime)) < earliest) return 'tooSoon'
    if (busy.some((range) => rangesOverlap(window, range))) return 'booked'
    if (busy.some((range) => rangesOverlap(window, range, bufferMinutes))) return 'buffer'
    const isMine = (slot: (typeof picked)[number]) =>
      slot.startTime === window.startTime && slot.careServiceId === active.careServiceId
    if (picked.some((slot) => !isMine(slot) && rangesOverlap(window, slot))) return 'overlapPicked'
    return null
  }

  return (
    <fieldset className='cc-fade-up rounded-xl border border-outline-variant bg-surface-container-lowest p-4'>
      <legend className='px-1 text-sm font-semibold text-on-surface'>
        {t('customer.booking.schedule.shift.slotsLegend', { time: `${shiftStart}–${shiftEnd}` })}
      </legend>
      <p className='mb-3 text-xs text-on-surface-variant'>
        {t('customer.booking.schedule.shift.slotsHint', { buffer })}
      </p>

      {options.length > 1 ? (
        <div
          aria-label={t('customer.booking.schedule.shift.serviceLegend')}
          className='mb-3 flex flex-wrap gap-2'
          role='group'
        >
          {options.map((option) => {
            const count = picked.filter((slot) => slot.careServiceId === option.careServiceId).length
            const on = option.careServiceId === active.careServiceId
            return (
              <button
                aria-pressed={on}
                className={`min-h-11 rounded-full border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${on ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest hover:border-brand-300'}`}
                key={option.careServiceId}
                onClick={() => setActiveId(option.careServiceId)}
                type='button'
              >
                {option.name} · {t('customer.booking.schedule.shift.serviceCount', { count })}
              </button>
            )
          })}
        </div>
      ) : null}

      {isFixedPlan(active.plan) ? (
        <p className='mb-3 text-sm text-on-surface-variant'>
          {t('customer.booking.schedule.shift.planLength', {
            plan: active.plan?.planName ?? active.name,
            duration: format.duration(length)
          })}
        </p>
      ) : (
        <div className='mb-3 flex flex-wrap items-center gap-3 text-sm font-medium text-on-surface'>
          <label htmlFor='shift-slot-length'>{t('customer.booking.schedule.shift.lengthLabel')}</label>
          <NumberStepper
            id='shift-slot-length'
            max={Math.max(1, shiftHours)}
            min={Math.max(1, Math.ceil((active.plan?.durationMinutes ?? 60) / 60))}
            onChange={(hours) => setHourLengths((current) => ({ ...current, [active.careServiceId]: hours }))}
            value={length / 60}
          />
          <span className='text-on-surface-variant'>
            {t('customer.booking.schedule.shift.lengthValue', { count: length / 60 })}
          </span>
        </div>
      )}

      {windows.length === 0 ? (
        <p className='text-sm text-on-surface-variant'>{t('customer.booking.schedule.shift.noWindow')}</p>
      ) : (
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
          {windows.map((window) => {
            const on = picked.some(
              (slot) => slot.startTime === window.startTime && slot.careServiceId === active.careServiceId
            )
            const block = on ? null : blockOf(window)
            return (
              <button
                aria-pressed={on}
                className={`flex min-h-12 flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${block ? 'cursor-not-allowed border-outline-variant bg-surface-container-low text-on-surface-variant' : on ? 'border-primary bg-brand-50 font-semibold text-primary shadow-[0_0_0_1px_var(--color-primary)]' : 'border-outline-variant bg-surface-container-lowest hover:border-brand-300'}`}
                disabled={Boolean(block)}
                key={window.startTime}
                onClick={() => form.toggleShiftSlot({ ...window, careServiceId: active.careServiceId })}
                type='button'
              >
                <span className={`tabular-nums ${block ? 'line-through' : ''}`}>
                  {window.startTime}–{window.endTime}
                </span>
                {block ? (
                  <span className='text-xs'>
                    {block === 'buffer'
                      ? t('customer.booking.schedule.shift.buffer', { buffer })
                      : t(`customer.booking.schedule.shift.${block}`)}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      )}

      <div className='mt-4'>
        <p className='text-sm font-semibold text-on-surface'>{t('customer.booking.schedule.shift.pickedTitle')}</p>
        {picked.length === 0 ? (
          <p className='mt-1 text-sm text-on-surface-variant'>{t('customer.booking.schedule.shift.pickedEmpty')}</p>
        ) : (
          <ul className='mt-2 flex flex-wrap gap-2'>
            {picked.map((slot) => {
              const time = `${slot.startTime}–${slot.endTime}`
              const service = nameOf(slot.careServiceId)
              return (
                <li key={`${slot.careServiceId}-${slot.startTime}`}>
                  <button
                    aria-label={t('customer.booking.schedule.shift.remove', { time, service })}
                    className='inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-sm text-primary hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-primary'
                    onClick={() => form.toggleShiftSlot(slot)}
                    type='button'
                  >
                    <span className='tabular-nums'>{time}</span>
                    {options.length > 1 ? <span>· {service}</span> : null}
                    <Icon className='text-base' name='close' />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {form.servicesWithoutVisit(picked).length > 0 && picked.length > 0 ? (
          <p className='mt-2 text-sm text-on-warning-container' role='status'>
            {t('customer.booking.schedule.custom.withoutVisit', {
              names: form
                .servicesWithoutVisit(picked)
                .map((option) => option.name)
                .join(', ')
            })}
          </p>
        ) : null}
      </div>
    </fieldset>
  )
}
