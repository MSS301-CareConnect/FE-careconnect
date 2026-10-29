import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatProviderDate, formatProviderTime } from './provider-format'
import { fetchCenterSchedules, fetchMySchedules, providerKeys, updateCaregiverSchedule } from './provider-api'
import { ProviderStatusBadge } from './provider-status-badge'
import type { ProviderScheduleRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'

// D11: an availability slot is only open (SCHEDULED) or cancelled; care itself runs on assigned visits.
const FILTERS = ['ALL', 'UPCOMING', 'PAST', 'CANCELLED'] as const
type Filter = (typeof FILTERS)[number]
const filterKeys = { ALL: 'allStatuses', UPCOMING: 'upcoming', PAST: 'past', CANCELLED: 'cancelled' } as const

/** A slot is over once its end time has passed in the browser's local time. */
function isPast(item: ProviderScheduleRecord, now: number) {
  return new Date(`${item.workDate}T${item.endTime}`).getTime() <= now
}

function matches(filter: Filter, item: ProviderScheduleRecord, now: number) {
  if (filter === 'ALL') return true
  if (filter === 'CANCELLED') return item.scheduleStatus === 'CANCELLED'
  if (item.scheduleStatus === 'CANCELLED') return false
  return filter === 'PAST' ? isPast(item, now) : !isPast(item, now)
}

export function ProviderSchedulePage({ centerId }: { centerId?: string }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [cancelling, setCancelling] = useState<ProviderScheduleRecord | null>(null)
  const [reason, setReason] = useState('')
  const [reasonMissing, setReasonMissing] = useState(false)
  const manager = centerId !== undefined
  const key = manager ? 'centerManager.schedules' : 'caregiver.provider'
  const queryKey = manager
    ? [...providerKeys.centerSchedules(centerId ?? ''), page]
    : [...providerKeys.mySchedules, page]
  const schedules = useQuery({
    queryKey,
    queryFn: () =>
      manager ? fetchCenterSchedules(centerId ?? '', { page, size: 20 }) : fetchMySchedules({ page, size: 20 }),
    enabled: !manager || Boolean(centerId),
    retry: false
  })
  const cancel = useMutation({
    mutationFn: (item: ProviderScheduleRecord) =>
      updateCaregiverSchedule(item.id, { status: 'CANCELLED', version: item.version, reason: reason.trim() }),
    onSuccess: async () => {
      closeCancel()
      await queryClient.invalidateQueries({ queryKey: providerKeys.mySchedules })
    }
  })
  const title = t(manager ? 'centerManager.schedules.title' : 'caregiver.provider.schedulesTitle')
  // Fixed when the page opens so the list does not shift between renders.
  const [now] = useState(() => Date.now())
  const rows = schedules.data?.items ?? []
  const visible = rows.filter((item) => matches(filter, item, now))
  useDocumentTitle(title)

  function openCancel(item: ProviderScheduleRecord) {
    cancel.reset()
    setReason('')
    setReasonMissing(false)
    setCancelling(item)
  }
  function closeCancel() {
    setCancelling(null)
    setReason('')
    setReasonMissing(false)
  }
  function confirmCancel() {
    if (!cancelling) return
    if (!reason.trim()) {
      setReasonMissing(true)
      return
    }
    cancel.mutate(cancelling)
  }

  if (manager && !centerId)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        {t('centerManager.schedules.noCenter')}
      </main>
    )
  return (
    <main className='mx-auto max-w-5xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='space-y-3'>
        <nav aria-label={title} className='flex items-center gap-1 text-xs text-on-surface-variant'>
          <Link className='hover:text-primary' to={manager ? '/center-manager' : '/caregiver/visits'}>
            {t(manager ? 'centerManager.portal' : 'caregiver.nav.home')}
          </Link>
          <Icon className='text-sm' name='chevron_right' />
          <span className='font-semibold text-on-surface'>{title}</span>
        </nav>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='max-w-2xl'>
            <h1 className='text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl'>{title}</h1>
            <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.availabilityIntro`)}</p>
          </div>
          <span className='rounded-xl border border-outline-variant/60 bg-secondary-container px-4 py-2 text-sm font-semibold tabular-nums text-primary'>
            {t(`${key}.availabilitySummary`, { count: schedules.data?.totalElements ?? 0 })}
          </span>
        </div>
      </header>

      <div
        aria-label={t(`${key}.filterLabel`)}
        className='flex flex-wrap gap-1.5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-xs'
        role='group'
      >
        {FILTERS.map((option) => (
          <button
            aria-pressed={filter === option}
            className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${filter === option ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            key={option}
            onClick={() => setFilter(option)}
            type='button'
          >
            {t(`${key}.${filterKeys[option]}`)}
          </button>
        ))}
      </div>

      {schedules.isPending ? (
        <div
          className='h-44 animate-pulse rounded-2xl border border-outline-variant/60 bg-surface-container-lowest'
          role='status'
        >
          <span className='sr-only'>{t(`${key}.loading`)}</span>
        </div>
      ) : null}
      {schedules.isError ? (
        <div className='rounded-2xl border border-error/25 bg-surface-container-lowest p-6 shadow-xs' role='alert'>
          <p className='text-sm text-error'>
            {t(manager ? 'centerManager.schedules.error' : 'caregiver.provider.schedulesError')}
          </p>
          <button
            className='mt-3 min-h-11 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low'
            onClick={() => void schedules.refetch()}
            type='button'
          >
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {schedules.isSuccess && visible.length === 0 ? (
        <section className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-14 text-center shadow-xs'>
          <Icon className='text-4xl text-outline' name='event_busy' />
          <p className='mt-4 font-bold text-on-surface'>
            {t(manager ? 'centerManager.schedules.empty' : 'caregiver.provider.schedulesEmpty')}
          </p>
        </section>
      ) : null}
      {schedules.isSuccess && visible.length > 0 ? (
        <ul className='space-y-3'>
          {visible.map((item) => {
            const past = item.scheduleStatus === 'SCHEDULED' && isPast(item, now)
            return (
              <li
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs ${past ? 'opacity-70' : ''}`}
                key={item.id}
              >
                <div className='min-w-0 space-y-1'>
                  <p className='text-base font-bold text-on-surface'>
                    {formatProviderDate(item.workDate, i18n.language)}
                  </p>
                  <p className='flex items-center gap-2 text-sm tabular-nums text-on-surface-variant'>
                    <Icon className='text-lg text-primary' name='schedule' />
                    {formatProviderTime(item.startTime, i18n.language)}–
                    {formatProviderTime(item.endTime, i18n.language)}
                  </p>
                  {manager ? <p className='text-sm text-on-surface'>{item.caregiverName || item.caregiverId}</p> : null}
                </div>
                <div className='flex flex-wrap items-center gap-3'>
                  {past ? (
                    <span className='rounded-full bg-neutral-container px-3 py-1 text-xs font-semibold text-on-neutral-container'>
                      {t(`${key}.past`)}
                    </span>
                  ) : (
                    <ProviderStatusBadge
                      label={t(`${key}.${item.scheduleStatus === 'CANCELLED' ? 'cancelled' : 'scheduled'}`)}
                      status={item.scheduleStatus}
                    />
                  )}
                  {!manager && item.scheduleStatus === 'SCHEDULED' && !past ? (
                    <button
                      className='min-h-11 rounded-xl border border-error/30 px-4 py-2 text-sm font-semibold text-error transition-colors hover:bg-error-container'
                      onClick={() => openCancel(item)}
                      type='button'
                    >
                      {t('caregiver.provider.cancelSchedule')}
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
      {schedules.isSuccess && schedules.data.totalPages > 1 ? (
        <div className='flex items-center justify-between rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-3 text-sm shadow-xs'>
          <button
            className='min-h-11 rounded-lg px-3 font-semibold text-primary hover:bg-surface-container-low disabled:opacity-40'
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            type='button'
          >
            {t(`${key}.previous`)}
          </button>
          <span className='tabular-nums text-on-surface-variant'>
            {t(`${key}.page`, { page: page + 1, pages: schedules.data.totalPages })}
          </span>
          <button
            className='min-h-11 rounded-lg px-3 font-semibold text-primary hover:bg-surface-container-low disabled:opacity-40'
            disabled={page + 1 >= schedules.data.totalPages}
            onClick={() => setPage(page + 1)}
            type='button'
          >
            {t(`${key}.next`)}
          </button>
        </div>
      ) : null}

      {!manager ? (
        <ConfirmDialog
          confirmLabel={t('caregiver.provider.cancelSchedule')}
          danger
          description={
            cancelling
              ? t('caregiver.provider.cancelScheduleDescription', {
                  date: formatProviderDate(cancelling.workDate, i18n.language),
                  start: formatProviderTime(cancelling.startTime, i18n.language),
                  end: formatProviderTime(cancelling.endTime, i18n.language)
                })
              : undefined
          }
          error={cancel.isError ? t('caregiver.provider.actionError') : undefined}
          loading={cancel.isPending}
          onClose={closeCancel}
          onConfirm={confirmCancel}
          open={cancelling !== null}
          title={t('caregiver.provider.cancelScheduleTitle')}
        >
          <label className='block text-sm font-semibold text-on-surface' htmlFor='schedule-cancel-reason'>
            {t('caregiver.provider.reason')}
          </label>
          <textarea
            aria-describedby={reasonMissing ? 'schedule-cancel-reason-error' : undefined}
            aria-invalid={reasonMissing}
            className='mt-2 min-h-24 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/25'
            id='schedule-cancel-reason'
            onChange={(event) => {
              setReason(event.target.value)
              if (event.target.value.trim()) setReasonMissing(false)
            }}
            value={reason}
          />
          {reasonMissing ? (
            <p className='mt-1 text-sm text-error' id='schedule-cancel-reason-error'>
              {t('caregiver.provider.reasonRequired')}
            </p>
          ) : null}
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
