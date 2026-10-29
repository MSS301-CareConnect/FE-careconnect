import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatDateTime } from '~/entities/booking/booking-format'
import {
  acceptInvitation,
  declineInvitation,
  fetchMyInvitations,
  managerErrorKey,
  managerKeys
} from '~/entities/care-recipient/care-recipient-managers-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

/** Invitations addressed to the signed-in customer; accepting is the only way to become a co-manager (C-04). */
export function InvitationsPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  useDocumentTitle(t('customer.invitations.documentTitle'))
  const invitations = useQuery({ queryKey: managerKeys.myInvitations, queryFn: fetchMyInvitations, retry: false })
  const refresh = () => queryClient.invalidateQueries({ queryKey: managerKeys.myInvitations })
  const accept = useMutation({ mutationFn: acceptInvitation, onSuccess: refresh })
  const decline = useMutation({ mutationFn: declineInvitation, onSuccess: refresh })
  const failure = accept.error ?? decline.error
  const items = invitations.data ?? []

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10'>
      <div>
        <h1 className='text-3xl font-extrabold tracking-[-0.045em]'>{t('customer.invitations.title')}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('customer.invitations.subtitle')}</p>
      </div>
      {invitations.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.invitations.loading')}
        </p>
      ) : null}
      {invitations.isError || failure ? (
        <p className='rounded-xl bg-error/10 p-3 text-sm text-error' role='alert'>
          {t(managerErrorKey(failure ?? invitations.error))}
        </p>
      ) : null}
      {invitations.isSuccess && items.length === 0 ? (
        <p className='text-sm text-on-surface-variant'>{t('customer.invitations.empty')}</p>
      ) : null}
      {accept.isSuccess ? (
        <p className='text-sm' role='status'>
          {t('customer.invitations.accepted')}{' '}
          <Link className='font-semibold text-primary underline' to='/customer/patient-profiles'>
            {t('customer.invitations.openProfiles')}
          </Link>
        </p>
      ) : null}
      <ul className='flex flex-col gap-3'>
        {items.map((invitation) => (
          <li className='rounded-xl border border-outline-variant bg-white p-4' key={invitation.id}>
            <p className='font-semibold'>
              {t('customer.invitations.profile', { name: invitation.recipientFullName ?? '—' })}
            </p>
            <p className='mt-1 text-sm text-on-surface-variant'>
              {t(`customer.managers.levels.${invitation.accessLevel}`)} ·{' '}
              {t('customer.invitations.expires', { time: formatDateTime(invitation.expiresAt, i18n.language) })}
            </p>
            <div className='mt-3 flex gap-2'>
              <button
                className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50'
                disabled={accept.isPending || decline.isPending}
                onClick={() => accept.mutate(invitation.id)}
                type='button'
              >
                {t('customer.invitations.accept')}
              </button>
              <button
                className='rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold disabled:opacity-50'
                disabled={accept.isPending || decline.isPending}
                onClick={() => decline.mutate(invitation.id)}
                type='button'
              >
                {t('customer.invitations.decline')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
