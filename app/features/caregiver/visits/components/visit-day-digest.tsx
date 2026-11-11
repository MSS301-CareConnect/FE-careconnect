import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { groupVisitsByDay } from '../withdraw-model'

/** Names of the services of a visit ("Tắm rửa · Cho ăn"). */
export function visitServiceNames(visit: CaregiverOccurrenceRecord) {
  return (visit.services ?? [])
    .map((service) => service.serviceName)
    .filter(Boolean)
    .join(' · ')
}

/**
 * Visits listed per day for a dialog (2026-11-10): a date tile (weekday over the day number) next to the day's visits,
 * each with its hours and services. Scrolls inside the dialog when the list is long.
 */
export function VisitDayDigest({
  visits,
  tone = 'default',
  className = ''
}: {
  visits: CaregiverOccurrenceRecord[]
  tone?: 'default' | 'muted'
  className?: string
}) {
  const format = useCaregiverFormat()
  const days = groupVisitsByDay(visits)
  const tile =
    tone === 'muted'
      ? 'bg-surface-container text-on-surface-variant'
      : 'bg-forest-900 text-white shadow-[var(--shadow-soft)]'

  return (
    <ul className={`flex max-h-64 flex-col gap-2 overflow-y-auto pr-1 ${className}`}>
      {days.map((group) => (
        <li
          className='flex items-start gap-3 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-2.5'
          key={group.day}
        >
          <span className={`grid w-12 shrink-0 place-items-center rounded-xl py-1.5 text-center leading-tight ${tile}`}>
            <span className='text-[11px] font-semibold opacity-80'>{format.weekday(group.day)}</span>
            <span className='text-lg font-bold tabular-nums'>{group.day.slice(8)}</span>
            <span className='text-[10px] opacity-70 tabular-nums'>{group.day.slice(5, 7)}</span>
          </span>
          <ul className='flex min-w-0 flex-1 flex-col gap-1 py-0.5 text-sm'>
            {group.visits.map((visit) => (
              <li className='min-w-0' key={visit.id}>
                <span className='font-semibold text-on-surface tabular-nums'>
                  {format.clockRange(visit.startAt, visit.endAt)}
                </span>
                {visitServiceNames(visit) ? (
                  <span className='block truncate text-on-surface-variant'>{visitServiceNames(visit)}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
