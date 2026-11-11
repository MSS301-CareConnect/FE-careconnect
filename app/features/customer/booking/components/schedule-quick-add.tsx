import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { addDays } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { MAX_CUSTOM_SLOTS, type RecurrenceRule } from '../hooks/schedule-slots'
import type { BookingForm } from '../hooks/use-booking-form'
import { SchedulePattern } from './schedule-pattern'

/**
 * CUSTOM quick add (CR-1, 2026-11-11): a daily / weekly pattern with a time per service that appends its visits to the
 * list in one go; visits that overlap one already listed are skipped and every added visit stays editable. Open while
 * the list is still empty.
 */
export function ScheduleQuickAdd({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(form.schedule.slots.length === 0)
  const [rule, setRule] = useState<RecurrenceRule>(() => ({
    frequency: 'WEEKLY',
    startDate: form.earliestDay,
    endDate: addDays(form.earliestDay, 27),
    startTime: '08:00',
    endTime: '10:00',
    daysOfWeek: []
  }))
  const [result, setResult] = useState<string | null>(null)

  return (
    <section className='rounded-xl border border-brand-100 bg-brand-50/40'>
      <button
        aria-controls='custom-quick-add'
        aria-expanded={open}
        className='flex w-full items-center gap-3 rounded-xl p-4 text-left focus-visible:outline-2 focus-visible:outline-primary'
        onClick={() => setOpen((value) => !value)}
        type='button'
      >
        <span aria-hidden='true' className='grid h-9 w-9 place-items-center rounded-lg bg-surface-container-lowest'>
          <Icon className='text-primary' name='bolt' />
        </span>
        <span className='flex-1'>
          <span className='block text-sm font-semibold text-on-surface'>
            {t('customer.booking.schedule.custom.quickAdd.title')}
          </span>
          <span className='block text-xs text-on-surface-variant'>
            {t('customer.booking.schedule.custom.quickAdd.description')}
          </span>
        </span>
        <Icon className={`transition-transform ${open ? 'rotate-180' : ''}`} name='expand_more' />
      </button>
      {open ? (
        <div className='border-t border-brand-100 p-4' id='custom-quick-add'>
          <SchedulePattern
            footer={
              result ? (
                <p aria-live='polite' className='text-sm text-on-surface-variant'>
                  {result}
                </p>
              ) : null
            }
            form={form}
            idPrefix='quick-add'
            onRuleChange={(patch) => {
              setRule((current) => ({ ...current, ...patch }))
              setResult(null)
            }}
            onSubmit={(candidates) => {
              const { added, skipped } = form.appendSlots(candidates)
              const done = t('customer.booking.schedule.custom.quickAdd.added', { count: added })
              setResult(
                added === 0
                  ? t('customer.booking.schedule.custom.quickAdd.nothing')
                  : skipped > 0
                    ? `${done} ${t('customer.booking.schedule.custom.quickAdd.limit', { count: added, max: MAX_CUSTOM_SLOTS })}`
                    : done
              )
            }}
            rule={rule}
            submitLabel={(count) => t('customer.booking.schedule.custom.quickAdd.submit', { count })}
          />
        </div>
      ) : null}
    </section>
  )
}
