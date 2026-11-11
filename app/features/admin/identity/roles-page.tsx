import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import type { RoleRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoCard, bentoContainer } from '~/shared/ui/bento-page-header'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { BUILT_IN_ROLES, isBuiltInRole, type BuiltInRole } from './account-format'
import { CreateRoleDialog } from './components/create-role-dialog'
import { CustomRolesPanel } from './components/custom-roles-panel'
import { PermissionText } from './components/permission-text'
import { fetchPermissions, fetchRoles, roleKeys } from './identity-api'

const key = 'admin.identity.rolesPage' as const
const ROLE_ICONS: Record<BuiltInRole, string> = {
  ADMIN: 'shield_person',
  CENTER_MANAGER: 'apartment',
  CAREGIVER: 'medical_services',
  CUSTOMER: 'family_restroom'
}

/**
 * U-09: what each role is for, which portal it opens, its data scope and its account permissions, then the custom
 * roles with their full lifecycle — create, rename / describe / stop using, choose permissions, delete (2026-11-11).
 */
export function RolesPage() {
  const { t } = useTranslation()
  const authUser = useAuthUser()
  const roles = useQuery({ queryKey: roleKeys.roles, queryFn: fetchRoles, retry: false })
  const permissions = useQuery({ queryKey: roleKeys.permissions, queryFn: fetchPermissions, retry: false })
  const [selectedId, setSelectedId] = useState('')
  const [creating, setCreating] = useState(false)
  const canManageRoles = Boolean(authUser?.permissions?.includes('role:manage'))
  useDocumentTitle(t(`${key}.documentTitle`))

  const allRoles = roles.data ?? []
  const allPermissions = (permissions.data ?? []).filter((permission) => permission.id)
  const builtIns = BUILT_IN_ROLES.map((code) => allRoles.find((role) => role.roleCode === code)).filter(
    (role): role is RoleRecord => Boolean(role)
  )
  const customs = allRoles.filter((role) => !isBuiltInRole(role.roleCode))

  return (
    <main className={bentoContainer}>
      <BentoPageHeader
        actions={
          canManageRoles ? (
            <Button leftIcon={<Icon name='add' />} onClick={() => setCreating(true)}>
              {t(`${key}.create`)}
            </Button>
          ) : undefined
        }
        description={t(`${key}.subtitle`)}
        title={t(`${key}.title`)}
      />

      {roles.isPending || permissions.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={6} />
      ) : roles.isError || permissions.isError ? (
        <ErrorState
          message={t(isForbiddenError(roles.error ?? permissions.error) ? `${key}.forbidden` : `${key}.error`)}
          onRetry={() => {
            void roles.refetch()
            void permissions.refetch()
          }}
          retryLabel={t(`${key}.retry`)}
        />
      ) : (
        <>
          <section className={`${bentoCard} overflow-hidden`}>
            <div className='border-b border-outline-variant/30 px-5 py-4 sm:px-6'>
              <h2 className='text-lg font-bold tracking-tight text-forest-950'>{t(`${key}.systemTitle`)}</h2>
              <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.systemHint`)}</p>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-215 text-left text-sm'>
                <thead className='bg-surface-container-low/70 text-xs font-semibold text-on-surface-variant'>
                  <tr>
                    <th className='px-5 py-3' scope='col'>
                      {t('admin.identity.accounts.columns.roles')}
                    </th>
                    {(['usedFor', 'portal', 'can', 'scope'] as const).map((column) => (
                      <th className='px-5 py-3' key={column} scope='col'>
                        {t(`${key}.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/25 align-top'>
                  {BUILT_IN_ROLES.map((code) => (
                    <tr className='transition-colors hover:bg-mint-50/60' key={code}>
                      <th className='px-5 py-4 font-semibold text-on-surface' scope='row'>
                        <span className='flex items-center gap-3 whitespace-nowrap'>
                          <span
                            aria-hidden='true'
                            className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint-100 text-forest-900'
                          >
                            <Icon className='text-lg' name={ROLE_ICONS[code]} />
                          </span>
                          {t(`admin.identity.roles.${code}`)}
                        </span>
                      </th>
                      <td className='px-5 py-4'>{t(`${key}.info.${code}.usedFor`)}</td>
                      <td className='px-5 py-4'>{t(`${key}.info.${code}.portal`)}</td>
                      <td className='max-w-sm px-5 py-4 leading-6'>{t(`${key}.info.${code}.can`)}</td>
                      <td className='px-5 py-4'>
                        <span className='inline-block rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-forest-900'>
                          {t(`${key}.info.${code}.scope`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${bentoCard} overflow-hidden`}>
            <div className='border-b border-outline-variant/30 px-5 py-4 sm:px-6'>
              <h2 className='text-lg font-bold tracking-tight text-forest-950'>{t(`${key}.matrixTitle`)}</h2>
              <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.matrixHint`)}</p>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-190 text-left text-sm'>
                <thead className='bg-surface-container-low/70 text-xs font-semibold text-on-surface-variant'>
                  <tr>
                    <th className='px-5 py-3' scope='col'>
                      {t(`${key}.permission`)}
                    </th>
                    {builtIns.map((role) => (
                      <th className='px-4 py-3 text-center' key={role.roleCode} scope='col'>
                        {t(`admin.identity.roles.${role.roleCode as BuiltInRole}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/25'>
                  {allPermissions.map((permission) => (
                    <tr className='transition-colors hover:bg-mint-50/60' key={permission.id}>
                      <th className='px-5 py-3.5 font-normal' scope='row'>
                        <PermissionText permission={permission} />
                      </th>
                      {builtIns.map((role) => {
                        const has = role.permissions?.includes(permission.permissionCode ?? '')
                        return (
                          <td className='px-4 py-3.5 text-center' key={role.roleCode}>
                            <span
                              className={`inline-grid h-8 w-8 place-items-center rounded-full ${has ? 'bg-mint-100 text-forest-900' : 'text-outline-variant'}`}
                            >
                              <Icon className='text-lg' name={has ? 'check' : 'remove'} />
                            </span>
                            <span className='sr-only'>{t(has ? `${key}.has` : `${key}.hasNot`)}</span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <CustomRolesPanel
            canManage={canManageRoles}
            onSelect={setSelectedId}
            permissions={allPermissions}
            roles={customs}
            selectedId={selectedId}
          />
        </>
      )}
      {creating ? (
        <CreateRoleDialog
          onClose={() => setCreating(false)}
          onCreated={(role) => {
            setCreating(false)
            setSelectedId(role.id ?? '')
          }}
        />
      ) : null}
    </main>
  )
}
