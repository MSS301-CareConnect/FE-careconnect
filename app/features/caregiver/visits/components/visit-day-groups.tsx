import { useTranslation } from 'react-i18next'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { VisitCard } from '../../ui/visit-card'
import type { VisitDayGroup } from '../hooks/use-visit-list'

/** Visits under a sticky day header ("Hôm nay", "Ngày mai", "T6, 08/11") that stays below the topbar. */
export function VisitDayGroups({ groups, today, now }: { groups: VisitDayGroup[]; today: string; now: number }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()

  return (
    <div className='flex flex-col gap-5'>
      {groups.map((group) => (
        <section aria-labelledby={`day-${group.day}`} key={group.day}>
          <h2
            className='sticky top-14 z-20 -mx-4 mb-2 flex items-baseline justify-between bg-surface/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-16'
            id={`day-${group.day}`}
          >
            <span className='text-[15px] font-semibold text-on-surface'>
              {format.relativeDay(group.day, today)}
              {format.relativeDay(group.day, today) !== format.shortDay(group.day) ? (
                <span className='ml-2 text-sm font-normal text-on-surface-variant tabular-nums'>
                  {format.shortDay(group.day)}
                </span>
              ) : null}
            </span>
            <span className='text-sm text-on-surface-variant tabular-nums'>
              {t('caregiver.visits.count', { count: group.visits.length })}
            </span>
          </h2>
          <ul className='cg-stagger flex flex-col gap-3'>
            {group.visits.map((visit) => (
              <li key={visit.id}>
                <VisitCard now={now} visit={visit} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
