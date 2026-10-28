import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatProviderDate, formatProviderTime } from './provider-format'
import { fetchCenterSchedules, fetchMySchedules, providerKeys, updateCaregiverSchedule } from './provider-api'
import type { ProviderScheduleRecord, ScheduleStatusRequest } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

const statusKeys = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export function ProviderSchedulePage({ centerId }: { centerId?: string }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [reason, setReason] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProviderScheduleRecord['scheduleStatus']>('ALL')
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
  const update = useMutation({
    mutationFn: ({ item, status }: { item: ProviderScheduleRecord; status: ScheduleStatusRequest['status'] }) => {
      const request = { status, version: item.version, reason: status === 'CANCELLED' ? reason.trim() : undefined }
      return updateCaregiverSchedule(item.id, request)
    },
    onSuccess: async () => {
      setReason('')
      await queryClient.invalidateQueries({ queryKey: providerKeys.mySchedules })
    }
  })
  const title = t(manager ? 'centerManager.schedules.title' : 'caregiver.provider.schedulesTitle')
  const rows = schedules.data?.items ?? []
  const visible = statusFilter === 'ALL' ? rows : rows.filter((item) => item.scheduleStatus === statusFilter)
  useDocumentTitle(title)
  if (manager && !centerId)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        {t('centerManager.schedules.noCenter')}
      </main>
    )
  return (
    <main className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-12'>
      <header className='space-y-4'>
        <nav aria-label={title} className='flex items-center gap-1 text-xs text-on-surface-variant'>
          <Link className='hover:text-primary' to={manager ? '/center-manager' : '/caregiver/visits'}>
            {t(manager ? 'centerManager.portal' : 'caregiver.nav.home')}
          </Link>
          <Icon className='text-sm' name='chevron_right' />
          <span className='font-semibold'>{title}</span>
        </nav>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{title}</h1>
            <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.pageScope`)}</p>
          </div>
          <span className='rounded-xl bg-secondary-container px-4 py-2 text-sm font-semibold text-primary'>
            {t(`${key}.summary`, { count: schedules.data?.totalElements ?? 0 })}
          </span>
        </div>
      </header>
      <div className='grid gap-4 sm:grid-cols-3'>
        {(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
          <section className='rounded-xl bg-white p-5 shadow-sm' key={status}>
            <div className='flex items-center justify-between'>
              <h2 className='text-xs font-semibold uppercase tracking-wide text-outline'>
                {t(`${key}.${statusKeys[status]}`)}
              </h2>
              <Icon
                className='text-2xl text-primary'
                name={status === 'SCHEDULED' ? 'event' : status === 'IN_PROGRESS' ? 'timelapse' : 'task_alt'}
              />
            </div>
            <p className='mt-4 text-3xl font-extrabold'>
              {schedules.isSuccess
                ? new Intl.NumberFormat(i18n.language).format(
                    rows.filter((item) => item.scheduleStatus === status).length
                  )
                : '—'}
            </p>
            <p className='mt-2 text-xs text-outline'>{t(`${key}.pageScope`)}</p>
          </section>
        ))}
      </div>
      <div className='grid items-start gap-8 lg:grid-cols-12'>
        <div className={`space-y-5 ${manager ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
          <div className='flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-sm'>
            {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
              <button
                aria-pressed={statusFilter === status}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${statusFilter === status ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                key={status}
                onClick={() => setStatusFilter(status)}
                type='button'
              >
                {status === 'ALL' ? t(`${key}.allStatuses`) : t(`${key}.${statusKeys[status]}`)}
              </button>
            ))}
          </div>
          {schedules.isPending ? (
            <div className='h-44 animate-pulse rounded-xl bg-white' role='status'>
              <span className='sr-only'>{t(`${key}.loading`)}</span>
            </div>
          ) : null}
          {schedules.isError ? (
            <div className='rounded-xl bg-white p-6 shadow-sm' role='alert'>
              <p>{t(manager ? 'centerManager.schedules.error' : 'caregiver.provider.schedulesError')}</p>
              <button className='mt-3 text-primary underline' onClick={() => void schedules.refetch()} type='button'>
                {t(`${key}.retry`)}
              </button>
            </div>
          ) : null}
          {schedules.isSuccess && visible.length === 0 ? (
            <section className='rounded-xl bg-white px-6 py-14 text-center shadow-sm'>
              <Icon className='text-4xl text-outline' name='event_busy' />
              <p className='mt-4 font-bold'>
                {t(manager ? 'centerManager.schedules.empty' : 'caregiver.provider.schedulesEmpty')}
              </p>
            </section>
          ) : null}
          {schedules.isSuccess ? (
            <ul className='space-y-4'>
              {visible.map((item) => (
                <li className='rounded-xl bg-white p-5 shadow-sm' key={item.id}>
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div className='space-y-2'>
                      <p className='text-xs font-bold uppercase tracking-wide text-primary'>
                        {formatProviderDate(item.workDate, i18n.language)}
                      </p>
                      <h2 className='text-lg font-bold'>{item.caregiverName || item.caregiverId}</h2>
                      <p className='flex items-center gap-2 text-sm text-on-surface-variant'>
                        <Icon className='text-lg' name='schedule' />
                        {formatProviderTime(item.startTime, i18n.language)}–
                        {formatProviderTime(item.endTime, i18n.language)}
                      </p>
                    </div>
                    <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
                      {t(`${key}.${statusKeys[item.scheduleStatus]}`)}
                    </span>
                  </div>
                  {!manager ? (
                    <div className='mt-5 flex flex-wrap gap-2 border-t border-outline-variant/20 pt-4'>
                      {/* Lịch là lịch rảnh (D11): caregiver chỉ được hủy; bắt đầu / kết thúc ca làm ở Buổi được giao. */}
                      {item.scheduleStatus === 'SCHEDULED' ? (
                        <button
                          className='rounded-lg bg-error-container px-4 py-2 text-sm font-semibold text-on-error-container disabled:opacity-50'
                          disabled={update.isPending || !reason.trim()}
                          onClick={() => update.mutate({ item, status: 'CANCELLED' })}
                          type='button'
                        >
                          {t('caregiver.provider.cancelSchedule')}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          {schedules.isSuccess ? (
            <div className='flex items-center justify-between rounded-xl bg-white p-4 text-sm shadow-sm'>
              <button
                className='text-primary disabled:opacity-40'
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                type='button'
              >
                {t(`${key}.previous`)}
              </button>
              <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, schedules.data.totalPages) })}</span>
              <button
                className='text-primary disabled:opacity-40'
                disabled={page + 1 >= schedules.data.totalPages}
                onClick={() => setPage(page + 1)}
                type='button'
              >
                {t(`${key}.next`)}
              </button>
            </div>
          ) : null}
        </div>
        {!manager ? (
          <aside className='space-y-5 lg:col-span-4'>
            <div className='rounded-xl bg-white p-5 shadow-sm'>
              <h2 className='flex items-center gap-2 text-lg font-bold'>
                <Icon className='text-primary' name='event_note' />
                {t(`${key}.reason`)}
              </h2>
              <p className='mt-2 text-xs leading-5 text-outline'>{t(`${key}.reasonHint`)}</p>
              <label className='mt-4 block text-sm'>
                {t(`${key}.reason`)}
                <input
                  className='mt-2 w-full rounded-lg bg-surface-container-low p-3 outline-none focus:ring-2 focus:ring-primary'
                  onChange={(event) => setReason(event.target.value)}
                  value={reason}
                />
              </label>
            </div>
            {update.isError ? (
              <p className='rounded-xl bg-error-container p-4 text-sm text-on-error-container' role='alert'>
                {t(`${key}.actionError`)}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>
    </main>
  )
}
