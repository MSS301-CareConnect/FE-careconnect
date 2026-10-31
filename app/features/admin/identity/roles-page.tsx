import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import type { PermissionRecord, RoleRecord } from '~/shared/api/generated/contracts'
import { classifyApiError } from '~/shared/api/api-error'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { BUILT_IN_ROLES, isBuiltInRole } from './account-format'
import { CreateRoleDialog } from './components/create-role-dialog'
import { fetchPermissions, fetchRoles, roleKeys, saveRolePermissions } from './identity-api'

const key = 'admin.identity.rolesPage' as const

/** Permission codes contain ":", which i18next reads as a namespace separator, so they map to plain keys. */
const PERMISSION_KEYS = {
  'user:read': 'userRead',
  'user:manage': 'userManage',
  'manager:create': 'managerCreate',
  'caregiver:create': 'caregiverCreate',
  'role:manage': 'roleManage'
} as const

function permissionKey(code: string | undefined) {
  return code && code in PERMISSION_KEYS ? PERMISSION_KEYS[code as keyof typeof PERMISSION_KEYS] : 'other'
}

function PermissionText({ permission }: { permission: PermissionRecord }) {
  const { t } = useTranslation()
  const known = permissionKey(permission.permissionCode)
  return (
    <span>
      <strong className='block text-sm text-on-surface'>
        {known === 'other'
          ? (permission.permissionName ?? t(`${key}.permissions.other.name`))
          : t(`${key}.permissions.${known}.name`)}
      </strong>
      <span className='block text-xs leading-5 text-on-surface-variant'>
        {known === 'other'
          ? (permission.description ?? t(`${key}.permissions.other.description`))
          : t(`${key}.permissions.${known}.description`)}
      </span>
    </span>
  )
}

