import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { CountUp, easeSoft } from '~/shared/ui/motion'
import { Skeleton } from '~/shared/ui/skeleton'

import { CANCELLED_VISIT_STATUSES, VISIT_PAGE_SIZE, useMySchedules, useVisitPage } from '../../data/caregiver-queries'
import {
  addDays,
  calendarDayOf,
  hhmm,
  minutesBetweenInstants,
  minutesOfTimes,
  useCaregiverFormat,
  weekStart
} from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'

interface DayFigures {
  day: string
  visits: number
  done: number
  upcoming: number
  missed: number
  minutes: number
  doneMinutes: number
  upcomingMinutes: number
  missedMinutes: number
  workMinutes: number
}

const navButton =
  'cg-press grid h-9 w-9 place-items-center rounded-full border border-forest-900/10 bg-white text-forest-900 hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-forest-900'

function figuresOf(day: string, visits: CaregiverOccurrenceRecord[], workMinutes: number): DayFigures {
  const ofDay = visits.filter((visit) => calendarDayOf(visit.startAt) === day)
  const sum = (items: CaregiverOccurrenceRecord[]) =>
    items.reduce((total, visit) => total + minutesBetweenInstants(visit.startAt, visit.endAt), 0)
  const done = ofDay.filter((visit) => visit.status === 'COMPLETED' || visit.status === 'CUSTOMER_NO_SHOW')
  const missed = ofDay.filter((visit) => visit.status === 'CAREGIVER_MISSED')
  const upcoming = ofDay.filter((visit) => !done.includes(visit) && !missed.includes(visit))
  return {
    day,
    visits: ofDay.length,
    done: done.length,
    upcoming: upcoming.length,
    missed: missed.length,
    minutes: sum(ofDay),
    doneMinutes: sum(done),
    upcomingMinutes: sum(upcoming),
    missedMinutes: sum(missed),
    workMinutes
  }
}

/**
 * The week at a glance (2026-11-10 redesign): visits, care hours, finished visits and how full the registered working
 * hours are, then a column per day stacked by done / upcoming / missed hours. Hovering, focusing or tapping a column
 * shows that day's numbers; the arrows move to other weeks.
 */
