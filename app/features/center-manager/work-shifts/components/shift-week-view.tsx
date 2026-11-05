import { useTranslation } from 'react-i18next'

import { SHIFT_STATUS_TONES, shiftStatusLabelKey, shiftTypeLabelKey } from '~/entities/provider/work-shift'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { addDays, useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

const k = 'centerManager.workShifts.week' as const

const BLOCK_TONES: Record<ProviderWorkShiftRecord['shiftStatus'], string> = {
  DRAFT: 'border-caution/40 bg-caution-container/60',
  OPEN: 'border-success/40 bg-success-container/70',
  CLOSED: 'border-info/30 bg-info-container/60',
  COMPLETED: 'border-outline-variant bg-surface-container-low',
  CANCELLED: 'border-error/30 bg-error-container/40 line-through decoration-error/50'
}

/** Seven columns (Mon–Sun) of shift blocks; phones get one day per row. Clicking a block opens its details. */
export function ShiftWeekView({
  monday,
  today,
  shifts,
  truncated,
  onWeek,
  onOpen
}: {
  monday: string
  today: string
  shifts: ProviderWorkShiftRecord[]
  truncated: boolean
  onWeek: (monday: string) => void
  onOpen: (shift: ProviderWorkShiftRecord) => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index))
  const byDay = new Map(days.map((day) => [day, [] as ProviderWorkShiftRecord[]]))
  for (const shift of shifts) byDay.get(shift.workDate)?.push(shift)
  for (const list of byDay.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <section aria-label={t(`${k}.label`)} className='space-y-3 p-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-base font-semibold'>
          {t(`${k}.range`, { from: format.date(days[0]), to: format.date(days[6]) })}
        </h2>
        <div className='flex gap-2'>
          <Button
            aria-label={t(`${k}.previous`)}
            leftIcon={<Icon name='chevron_left' />}
            onClick={() => onWeek(addDays(monday, -7))}
            size='sm'
            variant='outline'
          >
            <span className='sr-only sm:not-sr-only'>{t(`${k}.previous`)}</span>
          </Button>
          <Button onClick={() => onWeek(today)} size='sm' variant='ghost'>
            {t(`${k}.thisWeek`)}
          </Button>
          <Button
            aria-label={t(`${k}.next`)}
            onClick={() => onWeek(addDays(monday, 7))}
            rightIcon={<Icon name='chevron_right' />}
            size='sm'
            variant='outline'
          >
            <span className='sr-only sm:not-sr-only'>{t(`${k}.next`)}</span>
          </Button>
        </div>
      </div>
      {truncated ? <p className='text-sm text-warning'>{t(`${k}.truncated`)}</p> : null}
      <ol className='grid gap-2 lg:grid-cols-7'>
        {days.map((day) => {
          const list = byDay.get(day) ?? []
          const isToday = day === today
          return (
            <li
              className={`min-h-28 rounded-xl border p-2 ${isToday ? 'border-primary/50 bg-brand-50/50' : 'border-outline-variant/50 bg-surface-container-lowest'}`}
              key={day}
            >
              <p className={`mb-2 text-xs font-semibold ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
                {format.shortDayLabel(day)}
              </p>
              {list.length === 0 ? (
                <p className='text-xs text-outline'>{t(`${k}.empty`)}</p>
              ) : (
                <ul className='space-y-1.5'>
                  {list.map((shift) => (
                    <li key={shift.id}>
                      <button
                        className={`w-full rounded-lg border px-2 py-1.5 text-left text-xs transition-shadow duration-150 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary ${BLOCK_TONES[shift.shiftStatus]}`}
                        onClick={() => onOpen(shift)}
                        type='button'
                      >
                        <span className='block font-semibold tabular-nums'>
                          {shift.startTime.slice(0, 5)}–{shift.endTime.slice(0, 5)}
                        </span>
                        <span className='block truncate text-on-surface-variant'>
                          {t(shiftTypeLabelKey(shift.shiftType))} · {shift.approvedCount ?? 0}/{shift.capacity}
                        </span>
                        <span className='mt-1 flex flex-wrap gap-1'>
                          <StatusBadge
                            className='px-1.5 py-0.5 text-[11px]'
                            tone={SHIFT_STATUS_TONES[shift.shiftStatus]}
                          >
                            {t(shiftStatusLabelKey(shift.shiftStatus))}
                          </StatusBadge>
                          {(shift.pendingCount ?? 0) > 0 ? (
                            <StatusBadge className='px-1.5 py-0.5 text-[11px]' tone='warning'>
                              {t('centerManager.workShifts.table.pendingBadge', { count: shift.pendingCount })}
                            </StatusBadge>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
