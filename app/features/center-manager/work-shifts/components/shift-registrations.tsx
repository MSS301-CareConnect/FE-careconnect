import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import { providerKeys, reviewShiftRegistrations } from '~/entities/provider/provider-api'
import { resolveStatusTone } from '~/entities/provider/provider-status-badge'
import type { ProviderShiftRegistrationRecord } from '~/shared/api/generated/contracts'
import { classifyApiError, type ApiErrorMap } from '~/shared/api/api-error'
import { useFormat } from '~/shared/lib/format'
import { toastSuccess, toastSystemError } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Textarea } from '~/shared/ui/form-field'
import { Modal } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'
import { Tabs, tabPanelId } from '~/shared/ui/tabs'

const k = 'centerManager.workShifts.detail' as const
type Group = 'PENDING' | 'APPROVED' | 'OTHER'
type ReviewKey = `${typeof k}.business.${'full' | 'conflict' | 'timeOff' | 'started' | 'notPending' | 'stale'}`

const REVIEW_ERRORS: ApiErrorMap<never, never, ReviewKey> = {
  business: {
    4305: `${k}.business.full`,
    4401: `${k}.business.conflict`,
    4355: `${k}.business.timeOff`,
    4308: `${k}.business.started`,
    4352: `${k}.business.notPending`,
    4006: `${k}.business.stale`
  }
}

function groupOf(registration: ProviderShiftRegistrationRecord): Group {
  if (registration.registrationStatus === 'PENDING') return 'PENDING'
  if (registration.registrationStatus === 'APPROVED') return 'APPROVED'
  return 'OTHER'
}

