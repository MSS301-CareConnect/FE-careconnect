import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'

import { CANCELLED_VISIT_STATUSES } from '../../data/caregiver-queries'
import { minutesBetweenInstants } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'

/** Visits, care hours and finished visits of the current week (Monday–Sunday), from the visits already assigned. */
export function WeekStats({ visits }: { visits: CaregiverOccurrenceRecord[] }) {
  const { t, i18n } = useTranslation()
  const counted = visits.filter((visit) => !CANCELLED_VISIT_STATUSES.has(visit.status))
  const minutes = counted.reduce((sum, visit) => sum + minutesBetweenInstants(visit.startAt, visit.endAt), 0)
  const hours = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(minutes / 60)
  const done = counted.filter((visit) => visit.status === 'COMPLETED').length
  const stats = [
    { key: 'visits', value: String(counted.length) },
    { key: 'hours', value: hours },
    { key: 'done', value: String(done) }
  ] as const

  return (
    <section aria-labelledby='week-stats' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='mb-3 text-base font-semibold text-on-surface' id='week-stats'>
        {t('caregiver.today.week.title')}
      </h2>
      <dl className='grid grid-cols-3 gap-2'>
        {stats.map((stat) => (
          <div className='rounded-lg bg-surface-container-low px-3 py-2.5' key={stat.key}>
            <dt className='text-xs text-on-surface-variant'>{t(`caregiver.today.week.${stat.key}`)}</dt>
            <dd className='text-xl font-bold text-on-surface tabular-nums'>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
