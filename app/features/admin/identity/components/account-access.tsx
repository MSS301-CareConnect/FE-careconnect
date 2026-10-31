import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { accountKeys, changeAccountStatus } from '~/entities/identity/account-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { classifyApiError } from '~/shared/api/api-error'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { ConfirmDialog } from '~/shared/ui/modal'

import { removeUser } from '../identity-api'

const key = 'admin.identity.detail' as const
const REASON_MAX = 500
const BUSINESS = {
  business: {
    1104: 'admin.identity.detail.business.lastAdmin',
    1023: 'admin.identity.detail.business.self'
  }
} as const

type Pending = 'lock' | 'unlock' | 'deactivate' | null

/** Lock (with a reason the backend requires), unlock and deactivate; each asks for confirmation first. */
export function AccountAccess({ user }: { user: UserResponse }) {
  const { t } = useTranslation()
  const id = useId()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<Pending>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<'reasonRequired' | 'reasonTooLong' | null>(null)
  const name = user.fullName || user.email || ''
  const locked = user.status === 'LOCKED'

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: accountKeys.all })
    await queryClient.invalidateQueries({ queryKey: accountKeys.detail(user.id!) })
  }
  const status = useMutation({
    mutationFn: (next: 'ACTIVE' | 'LOCKED') =>
      changeAccountStatus(user.id!, next, next === 'LOCKED' ? reason.trim() : undefined),
    onSuccess: async () => {
      setPending(null)
      setReason('')
      await refresh()
    }
  })
  const deactivate = useMutation({
    mutationFn: () => removeUser(user.id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountKeys.all })
      navigate('/admin/accounts')
    }
  })
  const failure = status.error ?? deactivate.error
  const classified = failure ? classifyApiError(failure, BUSINESS) : null
  const errorMessage = classified && classified.kind !== 'field' ? t(classified.key) : undefined

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
      {locked ? (
        <Button onClick={() => open('unlock')} variant='secondary'>
          {t(`${key}.unlock`)}
        </Button>
      ) : (
        <Button onClick={() => open('lock')} variant='outline'>
          {t(`${key}.lock`)}
        </Button>
      )}
      <Button onClick={() => open('deactivate')} variant='ghost' className='text-error! hover:bg-error-container/50!'>
        {t(`${key}.deactivate`)}
      </Button>
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
