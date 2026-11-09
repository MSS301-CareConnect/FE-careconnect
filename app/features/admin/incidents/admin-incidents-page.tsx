import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { useSearchParams } from 'react-router'

import type { OutboxStatus } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { IncidentRow } from './components/incident-row'
import { fetchIncidents, incidentKeys, requeueIncident, skipIncident, type IncidentSource } from './incidents-api'
import { classifyApiError } from '~/shared/api/api-error'
import { useActionToast } from '~/shared/ui/use-action-toast'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

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
  const notify = useActionToast()
  const requeue = useMutation({
    mutationFn: (id: string) => requeueIncident(source, id),
    onSuccess: () => {
      notify.success(t('admin.toast.incidents.requeued'))
      return refresh()
    },
    onError: (error, id) =>
      notify.systemError(error, t('admin.toast.incidents.actions.requeue'), () => requeue.mutate(id))
  })
  const skip = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => skipIncident(source, id, note),
    onSuccess: () => {
      notify.success(t('admin.toast.incidents.skipped'))
      return refresh()
    },
    onError: (error, variables) =>
      notify.systemError(error, t('admin.toast.incidents.actions.skip'), () => skip.mutate(variables))
  })
  const failed = requeue.error ?? skip.error
  // System failures are toasts; only a business refusal (already handled by someone else…) stays on the page.
  const actionError = failed && classifyApiError(failed).kind !== 'system' ? failed : null

  function select(next: { source?: IncidentSource; status?: OutboxStatus | 'ALL' }) {
    const search = new URLSearchParams(params)
    search.set('source', next.source ?? source)
    search.set('status', next.status ?? status)
    setParams(search, { replace: true })
  }

  return (
    <div className={bentoContainer}>
      <BentoPageHeader description={t('admin.incidentsPage.description')} title={t('admin.incidentsPage.title')} />
      <div className='flex flex-wrap items-end gap-3'>
        <div aria-label={t('admin.incidentsPage.source')} className='flex gap-2' role='group'>
          {SOURCES.map((item) => (
            <button
              aria-pressed={item === source}
              className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                item === source
                  ? 'border-forest-900 bg-forest-900 text-white'
                  : 'border-forest-900/10 bg-white text-on-surface-variant hover:bg-mint-50'
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
              source={source}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
