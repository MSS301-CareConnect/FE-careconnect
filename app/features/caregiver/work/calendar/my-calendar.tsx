import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { SegmentedControl } from '~/shared/ui/segmented-control'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { Icon } from '~/shared/ui/icon'

import { DayStrip, type DayMarks } from '../../ui/day-strip'
import { addDays, monthEnd, monthStart, useCaregiverFormat, weekStart } from '../../ui/caregiver-format'
import { CaregiverError } from '../../ui/caregiver-page'
import { useNow } from '../../ui/use-now'
import { buildCalendarItems, itemsOfDay, type CalendarItem } from './calendar-model'
import { LEGEND } from './calendar-item-style'
import { DayAgenda } from './day-agenda'
import { CalendarItemDialog } from './item-dialog'
import { MonthGrid } from './month-grid'
import { useCalendarData } from './use-calendar-data'
import { WeekGrid } from './week-grid'

type View = 'week' | 'month'

const DOT: Record<CalendarItem['kind'], string> = {
  availability: 'bg-mint-300',
  visit: 'bg-forest-900',
  timeOff: 'bg-outline'
}

function shiftMonth(day: string, amount: number) {
  const date = new Date(`${monthStart(day)}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + amount)
  return date.toISOString().slice(0, 10)
}

const navButton =
  'cg-press grid h-11 w-11 place-items-center rounded-full border border-forest-900/10 bg-white text-forest-900 hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-forest-900'

/**
 * "Lịch của tôi": availability (light green), assigned visits (solid) and time off (striped). Desktop shows a week or
 * month grid; phones pick a day from a strip and read its agenda.
 */
export function MyCalendar({ profileId, today }: { profileId?: string; today: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const format = useCaregiverFormat()
  const now = useNow(60_000)
  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState(today)
  const [selectedDay, setSelectedDay] = useState(today)
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null)
  const [selected, setSelected] = useState<CalendarItem | null>(null)

  const week = weekStart(anchor)
  const from = view === 'week' ? week : weekStart(monthStart(anchor))
  const to = view === 'week' ? addDays(week, 6) : addDays(weekStart(monthStart(anchor)), 41)
  const data = useCalendarData(profileId, from, to)
  const items = buildCalendarItems({
    from,
    to,
    slots: data.schedules.data ?? [],
    visits: data.visits.data?.items ?? [],
    timeOffs: data.timeOffs.data ?? [],
    now
  })
  const periodStart = view === 'week' ? week : monthStart(anchor)
  const periodEnd = view === 'week' ? addDays(week, 6) : monthEnd(anchor)
  const openSlots = items.filter(
    (item) => item.kind === 'availability' && item.state === 'open' && item.day >= periodStart && item.day <= periodEnd
  ).length
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(week, index))
  const marks: Record<string, DayMarks> = {}
  for (const day of weekDays) {
    const kinds = new Set(itemsOfDay(items, day).map((item) => item.kind))
    marks[day] = { dots: [...kinds].map((kind) => DOT[kind]) }
  }
  const pending = data.schedules.isPending || data.visits.isPending
  const failed = data.schedules.isError || data.visits.isError || data.timeOffs.isError

  function move(amount: number) {
    setDirection(amount > 0 ? 'next' : 'prev')
    const next = view === 'week' ? addDays(anchor, amount * 7) : shiftMonth(anchor, amount)
    setAnchor(next)
    setSelectedDay(view === 'week' ? addDays(selectedDay, amount * 7) : next)
  }
  function goToday() {
    setDirection(null)
    setAnchor(today)
    setSelectedDay(today)
  }
  function select(item: CalendarItem) {
    if (item.kind === 'visit' && typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      void navigate(`/caregiver/visits/${item.visit.id}`)
      return
    }
    setSelected(item)
  }

  const title =
    view === 'week'
      ? t('caregiver.work.calendar.weekOf', { from: format.shortDay(week), to: format.shortDay(addDays(week, 6)) })
      : new Intl.DateTimeFormat(format.language.startsWith('en') ? 'en-GB' : 'vi-VN', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC'
        }).format(new Date(`${monthStart(anchor)}T00:00:00Z`))
  const unit = view === 'week' ? 'Week' : 'Month'

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <button
            aria-label={t(`caregiver.work.calendar.previous${unit}`)}
            className={navButton}
            onClick={() => move(-1)}
            type='button'
          >
            <Icon name='chevron_left' />
          </button>
          <button
            aria-label={t(`caregiver.work.calendar.next${unit}`)}
            className={navButton}
            onClick={() => move(1)}
            type='button'
          >
            <Icon name='chevron_right' />
          </button>
          <button
            className='cg-press min-h-11 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm font-semibold whitespace-nowrap text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
            onClick={goToday}
            type='button'
          >
            {t('caregiver.work.calendar.today')}
          </button>
          <h2
            aria-live='polite'
            className='order-first w-full text-base font-semibold text-on-surface capitalize tabular-nums sm:order-none sm:ml-1 sm:w-auto sm:text-lg'
          >
            {title}
          </h2>
        </div>
        <div className='flex items-center gap-3'>
          <span className='rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-primary tabular-nums'>
            {t(view === 'week' ? 'caregiver.work.calendar.slotsThisWeek' : 'caregiver.work.calendar.slotsThisMonth', {
              count: openSlots
            })}
          </span>
          <SegmentedControl
            className='hidden lg:block'
            legend={t('caregiver.work.calendar.viewLabel')}
            onChange={(value) => {
              setDirection(null)
              setView(value)
            }}
            options={[
              { value: 'week', label: t('caregiver.work.calendar.views.week') },
              { value: 'month', label: t('caregiver.work.calendar.views.month') }
            ]}
            value={view}
          />
        </div>
      </div>

      <ul
        aria-label={t('caregiver.work.calendar.legend')}
        className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant'
      >
        {LEGEND.map((entry) => (
          <li className='flex items-center gap-1.5' key={entry.key}>
            <span aria-hidden='true' className={`h-3 w-3 rounded ${entry.swatch}`} />
            {t(`caregiver.work.calendar.layers.${entry.key}`)}
          </li>
        ))}
      </ul>

      {failed ? (
        <CaregiverError
          message={t('caregiver.work.calendar.loadError')}
          onRetry={() => {
            void data.schedules.refetch()
            void data.visits.refetch()
            void data.timeOffs.refetch()
          }}
          retryLabel={t('caregiver.ui.actions.retry')}
        />
      ) : null}

      {pending ? (
        <SkeletonGroup label={t('caregiver.ui.states.loading')}>
          <Skeleton className='h-20 rounded-xl lg:hidden' />
          <Skeleton className='mt-3 h-24 rounded-xl lg:h-[520px]' />
        </SkeletonGroup>
      ) : (
        <div
          className={direction === 'next' ? 'cg-slide-next' : direction === 'prev' ? 'cg-slide-prev' : 'cg-page-in'}
          key={`${view}-${from}`}
        >
          <div className='hidden lg:block'>
            {view === 'week' ? (
              <WeekGrid items={items} onSelect={select} today={today} weekStart={week} />
            ) : (
              <MonthGrid
                items={items}
                month={anchor}
                onDay={(day) => {
                  setDirection(null)
                  setView('week')
                  setAnchor(day)
                  setSelectedDay(day)
                }}
                onSelect={select}
                today={today}
              />
            )}
          </div>
          <div className='flex flex-col gap-3 lg:hidden'>
            <DayStrip
              days={weekDays}
              label={t('caregiver.work.calendar.dayStrip')}
              marks={marks}
              onChange={setSelectedDay}
              today={today}
              value={weekDays.includes(selectedDay) ? selectedDay : week}
            />
            <h3 className='text-[15px] font-semibold text-on-surface'>
              {format.relativeDay(selectedDay, today)}
              <span className='ml-2 font-normal text-on-surface-variant tabular-nums'>{format.date(selectedDay)}</span>
            </h3>
            <DayAgenda day={selectedDay} items={itemsOfDay(items, selectedDay)} onSelect={select} />
          </div>
        </div>
      )}

      {selected ? <CalendarItemDialog item={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  )
}
