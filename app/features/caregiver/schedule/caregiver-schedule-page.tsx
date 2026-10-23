import { useTranslation } from 'react-i18next'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { ScheduleCalendar } from './components/schedule-calendar'
import { ScheduleControls } from './components/schedule-controls'
import { ScheduleProgress } from './components/schedule-progress'
import { ScheduleSessionCard } from './components/schedule-session-card'
import { ScheduleSidebar } from './components/schedule-sidebar'
import { useScheduleFilters } from './hooks/use-schedule-filters'
import { formatDate, sampleToday, sampleTomorrow } from './schedule-preview'

export function CaregiverSchedulePage() {
  const { t, i18n } = useTranslation()
  const filters = useScheduleFilters()
  const locale = i18n.resolvedLanguage ?? 'vi'
  useDocumentTitle(t('caregiver.schedulePage.documentTitle'))
  const dates = [...new Set(filters.visibleSessions.map((session) => session.date))].sort()
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  return (
    <div className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-12'>
      <ScheduleControls filters={filters} />
      <p className='flex items-start gap-2 rounded-lg bg-secondary-container px-4 py-3 text-xs leading-5 text-primary'>
        <Icon className='shrink-0 text-lg' name='info' />
        {t('caregiver.schedulePage.demo', {
          date: formatDate(sampleToday, locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
        })}
      </p>
      <ScheduleProgress />
      <div className='grid items-start gap-8 lg:grid-cols-12'>
        <div className='space-y-8 lg:col-span-8'>
          {filters.view === 'calendar' ? (
            <ScheduleCalendar filters={filters} />
          ) : dates.length > 0 ? (
            dates.map((date) => {
              const sessions = filters.visibleSessions.filter((session) => session.date === date)
              const dateLabel = formatDate(date, locale, { weekday: 'long', day: '2-digit', month: '2-digit' })
              const heading =
                date === sampleToday
                  ? t('caregiver.schedulePage.group.today', { date: dateLabel })
                  : date === sampleTomorrow
                    ? t('caregiver.schedulePage.group.tomorrow', { date: dateLabel })
                    : dateLabel
              return (
                <section className='space-y-4' key={date}>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <h2 className='flex items-center gap-2 text-lg font-bold capitalize'>
                      {date === sampleToday && <span className='h-2.5 w-2.5 rounded-full bg-primary' />}
                      {heading}
                    </h2>
                    <span className='rounded-full bg-surface-container px-3 py-1.5 text-xs text-on-surface-variant'>
                      {t('caregiver.schedulePage.group.summary', {
                        count: sessions.length,
                        hours: number(sessions.reduce((sum, session) => sum + session.endHour - session.startHour, 0))
                      })}
                    </span>
                  </div>
                  {sessions.map((session) => (
                    <ScheduleSessionCard key={session.id} session={session} />
                  ))}
                </section>
              )
            })
          ) : (
            <section className='rounded-xl bg-white px-6 py-14 text-center shadow-sm'>
              <Icon className='text-4xl text-outline' name='event_busy' />
              <h2 className='mt-4 text-lg font-bold'>{t('caregiver.schedulePage.empty.title')}</h2>
              <p className='mt-2 text-sm text-outline'>{t('caregiver.schedulePage.empty.description')}</p>
              <button
                className='mt-5 min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white'
                onClick={filters.reset}
                type='button'
              >
                {t('caregiver.schedulePage.empty.reset')}
              </button>
            </section>
          )}
        </div>
        <div className='lg:col-span-4'>
          <ScheduleSidebar dates={filters.weekDates} sessions={filters.weekSessions} />
        </div>
      </div>
    </div>
  )
}
