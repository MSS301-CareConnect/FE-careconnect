import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

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
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type {
  ManagerCreateRequestAccessLevel,
  ManagerCreateRequestRelationshipType
} from '~/shared/api/generated/contracts'
import { formatCalendarDate } from '~/shared/lib/format'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

import { DetailSection } from './detail-ui'
import { FormField, inputClassName } from './form-field'

const RELATIONSHIPS = ['CHILD', 'SPOUSE', 'PARENT', 'SIBLING', 'GRANDCHILD', 'RELATIVE', 'OTHER'] as const
const LEVELS = ['VIEWER', 'EDITOR', 'OWNER'] as const
const INVITE_FORM = 'invite-manager-form'

/**
 * Co-managers of a profile (C-04 / D19). Only the primary OWNER invites by email (in a dialog) or removes others; an
 * invitation shows nothing about the invitee until they accept it themselves.
 */
export function ManagersCard({ recipientId }: { recipientId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const user = useAuthUser()
  const [inviting, setInviting] = useState(false)
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
      toastSuccess(t('customer.managers.invited'))
      setEmail('')
      setInviting(false)
      await refresh()
    }
  })
  const revoke = useMutation({ mutationFn: (id: string) => revokeInvitation(recipientId, id), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (id: string) => removeManager(recipientId, id), onSuccess: refresh })
  const failure = revoke.error ?? remove.error
  const pending = (invitations.data ?? []).filter((invitation) => invitation.status === 'PENDING')

  function submit(event: FormEvent) {
    event.preventDefault()
    invite.mutate()
  }

  return (
    <DetailSection
      action={
        isPrimary ? (
          <Button
            leftIcon={<Icon className='text-lg' name='person_add' />}
            onClick={() => {
              invite.reset()
              setInviting(true)
            }}
            className='whitespace-nowrap'
            size='sm'
            variant='outline'
          >
            {t('customer.managers.openInvite')}
          </Button>
        ) : undefined
      }
      icon='group'
      title={t('customer.managers.title')}
    >
      {managers.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t(apiRequestErrorKey(managers.error, 'customer.managers.errors.generic'))}
        </p>
      ) : null}
      <ul className='flex flex-col divide-y divide-outline-variant/70'>
        {(managers.data ?? []).map((manager) => {
          const name = manager.fullName ?? manager.email ?? '—'
          return (
            <li className='flex items-center gap-3 py-3 first:pt-0 last:pb-0' key={manager.id}>
              <Avatar className='h-10 w-10 shrink-0 rounded-full text-sm' decorative name={name} />
              <span className='min-w-0 flex-1'>
                <span className='block truncate font-semibold text-on-surface'>
                  {name}
                  {manager.userId === user?.id ? (
                    <span className='font-normal text-on-surface-variant'> {t('customer.managers.you')}</span>
                  ) : null}
                </span>
                <span className='text-sm text-on-surface-variant'>
                  {t(`customer.managers.levels.${manager.accessLevel}`)}
                  {manager.primary ? ` · ${t('customer.managers.primary')}` : ''}
                </span>
              </span>
              {isPrimary && !manager.primary ? (
                <Button
                  aria-label={t('customer.managers.remove', { name })}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(manager.id)}
                  size='sm'
                  variant='ghost'
                >
                  {t('customer.managers.removeShort')}
                </Button>
              ) : null}
            </li>
          )
        })}
      </ul>

      {pending.length > 0 ? (
        <div className='mt-4 flex flex-col gap-2 border-t border-outline-variant pt-4'>
          <h3 className='text-sm font-semibold text-on-surface'>{t('customer.managers.pending')}</h3>
          {pending.map((invitation) => (
            <div className='flex items-center gap-3 text-sm' key={invitation.id}>
              <Icon className='text-lg text-on-surface-variant' name='schedule_send' />
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-on-surface'>{invitation.email}</span>
                <span className='text-xs text-on-surface-variant'>
                  {t(`customer.managers.levels.${invitation.accessLevel}`)} ·{' '}
                  {t('customer.managers.expires', { date: formatCalendarDate(invitation.expiresAt) })}
                </span>
              </span>
              <Button
                aria-label={t('customer.managers.revoke', { email: invitation.email })}
                disabled={revoke.isPending}
                onClick={() => revoke.mutate(invitation.id)}
                size='sm'
                variant='ghost'
              >
                {t('customer.managers.revokeShort')}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      {failure ? (
        <p className='mt-3 text-sm text-error' role='alert'>
          {t(managerErrorKey(failure))}
        </p>
      ) : null}

      <Modal
        description={t('customer.managers.inviteHint')}
        footer={
          <>
            <Button disabled={invite.isPending} onClick={() => setInviting(false)} variant='outline'>
              {t('customer.managers.cancel')}
            </Button>
            <Button form={INVITE_FORM} loading={invite.isPending} type='submit'>
              {t('customer.managers.invite')}
            </Button>
          </>
        }
        onClose={() => !invite.isPending && setInviting(false)}
        open={inviting}
        title={t('customer.managers.inviteTitle')}
      >
        <form className='flex flex-col gap-4' id={INVITE_FORM} onSubmit={submit}>
          <FormField label={t('customer.managers.email')}>
            <input
              autoComplete='email'
              className={inputClassName}
              onChange={(event) => setEmail(event.target.value)}
              required
              type='email'
              value={email}
            />
          </FormField>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField label={t('customer.managers.relationship')}>
              <select
                className={inputClassName}
                onChange={(event) => setRelationship(event.target.value as ManagerCreateRequestRelationshipType)}
                value={relationship}
              >
                {RELATIONSHIPS.map((item) => (
                  <option key={item} value={item}>
                    {t(`customer.managers.relationships.${item}`)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('customer.managers.level')}>
              <select
                className={inputClassName}
                onChange={(event) => setLevel(event.target.value as ManagerCreateRequestAccessLevel)}
                value={level}
              >
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {t(`customer.managers.levels.${item}`)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          {invite.isError ? (
            <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
              {t(managerErrorKey(invite.error))}
            </p>
          ) : null}
        </form>
      </Modal>
    </DetailSection>
  )
}
