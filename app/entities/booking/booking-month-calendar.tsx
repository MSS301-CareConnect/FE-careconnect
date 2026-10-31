import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { StatusTone } from '~/shared/ui/status-badge'

import { BOOKING_STATUS_TONES } from './booking-status-badge'
import { monthGrid, type DayKey, type PlannedVisit } from './booking-month'
import { shortTime } from './booking-format'

const VISIBLE_PER_DAY = 3
const DOT: Record<StatusTone, string> = {
  success: 'bg-success',
  active: 'bg-active',
  info: 'bg-info',
  warning: 'bg-warning',
  caution: 'bg-caution',
  danger: 'bg-error',
  error: 'bg-error',
  neutral: 'bg-neutral'
}
/** Bookings that will not happen stay visible, but quieter. */
const ENDED = new Set(['CANCELLED', 'EXPIRED', 'REJECTED'])

interface BookingMonthCalendarProps {
  month: string
  today: DayKey
  visits: Map<DayKey, PlannedVisit[]>
  selectedDay: DayKey | null
  onSelectDay: (day: DayKey) => void
  detailPath: (bookingId: string) => string
  centerName?: (centerId: string | undefined) => string
}

function useDayFormat() {
  const { i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const utc = (day: DayKey) => new Date(`${day}T12:00:00Z`)
  return {
    weekday: (day: DayKey) => new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(utc(day)),
    long: (day: DayKey) =>
      new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
        utc(day)
      )
  }
}

function VisitLink({
  visit,
  detailPath,
  detailed,
  centerName
}: {
  visit: PlannedVisit
  detailPath: (bookingId: string) => string
  detailed?: boolean
  centerName?: (centerId: string | undefined) => string
}) {
  const { t } = useTranslation()
  const ended = ENDED.has(visit.status)
  return (
    <Link
      aria-label={t('booking.browser.open', { code: visit.bookingCode })}
      className={`group flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary ${ended ? 'text-on-surface-variant/70' : 'text-on-surface'}`}
      to={detailPath(visit.bookingId)}
    >
      <span aria-hidden='true' className={`h-2 w-2 shrink-0 rounded-full ${DOT[BOOKING_STATUS_TONES[visit.status]]}`} />
      <span className='shrink-0 font-semibold tabular-nums'>
        {detailed
          ? t('booking.browser.time', { start: shortTime(visit.startTime), end: shortTime(visit.endTime) })
          : shortTime(visit.startTime)}
      </span>
      <span className={`min-w-0 truncate ${ended ? 'line-through' : ''}`}>
        {visit.recipientName ?? (detailed ? t('booking.browser.noRecipient') : `#${visit.bookingCode}`)}
        {detailed && centerName ? ` · ${centerName(visit.centerId)}` : ''}
      </span>
      {detailed ? (
        <span className='ml-auto hidden shrink-0 tabular-nums text-on-surface-variant sm:inline'>
          #{visit.bookingCode}
        </span>
      ) : null}
    </Link>
  )
}

/** Month view of planned visits: a grid on wide screens, a day-by-day agenda on narrow ones. */
export function BookingMonthCalendar({
  month,
  today,
  visits,
  selectedDay,
  onSelectDay,
  detailPath,
  centerName
}: BookingMonthCalendarProps) {
  const { t } = useTranslation()
  const format = useDayFormat()
  const grid = monthGrid(month)
  const daysWithVisits = grid.filter((day) => day.startsWith(month) && visits.has(day))
  const selected = selectedDay ? (visits.get(selectedDay) ?? []) : []

  return (
    <div className='space-y-4'>
      <div className='hidden overflow-hidden rounded-xl border border-outline-variant/40 bg-white md:block'>
        <div className='grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container-low'>
          {grid.slice(0, 7).map((day) => (
            <div className='px-3 py-2 text-xs font-semibold text-on-surface-variant' key={day}>
              {format.weekday(day)}
            </div>
          ))}
        </div>
        <div className='grid grid-cols-7'>
          {grid.map((day) => {
            const inMonth = day.startsWith(month)
            const items = visits.get(day) ?? []
            const isSelected = day === selectedDay
            return (
              <div
                className={`min-h-30 border-r border-b border-outline-variant/25 p-1.5 [&:nth-child(7n)]:border-r-0 ${inMonth ? 'bg-white' : 'bg-surface-container-low/50'} ${isSelected ? 'ring-2 ring-primary/40 ring-inset' : ''}`}
                key={day}
              >
                <button
                  aria-label={t('booking.browser.dayTitle', { date: format.long(day) })}
                  aria-pressed={isSelected}
                  className={`mb-1 grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary ${day === today ? 'bg-primary text-on-primary hover:bg-primary' : inMonth ? 'text-on-surface' : 'text-outline'}`}
                  onClick={() => onSelectDay(day)}
                  type='button'
                >
                  {Number(day.slice(8))}
                </button>
                <div className='space-y-0.5'>
                  {items.slice(0, VISIBLE_PER_DAY).map((visit) => (
                    <VisitLink detailPath={detailPath} key={`${visit.bookingId}-${day}`} visit={visit} />
                  ))}
                  {items.length > VISIBLE_PER_DAY ? (
                    <button
                      className='w-full rounded-md px-1.5 py-1 text-left text-xs font-semibold text-primary hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
                      onClick={() => onSelectDay(day)}
                      type='button'
                    >
                      {t('booking.browser.more', { count: items.length - VISIBLE_PER_DAY })}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <section className='hidden rounded-xl border border-outline-variant/40 bg-white p-4 md:block'>
        {selectedDay ? (
          <>
            <h3 className='text-sm font-bold text-on-surface first-letter:uppercase'>
              {format.long(selectedDay)}
              <span className='ml-2 font-normal text-on-surface-variant'>
                {t('booking.browser.visits', { count: selected.length })}
              </span>
            </h3>
            {selected.length ? (
              <div className='mt-2 space-y-0.5'>
                {selected.map((visit) => (
                  <VisitLink
                    centerName={centerName}
                    detailPath={detailPath}
                    detailed
                    key={visit.bookingId}
                    visit={visit}
                  />
                ))}
              </div>
            ) : (
              <p className='mt-2 text-sm text-on-surface-variant'>{t('booking.browser.dayEmpty')}</p>
            )}
          </>
        ) : (
          <p className='text-sm text-on-surface-variant'>{t('booking.browser.pickDay')}</p>
        )}
      </section>

      <div className='space-y-3 md:hidden'>
        {daysWithVisits.length === 0 ? (
          <p className='rounded-xl border border-outline-variant/40 bg-white p-4 text-sm text-on-surface-variant'>
            {t('booking.browser.noVisits')}
          </p>
        ) : (
          daysWithVisits.map((day) => (
            <section className='rounded-xl border border-outline-variant/40 bg-white p-3' key={day}>
              <h3
                className={`text-sm font-bold first-letter:uppercase ${day === today ? 'text-primary' : 'text-on-surface'}`}
              >
                {format.long(day)}
              </h3>
              <div className='mt-1.5 space-y-0.5'>
                {(visits.get(day) ?? []).map((visit) => (
                  <VisitLink
                    centerName={centerName}
                    detailPath={detailPath}
                    detailed
                    key={visit.bookingId}
                    visit={visit}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