export function WeekStats({ today }: { today: string }) {
  const { t, i18n } = useTranslation()
  const format = useCaregiverFormat()
  const [monday, setMonday] = useState(weekStart(today))
  const [active, setActive] = useState<number | null>(null)
  const sunday = addDays(monday, 6)
  const week = useVisitPage({ from: monday, to: sunday, page: 0, size: VISIT_PAGE_SIZE })
  const schedules = useMySchedules()
  const hourFormat = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const hours = (minutes: number) => hourFormat.format(Math.round((minutes / 60) * 10) / 10)

  const visits = (week.data?.items ?? []).filter((visit) => !CANCELLED_VISIT_STATUSES.has(visit.status))
  const slots = (schedules.data ?? []).filter(
    (slot) => slot.scheduleStatus !== 'CANCELLED' && slot.workDate >= monday && slot.workDate <= sunday
  )
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(monday, index)
    const work = slots
      .filter((slot) => slot.workDate === day)
      .reduce((total, slot) => total + minutesOfTimes(hhmm(slot.startTime), hhmm(slot.endTime) || '24:00'), 0)
    return figuresOf(day, visits, work)
  })
  const totalMinutes = days.reduce((total, item) => total + item.minutes, 0)
  const workMinutes = days.reduce((total, item) => total + item.workMinutes, 0)
  const done = days.reduce((total, item) => total + item.done, 0)
  const fill = workMinutes > 0 ? Math.min(100, Math.round((totalMinutes / workMinutes) * 100)) : null
  const most = Math.max(60, ...days.map((item) => Math.max(item.minutes, item.workMinutes)))
  const thisWeek = monday === weekStart(today)
  const stats = [
    { key: 'visits', value: visits.length, format: (n: number) => String(Math.round(n)), tone: 'bg-mint-100' },
    { key: 'hours', value: totalMinutes / 60, format: (n: number) => hours(n * 60), tone: 'bg-peach-50' },
    { key: 'done', value: done, format: (n: number) => String(Math.round(n)), tone: 'bg-surface-container-low' }
  ] as const

  function move(amount: number) {
    setActive(null)
    setMonday(addDays(monday, amount * 7))
  }

  return (
    <section aria-labelledby='week-stats' className={`${cgCard} p-5`}>
      <div className='mb-4 flex items-center justify-between gap-2'>
        <div className='min-w-0'>
          <h2 className='text-base font-semibold text-on-surface' id='week-stats'>
            {thisWeek ? t('caregiver.today.week.title') : t('caregiver.today.week.otherWeek')}
          </h2>
          <p className='text-xs text-on-surface-variant tabular-nums'>
            {t('caregiver.today.week.range', { from: format.shortDay(monday), to: format.shortDay(sunday) })}
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-1.5'>
          {thisWeek ? null : (
            <button
              className='cg-press min-h-9 rounded-full px-3 text-xs font-semibold text-forest-800 hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-forest-900'
              onClick={() => {
                setActive(null)
                setMonday(weekStart(today))
              }}
              type='button'
            >
              {t('caregiver.today.week.backToThisWeek')}
            </button>
          )}
          <button
            aria-label={t('caregiver.today.week.previous')}
            className={navButton}
            onClick={() => move(-1)}
            type='button'
          >
            <Icon className='text-lg' name='chevron_left' />
          </button>
          <button
            aria-label={t('caregiver.today.week.next')}
            className={navButton}
            onClick={() => move(1)}
            type='button'
          >
            <Icon className='text-lg' name='chevron_right' />
          </button>
        </div>
      </div>

      {week.isPending ? (
        <Skeleton className='h-52 rounded-2xl' />
      ) : (
        <>
          <dl className='grid grid-cols-3 gap-2'>
            {stats.map((stat) => (
              <div className={`rounded-2xl px-3 py-3 ${stat.tone}`} key={stat.key}>
                <dt className='text-xs font-medium text-on-surface-variant'>{t(`caregiver.today.week.${stat.key}`)}</dt>
                <dd className='mt-1 text-2xl font-bold text-forest-950'>
                  <CountUp format={stat.format} value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>

          <ul
            aria-label={t('caregiver.today.week.chart')}
            className='mt-5 grid grid-cols-7 gap-1.5'
            onMouseLeave={() => setActive(null)}
          >
            {days.map((item, index) => {
              const isToday = item.day === today
              const isActive = active === index
              const label = format.weekday(item.day)
              const tooltipId = `week-day-${item.day}`
              const share = (minutes: number) => `${(minutes / most) * 100}%`
              const align = index < 2 ? 'left-0' : index > 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'
              return (
                <li className='relative' key={item.day}>
                  <button
                    aria-describedby={isActive ? tooltipId : undefined}
                    aria-label={t('caregiver.today.week.dayCount', {
                      day: format.weekdayLong(item.day),
                      count: item.visits,
                      hours: hours(item.minutes)
                    })}
                    className={`flex w-full flex-col items-center gap-1.5 rounded-2xl py-1 transition-colors focus-visible:outline-2 focus-visible:outline-forest-900 ${isActive ? 'bg-mint-50' : ''}`}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(isActive ? null : index)}
                    onFocus={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    type='button'
                  >
                    <span aria-hidden='true' className='relative flex h-24 w-full max-w-8 items-end justify-center'>
                      {item.workMinutes > 0 ? (
                        <span
                          className='absolute inset-x-0 bottom-0 rounded-full border border-dashed border-mint-300 bg-mint-50/60'
                          style={{ height: share(item.workMinutes) }}
                        />
                      ) : null}
                      <motion.span
                        animate={{ scaleY: 1 }}
                        className='relative flex w-full flex-col-reverse overflow-hidden rounded-full'
                        initial={{ scaleY: 0 }}
                        style={{
                          height: item.minutes ? share(item.minutes) : '10%',
                          transformOrigin: 'bottom'
                        }}
                        transition={{ duration: 0.6, delay: 0.1 + index * 0.05, ease: easeSoft }}
                      >
                        {item.minutes ? (
                          <>
                            <span
                              className='bg-forest-800'
                              style={{ height: `${(item.doneMinutes / item.minutes) * 100}%` }}
                            />
                            <span
                              className={isToday ? 'bg-peach-300' : 'bg-mint-300'}
                              style={{ height: `${(item.upcomingMinutes / item.minutes) * 100}%` }}
                            />
                            <span
                              className='bg-error'
                              style={{ height: `${(item.missedMinutes / item.minutes) * 100}%` }}
                            />
                          </>
                        ) : (
                          <span className='h-full bg-surface-container' />
                        )}
                      </motion.span>
                    </span>
                    <span
                      aria-hidden='true'
                      className={`grid h-7 w-full max-w-9 place-items-center rounded-full text-[11px] font-semibold ${isToday ? 'bg-forest-900 text-white' : 'text-on-surface-variant'}`}
                    >
                      {label}
                    </span>
                  </button>
                  {isActive ? (
                    <div
                      className={`pointer-events-none absolute bottom-full z-20 mb-2 w-48 rounded-2xl bg-forest-950 p-3 text-xs text-white shadow-[var(--shadow-float)] ${align}`}
                      id={tooltipId}
                      role='tooltip'
                    >
                      <p className='font-semibold'>
                        {format.weekdayLong(item.day)}, {format.date(item.day)}
                      </p>
                      <dl className='mt-1.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 tabular-nums'>
                        <dt className='text-white/70'>{t('caregiver.today.week.tooltip.visits')}</dt>
                        <dd className='text-right font-semibold'>{item.visits}</dd>
                        <dt className='text-white/70'>{t('caregiver.today.week.tooltip.hours')}</dt>
                        <dd className='text-right font-semibold'>{hours(item.minutes)}</dd>
                        <dt className='text-white/70'>{t('caregiver.today.week.tooltip.done')}</dt>
                        <dd className='text-right font-semibold'>{item.done}</dd>
                        <dt className='text-white/70'>{t('caregiver.today.week.tooltip.upcoming')}</dt>
                        <dd className='text-right font-semibold'>{item.upcoming}</dd>
                        {item.missed ? (
                          <>
                            <dt className='text-peach-200'>{t('caregiver.today.week.tooltip.missed')}</dt>
                            <dd className='text-right font-semibold text-peach-200'>{item.missed}</dd>
                          </>
                        ) : null}
                        <dt className='text-white/70'>{t('caregiver.today.week.tooltip.workHours')}</dt>
                        <dd className='text-right font-semibold'>{hours(item.workMinutes)}</dd>
                      </dl>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <ul className='mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant'>
            <li className='flex items-center gap-1.5'>
              <span aria-hidden='true' className='h-2.5 w-2.5 rounded-full bg-forest-800' />
              {t('caregiver.today.week.legend.done')}
            </li>
            <li className='flex items-center gap-1.5'>
              <span aria-hidden='true' className='h-2.5 w-2.5 rounded-full bg-mint-300' />
              {t('caregiver.today.week.legend.upcoming')}
            </li>
            <li className='flex items-center gap-1.5'>
              <span aria-hidden='true' className='h-2.5 w-2.5 rounded-full bg-error' />
              {t('caregiver.today.week.legend.missed')}
            </li>
            <li className='flex items-center gap-1.5'>
              <span
                aria-hidden='true'
                className='h-2.5 w-2.5 rounded-full border border-dashed border-mint-400 bg-mint-50'
              />
              {t('caregiver.today.week.legend.workHours')}
            </li>
          </ul>

          {fill !== null ? (
            <div className='mt-4 rounded-2xl bg-surface-container-low p-3'>
              <div className='flex items-baseline justify-between gap-2 text-xs'>
                <span className='font-semibold text-on-surface'>{t('caregiver.today.week.fill')}</span>
                <span className='text-on-surface-variant tabular-nums'>
                  {t('caregiver.today.week.fillDetail', {
                    booked: hours(totalMinutes),
                    registered: hours(workMinutes)
                  })}
                </span>
              </div>
              <div
                aria-label={t('caregiver.today.week.fillLabel', { percent: fill })}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={fill}
                className='mt-2 h-2 overflow-hidden rounded-full bg-white'
                role='progressbar'
              >
                <motion.span
                  animate={{ scaleX: fill / 100 }}
                  className='block h-full origin-left rounded-full bg-gradient-to-r from-mint-400 to-forest-800'
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.7, ease: easeSoft }}
                />
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
