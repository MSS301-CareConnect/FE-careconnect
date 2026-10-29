import { useTranslation } from 'react-i18next'

import { OCCURRENCE_STATUSES, bookingErrorKey } from '~/entities/booking/booking-format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { VisitCard } from './components/visit-card'
import { VISIT_RANGES, useCaregiverVisits } from './hooks/use-caregiver-visits'

export function CaregiverVisitsPage() {
  const { t } = useTranslation()
  const list = useCaregiverVisits()
  const { visits } = list
  useDocumentTitle(t('caregiver.visits.documentTitle'))

  return (
    <div className='mx-auto flex max-w-5xl flex-col gap-6 px-4 py-7 sm:px-6'>
      <header>
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t('caregiver.visits.title')}</h1>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>{t('caregiver.visits.subtitle')}</p>
      </header>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div
          aria-label={t('caregiver.visits.rangeLabel')}
          className='flex gap-1 rounded-xl border border-outline-variant/25 bg-white p-1 shadow-sm'
          role='group'
        >
          {VISIT_RANGES.map((range) => (
            <button
              aria-pressed={list.range === range}
              className={`min-h-11 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${list.range === range ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              key={range}
              onClick={() => list.setRange(range)}
              type='button'
            >
              {t(`caregiver.visits.ranges.${range}`)}
            </button>
          ))}
        </div>
        <label className='flex items-center gap-2 text-sm font-semibold text-on-surface'>
          {t('caregiver.visits.status')}
          <select
            className='min-h-11 rounded-xl border border-outline-variant/50 bg-white px-3.5 py-2 text-sm font-normal text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
            onChange={(event) => list.setStatus(event.target.value)}
            value={list.status ?? ''}
          >
            <option value=''>{t('caregiver.visits.allStatuses')}</option>
            {OCCURRENCE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`booking.occurrenceStatus.${status}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visits.isPending ? (
        <p
          className='rounded-xl border border-outline-variant/20 bg-white p-6 text-sm text-on-surface-variant shadow-sm'
          role='status'
        >
          {t('caregiver.visits.loading')}
        </p>
      ) : null}
      {visits.isError ? (
        <div className='rounded-xl border border-error/25 bg-white p-6 shadow-sm' role='alert'>
          <p className='text-sm text-error'>{t(bookingErrorKey(visits.error))}</p>
          <button
            className='mt-2 min-h-11 text-sm font-semibold text-primary underline'
            onClick={() => void visits.refetch()}
            type='button'
          >
            {t('booking.actions.retry')}
          </button>
        </div>
      ) : null}
      {visits.isSuccess && visits.data.items.length === 0 ? (
        <div className='flex flex-col items-center gap-3 rounded-2xl border border-outline-variant/20 bg-white px-6 py-12 text-center shadow-sm'>
          <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-primary'>
            <Icon className='text-2xl' name='event_available' />
          </span>
          <h2 className='text-lg font-bold text-on-surface'>{t('caregiver.visits.empty')}</h2>
          <p className='max-w-md text-sm text-on-surface-variant'>{t('caregiver.visits.emptyHint')}</p>
        </div>
      ) : null}
      {visits.isSuccess && visits.data.items.length > 0 ? (
        <ul className='flex flex-col gap-3'>
          {visits.data.items.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </ul>
      ) : null}
      {visits.isSuccess && visits.data.totalPages > 1 ? (
        <nav aria-label={t('caregiver.visits.pagination')} className='flex items-center justify-between text-sm'>
          <button
            className='min-h-11 rounded-xl border border-outline-variant/30 bg-white px-4 py-2 font-semibold text-primary shadow-sm hover:bg-surface-container-low disabled:opacity-40'
            disabled={visits.data.page <= 0}
            onClick={() => list.setPage(visits.data.page - 1)}
            type='button'
          >
            {t('caregiver.visits.previous')}
          </button>
          <span className='font-medium text-on-surface-variant tabular-nums'>
            {t('caregiver.visits.pageOf', { page: visits.data.page + 1, total: visits.data.totalPages })}
          </span>
          <button
            className='min-h-11 rounded-xl border border-outline-variant/30 bg-white px-4 py-2 font-semibold text-primary shadow-sm hover:bg-surface-container-low disabled:opacity-40'
            disabled={visits.data.page + 1 >= visits.data.totalPages}
            onClick={() => list.setPage(visits.data.page + 1)}
            type='button'
          >
            {t('caregiver.visits.next')}
          </button>
        </nav>
      ) : null}
    </div>
  )
}
