import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { addRole, fetchPermissions, fetchRoles, saveRolePermissions } from './identity-api'

const key = 'admin.identity' as const
const builtIn = new Set(['ADMIN', 'CENTER_MANAGER', 'CAREGIVER', 'CUSTOMER'])
const inputClass =
  'mt-1 block w-full rounded-lg bg-surface-container-low px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'

export function RolesPage() {
  const { t, i18n } = useTranslation()
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
  const [showCreate, setShowCreate] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [kind, setKind] = useState('all')
  const current = roles.data?.find((role) => role.id === selectedRole)
  const canManageRoles = authUser?.permissions?.includes('role:manage')
  const selectedPermissions =
    editedPermissions ??
    permissions.data
      ?.filter((permission) => permission.id && current?.permissions?.includes(permission.permissionCode ?? ''))
      .map((permission) => permission.id!) ??
    []
  const visible =
    roles.data?.filter((role) => {
      const matchesSearch =
        !keyword ||
        [role.roleCode, role.roleName, role.description].some((value) =>
          value?.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase())
        )
      return matchesSearch && (kind === 'all' || (kind === 'builtin') === builtIn.has(role.roleCode ?? ''))
    }) ?? []
  const metrics = [
    { label: 'rolesMetricTotal', value: roles.data?.length ?? 0, icon: 'admin_panel_settings' },
    {
      label: 'rolesMetricBuiltin',
      value: roles.data?.filter((role) => builtIn.has(role.roleCode ?? '')).length ?? 0,
      icon: 'shield'
    },
    {
      label: 'rolesMetricCustom',
      value: roles.data?.filter((role) => !builtIn.has(role.roleCode ?? '')).length ?? 0,
      icon: 'manage_accounts'
    },
    { label: 'rolesMetricPermissions', value: permissions.data?.length ?? 0, icon: 'key' }
  ] as const
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  useDocumentTitle(t(`${key}.rolesTitle`))
  const create = useMutation({
    mutationFn: () =>
      addRole({ roleCode: roleCode.trim(), roleName: roleName.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      setMessage(t(`${key}.created`))
      setRoleCode('')
      setRoleName('')
      setDescription('')
      setShowCreate(false)
      void client.invalidateQueries({ queryKey: ['identity', 'roles'] })
    },
    onError: () => setMessage(t(`${key}.actionError`))
  })
  const update = useMutation({
    mutationFn: () => saveRolePermissions(selectedRole, { permissionIds: selectedPermissions }),
    onSuccess: () => {
      setMessage(t(`${key}.saved`))
      setEditedPermissions(null)
      void client.invalidateQueries({ queryKey: ['identity', 'roles'] })
    },
    onError: () => setMessage(t(`${key}.actionError`))
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!/^[A-Z][A-Z0-9_]{1,63}$/.test(roleCode)) {
      setMessage(t(`${key}.invalidRoleCode`))
      return
    }
    create.mutate()
  }

  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <nav aria-label={t('admin.menu')} className='flex items-center gap-2 text-xs text-outline'>
        <Link to='/admin/dashboard'>{t('admin.dashboard')}</Link>
        <Icon className='text-sm' name='chevron_right' />
        <span className='text-primary'>{t(`${key}.rolesTitle`)}</span>
      </nav>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.rolesTitle`)}</h1>
          <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.rolesSubtitle`)}</p>
        </div>
        {canManageRoles && (
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            onClick={() => {
              setMessage('')
              setShowCreate(true)
            }}
            type='button'
          >
            <Icon name='add' />
            {t(`${key}.createRole`)}
          </button>
        )}
      </header>
      {!canManageRoles && (
        <p className='rounded-xl bg-error-container p-4 text-sm text-on-error-container' role='alert'>
          {t(`${key}.forbidden`)}
        </p>
      )}
      {message && !showCreate && (
        <p className='rounded-lg bg-secondary-container px-4 py-3 text-sm text-primary' role='status'>
          {message}
        </p>
      )}
      <section aria-label={t(`${key}.rolesMetricsTitle`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metrics.map((metric) => (
          <div className='rounded-xl bg-white p-5 shadow-sm' key={metric.label}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
              <span>{t(`${key}.${metric.label}`)}</span>
              <Icon className='text-xl text-primary' name={metric.icon} />
            </div>
            <strong className='mt-4 block text-3xl tabular-nums'>
              {roles.isSuccess && permissions.isSuccess ? number.format(metric.value) : '—'}
            </strong>
            <p className='mt-2 text-xs text-outline'>{t(`${key}.rolesMetricsHint`)}</p>
          </div>
        ))}
      </section>
      <section aria-label={t(`${key}.rolesFiltersTitle`)} className='space-y-4 rounded-xl bg-white p-5 shadow-sm'>
        <div className='relative'>
          <Icon className='absolute left-3 top-3 text-xl text-outline' name='search' />
          <input
            aria-label={t(`${key}.searchRoles`)}
            className='w-full rounded-lg bg-surface-container-low py-3 pl-11 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t(`${key}.searchRoles`)}
            type='search'
            value={keyword}
          />
        </div>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap gap-2'>
            {(['all', 'builtin', 'custom'] as const).map((option) => (
              <button
                aria-pressed={kind === option}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${kind === option ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-secondary-container'}`}
                key={option}
                onClick={() => setKind(option)}
                type='button'
              >
                {t(`${key}.roleKinds.${option}`)}
              </button>
            ))}
          </div>
          <span className='text-sm text-on-surface-variant'>{t(`${key}.rolesResults`, { count: visible.length })}</span>
        </div>
      </section>
      {roles.isPending || permissions.isPending ? (
        <p className='rounded-xl bg-white p-8' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : roles.isError || permissions.isError ? (
        <div className='rounded-xl bg-white p-8' role='alert'>
          <p>{t(isForbiddenError(roles.error ?? permissions.error) ? `${key}.forbidden` : `${key}.error`)}</p>
          <button
            className='mt-2 font-semibold text-primary underline'
            onClick={() => {
              void roles.refetch()
              void permissions.refetch()
            }}
            type='button'
          >
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : (
        <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]'>
          <section aria-label={t(`${key}.rolesListTitle`)} className='overflow-hidden rounded-xl bg-white shadow-sm'>
            <div className='border-b border-outline-variant/20 bg-surface-container-low px-5 py-4 text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
              {t(`${key}.rolesListTitle`)}
            </div>
            {visible.length ? (
              visible.map((role) => (
                <button
                  className={`flex w-full items-center gap-4 border-b border-outline-variant/20 px-5 py-4 text-left transition-colors hover:bg-surface-container-low/70 ${selectedRole === role.id ? 'bg-secondary-container/30' : ''}`}
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id ?? '')
                    setEditedPermissions(null)
                  }}
                  type='button'
                >
                  <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-primary'>
                    <Icon name={builtIn.has(role.roleCode ?? '') ? 'shield' : 'manage_accounts'} />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <strong className='block truncate'>
                      {role.roleName} ({role.roleCode})
                    </strong>
                    <small className='mt-1 block truncate text-on-surface-variant'>
                      {role.description || t(`${key}.noDescription`)}
                    </small>
                    <small className='mt-1 block text-outline'>
                      {t(`${key}.permissionCount`, { count: role.permissions?.length ?? 0 })}
                    </small>
                  </span>
                  <Icon className='text-outline' name='chevron_right' />
                </button>
              ))
            ) : (
              <p className='p-8 text-center text-sm text-outline'>{t(`${key}.empty`)}</p>
            )}
          </section>
          <section aria-label={t(`${key}.rolePermissions`)} className='rounded-xl bg-white p-5 shadow-sm'>
            {current ? (
              <>
                <div className='flex items-start justify-between gap-3 border-b border-outline-variant/20 pb-5'>
                  <div>
                    <h2 className='text-lg font-bold'>
                      {t(`${key}.rolePermissions`)}: {current.roleName}
                    </h2>
                    <p className='mt-1 text-sm text-on-surface-variant'>{current.roleCode}</p>
                  </div>
                  <span className='rounded-lg bg-secondary-container px-2 py-1 text-xs font-semibold text-primary'>
                    {t(`${key}.roleKinds.${builtIn.has(current.roleCode ?? '') ? 'builtin' : 'custom'}`)}
                  </span>
                </div>
                {builtIn.has(current.roleCode ?? '') || !canManageRoles ? (
                  <>
                    <p className='mt-5 rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant'>
                      {t(`${key}.builtinRole`)}
                    </p>
                    <div className='mt-4 flex flex-wrap gap-2'>
                      {current.permissions?.map((code) => (
                        <span
                          className='rounded-md bg-secondary-container/50 px-2 py-1 text-xs text-primary'
                          key={code}
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                    {!current.permissions?.length && (
                      <p className='mt-4 text-sm text-outline'>{t(`${key}.noPermissions`)}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className='mt-4 text-sm text-on-surface-variant'>{t(`${key}.selectPermissionsHint`)}</p>
                    <div className='mt-4 max-h-[420px] space-y-2 overflow-y-auto'>
                      {permissions.data.map(
                        (permission) =>
                          permission.id && (
                            <label
                              className='flex cursor-pointer items-start gap-3 rounded-lg bg-surface-container-low p-3 hover:bg-secondary-container/30'
                              key={permission.id}
                            >
                              <input
                                checked={selectedPermissions.includes(permission.id)}
                                className='mt-1 accent-primary'
                                onChange={(event) =>
                                  setEditedPermissions(
                                    event.target.checked
                                      ? [...selectedPermissions, permission.id!]
                                      : selectedPermissions.filter((id) => id !== permission.id)
                                  )
                                }
                                type='checkbox'
                              />
                              <span>
                                <strong className='block text-sm'>
                                  {permission.permissionName ?? permission.permissionCode}
                                </strong>
                                <small className='text-xs text-outline'>{permission.permissionCode}</small>
                              </span>
                            </label>
                          )
                      )}
                    </div>
                    <button
                      className='mt-5 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50'
                      disabled={update.isPending}
                      onClick={() => {
                        if (window.confirm(t(`${key}.confirmPermissions`))) update.mutate()
                      }}
                      type='button'
                    >
                      {t(`${key}.save`)}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className='flex min-h-64 flex-col items-center justify-center text-center'>
                <Icon className='text-4xl text-primary' name='admin_panel_settings' />
                <h2 className='mt-3 font-bold'>{t(`${key}.selectRoleTitle`)}</h2>
                <p className='mt-2 max-w-xs text-sm text-on-surface-variant'>{t(`${key}.selectRoleHint`)}</p>
              </div>
            )}
          </section>
        </div>
      )}
      {showCreate && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false)
          }}
        >
          <section
            aria-labelledby='create-role-title'
            aria-modal='true'
            className='max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl'
            role='dialog'
          >
            <div className='mb-5 flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-xl font-bold' id='create-role-title'>
                  {t(`${key}.createRole`)}
                </h2>
                <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.createRoleHint`)}</p>
              </div>
              <button
                aria-label={t(`${key}.cancel`)}
                className='rounded-lg p-1 hover:bg-surface-container-low'
                onClick={() => setShowCreate(false)}
                type='button'
              >
                <Icon name='close' />
              </button>
            </div>
            {message && (
              <p className='mb-4 rounded-lg bg-error-container p-3 text-sm text-on-error-container' role='status'>
                {message}
              </p>
            )}
            <form className='grid gap-4 sm:grid-cols-2' onSubmit={submit}>
              <label className='text-sm font-semibold'>
                {t(`${key}.roleCode`)}
                <input
                  className={inputClass}
                  onChange={(event) => setRoleCode(event.target.value.toUpperCase())}
                  required
                  value={roleCode}
                />
              </label>
              <label className='text-sm font-semibold'>
                {t(`${key}.roleName`)}
                <input
                  className={inputClass}
                  onChange={(event) => setRoleName(event.target.value)}
                  required
                  value={roleName}
                />
              </label>
              <label className='text-sm font-semibold sm:col-span-2'>
                {t(`${key}.description`)}
                <textarea
                  className={inputClass}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  value={description}
                />
              </label>
              <div className='flex justify-end gap-3 sm:col-span-2'>
                <button
                  className='rounded-lg px-4 py-2 font-semibold text-on-surface-variant hover:bg-surface-container-low'
                  onClick={() => setShowCreate(false)}
                  type='button'
                >
                  {t(`${key}.cancel`)}
                </button>
                <button
                  className='rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50'
                  disabled={create.isPending}
                  type='submit'
                >
                  {t(`${key}.createRole`)}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
