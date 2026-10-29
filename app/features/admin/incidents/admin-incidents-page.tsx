import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { useSearchParams } from 'react-router'

import type { OutboxStatus } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { IncidentRow } from './components/incident-row'
import { fetchIncidents, incidentKeys, requeueIncident, skipIncident, type IncidentSource } from './incidents-api'

const SOURCES: IncidentSource[] = ['booking', 'provider']
const STATUSES: (OutboxStatus | 'ALL')[] = ['FAILED', 'PENDING', 'SKIPPED', 'SENT', 'ALL']

function parseSource(value: string | null): IncidentSource {
  return value === 'provider' ? 'provider' : 'booking'
}

function parseStatus(value: string | null): OutboxStatus | 'ALL' {
  return STATUSES.find((status) => status === value) ?? 'FAILED'
}

/** H-08: cross-service deliveries that ran out of retries, with requeue and "handled by hand" actions. */
export function AdminIncidentsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('admin.incidentsPage.title'))
  const [params, setParams] = useSearchParams()
  const source = parseSource(params.get('source'))
  const status = parseStatus(params.get('status'))
  const queryClient = useQueryClient()
  const incidents = useQuery({
    queryKey: incidentKeys.list(source, status),
    queryFn: () => fetchIncidents(source, status),
    retry: false
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: incidentKeys.all })
  const requeue = useMutation({ mutationFn: (id: string) => requeueIncident(source, id), onSuccess: refresh })
  const skip = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => skipIncident(source, id, note),
    onSuccess: refresh
  })
  const actionError = requeue.error ?? skip.error

  function select(next: { source?: IncidentSource; status?: OutboxStatus | 'ALL' }) {
    const search = new URLSearchParams(params)
    search.set('source', next.source ?? source)
    search.set('status', next.status ?? status)
    setParams(search, { replace: true })
  }

  return (
    <div className='flex flex-col gap-4 p-5 lg:p-8'>
      <div>
        <h1 className='text-2xl font-bold'>{t('admin.incidentsPage.title')}</h1>
        <p className='mt-1 text-sm text-on-surface-variant'>{t('admin.incidentsPage.description')}</p>
      </div>
      <div className='flex flex-wrap items-end gap-3'>
        <div aria-label={t('admin.incidentsPage.source')} className='flex gap-2' role='group'>
          {SOURCES.map((item) => (
            <button
              aria-pressed={item === source}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                item === source ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant'
              }`}
              key={item}
              onClick={() => select({ source: item })}
              type='button'
            >
              {t(`admin.incidentsPage.sources.${item}`)}
            </button>
          ))}
        </div>
        <label className='flex flex-col text-sm font-medium'>
          {t('admin.incidentsPage.filter')}
          <select
            className='mt-1 rounded-lg border border-outline-variant px-3 py-2'
            onChange={(event) => select({ status: parseStatus(event.target.value) })}
            value={status}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`admin.incidentsPage.status.${item}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {actionError ? (
        <p className='text-sm text-error' role='alert'>
          {t(apiRequestErrorKey(actionError, 'admin.incidentsPage.actionError'))}
        </p>
      ) : null}
      {incidents.isPending ? (
        <SkeletonBlock label={t('admin.incidentsPage.loading')} rows={4} />
      ) : incidents.isError ? (
        <ErrorState
          message={t('admin.incidentsPage.error')}
          onRetry={() => void incidents.refetch()}
          retryLabel={t('admin.incidentsPage.retry')}
        />
      ) : incidents.data.length === 0 ? (
        <EmptyState icon='task_alt' title={t('admin.incidentsPage.empty')} />
      ) : (
        <ul className='flex flex-col gap-3'>
          {incidents.data.map((row) => (
            <IncidentRow
              busy={requeue.isPending || skip.isPending}
              key={row.id}
              onRequeue={(id) => requeue.mutate(id)}
              onSkip={(id, note) => skip.mutate({ id, note })}
              row={row}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
