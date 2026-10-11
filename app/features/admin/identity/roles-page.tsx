import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import { addRole, fetchPermissions, fetchRoles, saveRolePermissions } from './identity-api'

const builtIn = new Set(['ADMIN', 'CENTER_MANAGER', 'CAREGIVER', 'CUSTOMER'])
const inputClass = 'w-full rounded-lg border border-outline-variant bg-white px-3 py-2'

export function RolesPage() {
  const { t } = useTranslation()
  const authUser = useAuthUser()
  const client = useQueryClient()
  const roles = useQuery({ queryKey: ['identity', 'roles'], queryFn: fetchRoles, retry: false })
  const permissions = useQuery({ queryKey: ['identity', 'permissions'], queryFn: fetchPermissions, retry: false })
  const [roleCode, setRoleCode] = useState('')
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [editedPermissions, setEditedPermissions] = useState<string[] | null>(null)
  const [message, setMessage] = useState('')
  const current = roles.data?.find((role) => role.id === selectedRole)
  const canManageRoles = authUser?.permissions?.includes('role:manage')
  const selectedPermissions =
    editedPermissions ??
    permissions.data
      ?.filter((permission) => permission.id && current?.permissions?.includes(permission.permissionCode ?? ''))
      .map((permission) => permission.id!) ??
    []
  const create = useMutation({
    mutationFn: () =>
      addRole({ roleCode: roleCode.trim(), roleName: roleName.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      setMessage(t('admin.identity.created'))
      setRoleCode('')
      setRoleName('')
      setDescription('')
      void client.invalidateQueries({ queryKey: ['identity', 'roles'] })
    },
    onError: () => setMessage(t('admin.identity.actionError'))
  })
  const update = useMutation({
    mutationFn: () => saveRolePermissions(selectedRole, { permissionIds: selectedPermissions }),
    onSuccess: () => {
      setMessage(t('admin.identity.saved'))
      setEditedPermissions(null)
      void client.invalidateQueries({ queryKey: ['identity', 'roles'] })
    },
    onError: () => setMessage(t('admin.identity.actionError'))
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!/^[A-Z][A-Z0-9_]{1,63}$/.test(roleCode)) {
      setMessage(t('admin.identity.invalidRoleCode'))
      return
    }
    create.mutate()
  }
  return (
    <div className='mx-auto max-w-5xl space-y-6 p-5 sm:p-8'>
      <h1 className='text-2xl font-bold'>{t('admin.identity.rolesTitle')}</h1>
      {!canManageRoles && <p role='alert'>{t('admin.identity.forbidden')}</p>}
      {message && (
        <p role='status' className='rounded-lg bg-surface-container p-3'>
          {message}
        </p>
      )}
      {canManageRoles && (
        <form
          className='grid gap-4 rounded-xl border border-outline-variant bg-white p-5 sm:grid-cols-2'
          onSubmit={submit}
        >
          <h2 className='text-lg font-semibold sm:col-span-2'>{t('admin.identity.createRole')}</h2>
          <label>
            {t('admin.identity.roleCode')}
            <input
              className={inputClass}
              required
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
            />
          </label>
          <label>
            {t('admin.identity.roleName')}
            <input className={inputClass} required value={roleName} onChange={(e) => setRoleName(e.target.value)} />
          </label>
          <label className='sm:col-span-2'>
            {t('admin.identity.description')}
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <button
            className='rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50'
            disabled={create.isPending}
            type='submit'
          >
            {t('admin.identity.createRole')}
          </button>
        </form>
      )}
      {roles.isPending || permissions.isPending ? (
        <p role='status'>{t('admin.identity.loading')}</p>
      ) : roles.isError || permissions.isError ? (
        <div role='alert'>
          <p>
            {t(
              isForbiddenError(roles.error ?? permissions.error) ? 'admin.identity.forbidden' : 'admin.identity.error'
            )}
          </p>
          <button
            className='underline'
            onClick={() => {
              void roles.refetch()
              void permissions.refetch()
            }}
            type='button'
          >
            {t('admin.identity.retry')}
          </button>
        </div>
      ) : (
        <>
          {roles.data.length === 0 ? (
            <p>{t('admin.identity.empty')}</p>
          ) : (
            <div className='space-y-2'>
              {roles.data.map((role) => (
                <button
                  className={`block w-full rounded-lg border p-4 text-left ${selectedRole === role.id ? 'border-primary bg-secondary-container' : 'border-outline-variant bg-white'}`}
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id ?? '')
                    setEditedPermissions(null)
                  }}
                  type='button'
                >
                  <strong>{role.roleName}</strong>{' '}
                  <span className='text-sm text-on-surface-variant'>({role.roleCode})</span>
                  <p className='text-sm'>{role.description}</p>
                  <p className='text-xs text-on-surface-variant'>
                    {role.permissions?.join(', ') || t('admin.identity.noPermissions')}
                  </p>
                </button>
              ))}
            </div>
          )}
          {current && (
            <section className='space-y-4 rounded-xl border border-outline-variant bg-white p-5'>
              <h2 className='text-lg font-semibold'>
                {t('admin.identity.rolePermissions')}: {current.roleName}
              </h2>
              {builtIn.has(current.roleCode ?? '') || !canManageRoles ? (
                <p>{t('admin.identity.builtinRole')}</p>
              ) : (
                <>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {permissions.data.map(
                      (permission) =>
                        permission.id && (
                          <label className='flex items-start gap-2' key={permission.id}>
                            <input
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={(e) =>
                                setEditedPermissions(
                                  e.target.checked
                                    ? [...selectedPermissions, permission.id!]
                                    : selectedPermissions.filter((id) => id !== permission.id)
                                )
                              }
                              type='checkbox'
                            />
                            <span>
                              <strong>{permission.permissionName ?? permission.permissionCode}</strong>
                              <small className='block text-on-surface-variant'>{permission.permissionCode}</small>
                            </span>
                          </label>
                        )
                    )}
                  </div>
                  <button
                    className='rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50'
                    disabled={update.isPending}
                    onClick={() => {
                      if (window.confirm(t('admin.identity.confirmPermissions'))) update.mutate()
                    }}
                    type='button'
                  >
                    {t('admin.identity.save')}
                  </button>
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