/** Sign-ups of one shift by state; pending ones can be approved or rejected one by one or several at once. */
export function ShiftRegistrations({
  shiftId,
  registrations,
  canReview
}: {
  shiftId: string
  registrations: ProviderShiftRegistrationRecord[]
  canReview: boolean
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Group>('PENDING')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<ProviderShiftRegistrationRecord[] | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const groups: Record<Group, ProviderShiftRegistrationRecord[]> = { PENDING: [], APPROVED: [], OTHER: [] }
  for (const registration of registrations) groups[groupOf(registration)].push(registration)
  const visible = groups[tab]
  const pending = groups.PENDING
  const chosen = pending.filter((registration) => selected.has(registration.id))

  const review = useMutation({
    mutationFn: ({
      items,
      status,
      why
    }: {
      items: ProviderShiftRegistrationRecord[]
      status: 'APPROVED' | 'REJECTED'
      why?: string
    }) =>
      reviewShiftRegistrations(shiftId, {
        status,
        reason: why,
        items: items.map((item) => ({ registrationId: item.id, version: item.version }))
      }),
    onSuccess: async (result, { status }) => {
      setSelected(new Set())
      setRejecting(null)
      setReason('')
      toastSuccess(
        t(status === 'APPROVED' ? `${k}.success.approved` : `${k}.success.rejected`, { count: result.length })
      )
      await refresh()
    },
    onError: async (error, variables) => {
      if (
        toastSystemError(error, {
          message: t('centerManager.workShifts.form.systemError'),
          retryLabel: t('centerManager.workShifts.retry'),
          retry: () => review.mutate(variables)
        })
      )
        return
      const classified = classifyApiError(error, REVIEW_ERRORS)
      setFailure(classified.kind === 'field' ? null : classified.key)
      setRejecting(null)
      if (classified.key === `${k}.business.notPending` || classified.key === `${k}.business.stale`) await refresh()
    }
  })

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: providerKeys.registrations(shiftId) }),
      queryClient.invalidateQueries({ queryKey: providerKeys.shift(shiftId) }),
      queryClient.invalidateQueries({ queryKey: ['provider', 'shifts'] })
    ])
  }

  function approve(items: ProviderShiftRegistrationRecord[]) {
    setFailure(null)
    review.mutate({ items, status: 'APPROVED' })
  }

  function toggle(id: string) {
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section aria-labelledby='shift-registrations-title' className='space-y-3'>
      <h3 className='text-base font-semibold' id='shift-registrations-title'>
        {t(`${k}.registrations`)}
      </h3>
      <Tabs
        idBase='shift-registrations'
        items={(['PENDING', 'APPROVED', 'OTHER'] as Group[]).map((group) => ({
          value: group,
          label: t(`${k}.tabs.${group}`),
          badge: groups[group].length,
          badgeTone: group === 'PENDING' && groups.PENDING.length > 0 ? 'attention' : 'neutral'
        }))}
        label={t(`${k}.registrations`)}
        onChange={(value) => {
          setTab(value)
          setFailure(null)
        }}
        value={tab}
      />
      <div className='space-y-3' id={tabPanelId('shift-registrations')} role='tabpanel'>
        {tab === 'PENDING' && canReview && pending.length > 0 ? (
          <div className='flex flex-wrap items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2'>
            <label className='flex min-h-10 items-center gap-2 text-sm font-medium'>
              <input
                checked={chosen.length === pending.length}
                className='h-5 w-5 accent-[var(--color-primary)]'
                onChange={(event) =>
                  setSelected(event.target.checked ? new Set(pending.map((item) => item.id)) : new Set())
                }
                type='checkbox'
              />
              {t(`${k}.selectAll`)}
            </label>
            {chosen.length > 0 ? (
              <div className='ml-auto flex flex-wrap gap-2'>
                <Button disabled={review.isPending} onClick={() => approve(chosen)} size='sm'>
                  {t(`${k}.approveSelected`, { count: chosen.length })}
                </Button>
                <Button disabled={review.isPending} onClick={() => setRejecting(chosen)} size='sm' variant='outline'>
                  {t(`${k}.rejectSelected`, { count: chosen.length })}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
        {failure ? <FormAlert tone='warning'>{t(failure as ReviewKey)}</FormAlert> : null}
        {visible.length === 0 ? (
          <p className='rounded-xl border border-dashed border-outline-variant px-4 py-6 text-center text-sm text-on-surface-variant'>
            {t(`${k}.empty.${tab}`)}
          </p>
        ) : (
          <ul className='space-y-2'>
            {visible.map((registration) => {
              const name = registration.caregiverName || t('common.ui.unknownName')
              return (
                <li
                  className='flex items-start gap-3 rounded-xl border border-outline-variant/50 p-3'
                  key={registration.id}
                >
                  {tab === 'PENDING' && canReview ? (
                    <input
                      aria-label={t(`${k}.selectOne`, { name })}
                      checked={selected.has(registration.id)}
                      className='mt-3 h-5 w-5 shrink-0 accent-[var(--color-primary)]'
                      onChange={() => toggle(registration.id)}
                      type='checkbox'
                    />
                  ) : null}
                  <CaregiverAvatar
                    caregiverId={registration.caregiverId}
                    className='h-11 w-11 shrink-0 rounded-xl'
                    name={name}
                  />
                  <div className='min-w-0 flex-1 space-y-1 text-sm'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Link
                        className='font-semibold hover:text-primary hover:underline'
                        to={`/center-manager/caregivers/${registration.caregiverId}`}
                      >
                        {name}
                      </Link>
                      <StatusBadge tone={resolveStatusTone(registration.registrationStatus)}>
                        {t(`common.status.registration.${registration.registrationStatus}`)}
                      </StatusBadge>
                    </div>
                    <p className='text-xs text-on-surface-variant'>
                      {t(`${k}.registeredAt`, { value: format.dateTime(registration.createdAt) })}
                      {registration.reviewedAt
                        ? ` · ${t(`${k}.reviewedAt`, { value: format.dateTime(registration.reviewedAt) })}`
                        : ''}
                    </p>
                    {registration.caregiverNote ? (
                      <p className='text-on-surface-variant'>
                        {t(`${k}.caregiverNote`, { note: registration.caregiverNote })}
                      </p>
                    ) : null}
                    {registration.rejectionReason && registration.registrationStatus === 'REJECTED' ? (
                      <p className='text-on-surface-variant'>
                        {t(`${k}.rejectionReason`, { reason: registration.rejectionReason })}
                      </p>
                    ) : null}
                  </div>
                  {tab === 'PENDING' && canReview ? (
                    <div className='flex shrink-0 flex-col gap-1.5 sm:flex-row'>
                      <Button disabled={review.isPending} onClick={() => approve([registration])} size='sm'>
                        {t(`${k}.approve`)}
                      </Button>
                      <Button
                        disabled={review.isPending}
                        onClick={() => setRejecting([registration])}
                        size='sm'
                        variant='outline'
                      >
                        {t(`${k}.reject`)}
                      </Button>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {rejecting ? (
        <Modal
          description={t(`${k}.rejectDescription`, { count: rejecting.length })}
          dismissOnBackdrop={false}
          footer={
            <>
              <Button disabled={review.isPending} onClick={() => setRejecting(null)} variant='ghost'>
                {t('common.ui.cancel')}
              </Button>
              <Button
                loading={review.isPending}
                loadingLabel={t('common.ui.working')}
                onClick={() => {
                  const why = reason.trim()
                  if (!why || why.length > 500) {
                    setReasonError(true)
                    return
                  }
                  setFailure(null)
                  review.mutate({ items: rejecting, status: 'REJECTED', why })
                }}
                variant='danger'
              >
                {t(`${k}.reject`)}
              </Button>
            </>
          }
          onClose={() => setRejecting(null)}
          open
          size='md'
          title={t(`${k}.rejectTitle`)}
        >
          <FormField error={reasonError ? t(`${k}.rejectReasonRequired`) : undefined} label={t(`${k}.rejectReason`)}>
            {(control) => (
              <Textarea
                {...control}
                autoFocus
                onChange={(event) => {
                  setReason(event.target.value)
                  setReasonError(false)
                }}
                rows={3}
                value={reason}
              />
            )}
          </FormField>
        </Modal>
      ) : null}
    </section>
  )
}
