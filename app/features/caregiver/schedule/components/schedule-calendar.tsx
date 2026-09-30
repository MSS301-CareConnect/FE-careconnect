import { useTranslation } from 'react-i18next'

import type { ScheduleFilters } from '../hooks/use-schedule-filters'
import { addDays, dateFromKey, formatDate } from '../schedule-preview'

export function ScheduleCalendar({ filters }: { filters: ScheduleFilters }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const firstDate = `${filters.month}-01`
  const offset = (dateFromKey(firstDate).getUTCDay() + 6) % 7
  const start = addDays(firstDate, -offset)
  const dates = Array.from({ length: 42 }, (_, index) => addDays(start, index))
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    formatDate(addDays('2026-09-21', index), locale, { weekday: 'short' })
  )
  return (
    <section className='rounded-xl bg-white p-4 shadow-sm sm:p-6'>
      <p className='mb-4 text-xs text-outline'>{t('caregiver.schedulePage.calendarHint')}</p>
      <div className='overflow-x-auto'>
        <table
          aria-label={t('caregiver.schedulePage.calendarLabel')}
          className='w-full min-w-120 table-fixed border-collapse'
        >
          <thead>
            <tr>
              {weekdays.map((day) => (
                <th className='pb-3 text-xs font-semibold text-outline' key={day} scope='col'>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, row) => (
              <tr key={row}>
                {dates.slice(row * 7, row * 7 + 7).map((date) => {
                  const sessions = filters.matchingSessions.filter((session) => session.date === date)
                  const shortDate = formatDate(date, locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
                  return (
                    <td className='border border-outline-variant/20 p-0.5 align-top' key={date}>
                      <button
                        aria-label={t('caregiver.schedulePage.calendarCount', {
                          count: sessions.length,
                          date: shortDate
                        })}
                        aria-pressed={date === filters.date}
                        className={`flex min-h-24 w-full flex-col items-start gap-2 rounded-lg p-2 text-left transition hover:bg-secondary-container aria-pressed:bg-secondary-container ${date.startsWith(filters.month) ? 'text-on-surface' : 'text-outline/60'}`}
                        onClick={() => filters.chooseDate(date)}
                        type='button'
                      >
                        <span className='text-sm font-bold'>{formatDate(date, locale, { day: 'numeric' })}</span>
                        {sessions.map((session) => (
                          <span
                            className={`w-full rounded px-1 py-1 text-[9px] font-semibold ${session.status === 'ongoing' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}
                            key={session.id}
                          >
                            {t(`caregiver.schedulePage.patients.${session.patient}.name`)}
                          </span>
                        ))}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
