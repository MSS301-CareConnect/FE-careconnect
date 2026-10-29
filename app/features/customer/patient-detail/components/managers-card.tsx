import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { apiRequestErrorKey } from '~/shared/api/error-details'

import {
  fetchInvitations,
  fetchManagers,
  inviteManager,
  managerErrorKey,
  managerKeys,
  removeManager,
  revokeInvitation
} from '~/entities/care-recipient/care-recipient-managers-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type {
  ManagerCreateRequestAccessLevel,
  ManagerCreateRequestRelationshipType
} from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const RELATIONSHIPS = ['CHILD', 'SPOUSE', 'PARENT', 'SIBLING', 'GRANDCHILD', 'RELATIVE', 'OTHER'] as const
const LEVELS = ['VIEWER', 'EDITOR', 'OWNER'] as const
const inputClass = 'mt-1 w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm'

/**
 * Co-managers of a profile (C-04 / D19). Only the primary OWNER invites by email or removes others; an invitation
 * shows nothing about the invitee until they accept it themselves.
 */
export function ManagersCard({ recipientId }: { recipientId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const user = useAuthUser()
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState<ManagerCreateRequestRelationshipType>('CHILD')
  const [level, setLevel] = useState<ManagerCreateRequestAccessLevel>('VIEWER')
  const managers = useQuery({
    queryKey: managerKeys.managers(recipientId),
    queryFn: () => fetchManagers(recipientId),
    retry: false
  })
  const isPrimary = Boolean(managers.data?.some((manager) => manager.primary && manager.userId === user?.id))
  const invitations = useQuery({
    queryKey: managerKeys.invitations(recipientId),
    queryFn: () => fetchInvitations(recipientId),
    enabled: isPrimary,
    retry: false
  })
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: managerKeys.managers(recipientId) })
    await queryClient.invalidateQueries({ queryKey: managerKeys.invitations(recipientId) })
  }
  const invite = useMutation({
    mutationFn: () =>
      inviteManager(recipientId, { email: email.trim(), relationshipType: relationship, accessLevel: level }),
    onSuccess: async () => {
      setEmail('')
      await refresh()
    }
  })
  const revoke = useMutation({ mutationFn: (id: string) => revokeInvitation(recipientId, id), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (id: string) => removeManager(recipientId, id), onSuccess: refresh })
  const failure = invite.error ?? revoke.error ?? remove.error
  const pending = (invitations.data ?? []).filter((invitation) => invitation.status === 'PENDING')

  function submit(event: FormEvent) {
    event.preventDefault()
    invite.mutate()
  }

  return (
    <section
      aria-labelledby='managers-title'
      className='flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm'
    >
      <h3 className='flex items-center gap-2 text-sm font-semibold text-on-surface' id='managers-title'>
        <Icon className='text-lg text-primary' name='group' />
        {t('customer.managers.title')}
      </h3>
      {managers.isError ? (
        <p className='text-xs text-error' role='alert'>
          {t(apiRequestErrorKey(managers.error, 'customer.managers.errors.generic'))}
        </p>
      ) : null}
      <ul className='flex flex-col gap-2'>
        {(managers.data ?? []).map((manager) => (
          <li className='flex items-center justify-between gap-2 text-sm' key={manager.id}>
            <span className='min-w-0'>
              <span className='block truncate font-semibold'>{manager.fullName ?? manager.email ?? '—'}</span>
              <span className='text-xs text-on-surface-variant'>
                {t(`customer.managers.levels.${manager.accessLevel}`)}
                {manager.primary ? ` · ${t('customer.managers.primary')}` : ''}
              </span>
            </span>
            {isPrimary && !manager.primary ? (
              <button
                aria-label={t('customer.managers.remove', { name: manager.fullName ?? manager.email ?? '' })}
                className='rounded-lg px-2 py-1 text-xs font-semibold text-error hover:bg-error/10'
                disabled={remove.isPending}
                onClick={() => remove.mutate(manager.id)}
                type='button'
              >
                {t('customer.managers.removeShort')}
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {isPrimary ? (
        <>
          <form className='flex flex-col gap-2 border-t border-outline-variant/40 pt-3' onSubmit={submit}>
            <p className='text-xs text-on-surface-variant'>{t('customer.managers.inviteHint')}</p>
            <label className='text-xs font-medium'>
              {t('customer.managers.email')}
              <input
                className={inputClass}
                onChange={(event) => setEmail(event.target.value)}
                required
                type='email'
                value={email}
              />
            </label>
            <div className='grid grid-cols-2 gap-2'>
              <label className='text-xs font-medium'>
                {t('customer.managers.relationship')}
                <select
                  className={inputClass}
                  onChange={(event) => setRelationship(event.target.value as ManagerCreateRequestRelationshipType)}
                  value={relationship}
                >
                  {RELATIONSHIPS.map((item) => (
                    <option key={item} value={item}>
                      {t(`customer.managers.relationships.${item}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className='text-xs font-medium'>
                {t('customer.managers.level')}
                <select
                  className={inputClass}
                  onChange={(event) => setLevel(event.target.value as ManagerCreateRequestAccessLevel)}
                  value={level}
                >
                  {LEVELS.map((item) => (
                    <option key={item} value={item}>
                      {t(`customer.managers.levels.${item}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary disabled:opacity-50'
              disabled={invite.isPending}
              type='submit'
            >
              {t('customer.managers.invite')}
            </button>
            {invite.isSuccess ? (
              <p className='text-xs text-on-surface-variant' role='status'>
                {t('customer.managers.invited')}
              </p>
            ) : null}
          </form>
          {pending.length > 0 ? (
            <div className='flex flex-col gap-2 border-t border-outline-variant/40 pt-3'>
              <h4 className='text-xs font-semibold'>{t('customer.managers.pending')}</h4>
              {pending.map((invitation) => (
                <div className='flex items-center justify-between gap-2 text-xs' key={invitation.id}>
                  <span className='truncate'>{invitation.email}</span>
                  <button
                    aria-label={t('customer.managers.revoke', { email: invitation.email })}
                    className='rounded-lg px-2 py-1 font-semibold text-error hover:bg-error/10'
                    disabled={revoke.isPending}
                    onClick={() => revoke.mutate(invitation.id)}
                    type='button'
                  >
                    {t('customer.managers.revokeShort')}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {failure ? (
        <p className='text-xs text-error' role='alert'>
          {t(managerErrorKey(failure))}
        </p>
      ) : null}
    </section>
  )
}
