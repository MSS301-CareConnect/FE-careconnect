import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ComplaintRecord, ComplaintStatus } from '~/shared/api/generated/contracts'

import { accept, adminResolve, aftercareErrorKey, aftercareKeys, fetchComplaints, resolve } from './aftercare-api'
import { classifyApiError } from '~/shared/api/api-error'
import { useActionToast } from '~/shared/ui/use-action-toast'
import { bentoTabClass, bentoTabList } from '~/shared/ui/bento-page-header'

const FILTERS = [
  'OPEN',
  'IN_PROGRESS',
  'ESCALATED',
  'RESOLVED',
  'RESOLVED_BY_ADMIN'
] as const satisfies readonly ComplaintStatus[]

/**
 * Complaint handling (H-05): the center manager accepts and resolves first-level cases of their center; the admin
 * decides escalated ones, optionally with a refund that PaymentService pays (complaint refund).
 */
export function ComplaintQueue({ role }: { role: 'CENTER_MANAGER' | 'ADMIN' }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<ComplaintStatus>(role === 'ADMIN' ? 'ESCALATED' : 'OPEN')
  const complaints = useQuery({
    queryKey: aftercareKeys.complaints(status),
    queryFn: () => fetchComplaints(status),
    retry: false
  })
  return (
    <div className='flex flex-col gap-4'>
      <div aria-label={t('aftercare.queue.filter')} className={bentoTabList} role='group'>
        {FILTERS.map((item) => (
          <button
            aria-pressed={status === item}
            className={bentoTabClass(status === item)}
            key={item}
            onClick={() => setStatus(item)}
            type='button'
          >
            {t(`aftercare.complaintStatus.${item}`)}
          </button>
        ))}
      </div>
      {complaints.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('aftercare.queue.loading')}
        </p>
      ) : null}
      {complaints.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t(aftercareErrorKey(complaints.error))}
        </p>
      ) : null}
      {complaints.isSuccess && complaints.data.length === 0 ? (
        <p className='rounded-2xl border border-forest-900/[0.06] bg-white px-5 py-10 text-center text-sm text-on-surface-variant shadow-[var(--shadow-card)]'>
          {t('aftercare.queue.empty')}
        </p>
      ) : null}
      <ul className='ops-stagger cc-stagger flex flex-col gap-3'>
        {(complaints.data ?? []).map((complaint) => (
          <ComplaintItem complaint={complaint} key={complaint.id} role={role} />
        ))}
      </ul>
    </div>
  )
}

function ComplaintItem({ complaint, role }: { complaint: ComplaintRecord; role: 'CENTER_MANAGER' | 'ADMIN' }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [resolution, setResolution] = useState('')
  const [refund, setRefund] = useState('')
  const notify = useActionToast()
  const done = () => queryClient.invalidateQueries({ queryKey: aftercareKeys.complaintsAll })
  const acceptMutation = useMutation({ mutationFn: () => accept(complaint.id), onSuccess: done })
  const resolveMutation = useMutation({
    mutationFn: () =>
      role === 'ADMIN'
        ? adminResolve(complaint.id, {
            resolution: resolution.trim(),
            refundAmount: refund.trim() ? Number(refund) : undefined
          })
        : resolve(complaint.id, resolution.trim()),
    onSuccess: () => {
      if (role === 'ADMIN') notify.success(t('admin.toast.complaints.resolved'))
      return done()
    },
    onError: (error) => {
      if (role === 'ADMIN') notify.systemError(error, t('admin.toast.complaints.actions.resolve'))
    }
  })
  const failed = acceptMutation.error ?? resolveMutation.error
  // In the admin portal a system failure is a toast; the inline message keeps business refusals.
  const error = failed && !(role === 'ADMIN' && classifyApiError(failed).kind === 'system') ? failed : null
  const canAccept = role === 'CENTER_MANAGER' && complaint.status === 'OPEN'
  const canResolve =
    (role === 'CENTER_MANAGER' && complaint.status === 'IN_PROGRESS') ||
    (role === 'ADMIN' && complaint.status === 'ESCALATED')
  return (
    <li className='rounded-2xl border border-forest-900/[0.06] bg-white p-5 shadow-[var(--shadow-card)]'>
      <p className='text-base font-bold text-forest-950'>
        {complaint.complaintCode ? `${complaint.complaintCode} · ` : ''}
        {complaint.title ?? '—'}
      </p>
      <p className='mt-1.5 inline-flex rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-medium text-forest-800'>
        {complaint.category ? t(`aftercare.categories.${complaint.category}`) : ''} ·{' '}
        {t(`aftercare.complaintStatus.${complaint.status}`)}
      </p>
      {complaint.content ? <p className='mt-2 text-sm whitespace-pre-line'>{complaint.content}</p> : null}
      {complaint.escalateReason ? (
        <p className='mt-2 text-sm text-on-surface-variant'>
          <strong>{t('aftercare.queue.escalateReason')}: </strong>
          {complaint.escalateReason}
        </p>
      ) : null}
      {complaint.resolution ? (
        <p className='mt-2 text-sm text-on-surface-variant'>
          <strong>{t('aftercare.queue.resolution')}: </strong>
          {complaint.resolution}
        </p>
      ) : null}
      {canAccept ? (
        <button
          className='mt-4 min-h-11 rounded-full bg-forest-900 px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-colors hover:bg-forest-800 disabled:opacity-50'
          disabled={acceptMutation.isPending}
          onClick={() => acceptMutation.mutate()}
          type='button'
        >
          {t('aftercare.queue.accept')}
        </button>
      ) : null}
      {canResolve ? (
        <div className='mt-4 flex flex-col gap-3 rounded-2xl bg-mint-50/70 p-4'>
          <label className='text-sm font-medium'>
            {t('aftercare.queue.resolution')}
            <textarea
              className='mt-1 w-full rounded-2xl border border-outline-variant bg-white p-3 text-sm focus-visible:outline-2 focus-visible:outline-forest-900'
              onChange={(event) => setResolution(event.target.value)}
              rows={3}
              value={resolution}
            />
          </label>
          {role === 'ADMIN' ? (
            <label className='text-sm font-medium'>
              {t('aftercare.queue.refund')}
              <input
                className='mt-1 w-full rounded-2xl border border-outline-variant bg-white p-3 text-sm focus-visible:outline-2 focus-visible:outline-forest-900'
                inputMode='numeric'
                min={0}
                onChange={(event) => setRefund(event.target.value)}
                type='number'
                value={refund}
              />
            </label>
          ) : null}
          <button
            className='self-start min-h-11 rounded-full bg-forest-900 px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-colors hover:bg-forest-800 disabled:opacity-50'
            disabled={resolveMutation.isPending || !resolution.trim()}
            onClick={() => resolveMutation.mutate()}
            type='button'
          >
            {t('aftercare.queue.resolve')}
          </button>
        </div>
      ) : null}
      {error ? (
        <p className='mt-2 text-sm text-error' role='alert'>
          {t(aftercareErrorKey(error))}
        </p>
      ) : null}
    </li>
  )
}
