import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { visitPeople } from '../../ui/visit-card'
import { VisitStatusBadge } from '../../ui/visit-status-badge'

/** Today's visits on a vertical line, past ones dimmed and the next one marked. */
export function TodayTimeline({
  visits,
  nextId,
  now
}: {
  visits: CaregiverOccurrenceRecord[]
  nextId?: string
  now: number
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()

  return (
    <section aria-labelledby='today-timeline' className={`${cgCard} p-5`}>
      <div className='mb-3 flex items-baseline justify-between'>
        <h2 className='text-base font-semibold text-on-surface' id='today-timeline'>
          {t('caregiver.today.timeline.title')}
        </h2>
        <span className='rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-semibold text-forest-800 tabular-nums'>
          {t('caregiver.today.timeline.count', { count: visits.length })}
        </span>
      </div>
      <ol className='relative flex flex-col'>
        {visits.map((visit, index) => {
          const past = new Date(visit.endAt).getTime() < now
          const next = visit.id === nextId
          return (
            <li className='relative flex gap-3 pb-3 last:pb-0' key={visit.id}>
              {index < visits.length - 1 ? (
                <span aria-hidden='true' className='absolute top-6 bottom-0 left-[11px] w-px bg-outline-variant' />
              ) : null}
              <span
                aria-hidden='true'
                className={`relative z-10 mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${next ? 'border-forest-900 bg-forest-900 text-white ring-4 ring-mint-100' : past ? 'border-mint-200 bg-mint-50 text-forest-700' : 'border-forest-700 bg-surface-container-lowest text-forest-700'}`}
              >
                {past ? <Icon className='text-sm' name='check' /> : null}
              </span>
              <Link
                className={`cg-press flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-primary ${past ? 'opacity-70' : ''} ${next ? 'bg-mint-50 ring-1 ring-mint-200' : ''}`}
                to={`/caregiver/visits/${visit.id}`}
              >
                <span className='min-w-0'>
                  <span className='block font-semibold text-on-surface tabular-nums'>
                    {format.clockRange(visit.startAt, visit.endAt)}
                  </span>
                  <span className='block truncate text-sm text-on-surface-variant'>
                    {visitPeople(visit).name ?? t('caregiver.visits.patientFallback')}
                    {visit.services?.length
                      ? ` · ${visit.services
                          .map((service) => service.serviceName)
                          .filter(Boolean)
                          .join(', ')}`
                      : ''}
                  </span>
                </span>
                <VisitStatusBadge status={visit.status} />
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
