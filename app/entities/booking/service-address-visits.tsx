import { useTranslation } from 'react-i18next'

import type { BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

/** Upcoming visits grouped by day, each with a checkbox; visits that can no longer move are shown locked. */
export function ServiceAddressVisits({
  visits,
  chosen,
  editable,
  hint,
  error,
  onToggle,
  onToggleAll
}: {
  visits: BookingOccurrenceRecord[]
  chosen: ReadonlySet<string>
  editable: (visit: BookingOccurrenceRecord) => boolean
  hint: string
  error?: string
  onToggle: (id: string) => void
  onToggleAll: () => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const editableCount = visits.filter(editable).length
  const days = new Map<string, BookingOccurrenceRecord[]>()
  for (const visit of visits) {
    const day = calendarDayOf(visit.startAt)
    days.set(day, [...(days.get(day) ?? []), visit])
  }

  return (
    <fieldset aria-describedby='service-address-visits-hint' className='min-w-0'>
      <legend className='flex w-full items-center gap-2.5'>
        <StepNumber value={1} />
        <span className='flex-1 text-base font-semibold text-on-surface'>{t('booking.address.visitsTitle')}</span>
        {editableCount > 0 ? (
          <button
            className='rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
            onClick={onToggleAll}
            type='button'
          >
            {chosen.size === editableCount ? t('booking.address.selectNone') : t('booking.address.selectAll')}
          </button>
        ) : null}
      </legend>
      <p className='mt-1.5 pl-[2.375rem] text-xs leading-5 text-on-surface-variant' id='service-address-visits-hint'>
        {hint}
      </p>
      <div className='mt-3 flex max-h-[22rem] flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]'>
        {[...days].map(([day, dayVisits]) => (
          <section aria-label={format.dayLabel(day)} key={day}>
            <h3 className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
              <Icon className='text-sm' name='calendar_today' />
              {format.dayLabel(day)}
            </h3>
            <ul className='flex flex-col gap-1.5'>
              {dayVisits.map((visit) => {
                const allowed = editable(visit)
                const checked = chosen.has(visit.id)
                return (
                  <li key={visit.id}>
                    <label
                      className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        !allowed
                          ? 'cursor-not-allowed border-dashed border-outline-variant bg-surface-container-low text-on-surface-variant'
                          : checked
                            ? 'cursor-pointer border-primary/60 bg-brand-50/70'
                            : 'cursor-pointer border-outline-variant hover:border-brand-300 hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        aria-label={format.visitRange(visit.startAt, visit.endAt)}
                        checked={checked}
                        className='mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 accent-[var(--color-primary)]'
                        disabled={!allowed}
                        onChange={() => onToggle(visit.id)}
                        type='checkbox'
                      />
                      <span className='min-w-0 flex-1'>
                        <span className='flex items-center gap-1.5 font-semibold text-on-surface tabular-nums'>
                          <Icon className='text-base text-on-surface-variant' name='schedule' />
                          {format.clock(visit.startAt)}–{format.clock(visit.endAt)}
                        </span>
                        {visit.serviceAddress ? (
                          <span className='mt-0.5 flex items-start gap-1 text-xs text-on-surface-variant'>
                            <Icon className='mt-px text-sm' name='location_on' />
                            <span className='line-clamp-2'>
                              {t('booking.address.visitAt', { address: visit.serviceAddress })}
                            </span>
                          </span>
                        ) : null}
                        {!allowed ? (
                          <span className='mt-1 inline-flex items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-[0.6875rem] font-semibold text-on-warning-container'>
                            <Icon className='text-xs' name='lock' />
                            {t('booking.address.tooLate')}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
      {error ? (
        <p className='mt-2 text-xs font-semibold text-error' role='alert'>
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

export function StepNumber({ value }: { value: number }) {
  return (
    <span
      aria-hidden='true'
      className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary'
    >
      {value}
    </span>
  )
}
