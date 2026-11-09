import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { CountUp, easeSoft } from '~/shared/ui/motion'

import { CANCELLED_VISIT_STATUSES } from '../../data/caregiver-queries'
import {
  addDays,
  calendarDayOf,
  minutesBetweenInstants,
  useCaregiverFormat,
  weekStart
} from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'

/**
 * Visits, care hours and finished visits of the current week (Monday–Sunday), from the visits already assigned, with
 * a small column per day that grows into place; today is the dark pill, like the week strip of the reference.
 */
export function WeekStats({ visits, today }: { visits: CaregiverOccurrenceRecord[]; today: string }) {
  const { t, i18n } = useTranslation()
  const format = useCaregiverFormat()
  const counted = visits.filter((visit) => !CANCELLED_VISIT_STATUSES.has(visit.status))
  const minutes = counted.reduce((sum, visit) => sum + minutesBetweenInstants(visit.startAt, visit.endAt), 0)
  const hourFormat = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const done = counted.filter((visit) => visit.status === 'COMPLETED').length
  const monday = weekStart(today)
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(monday, index)
    return { day, count: counted.filter((visit) => calendarDayOf(visit.startAt) === day).length }
  })
  const most = Math.max(1, ...days.map((item) => item.count))
  const stats = [
    { key: 'visits', value: counted.length, format: (n: number) => String(Math.round(n)) },
    { key: 'hours', value: minutes / 60, format: (n: number) => hourFormat.format(Math.round(n * 10) / 10) },
    { key: 'done', value: done, format: (n: number) => String(Math.round(n)) }
  ] as const

  return (
    <section aria-labelledby='week-stats' className={`${cgCard} p-5`}>
      <h2 className='mb-4 text-base font-semibold text-on-surface' id='week-stats'>
        {t('caregiver.today.week.title')}
      </h2>
      <dl className='grid grid-cols-3 gap-2'>
        {stats.map((stat, index) => (
          <div
            className={`rounded-2xl px-3 py-3 ${index === 0 ? 'bg-mint-100' : index === 1 ? 'bg-peach-50' : 'bg-surface-container-low'}`}
            key={stat.key}
          >
            <dt className='text-xs font-medium text-on-surface-variant'>{t(`caregiver.today.week.${stat.key}`)}</dt>
            <dd className='mt-1 text-2xl font-bold text-forest-950'>
              <CountUp format={stat.format} value={stat.value} />
            </dd>
          </div>
        ))}
      </dl>
      <ul aria-label={t('caregiver.today.week.chart')} className='mt-5 grid grid-cols-7 gap-1.5'>
        {days.map((item, index) => {
          const isToday = item.day === today
          const label = format.weekday(item.day)
          return (
            <li
              aria-label={t('caregiver.today.week.dayCount', { day: label, count: item.count })}
              className='flex flex-col items-center gap-1.5'
              key={item.day}
            >
              <div aria-hidden='true' className='flex h-16 w-full items-end justify-center'>
                <motion.span
                  animate={{ scaleY: 1 }}
                  className={`block w-full max-w-7 origin-bottom rounded-full ${isToday ? 'bg-peach-300' : item.count > 0 ? 'bg-mint-300' : 'bg-surface-container'}`}
                  initial={{ scaleY: 0 }}
                  style={{ height: `${Math.max(14, (item.count / most) * 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.15 + index * 0.05, ease: easeSoft }}
                />
              </div>
              <span
                aria-hidden='true'
                className={`grid h-7 w-full max-w-9 place-items-center rounded-full text-[11px] font-semibold ${isToday ? 'bg-forest-900 text-white' : 'text-on-surface-variant'}`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
