import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { ScheduleFilters, ScheduleScope } from '../hooks/use-schedule-filters'
import { formatDate, sampleToday, sampleTomorrow, sessionStatuses } from '../schedule-preview'

export function ScheduleControls({ filters }: { filters: ScheduleFilters }) {
  const { t, i18n } = useTranslation()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const locale = i18n.resolvedLanguage ?? 'vi'
  const shortDate = (date: string) => formatDate(date, locale, { day: '2-digit', month: '2-digit' })
  const scopes: { key: Exclude<ScheduleScope, 'day'>; label: string }[] = [
    { key: 'overview', label: t('caregiver.schedulePage.overview') },
    { key: 'today', label: t('caregiver.schedulePage.today', { date: shortDate(sampleToday) }) },
    { key: 'tomorrow', label: t('caregiver.schedulePage.tomorrow', { date: shortDate(sampleTomorrow) }) },
    { key: 'week', label: t('caregiver.schedulePage.week') },
    { key: 'month', label: t('caregiver.schedulePage.month') }
  ]
  return (
    <div className='space-y-5'>
      <div className='flex flex-col justify-between gap-5 xl:flex-row xl:items-end'>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{t('caregiver.schedulePage.title')}</h1>
        <div className='flex flex-wrap items-center gap-2'>
          <div
            aria-label={t('caregiver.schedulePage.view')}
            className='flex rounded-lg bg-surface-container-high p-1'
            role='group'
          >
            {(
              [
                { key: 'list', icon: 'view_list' },
                { key: 'calendar', icon: 'calendar_month' }
              ] as const
            ).map((item) => (
              <button
                aria-pressed={filters.view === item.key}
                className='flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold text-on-surface-variant aria-pressed:bg-white aria-pressed:text-primary aria-pressed:shadow-sm'
                key={item.key}
                onClick={() => filters.update({ view: item.key })}
                type='button'
              >
                <Icon className='text-lg' name={item.icon} />
                {t(`caregiver.schedulePage.${item.key}`)}
              </button>
            ))}
          </div>
          <button
            aria-controls='schedule-filter-panel'
            aria-expanded={filtersOpen}
            className='flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold shadow-sm'
            onClick={() => setFiltersOpen(!filtersOpen)}
            type='button'
          >
            <Icon className='text-lg text-primary' name='tune' />
            {t('caregiver.schedulePage.filters')}
          </button>
        </div>
      </div>
      {filtersOpen && (
        <section
          aria-label={t('caregiver.schedulePage.filters')}
          className='grid gap-4 rounded-xl border border-outline-variant/20 bg-white p-4 sm:grid-cols-2'
          id='schedule-filter-panel'
        >
          <label className='space-y-2 text-xs font-semibold'>
            <span className='block'>{t('caregiver.schedulePage.filter.status')}</span>
            <select
              className='min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm'
              onChange={(event) => filters.update({ status: event.target.value === 'all' ? null : event.target.value })}
              value={filters.status}
            >
              <option value='all'>{t('caregiver.schedulePage.filter.all')}</option>
              {sessionStatuses.map((status) => (
                <option key={status} value={status}>
                  {t(`caregiver.schedulePage.status.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='space-y-2 text-xs font-semibold'>
            <span className='block'>{t('caregiver.schedulePage.filter.search')}</span>
            <input
              className='min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm'
              onChange={(event) => filters.update({ q: event.target.value || null })}
              placeholder={t('caregiver.schedulePage.filter.placeholder')}
              type='search'
              value={filters.search}
            />
          </label>
          <div className='flex gap-4 sm:col-span-2'>
            <button
              className='min-h-10 text-xs font-bold text-primary'
              onClick={() => filters.update({ status: null, q: null })}
              type='button'
            >
              {t('caregiver.schedulePage.filter.reset')}
            </button>
            <button className='min-h-10 text-xs text-outline' onClick={() => setFiltersOpen(false)} type='button'>
              {t('caregiver.schedulePage.filter.close')}
            </button>
          </div>
        </section>
      )}
      <div className='flex flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-1 rounded-lg bg-surface-container p-1'>
            <button
              aria-label={t('caregiver.schedulePage.previous')}
              className='flex h-10 w-10 items-center justify-center rounded-md hover:bg-white'
              onClick={() => filters.changeMonth(-1)}
              type='button'
            >
              <Icon name='chevron_left' />
            </button>
            <p aria-live='polite' className='px-2 text-base font-bold capitalize'>
              {formatDate(`${filters.month}-01`, locale, { month: 'long', year: 'numeric' })}
            </p>
            <button
              aria-label={t('caregiver.schedulePage.next')}
              className='flex h-10 w-10 items-center justify-center rounded-md hover:bg-white'
              onClick={() => filters.changeMonth(1)}
              type='button'
            >
              <Icon name='chevron_right' />
            </button>
          </div>
          <p className='rounded-full bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant'>
            {t('caregiver.schedulePage.window', {
              start: shortDate(filters.weekDates[0]),
              end: shortDate(filters.weekDates[6]),
              count: filters.weekSessions.length
            })}
          </p>
        </div>
        <div className='flex gap-1 overflow-x-auto' role='group' aria-label={t('caregiver.schedulePage.navRange')}>
          {scopes.map((scope) => (
            <button
              aria-pressed={filters.scope === scope.key}
              className='min-h-10 shrink-0 rounded-lg bg-surface-container-low px-4 text-xs font-semibold text-on-surface-variant transition hover:bg-surface-container-high aria-pressed:bg-primary aria-pressed:text-white'
              key={scope.key}
              onClick={() => filters.chooseScope(scope.key)}
              type='button'
            >
              {scope.label}
            </button>
          ))}
          {filters.scope === 'day' && (
            <span className='flex items-center rounded-lg bg-primary px-4 text-xs font-semibold text-white'>
              {t('caregiver.schedulePage.day')}
            </span>
          )}
        </div>
      </div>
      <div className='grid grid-cols-7 gap-1.5 sm:gap-3'>
        {filters.weekDates.map((date) => {
          const count = filters.matchingSessions.filter((session) => session.date === date).length
          const selected = date === filters.date
          return (
            <button
              aria-label={t('caregiver.schedulePage.dateChoice', { date: shortDate(date) })}
              aria-pressed={selected}
              className='flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl bg-white p-1 text-center shadow-sm transition hover:bg-surface-container-low aria-pressed:bg-primary aria-pressed:text-white sm:p-3'
              key={date}
              onClick={() => filters.chooseDate(date)}
              type='button'
            >
              <span className={`text-[10px] sm:text-xs ${selected ? 'text-white/80' : 'text-outline'}`}>
                {formatDate(date, locale, { weekday: 'short' })}
              </span>
              <span className='text-lg font-bold sm:text-xl'>{formatDate(date, locale, { day: 'numeric' })}</span>
              <span
                className={`rounded-full px-1.5 py-1 text-[9px] sm:text-[11px] ${selected ? 'bg-white/20' : 'bg-surface-container-high text-on-surface-variant'}`}
              >
                {count ? t('caregiver.schedulePage.shifts', { count }) : t('caregiver.schedulePage.rest')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
