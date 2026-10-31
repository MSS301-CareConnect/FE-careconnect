import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { accountKeys } from '~/entities/identity/account-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { classifyApiError } from '~/shared/api/api-error'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { FormAlert } from '~/shared/ui/form-alert'
import { ConfirmDialog } from '~/shared/ui/modal'

import { isBuiltInRole } from '../account-format'
import { addUserRole, fetchRoles, removeUserRole, roleKeys } from '../identity-api'

const key = 'admin.identity.detail' as const
/** Given through their own flows: a manager on the center page, a caregiver together with its provider profile (A-06). */
const ASSIGNED_ELSEWHERE = new Set(['CENTER_MANAGER', 'CAREGIVER'])
const BUSINESS = {
  business: {
    1100: 'admin.identity.detail.business.centerRequired',
    1104: 'admin.identity.detail.business.lastAdmin',
    1019: 'admin.identity.detail.business.roleTaken'
  }
} as const

export function AccountRoles({ user, editable }: { user: UserResponse; editable: boolean }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [roleId, setRoleId] = useState('')
  const [revoking, setRevoking] = useState<{ id: string; label: string } | null>(null)
  const roles = useQuery({ queryKey: roleKeys.roles, queryFn: fetchRoles, retry: false, enabled: editable })
  const label = (code: string) => (isBuiltInRole(code) ? t(`admin.identity.roles.${code}`) : code)

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: accountKeys.all })
    await queryClient.invalidateQueries({ queryKey: accountKeys.detail(user.id!) })
  }
  const assign = useMutation({
    mutationFn: (selected: string) => addUserRole(user.id!, selected),
    onSuccess: async () => {
      setRoleId('')
      await refresh()
    }
  })
  const revoke = useMutation({
    mutationFn: (selected: string) => removeUserRole(user.id!, selected),
    onSuccess: async () => {
      setRevoking(null)
      await refresh()
    },
    onError: () => setRevoking(null)
  })
  const failure = assign.error ?? revoke.error
  const classified = failure ? classifyApiError(failure, BUSINESS) : null
  const options = (roles.data ?? []).filter(
    (role) =>
      role.id &&
      role.roleCode &&
      role.active !== false &&
      !ASSIGNED_ELSEWHERE.has(role.roleCode) &&
      !user.roles?.includes(role.roleCode)
  )

  return (
    <div className='space-y-4'>
      {user.roles?.length ? (
        <ul className='space-y-2'>
          {user.roles.map((code) => {
            const role = roles.data?.find((item) => item.roleCode === code)
            return (
              <li
                className='flex min-h-11 items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-1.5'
                key={code}
              >
                <span className='font-semibold text-on-surface'>{label(code)}</span>
                {editable && role?.id ? (
                  <Button onClick={() => setRevoking({ id: role.id!, label: label(code) })} size='sm' variant='ghost'>
                    {t(`${key}.revoke`)}
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className='text-sm text-on-surface-variant'>{t(`${key}.noRoles`)}</p>
      )}
      {editable ? (
        <div className='space-y-2 border-t border-outline-variant/30 pt-4'>
          <div className='flex flex-wrap gap-2'>
            <label className='sr-only' htmlFor='assign-role'>
              {t(`${key}.assign`)}
            </label>
            <select
              className={`${baseControlClass} min-w-44 flex-1`}
              disabled={!options.length}
              id='assign-role'
              onChange={(event) => setRoleId(event.target.value)}
              value={roleId}
            >
              <option value=''>{options.length ? t(`${key}.assignPlaceholder`) : t(`${key}.nothingToAssign`)}</option>
              {options.map((role) => (
                <option key={role.id} value={role.id}>
                  {isBuiltInRole(role.roleCode) ? label(role.roleCode) : (role.roleName ?? role.roleCode)}
                </option>
              ))}
            </select>
            <Button
              disabled={!roleId}
              loading={assign.isPending}
              onClick={() => {
                revoke.reset()
                assign.mutate(roleId)
              }}
              variant='secondary'
            >
              {t(`${key}.assign`)}
            </Button>
          </div>
          <p className='text-xs text-on-surface-variant'>{t(`${key}.assignHint`)}</p>
        </div>
      ) : null}
      {classified && classified.kind !== 'field' ? (
        <FormAlert tone={classified.kind === 'system' ? 'error' : 'warning'}>{t(classified.key)}</FormAlert>
      ) : null}
      <ConfirmDialog
        confirmLabel={t(`${key}.revoke`)}
        description={t(`${key}.revokeDescription`)}
        loading={revoke.isPending}
        onClose={() => setRevoking(null)}
        onConfirm={() => {
          if (!revoking) return
          assign.reset()
          revoke.mutate(revoking.id)
        }}
        open={Boolean(revoking)}
        title={t(`${key}.revokeTitle`, { role: revoking?.label ?? '' })}
        tone='danger'
      />
    </div>
  )
}
