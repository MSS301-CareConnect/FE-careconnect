import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useId, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { accountKeys, fetchAccount } from '~/entities/identity/account-api'
import { changeCenterStatus, fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { classifyApiError } from '~/shared/api/api-error'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { FormAlert } from '~/shared/ui/form-alert'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { CENTER_BUSINESS_ERRORS } from '../center-errors'
import { parseCenterHours } from '../center-hours'

const key = 'admin.centersPage' as const
const REASON_MAX = 500
const QUICK_REASONS = ['unverified', 'ineligible', 'duplicate'] as const
type Target = 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'INACTIVE'
/** ProviderService requires a reason for these (CENTER_STATUS_REASON_REQUIRED 4111). */
const NEEDS_REASON = new Set<Target>(['REJECTED', 'SUSPENDED', 'INACTIVE'])

function CheckItem({
  ok,
  optional,
  title,
  detail,
  children
}: {
  ok: boolean
  optional?: boolean
  title: string
  detail?: string
  children?: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <li className='flex items-start gap-3 py-3'>
      <Icon
        className={`mt-0.5 text-xl ${ok ? 'text-primary' : optional ? 'text-outline' : 'text-error'}`}
        name={ok ? 'check_circle' : optional ? 'radio_button_unchecked' : 'error'}
      />
      <div className='min-w-0 flex-1 text-sm'>
        <p className='font-semibold text-on-surface'>
          {title}
          <span className='ml-2 text-xs font-medium text-on-surface-variant'>
            {ok ? t(`${key}.review.passed`) : optional ? t(`${key}.review.optional`) : t(`${key}.review.missing`)}
          </span>
        </p>
        {detail ? <p className='text-on-surface-variant'>{detail}</p> : null}
        {children}
      </div>
    </li>
  )
}

/**
 * Approve / reject a PENDING center from a checklist (U-08), or change an operating center's status with explicit
 * buttons instead of a status dropdown. Missing items are reported where they are, never by opening another form.
 */
export function CenterStatusPanel({ center }: { center: ProviderCenterRecord }) {
  const { t } = useTranslation()
  const id = useId()
  const queryClient = useQueryClient()
  const [target, setTarget] = useState<Target | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<'reasonRequired' | 'reasonTooLong' | null>(null)
  const [managerMissing, setManagerMissing] = useState(false)
  const notify = useActionToast()
  const manager = useQuery({
    queryKey: accountKeys.detail(center.managerUserId ?? ''),
    queryFn: () => fetchAccount(center.managerUserId!),
    enabled: Boolean(center.managerUserId),
    retry: false
  })
  const media = useQuery({
    queryKey: providerKeys.media('CARE_CENTER', center.id),
    queryFn: () => fetchProviderMedia('CARE_CENTER', center.id),
    enabled: center.centerStatus === 'PENDING',
    retry: false
  })
  const managerReady = manager.data?.status === 'ACTIVE' && Boolean(manager.data.roles?.includes('CENTER_MANAGER'))
  const change = useMutation({
    mutationFn: (next: Target) =>
      changeCenterStatus(center.id, {
        status: next,
        reason: NEEDS_REASON.has(next) ? reason.trim() : undefined,
        version: center.version
      }),
    onSuccess: async (_saved, next) => {
      setTarget(null)
      setReason('')
      // The panel remounts with the new version, so the outcome is a toast rather than inline text.
      const sentence = {
        ACTIVE: center.centerStatus === 'PENDING' ? 'approved' : 'reopened',
        REJECTED: 'rejected',
        SUSPENDED: 'suspended',
        INACTIVE: 'deactivated'
      } as const
      notify.success(t(`admin.toast.centers.${sentence[next]}`, { name: center.centerName }))
      await queryClient.invalidateQueries({ queryKey: providerKeys.center(center.id) })
      await queryClient.invalidateQueries({ queryKey: providerKeys.centers })
      await queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
    onError: (error, next) => {
      if (notify.systemError(error, t('admin.toast.centers.actions.status'), () => change.mutate(next))) setTarget(null)
    }
  })
  const failure = change.error ? classifyApiError(change.error, { business: CENTER_BUSINESS_ERRORS }) : null
  const failureText = failure && failure.kind === 'business' ? t(failure.key) : undefined
  const name = center.centerName

  function open(next: Target) {
    change.reset()
    setReasonError(null)
    setTarget(next)
  }

  function approve() {
    if (!managerReady) {
      setManagerMissing(true)
      document.getElementById('center-manager-title')?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      return
    }
    setManagerMissing(false)
    open('ACTIVE')
  }

  function confirm() {
    if (!target) return
    if (NEEDS_REASON.has(target)) {
      const trimmed = reason.trim()
      if (!trimmed) return setReasonError('reasonRequired')
      if (trimmed.length > REASON_MAX) return setReasonError('reasonTooLong')
    }
    change.mutate(target)
  }

  const dialog = target
    ? {
        ACTIVE:
          center.centerStatus === 'PENDING'
            ? { title: t(`${key}.review.approve`), description: t(`${key}.review.hint`), tone: 'primary' as const }
            : {
                title: t(`${key}.statusActions.reopenTitle`, { name }),
                description: t(`${key}.statusActions.reopenDescription`),
                tone: 'primary' as const
              },
        REJECTED: {
          title: t(`${key}.review.rejectTitle`, { name }),
          description: t(`${key}.review.rejectDescription`),
          tone: 'danger' as const
        },
        SUSPENDED: {
          title: t(`${key}.statusActions.suspendTitle`, { name }),
          description: t(`${key}.statusActions.suspendDescription`),
          tone: 'danger' as const
        },
        INACTIVE: {
          title: t(`${key}.statusActions.deactivateTitle`, { name }),
          description: t(`${key}.statusActions.deactivateDescription`),
          tone: 'danger' as const
        }
      }[target]
    : null
  const confirmLabel = {
    ACTIVE: center.centerStatus === 'PENDING' ? t(`${key}.review.approve`) : t(`${key}.statusActions.reopen`),
    REJECTED: t(`${key}.review.reject`),
    SUSPENDED: t(`${key}.statusActions.suspend`),
    INACTIVE: t(`${key}.statusActions.deactivate`)
  }
  const contactOk = Boolean(center.email && center.address && center.phoneNumber)
  const hoursOk = parseCenterHours(center.operatingHours).kind !== 'none'

  return (
    <section aria-labelledby={`${id}-title`} className='space-y-3'>
      {center.centerStatus === 'PENDING' ? (
        <>
          <div>
            <h3 className='font-bold text-on-surface' id={`${id}-title`}>
              {t(`${key}.review.title`)}
            </h3>
            <p className='text-sm text-on-surface-variant'>{t(`${key}.review.hint`)}</p>
          </div>
          <ul className='divide-y divide-outline-variant/30 rounded-xl border border-outline-variant/40 px-4'>
            <CheckItem
              detail={contactOk ? t(`${key}.review.contactDetail`) : t(`${key}.review.missingContact`)}
              ok={contactOk}
              optional
              title={t(`${key}.review.contact`)}
            />
            <CheckItem ok={hoursOk} optional title={t(`${key}.review.hours`)} />
            <CheckItem ok={managerReady} title={t(`${key}.review.manager`)}>
              {!managerReady ? (
                <p className={managerMissing ? 'mt-1 font-medium text-error' : 'mt-1 text-on-surface-variant'}>
                  {t(`${key}.review.missingManager`)}
                </p>
              ) : null}
            </CheckItem>
            <CheckItem ok={(media.data?.length ?? 0) > 0} optional title={t(`${key}.review.images`)} />
          </ul>
          <div className='flex flex-wrap justify-between gap-2.5'>
            <Button onClick={() => open('REJECTED')} variant='outline'>
              {t(`${key}.review.reject`)}
            </Button>
            <Button leftIcon={<Icon className='text-lg' name='verified' />} onClick={approve}>
              {t(`${key}.review.approve`)}
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className='font-bold text-on-surface' id={`${id}-title`}>
            {t(`${key}.statusActions.title`)}
          </h3>
          {center.centerStatus === 'ACTIVE' ? (
            <div className='flex flex-wrap items-center gap-2.5'>
              <p className='flex-1 text-sm text-on-surface-variant'>{t(`${key}.statusActions.activeHint`)}</p>
              <Button onClick={() => open('INACTIVE')} variant='outline'>
                {t(`${key}.statusActions.deactivate`)}
              </Button>
              <Button onClick={() => open('SUSPENDED')} variant='danger'>
                {t(`${key}.statusActions.suspend`)}
              </Button>
            </div>
          ) : center.centerStatus === 'SUSPENDED' || center.centerStatus === 'INACTIVE' ? (
            <div className='flex flex-wrap items-center gap-2.5'>
              <p className='flex-1 text-sm text-on-surface-variant'>{t(`${key}.statusActions.pausedHint`)}</p>
              <Button onClick={() => open('ACTIVE')}>{t(`${key}.statusActions.reopen`)}</Button>
            </div>
          ) : (
            <p className='text-sm text-on-surface-variant'>{t(`${key}.statusActions.rejectedHint`)}</p>
          )}
        </>
      )}
      <ConfirmDialog
        confirmLabel={target ? confirmLabel[target] : undefined}
        description={dialog?.description}
        error={failureText}
        loading={change.isPending}
        onClose={() => setTarget(null)}
        onConfirm={confirm}
        open={Boolean(target)}
        title={dialog?.title ?? ''}
        tone={dialog?.tone}
      >
        {target && NEEDS_REASON.has(target) ? (
          <div className='space-y-2'>
            {target === 'REJECTED' ? (
              <div className='flex flex-wrap gap-2' role='group' aria-label={t(`${key}.review.quickReasons`)}>
                {QUICK_REASONS.map((item) => (
                  <button
                    className='min-h-9 rounded-full border border-outline-variant px-3 text-xs font-semibold text-on-surface hover:bg-surface-container-low'
                    key={item}
                    onClick={() => {
                      setReason(t(`${key}.review.reasons.${item}`))
                      setReasonError(null)
                    }}
                    type='button'
                  >
                    {t(`${key}.review.reasons.${item}`)}
                  </button>
                ))}
              </div>
            ) : null}
            <label className='block text-sm font-semibold text-on-surface' htmlFor={`${id}-reason`}>
              {t(`${key}.statusActions.reason`)}
            </label>
            <textarea
              aria-describedby={reasonError ? `${id}-reason-error` : undefined}
              aria-invalid={reasonError ? true : undefined}
              className={`${baseControlClass} min-h-20`}
              id={`${id}-reason`}
              maxLength={REASON_MAX}
              onChange={(event) => {
                setReason(event.target.value)
                setReasonError(null)
              }}
              value={reason}
            />
            {reasonError ? (
              <p className='text-xs font-medium text-error' id={`${id}-reason-error`}>
                {t(`${key}.statusActions.errors.${reasonError}`)}
              </p>
            ) : null}
          </div>
        ) : null}
      </ConfirmDialog>
      {failureText && !target ? <FormAlert tone='warning'>{failureText}</FormAlert> : null}
    </section>
  )
}