/** U-09: what each role is for, which portal it opens, its data scope and its account permissions. */
export function RolesPage() {
  const { t } = useTranslation()
  const authUser = useAuthUser()
  const queryClient = useQueryClient()
  const roles = useQuery({ queryKey: roleKeys.roles, queryFn: fetchRoles, retry: false })
  const permissions = useQuery({ queryKey: roleKeys.permissions, queryFn: fetchPermissions, retry: false })
  const [selectedId, setSelectedId] = useState('')
  const [edited, setEdited] = useState<string[] | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saved, setSaved] = useState(false)
  const canManageRoles = Boolean(authUser?.permissions?.includes('role:manage'))
  useDocumentTitle(t(`${key}.documentTitle`))

  const allRoles = roles.data ?? []
  const allPermissions = (permissions.data ?? []).filter((permission) => permission.id)
  const builtIns = BUILT_IN_ROLES.map((code) => allRoles.find((role) => role.roleCode === code)).filter(
    (role): role is RoleRecord => Boolean(role)
  )
  const customs = allRoles.filter((role) => !isBuiltInRole(role.roleCode))
  const selected = customs.find((role) => role.id === selectedId)
  const selectedPermissionIds =
    edited ??
    allPermissions
      .filter((permission) => selected?.permissions?.includes(permission.permissionCode ?? ''))
      .map((permission) => permission.id!)

  const save = useMutation({
    mutationFn: () => saveRolePermissions(selectedId, { permissionIds: selectedPermissionIds }),
    onSuccess: async () => {
      setConfirming(false)
      setEdited(null)
      setSaved(true)
      await queryClient.invalidateQueries({ queryKey: roleKeys.roles })
    },
    onError: () => setConfirming(false)
  })
  const saveFailure = save.error ? classifyApiError(save.error) : null

  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 max-w-2xl text-sm text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
        </div>
        {canManageRoles ? (
          <Button leftIcon={<Icon name='add' />} onClick={() => setCreating(true)} variant='secondary'>
            {t(`${key}.create`)}
          </Button>
        ) : null}
      </header>

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
          <section className='overflow-hidden rounded-xl border border-outline-variant/40 bg-white'>
            <div className='border-b border-outline-variant/30 px-5 py-4'>
              <h2 className='text-base font-bold'>{t(`${key}.systemTitle`)}</h2>
              <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.systemHint`)}</p>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-215 text-left text-sm'>
                <thead className='bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
                  <tr>
                    <th className='px-4 py-3' scope='col'>
                      {t('admin.identity.accounts.columns.roles')}
                    </th>
                    {(['usedFor', 'portal', 'can', 'scope'] as const).map((column) => (
                      <th className='px-4 py-3' key={column} scope='col'>
                        {t(`${key}.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/25 align-top'>
                  {BUILT_IN_ROLES.map((code) => (
                    <tr key={code}>
                      <th className='px-4 py-3 font-semibold text-on-surface' scope='row'>
                        {t(`admin.identity.roles.${code}`)}
                      </th>
                      <td className='px-4 py-3'>{t(`${key}.info.${code}.usedFor`)}</td>
                      <td className='px-4 py-3'>{t(`${key}.info.${code}.portal`)}</td>
                      <td className='max-w-sm px-4 py-3 leading-6'>{t(`${key}.info.${code}.can`)}</td>
                      <td className='px-4 py-3 font-medium'>{t(`${key}.info.${code}.scope`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className='overflow-hidden rounded-xl border border-outline-variant/40 bg-white'>
            <div className='border-b border-outline-variant/30 px-5 py-4'>
              <h2 className='text-base font-bold'>{t(`${key}.matrixTitle`)}</h2>
              <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.matrixHint`)}</p>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-190 text-left text-sm'>
                <thead className='bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
                  <tr>
                    <th className='px-4 py-3' scope='col'>
                      {t(`${key}.permission`)}
                    </th>
                    {builtIns.map((role) => (
                      <th className='px-4 py-3 text-center' key={role.roleCode} scope='col'>
                        {t(`admin.identity.roles.${role.roleCode as (typeof BUILT_IN_ROLES)[number]}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/25'>
                  {allPermissions.map((permission) => (
                    <tr key={permission.id}>
                      <th className='px-4 py-3 font-normal' scope='row'>
                        <PermissionText permission={permission} />
                      </th>
                      {builtIns.map((role) => {
                        const has = role.permissions?.includes(permission.permissionCode ?? '')
                        return (
                          <td className='px-4 py-3 text-center' key={role.roleCode}>
                            <Icon
                              className={has ? 'text-xl text-primary' : 'text-xl text-outline-variant'}
                              name={has ? 'check_circle' : 'remove'}
                            />
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

          <section className='space-y-4 rounded-xl border border-outline-variant/40 bg-white p-5'>
            <div>
              <h2 className='text-base font-bold'>{t(`${key}.customTitle`)}</h2>
              <p className='mt-2 flex items-start gap-2 rounded-lg bg-warning-container px-3 py-2 text-sm text-on-warning-container'>
                <Icon className='mt-0.5 text-lg' name='info' />
                {t(`${key}.customWarning`)}
              </p>
            </div>
            {customs.length === 0 ? (
              <p className='text-sm text-on-surface-variant'>{t(`${key}.noCustom`)}</p>
            ) : (
              <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'>
                <ul className='divide-y divide-outline-variant/25 rounded-lg border border-outline-variant/40'>
                  {customs.map((role) => (
                    <li key={role.id}>
                      <button
                        aria-pressed={role.id === selectedId}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low ${role.id === selectedId ? 'bg-secondary-container/40' : ''}`}
                        onClick={() => {
                          setSelectedId(role.id ?? '')
                          setEdited(null)
                          setSaved(false)
                          save.reset()
                        }}
                        type='button'
                      >
                        <span className='min-w-0 flex-1'>
                          <strong className='block text-on-surface'>
                            {role.roleName ?? role.roleCode}
                            {role.active === false ? (
                              <span className='ml-2 text-xs font-medium text-on-surface-variant'>
                                {t(`${key}.inactive`)}
                              </span>
                            ) : null}
                          </strong>
                          <span className='block text-xs text-on-surface-variant'>
                            {role.description || t(`${key}.noDescription`)}
                          </span>
                        </span>
                        <span className='shrink-0 text-xs text-on-surface-variant'>
                          {t(`${key}.permissionCount`, { count: role.permissions?.length ?? 0 })}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {selected ? (
                  <div className='space-y-3'>
                    <h3 className='font-bold'>
                      {t(`${key}.permissionsOf`, { role: selected.roleName ?? selected.roleCode ?? '' })}
                    </h3>
                    <div className='space-y-2'>
                      {allPermissions.map((permission) => (
                        <label
                          className='flex cursor-pointer items-start gap-3 rounded-lg bg-surface-container-low p-3 hover:bg-secondary-container/30'
                          key={permission.id}
                        >
                          <input
                            checked={selectedPermissionIds.includes(permission.id!)}
                            className='mt-1 accent-primary'
                            disabled={!canManageRoles}
                            onChange={(event) => {
                              setSaved(false)
                              setEdited(
                                event.target.checked
                                  ? [...selectedPermissionIds, permission.id!]
                                  : selectedPermissionIds.filter((item) => item !== permission.id)
                              )
                            }}
                            type='checkbox'
                          />
                          <PermissionText permission={permission} />
                        </label>
                      ))}
                    </div>
                    {saveFailure && saveFailure.kind !== 'field' ? (
                      <FormAlert tone={saveFailure.kind === 'system' ? 'error' : 'warning'}>
                        {t(saveFailure.key)}
                      </FormAlert>
                    ) : null}
                    {canManageRoles ? (
                      <div className='flex items-center gap-3'>
                        <Button disabled={edited === null} onClick={() => setConfirming(true)} size='sm'>
                          {t(`${key}.save`)}
                        </Button>
                        {saved ? (
                          <p className='text-sm text-on-surface-variant' role='status'>
                            {t(`${key}.saved`)}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </>
      )}
      <ConfirmDialog
        confirmLabel={t(`${key}.save`)}
        description={t(`${key}.confirmSave`)}
        loading={save.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => save.mutate()}
        open={confirming}
        title={t(`${key}.confirmTitle`, { role: selected?.roleName ?? selected?.roleCode ?? '' })}
        tone='primary'
      />
      {creating ? (
        <CreateRoleDialog
          onClose={() => setCreating(false)}
          onCreated={(role) => {
            setCreating(false)
            setSelectedId(role.id ?? '')
            setEdited(null)
          }}
        />
      ) : null}
    </main>
  )
}
