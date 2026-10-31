import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { accountKeys, fetchAccount } from '~/entities/identity/account-api'
import { PasswordResetPanel } from '~/entities/identity/password-reset-panel'
import { useCenterName } from '~/entities/provider/use-provider-names'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import { apiErrorStatus } from '~/shared/api/error-details'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

import { AccountAccess } from './components/account-access'
import { AccountAvatar, useAccountCaregiver } from './components/account-avatar'
import { AccountProfileForm } from './components/account-profile-form'
import { AccountRoles } from './components/account-roles'
import { RoleChips } from './components/role-chips'

const key = 'admin.identity.detail' as const

function Panel({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return (
    <section className='space-y-4 rounded-xl border border-outline-variant/40 bg-white p-5 sm:p-6'>
      <h2 className='flex items-center gap-2 text-base font-bold text-on-surface'>
        <Icon className='text-xl text-primary' name={icon} />
        {title}
      </h2>
      {children}
    </section>
  )
}

function CenterLink({ centerId }: { centerId: string }) {
  const name = useCenterName(centerId)
  return (
    <Link className='font-semibold text-primary hover:underline' to={`/admin/centers/${centerId}`}>
      {name}
    </Link>
  )
}

/** A caregiver account links to the profile the admin reviews in its center's caregiver list. */
function CaregiverProfileLink({ userId, roles }: { userId: string | undefined; roles: readonly string[] | undefined }) {
  const { t } = useTranslation()
  const caregiver = useAccountCaregiver(userId, roles)
  if (!caregiver.data) return null
  return (
    <div>
      <dt className='text-on-surface-variant'>{t(`${key}.caregiverProfile`)}</dt>
      <dd className='mt-1'>
        <Link
          className='inline-flex items-center gap-1 font-semibold text-primary hover:underline'
          to={`/admin/centers/${caregiver.data.centerId}/caregivers?caregiver=${caregiver.data.id}`}
        >
          {caregiver.data.fullName}
          <Icon className='text-base' name='arrow_forward' />
        </Link>
      </dd>
    </div>
  )
}

export function AccountDetailPage() {
  const { t, i18n } = useTranslation()
  const { id = '' } = useParams()
  const authUser = useAuthUser()
  const account = useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => fetchAccount(id),
    enabled: Boolean(id),
    retry: false
  })
  useDocumentTitle(t(`${key}.documentTitle`))
  const canManage = Boolean(authUser?.permissions?.includes('user:manage'))
  const canManageRoles = Boolean(authUser?.permissions?.includes('role:manage'))
  const isSelf = authUser?.id === id
  const date = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { dateStyle: 'long' })

  return (
    <main className='mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6'>
      <Link
        className='inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline'
        to='/admin/accounts'
      >
        <Icon className='text-base' name='arrow_back' />
        {t(`${key}.back`)}
      </Link>
      {account.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={6} />
      ) : account.isError ? (
        <ErrorState
          message={t(
            isForbiddenError(account.error)
              ? `${key}.forbidden`
              : apiErrorStatus(account.error) === 404
                ? `${key}.notFound`
                : `${key}.error`
          )}
          onRetry={() => void account.refetch()}
          retryLabel={t(`${key}.retry`)}
        />
      ) : (
        <>
          <header className='flex flex-wrap items-center gap-4'>
            <AccountAvatar
              className='h-14 w-14 rounded-2xl text-lg'
              name={account.data.fullName || account.data.email}
              roles={account.data.roles}
              userId={account.data.id}
            />
            <div className='min-w-0 flex-1'>
              <h1 className='text-2xl font-extrabold tracking-tight'>{account.data.fullName || account.data.email}</h1>
              <p className='mt-1 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
                {account.data.email}
                <StatusBadge dot tone={account.data.status === 'ACTIVE' ? 'success' : 'error'}>
                  {t(`admin.identity.status.${account.data.status ?? 'ACTIVE'}`)}
                </StatusBadge>
              </p>
            </div>
          </header>
          <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]'>
            <div className='space-y-5'>
              <Panel icon='badge' title={t(`${key}.information`)}>
                <dl className='grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2'>
                  <div>
                    <dt className='text-on-surface-variant'>{t(`${key}.roles`)}</dt>
                    <dd className='mt-1'>
                      <RoleChips roles={account.data.roles} />
                    </dd>
                  </div>
                  <div>
                    <dt className='text-on-surface-variant'>{t(`${key}.center`)}</dt>
                    <dd className='mt-1'>
                      {account.data.centerId ? <CenterLink centerId={account.data.centerId} /> : t(`${key}.none`)}
                    </dd>
                  </div>
                  <CaregiverProfileLink roles={account.data.roles} userId={account.data.id} />
                  <div>
                    <dt className='text-on-surface-variant'>{t(`${key}.createdAt`)}</dt>
                    <dd className='mt-1 tabular-nums'>
                      {account.data.createdAt ? date.format(new Date(account.data.createdAt)) : t(`${key}.none`)}
                    </dd>
                  </div>
                  {account.data.status === 'LOCKED' && account.data.statusReason ? (
                    <div>
                      <dt className='text-on-surface-variant'>{t(`${key}.status`)}</dt>
                      <dd className='mt-1'>{t(`${key}.lockReasonValue`, { reason: account.data.statusReason })}</dd>
                    </div>
                  ) : null}
                </dl>
                {canManage ? (
                  <div className='border-t border-outline-variant/30 pt-4'>
                    <AccountProfileForm key={account.dataUpdatedAt} user={account.data} />
                  </div>
                ) : null}
              </Panel>
              {canManage && account.data.email ? (
                <div className='rounded-xl border border-outline-variant/40 bg-white p-5 sm:p-6'>
                  <PasswordResetPanel
                    email={account.data.email}
                    mode='existing'
                    name={account.data.fullName || account.data.email}
                  />
                </div>
              ) : null}
            </div>
            <div className='space-y-5'>
              <Panel icon='admin_panel_settings' title={t(`${key}.rolesTitle`)}>
                <AccountRoles editable={canManageRoles && !isSelf} user={account.data} />
              </Panel>
              {canManage ? (
                <Panel icon='lock' title={t(`${key}.access`)}>
                  {isSelf ? (
                    <p className='text-sm text-on-surface-variant'>{t(`${key}.selfNote`)}</p>
                  ) : (
                    <AccountAccess user={account.data} />
                  )}
                </Panel>
              ) : null}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
