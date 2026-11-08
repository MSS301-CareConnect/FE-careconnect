import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { addDays, useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { MAX_CUSTOM_SLOTS, ruleIssuesOf, slotsFromRule, type RecurrenceRule } from '../hooks/schedule-slots'
import type { BookingForm } from '../hooks/use-booking-form'
import { ScheduleRuleFields } from './schedule-rule-fields'
import { minimumVisitMinutes } from './visit-duration'

/**
 * CUSTOM quick add (CR-1): a daily / weekly pattern that appends its visits to the list in one go; visits that overlap
 * one already listed are skipped and every added visit stays editable on its own.
 */
export function ScheduleQuickAdd({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [open, setOpen] = useState(false)
  const [rule, setRule] = useState<RecurrenceRule>(() => ({
    frequency: 'WEEKLY',
    startDate: form.earliestDay,
    endDate: addDays(form.earliestDay, 27),
    startTime: form.schedule.slots.at(-1)?.startTime ?? '08:00',
    endTime: form.schedule.slots.at(-1)?.endTime ?? '10:00',
    daysOfWeek: []
  }))
  const [result, setResult] = useState<string | null>(null)
  const issues = ruleIssuesOf(rule)
  const candidates = slotsFromRule(rule)
  const blocked = issues.invalidRange || issues.invalidTime || issues.noWeekday || candidates.length === 0

  function add() {
    const { added, skipped } = form.appendSlots(candidates)
    if (added === 0) {
      setResult(t('customer.booking.schedule.custom.quickAdd.nothing'))
      return
    }
    const done = t('customer.booking.schedule.custom.quickAdd.added', { count: added })
    setResult(
      skipped > 0
        ? `${done} ${t('customer.booking.schedule.custom.quickAdd.limit', { count: added, max: MAX_CUSTOM_SLOTS })}`
        : done
    )
  }

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
        <div id='custom-quick-add'>
          <div className='flex flex-col gap-4 border-t border-brand-100 p-4'>
            <ScheduleRuleFields
              earliestDay={form.earliestDay}
              idPrefix='quick-add'
              issues={issues}
              minimumMinutes={minimumVisitMinutes(form)}
              onChange={(patch) => {
                setRule((current) => ({ ...current, ...patch }))
                setResult(null)
              }}
              rule={rule}
              tooEarlyReason={t('customer.booking.schedule.tooEarlyDay', {
                duration: format.duration(form.noticeMinutes.CUSTOM)
              })}
            />
            <div className='flex flex-wrap items-center gap-3'>
              <Button disabled={blocked} leftIcon={<Icon className='text-lg' name='playlist_add' />} onClick={add}>
                {t('customer.booking.schedule.custom.quickAdd.submit', { count: candidates.length })}
              </Button>
              {result ? (
                <p aria-live='polite' className='text-sm text-on-surface-variant'>
                  {result}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
