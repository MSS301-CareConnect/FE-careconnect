import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { fetchPendingCaregivers, providerKeys, verifyCaregiver } from '~/entities/provider/provider-api'
import { classifyApiError } from '~/shared/api/api-error'
import type { VerificationRequest } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { PendingCaregiverCard } from './components/pending-caregiver-card'

const PAGE_SIZE = 20

/** M-13: caregivers of every center that wait for the admin's verification, oldest decisions first. */
export function AdminCaregiverQueuePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('admin.caregiverQueuePage.title'))
  const [params, setParams] = useSearchParams()
  const page = Math.max(Number(params.get('page') ?? '0') || 0, 0)
  const queryClient = useQueryClient()
  const queue = useQuery({
    queryKey: providerKeys.pendingCaregivers(page),
    queryFn: () => fetchPendingCaregivers({ page, size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    retry: false
  })
  const notify = useActionToast()
  const decide = useMutation({
    mutationFn: ({ id, request }: { id: string; request: VerificationRequest; name: string }) =>
      verifyCaregiver(id, request),
    onSuccess: (_saved, { request, name }) => {
      notify.success(
        t(request.status === 'VERIFIED' ? 'admin.toast.caregivers.verified' : 'admin.toast.caregivers.rejected', {
          name
        })
      )
      return queryClient.invalidateQueries({ queryKey: ['provider'] })
    },
    onError: (error, variables) =>
      notify.systemError(error, t('admin.toast.caregivers.actions.review'), () => decide.mutate(variables))
  })

  return (
    <div className='flex flex-col gap-4 p-5 lg:p-8'>
      <div>
        <h1 className='text-2xl font-bold'>{t('admin.caregiverQueuePage.title')}</h1>
        <p className='mt-1 text-sm text-on-surface-variant'>{t('admin.caregiverQueuePage.description')}</p>
      </div>
      {decide.isError && classifyApiError(decide.error).kind !== 'system' ? (
        <p className='text-sm text-error' role='alert'>
          {t('admin.caregiverQueuePage.decideError')}
        </p>
      ) : null}
      {queue.isPending ? (
        <SkeletonBlock label={t('admin.caregiverQueuePage.loading')} rows={4} />
      ) : queue.isError ? (
        <ErrorState
          message={t('admin.caregiverQueuePage.error')}
          onRetry={() => void queue.refetch()}
          retryLabel={t('admin.caregiverQueuePage.retry')}
        />
      ) : queue.data.items.length === 0 ? (
        <EmptyState icon='verified' title={t('admin.caregiverQueuePage.empty')} />
      ) : (
        <>
          <ul className='flex flex-col gap-3'>
            {queue.data.items.map((caregiver) => (
              <PendingCaregiverCard
                busy={decide.isPending}
                caregiver={caregiver}
                key={caregiver.id}
                onDecide={(request) => decide.mutate({ id: caregiver.id, request, name: caregiver.fullName })}
              />
            ))}
          </ul>
          <Pagination
            ariaLabel={t('admin.caregiverQueuePage.pagination')}
            onPageChange={(next) => setParams(next > 0 ? { page: String(next) } : {}, { replace: true })}
            page={queue.data.page}
            totalPages={queue.data.totalPages}
          />
        </>
      )}
      <p className='text-xs text-on-surface-variant'>
        {t('admin.caregiverQueuePage.certificatesHint')}{' '}
        <Link className='font-semibold text-primary underline' to='/admin/centers'>
          {t('admin.caregiverQueuePage.centersLink')}
        </Link>
      </p>
    </div>
  )
}
