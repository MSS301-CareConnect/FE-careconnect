import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PasswordResetPanel } from '~/entities/identity/password-reset-panel'
import { ProvisionAccountForm, type ProvisionRole } from '~/entities/identity/provision-account-form'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Modal } from '~/shared/ui/modal'

import { useCenterOptions } from '../hooks/use-center-options'

const key = 'admin.identity.accounts' as const

/**
 * Two steps in one dialog: create the account, then help its owner set a password with an emailed code. A new
 * center manager also gets a shortcut to the center page, where the account is linked as the center's manager.
 */
export function CreateAccountDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const authUser = useAuthUser()
  const [created, setCreated] = useState<{ user: UserResponse; sendCode: boolean } | null>(null)
  const roles: ProvisionRole[] = []
  if (authUser?.permissions?.includes('user:manage')) roles.push('CUSTOMER')
  if (authUser?.permissions?.includes('manager:create')) roles.push('CENTER_MANAGER')
  const centers = useCenterOptions(roles.includes('CENTER_MANAGER'))
  const centerOptions = (centers.data ?? []).map((center) => ({
    id: center.id,
    name: center.centerName,
    note: center.managerUserId ? t(`${key}.centerHasManager`) : t(`admin.provider.${statusKey(center.centerStatus)}`)
  }))

  return (
    <Modal
      description={created ? undefined : t(`${key}.createDescription`)}
      maxWidthClass='max-w-3xl'
      onClose={onClose}
      open
      title={created ? t(`${key}.createdTitle`) : t(`${key}.createTitle`)}
    >
      {created ? (
        <div className='space-y-5'>
          <p className='text-sm text-on-surface-variant'>
            {t(`${key}.createdDescription`, {
              name: created.user.fullName ?? '',
              email: created.user.email ?? ''
            })}
          </p>
          <PasswordResetPanel
            className='border-t border-outline-variant/40 pt-5'
            email={created.user.email ?? ''}
            mode='new'
            name={created.user.fullName ?? created.user.email ?? ''}
            sendOnOpen={created.sendCode}
          />
          <div className='flex flex-wrap justify-end gap-2.5 border-t border-outline-variant/40 pt-4'>
            {created.user.roles?.includes('CENTER_MANAGER') && created.user.centerId ? (
              <Link
                className='inline-flex min-h-11 items-center rounded-xl border border-outline-variant px-4 text-sm font-semibold text-primary hover:bg-surface-container-low'
                to={`/admin/centers/${created.user.centerId}`}
              >
                {t(`${key}.openCenter`)}
              </Link>
            ) : null}
            <Button onClick={onClose}>{t(`${key}.done`)}</Button>
          </div>
        </div>
      ) : (
        <ProvisionAccountForm
          centers={centerOptions}
          centersHint={
            centers.isPending
              ? t(`${key}.centerLoading`)
              : centers.isError
                ? t(`${key}.centerError`)
                : centerOptions.length === 0
                  ? t(`${key}.centerEmpty`)
                  : undefined
          }
          onCancel={onClose}
          onCreated={(user, options) => setCreated({ user, sendCode: options.sendCode })}
          roles={roles}
          submitLabel={t(`${key}.create`)}
        />
      )}
    </Modal>
  )
}

function statusKey(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'active' as const
    case 'PENDING':
      return 'pending' as const
    case 'SUSPENDED':
      return 'suspended' as const
    case 'REJECTED':
      return 'rejected' as const
    default:
      return 'inactive' as const
  }
}
