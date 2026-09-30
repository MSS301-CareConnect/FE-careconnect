import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { careDate, careRecordPreviews } from '~/entities/care-session/care-record-preview'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { HistoryRecordCard } from './components/history-record-card'
import { HistorySidebar } from './components/history-sidebar'

const tabs = ['all', 'done', 'reviewed', 'supplement'] as const
const fieldClass =
  'min-h-11 rounded-xl border border-outline-variant/40 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
export function CaregiverCareHistoryPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
  const currency = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(value)
  const [params, setParams] = useSearchParams()
  const [advanced, setAdvanced] = useState(false)
  const search = params.get('q') ?? ''
  const month = params.get('month') ?? '2026-09'
  const tab = params.get('tab') ?? 'all'
  const sort = params.get('sort') ?? 'newest'
  const minimum = Math.max(0, Number(params.get('min')) || 0)
  function setFilter(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.set(key, value)
        next.delete('page')
        return next
      },
      { replace: true }
    )
  }
  const monthly = careRecordPreviews.filter((record) => !month || record.date.startsWith(month))
  const filtered = monthly
    .filter(
      (record) =>
        `${record.code} ${t(`caregiver.careRecords.${record.patient}.name`)}`
          .toLocaleLowerCase(locale)
          .includes(search.trim().toLocaleLowerCase(locale)) &&
        record.amount >= minimum &&
        (tab === 'reviewed' ? record.rating !== null : tab === 'supplement' ? record.needsSupplement : true)
    )
    .sort((a, b) =>
      sort === 'highest'
        ? b.amount - a.amount
        : sort === 'best'
          ? (b.rating ?? -1) - (a.rating ?? -1)
          : b.date.localeCompare(a.date)
    )
  const pages = Math.max(1, Math.ceil(filtered.length / 4))
  const page = Math.min(pages, Math.max(1, Math.floor(Number(params.get('page')) || 1)))
  const shown = filtered.slice((page - 1) * 4, page * 4)
  const ratings = monthly.flatMap((record) => (record.rating === null ? [] : [record.rating]))
  const stats = [
    {
      key: 'completed',
      icon: 'task_alt',
      value: number(monthly.length),
      detail: t('caregiver.careHistory.hours', {
        hours: number(monthly.reduce((sum, record) => sum + record.minutes, 0) / 60)
      })
    },
    {
      key: 'income',
      icon: 'account_balance_wallet',
      value: currency(monthly.reduce((sum, record) => sum + record.amount, 0))
    },
    {
      key: 'rating',
      icon: 'star',
      value: ratings.length
        ? t('caregiver.careHistory.ratingValue', {
            score: number(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length),
            max: number(5)
          })
        : t('caregiver.careHistory.noReview')
    },
    { key: 'records', icon: 'folder_open', value: number(monthly.filter((record) => record.needsSupplement).length) }
  ] as const
  useDocumentTitle(t('caregiver.careHistory.documentTitle'))
  function exportCsv() {
    const rows = [
      [
        t('caregiver.careHistory.downloadCode'),
        t('caregiver.careHistory.downloadDate'),
        t('caregiver.careHistory.downloadPatient'),
        t('caregiver.careHistory.downloadAmount')
      ],
      ...filtered.map((record) => [
        record.code,
        record.date,
        t(`caregiver.careRecords.${record.patient}.name`),
        String(record.amount)
      ])
    ]
    const csv = rows
      .map((row) =>
        row.map((value) => `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`).join(',')
      )
      .join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'care-history.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {t('caregiver.careHistory.title')}
          </h1>
          <p className='mt-3 text-sm text-on-surface-variant'>{t('caregiver.careHistory.subtitle')}</p>
        </div>
        <button
          className='flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50'
          disabled={!filtered.length}
          onClick={exportCsv}
          type='button'
        >
          <Icon name='download' />
          {t('caregiver.careHistory.export')}
        </button>
      </div>
      <p className='text-xs text-outline'>{t('caregiver.careHistory.demo')}</p>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <section className='rounded-2xl bg-white p-5 shadow-sm' key={stat.key}>
            <div className='flex items-center justify-between gap-2'>
              <h2 className='text-xs font-semibold text-outline'>{t(`caregiver.careHistory.${stat.key}`)}</h2>
              <Icon className='text-primary' name={stat.icon} />
            </div>
            <p className='mt-4 text-2xl font-extrabold text-primary'>{stat.value}</p>
            {'detail' in stat && <p className='mt-2 text-xs text-outline'>{stat.detail}</p>}
          </section>
        ))}
      </div>
      <section className='space-y-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5'>
        <div aria-label={t('caregiver.careHistory.filters')} className='flex flex-wrap gap-2'>
          {tabs.map((key) => (
            <button
              aria-pressed={tab === key}
              className={`rounded-lg px-4 py-2.5 text-xs font-bold ${tab === key ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}
              key={key}
              onClick={() => setFilter('tab', key)}
              type='button'
            >
              {t(`caregiver.careHistory.${key}`)}
            </button>
          ))}
        </div>
        <div className='flex flex-wrap gap-3'>
          <label className='flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-outline-variant/40 px-3 focus-within:border-primary'>
            <Icon className='text-outline' name='search' />
            <input
              aria-label={t('caregiver.careHistory.search')}
              className='h-11 w-full min-w-40 bg-transparent text-sm outline-none'
              onChange={(event) => setFilter('q', event.target.value)}
              placeholder={t('caregiver.careHistory.search')}
              type='search'
              value={search}
            />
          </label>
          <select
            aria-label={t('caregiver.careHistory.month')}
            className={fieldClass}
            onChange={(event) => setFilter('month', event.target.value)}
            value={month}
          >
            <option value=''>{t('caregiver.careHistory.allMonths')}</option>
            {['2026-09', '2026-08'].map((value) => (
              <option key={value} value={value}>
                {careDate(`${value}-01`, locale, { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
          <select
            aria-label={t('caregiver.careHistory.sort')}
            className={fieldClass}
            onChange={(event) => setFilter('sort', event.target.value)}
            value={sort}
          >
            {(['newest', 'highest', 'best'] as const).map((key) => (
              <option key={key} value={key}>
                {t(`caregiver.careHistory.${key}`)}
              </option>
            ))}
          </select>
          <button
            aria-expanded={advanced}
            className='flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-3 text-xs font-semibold'
            onClick={() => setAdvanced(!advanced)}
            type='button'
          >
            <Icon name='tune' />
            {t('caregiver.careHistory.filters')}
          </button>
        </div>
        {advanced && (
          <div className='flex flex-wrap items-end gap-4 border-t border-outline-variant/20 pt-4'>
            <label className='flex flex-col gap-2 text-xs font-semibold'>
              {t('caregiver.careHistory.minAmount')}
              <input
                className={fieldClass}
                min='0'
                onChange={(event) => setFilter('min', event.target.value)}
                step='10000'
                type='number'
                value={minimum || ''}
              />
            </label>
            <button
              className='py-3 text-xs font-bold text-primary underline'
              onClick={() => setParams({})}
              type='button'
            >
              {t('caregiver.careHistory.reset')}
            </button>
          </div>
        )}
      </section>
      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <div className='space-y-5 lg:col-span-8'>
          {shown.map((record) => (
            <HistoryRecordCard key={record.code} record={record} />
          ))}
          {!shown.length && (
            <div className='rounded-2xl bg-white px-6 py-16 text-center'>
              <Icon className='mb-4 text-4xl text-outline' name='search_off' />
              <h2 className='font-bold'>{t('caregiver.careHistory.empty')}</h2>
              <p className='mt-3 text-sm text-outline'>{t('caregiver.careHistory.emptyHint')}</p>
              <button className='mt-5 font-semibold text-primary underline' onClick={() => setParams({})} type='button'>
                {t('caregiver.careHistory.reset')}
              </button>
            </div>
          )}
          <div className='flex flex-wrap items-center justify-between gap-3 px-1'>
            <p aria-live='polite' className='text-xs text-outline'>
              {t('caregiver.careHistory.pagination', {
                from: number(filtered.length ? (page - 1) * 4 + 1 : 0),
                to: number(Math.min(page * 4, filtered.length)),
                total: number(filtered.length)
              })}
            </p>
            <div className='flex gap-2'>
              {([-1, 1] as const).map((direction) => (
                <button
                  aria-label={t(direction < 0 ? 'caregiver.careHistory.previous' : 'caregiver.careHistory.next')}
                  className='flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/30 bg-white text-primary disabled:opacity-30'
                  disabled={direction < 0 ? page === 1 : page === pages}
                  key={direction}
                  onClick={() =>
                    setParams((previous) => {
                      const next = new URLSearchParams(previous)
                      next.set('page', String(page + direction))
                      return next
                    })
                  }
                  type='button'
                >
                  <Icon name={direction < 0 ? 'chevron_left' : 'chevron_right'} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className='lg:col-span-4'>
          <HistorySidebar records={monthly} />
        </div>
      </div>
    </div>
  )
}
