import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { accountKeys, changeAccountStatus } from '~/entities/identity/account-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { classifyApiError } from '~/shared/api/api-error'
import { ActionMenu } from '~/shared/ui/action-menu'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { ConfirmDialog } from '~/shared/ui/modal'

import { removeUser } from '../identity-api'
import { useActionToast } from '~/shared/ui/use-action-toast'

const key = 'admin.identity.detail' as const
const REASON_MAX = 500
const BUSINESS = {
  business: {
    1104: 'admin.identity.detail.business.lastAdmin',
    1023: 'admin.identity.detail.business.self'
  }
} as const

type Pending = 'lock' | 'unlock' | 'deactivate' | null

/**
 * Lock (with a reason the backend requires), unlock and deactivate; each asks for confirmation first. On the account
 * page they are buttons; `menuLabel` draws them as the "⋯" menu of a list row instead (with "open" first), and the list
 * stays where it is after a removal.
 */
export function AccountAccess({
  user,
  menuLabel,
  readOnly = false
}: {
  user: UserResponse
  /** Accessible name of the row menu; switches the component to its menu form. */
  menuLabel?: string
  /** Menu form only: the admin's own account or missing permission leaves just "open". */
  readOnly?: boolean
}) {
  const { t } = useTranslation()
  const id = useId()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<Pending>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<'reasonRequired' | 'reasonTooLong' | null>(null)
  const name = user.fullName || user.email || ''
  const locked = user.status === 'LOCKED'
  const notify = useActionToast()

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: accountKeys.all })
    await queryClient.invalidateQueries({ queryKey: accountKeys.detail(user.id!) })
  }
  const status = useMutation({
    mutationFn: (next: 'ACTIVE' | 'LOCKED') =>
      changeAccountStatus(user.id!, next, next === 'LOCKED' ? reason.trim() : undefined),
    onSuccess: async (_saved, next) => {
      setPending(null)
      setReason('')
      notify.success(t(next === 'LOCKED' ? 'admin.toast.accounts.locked' : 'admin.toast.accounts.unlocked', { name }))
      await refresh()
    },
    onError: (error, next) => {
      if (notify.systemError(error, t('admin.toast.accounts.actions.status'), () => status.mutate(next)))
        setPending(null)
    }
  })
  const deactivate = useMutation({
    mutationFn: () => removeUser(user.id!),
    onSuccess: async () => {
      notify.success(t('admin.toast.accounts.deactivated', { name }))
      setPending(null)
      await queryClient.invalidateQueries({ queryKey: accountKeys.all })
      if (!menuLabel) navigate('/admin/accounts')
    },
    onError: (error) => {
      if (notify.systemError(error, t('admin.toast.accounts.actions.deactivate'), () => deactivate.mutate())) {
        setPending(null)
      }
    }
  })
  const failure = status.error ?? deactivate.error
  const classified = failure ? classifyApiError(failure, BUSINESS) : null
  const errorMessage = classified && classified.kind === 'business' ? t(classified.key) : undefined

  function open(next: Pending) {
    status.reset()
    deactivate.reset()
    setReasonError(null)
    setPending(next)
  }

  function confirm() {
    if (pending === 'deactivate') {
      deactivate.mutate()
      return
    }
    if (pending === 'lock') {
      const trimmed = reason.trim()
      if (!trimmed) return setReasonError('reasonRequired')
      if (trimmed.length > REASON_MAX) return setReasonError('reasonTooLong')
      status.mutate('LOCKED')
      return
    }
    status.mutate('ACTIVE')
  }

  return (
    <div className='flex flex-wrap gap-2.5'>
      {menuLabel ? (
        <ActionMenu
          items={[
            {
              id: 'open',
              icon: 'manage_accounts',
              label: t(`${key}.openAccount`),
              onSelect: () => navigate(`/admin/accounts/${user.id}`)
            },
            ...(readOnly
              ? []
              : [
                  locked
                    ? { id: 'unlock', icon: 'lock_open', label: t(`${key}.unlock`), onSelect: () => open('unlock') }
                    : { id: 'lock', icon: 'lock', label: t(`${key}.lock`), onSelect: () => open('lock') },
                  {
                    id: 'deactivate',
                    icon: 'person_remove',
                    label: t(`${key}.deactivate`),
                    tone: 'danger' as const,
                    onSelect: () => open('deactivate')
                  }
                ])
          ]}
          label={menuLabel}
        />
      ) : (
        <>
          {locked ? (
            <Button onClick={() => open('unlock')} variant='secondary'>
              {t(`${key}.unlock`)}
            </Button>
          ) : (
            <Button onClick={() => open('lock')} variant='outline'>
              {t(`${key}.lock`)}
            </Button>
          )}
          <Button
            className='text-error! hover:bg-error-container/50!'
            onClick={() => open('deactivate')}
            variant='ghost'
          >
            {t(`${key}.deactivate`)}
          </Button>
        </>
      )}
      <ConfirmDialog
        confirmLabel={
          pending === 'lock' ? t(`${key}.lock`) : pending === 'unlock' ? t(`${key}.unlock`) : t(`${key}.deactivate`)
        }
        description={
          pending === 'lock'
            ? t(`${key}.lockDescription`)
            : pending === 'unlock'
              ? t(`${key}.unlockDescription`)
              : t(`${key}.deactivateDescription`)
        }
        error={errorMessage}
        loading={status.isPending || deactivate.isPending}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        open={pending !== null}
        title={
          pending === 'lock'
            ? t(`${key}.lockTitle`, { name })
            : pending === 'unlock'
              ? t(`${key}.unlockTitle`, { name })
              : t(`${key}.deactivateTitle`, { name })
        }
        tone={pending === 'unlock' ? 'primary' : 'danger'}
      >
        {pending === 'lock' ? (
          <div>
            <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-reason`}>
              {t(`${key}.lockReason`)}
            </label>
            <textarea
              aria-describedby={reasonError ? `${id}-reason-error` : undefined}
              aria-invalid={reasonError ? true : undefined}
              className={`${baseControlClass} mt-1 min-h-20`}
              id={`${id}-reason`}
              maxLength={REASON_MAX}
              onChange={(event) => {
                setReason(event.target.value)
                setReasonError(null)
              }}
              value={reason}
            />
            {reasonError ? (
              <p className='mt-1 text-xs font-medium text-error' id={`${id}-reason-error`}>
                {t(`${key}.errors.${reasonError}`)}
              </p>
            ) : null}
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}
