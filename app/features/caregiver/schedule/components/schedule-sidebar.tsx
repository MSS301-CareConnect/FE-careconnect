import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { formatDate, formatHour, type ScheduleSession } from '../schedule-preview'

export function ScheduleSidebar({ sessions, dates }: { sessions: readonly ScheduleSession[]; dates: string[] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  const currency = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(value)
  const hours = sessions.reduce((sum, session) => sum + session.endHour - session.startHour, 0)
  const completed = sessions.filter((session) => session.status === 'completed').length
  const ratio = sessions.length ? completed / sessions.length : 0
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(ratio)
  const suggestions = sessions.length
    ? ([
        { key: 'elder', slot: 'morning', date: '2026-09-22', start: 8, end: 12, amount: 380000, age: 80 },
        { key: 'child', slot: 'evening', date: '2026-09-24', start: 18, end: 21, amount: 300000, age: 6 }
      ] as const)
    : []
  const visibleSuggestions = suggestions.filter((item) => dates.includes(item.date))
  return (
    <aside className='space-y-6'>
      <section className='space-y-5 rounded-xl bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <h2 className='text-base font-bold'>{t('caregiver.schedulePage.summary.title')}</h2>
          <span className='rounded-full bg-secondary-container px-2 py-1 text-[9px] font-semibold text-primary'>
            {t('caregiver.schedulePage.summary.sample')}
          </span>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-2 rounded-lg bg-surface-container-low p-3'>
            <p className='text-[10px] text-outline'>{t('caregiver.schedulePage.summary.time')}</p>
            <p className='text-xl font-bold'>{t('caregiver.schedulePage.shifts', { count: sessions.length })}</p>
            <p className='text-[11px] text-on-surface-variant'>
              {t('caregiver.schedulePage.summary.hours', { hours: number(hours) })}
            </p>
          </div>
          <div className='space-y-2 rounded-lg bg-secondary-container/60 p-3'>
            <p className='text-[10px] text-outline'>{t('caregiver.schedulePage.summary.income')}</p>
            <p className='text-lg font-bold text-primary'>{currency(hours * 106250)}</p>
            <p className='text-[11px] font-semibold text-primary'>{t('caregiver.schedulePage.summary.allowance')}</p>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='flex flex-wrap justify-between gap-2 text-[11px]'>
            <span className='text-on-surface-variant'>{t('caregiver.schedulePage.summary.completion')}</span>
            <span className='font-bold'>
              {t('caregiver.schedulePage.summary.completed', {
                done: number(completed),
                total: number(sessions.length),
                percent
              })}
            </span>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-surface-container'>
            <div aria-hidden='true' className='h-full rounded-full bg-primary' style={{ width: `${ratio * 100}%` }} />
          </div>
        </div>
        <div className='flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/20 pt-3'>
          <p className='flex items-center gap-1 text-sm font-bold'>
            <Icon className='text-lg text-amber-500' filled name='star' />
            {t('caregiver.schedulePage.summary.rating', { score: number(5), max: number(5) })}
            <span className='text-[10px] font-normal text-outline'>
              {t('caregiver.schedulePage.summary.reviews', { count: 18 })}
            </span>
          </p>
          <span className='text-[10px] font-semibold text-primary'>
            {t('caregiver.schedulePage.summary.excellent')}
          </span>
        </div>
      </section>
      <div className='space-y-2'>
        <button
          className='flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70'
          disabled
          title={t('caregiver.unavailable')}
          type='button'
        >
          <Icon className='text-lg' name='add_circle' />
          {t('caregiver.schedulePage.progress.extra', { amount: currency(350000) })}
        </button>
        <button
          className='flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-70'
          disabled
          title={t('caregiver.unavailable')}
          type='button'
        >
          <Icon className='text-lg text-outline' name='event_busy' />
          {t('caregiver.schedulePage.progress.leave')}
        </button>
      </div>
      {visibleSuggestions.length > 0 && (
        <section className='space-y-4 rounded-xl bg-white p-5 shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h2 className='flex items-center gap-2 text-sm font-bold'>
              <Icon className='text-lg text-primary' name='explore' />
              {t('caregiver.schedulePage.open.title')}
            </h2>
            <span className='rounded bg-surface-container px-2 py-1 text-[9px] text-outline'>
              {t('caregiver.schedulePage.open.area')}
            </span>
          </div>
          {visibleSuggestions.map((item) => (
            <article className='space-y-3 rounded-lg bg-surface-container-low p-4' key={item.key}>
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <div>
                  <p className='text-[10px] font-bold uppercase text-primary'>
                    {t(`caregiver.schedulePage.open.${item.slot}`, {
                      date: formatDate(item.date, locale, { weekday: 'short', day: '2-digit', month: '2-digit' })
                    })}
                  </p>
                  <p className='mt-1 text-sm font-bold'>
                    {formatHour(item.start, locale)}
                    <span className='mx-1' aria-hidden='true'>
                      –
                    </span>
                    {formatHour(item.end, locale)}
                  </p>
                </div>
                <span className='text-xs font-bold text-primary'>{currency(item.amount)}</span>
              </div>
              <p className='text-xs leading-5 text-on-surface-variant'>
                {t(`caregiver.schedulePage.open.${item.key}`, { age: number(item.age) })}
              </p>
              <div className='flex justify-end'>
                <button
                  className='min-h-10 rounded-lg bg-primary px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-65'
                  disabled
                  title={t('caregiver.unavailable')}
                  type='button'
                >
                  {t('caregiver.schedulePage.open.accept')}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
      <div className='rounded-xl bg-surface-container-low p-5'>
        <div className='flex items-center gap-3'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <Icon name='support_agent' />
          </span>
          <h2 className='text-xs font-bold uppercase tracking-wide'>{t('caregiver.schedulePage.support.title')}</h2>
        </div>
        <p className='mt-3 flex items-start gap-2 text-[11px] leading-6 text-on-surface-variant'>
          <Icon className='shrink-0 text-base text-amber-600' name='info' />
          {t('caregiver.schedulePage.support.description')}
        </p>
      </div>
    </aside>
  )
}
