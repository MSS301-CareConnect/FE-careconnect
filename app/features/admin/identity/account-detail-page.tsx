import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import {
  addUserRole,
  changeUserStatus,
  fetchRoles,
  fetchUser,
  removeUser,
  removeUserRole,
  saveUser
} from './identity-api'

const builtIn = ['CUSTOMER', 'CAREGIVER', 'CENTER_MANAGER', 'ADMIN']
const inputClass =
  'mt-1 block w-full rounded-lg bg-surface-container-low px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'

export function AccountDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const authUser = useAuthUser()
  const client = useQueryClient()
  const user = useQuery({
    queryKey: ['identity', 'user', id],
    queryFn: () => fetchUser(id),
    enabled: Boolean(id),
    retry: false
  })
  const roles = useQuery({
    queryKey: ['identity', 'roles'],
    queryFn: fetchRoles,
    retry: false,
    enabled: authUser?.permissions?.includes('role:manage')
  })
  const [fullName, setFullName] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [roleId, setRoleId] = useState('')
  const [message, setMessage] = useState('')
  function refresh() {
    void client.invalidateQueries({ queryKey: ['identity', 'users'] })
    void client.invalidateQueries({ queryKey: ['identity', 'user', id] })
  }
  const update = useMutation({
    mutationFn: () =>
      saveUser(id, {
        fullName: (fullName ?? user.data?.fullName ?? '').trim(),
        phoneNumber: (phone ?? user.data?.phoneNumber ?? '').trim() || undefined
      }),
    onSuccess: () => {
      setMessage(t('admin.identity.saved'))
      refresh()
    },
    onError: () => setMessage(t('admin.identity.actionError'))
  })
  const status = useMutation({
    mutationFn: (value: 'ACTIVE' | 'LOCKED') => changeUserStatus(id, value),
    onSuccess: () => {
      setMessage(t('admin.identity.saved'))
      refresh()
    },
    onError: () => setMessage(t('admin.identity.actionError'))
  })
  const deletion = useMutation({
    mutationFn: () => removeUser(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['identity', 'users'] })
      navigate('/admin/accounts')
    },
    onError: () => setMessage(t('admin.identity.actionError'))
  })
  const assignment = useMutation({
    mutationFn: (selected: string) => addUserRole(id, selected),
    onSuccess: () => {
      setMessage(t('admin.identity.saved'))
      refresh()
    },
    onError: () => setMessage(t('admin.identity.actionError'))
  })
  const revocation = useMutation({
    mutationFn: (selected: string) => removeUserRole(id, selected),
    onSuccess: () => {
      setMessage(t('admin.identity.saved'))
      refresh()
    },
    onError: () => setMessage(t('admin.identity.actionError'))
  })
  const canManage = authUser?.permissions?.includes('user:manage')
  const canManageRoles = authUser?.permissions?.includes('role:manage')
  const isSelf = authUser?.id === id
  useDocumentTitle(t('admin.identity.detail'))
  function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (phone && !/^\d{10,11}$/.test(phone)) {
      setMessage(t('admin.identity.invalidPhone'))
      return
    }
    update.mutate()
  }
  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-center gap-4'>
        <span className='flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container text-2xl font-bold text-primary'>
          {user.data?.fullName
            ?.split(' ')
            .slice(-2)
            .map((part) => part[0])
            .join('') || <Icon name='person' />}
        </span>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {user.data?.fullName || t('admin.identity.detail')}
          </h1>
          <p className='mt-1 text-sm text-on-surface-variant'>
            {user.data?.email || t('admin.identity.accountDetailSubtitle')}
          </p>
        </div>
      </header>
      {message && (
        <p role='status' className='rounded-lg bg-surface-container p-3'>
          {message}
        </p>
      )}
      {user.isPending ? (
        <p className='rounded-xl bg-white p-8' role='status'>
          {t('admin.identity.loading')}
        </p>
      ) : user.isError ? (
        <div className='rounded-xl bg-white p-8' role='alert'>
          <p>{t(isForbiddenError(user.error) ? 'admin.identity.forbidden' : 'admin.identity.error')}</p>
          <button
            className='mt-2 font-semibold text-primary underline'
            onClick={() => void user.refetch()}
            type='button'
          >
            {t('admin.identity.retry')}
          </button>
        </div>
      ) : (
        <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]'>
          <section className='space-y-5 rounded-xl bg-white p-6 shadow-sm'>
            <div className='flex items-center gap-3 border-b border-outline-variant/20 pb-4'>
              <Icon className='text-xl text-primary' name='badge' />
              <h2 className='text-lg font-bold'>{t('admin.identity.accountInformation')}</h2>
            </div>
            <p>
              <strong>{t('admin.identity.email')}:</strong> {user.data.email}
            </p>
            <p>
              <strong>{t('admin.identity.status')}:</strong>{' '}
              {t(user.data.status === 'ACTIVE' ? 'admin.identity.active' : 'admin.identity.locked')}
            </p>
            {user.data.centerId && (
              <p>
                <strong>{t('admin.identity.centerId')}:</strong> {user.data.centerId}
              </p>
            )}
            {canManage && (
              <form className='grid gap-4 border-t border-outline-variant/20 pt-5 sm:grid-cols-2' onSubmit={submit}>
                <label>
                  {t('admin.identity.fullName')}
                  <input
                    className={inputClass}
                    maxLength={255}
                    required
                    value={fullName ?? user.data.fullName ?? ''}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </label>
                <label>
                  {t('admin.identity.phone')}
                  <input
                    className={inputClass}
                    inputMode='numeric'
                    value={phone ?? user.data.phoneNumber ?? ''}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <button
                  className='rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2 sm:justify-self-start'
                  disabled={update.isPending}
                  type='submit'
                >
                  {t('admin.identity.save')}
                </button>
              </form>
            )}
            {canManage && !isSelf && (
              <div className='flex flex-wrap gap-3 border-t border-outline-variant/20 pt-5'>
                <button
                  className='rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold disabled:opacity-50'
                  disabled={status.isPending}
                  onClick={() => {
                    if (window.confirm(t('admin.identity.confirmLock')))
                      status.mutate(user.data.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE')
                  }}
                  type='button'
                >
                  {t(user.data.status === 'ACTIVE' ? 'admin.identity.lock' : 'admin.identity.unlock')}
                </button>
                <button
                  className='rounded-lg bg-error-container px-4 py-2 text-sm font-semibold text-on-error-container disabled:opacity-50'
                  disabled={deletion.isPending}
                  onClick={() => {
                    if (window.confirm(t('admin.identity.confirmDelete'))) deletion.mutate()
                  }}
                  type='button'
                >
                  {t('admin.identity.delete')}
                </button>
              </div>
            )}
          </section>
          <section className='space-y-5 rounded-xl bg-white p-6 shadow-sm'>
            <div className='flex items-center gap-3 border-b border-outline-variant/20 pb-4'>
              <Icon className='text-xl text-primary' name='admin_panel_settings' />
              <h2 className='text-lg font-bold'>{t('admin.identity.role')}</h2>
            </div>
            {user.data.roles?.length ? (
              <ul className='space-y-2'>
                {user.data.roles.map((code) => (
                  <li
                    className='flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-3'
                    key={code}
                  >
                    <span className='font-semibold text-primary'>{code}</span>
                    {canManageRoles && !isSelf && roles.data?.find((role) => role.roleCode === code)?.id && (
                      <button
                        className='text-error underline disabled:opacity-50'
                        disabled={revocation.isPending}
                        onClick={() => {
                          const selected = roles.data?.find((role) => role.roleCode === code)?.id
                          if (selected && window.confirm(t('admin.identity.confirmRevoke'))) revocation.mutate(selected)
                        }}
                        type='button'
                      >
                        {t('admin.identity.revokeRole')}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('admin.identity.noRoles')}</p>
            )}
            {canManageRoles &&
              !isSelf &&
              (roles.isPending ? (
                <p role='status'>{t('admin.identity.loading')}</p>
              ) : roles.isError ? (
                <p role='alert'>{t('admin.identity.rolesUnavailable')}</p>
              ) : (
                <div className='flex flex-wrap gap-2 border-t border-outline-variant/20 pt-5'>
                  <select
                    aria-label={t('admin.identity.role')}
                    className={`${inputClass} min-w-[180px] flex-1`}
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                  >
                    <option value=''>{t('admin.identity.role')}</option>
                    {roles.data
                      .filter(
                        (role) =>
                          role.id &&
                          role.roleCode &&
                          !user.data.roles?.includes(role.roleCode) &&
                          (builtIn.includes(role.roleCode) || role.active)
                      )
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.roleName ?? role.roleCode}
                        </option>
                      ))}
                  </select>
                  <button
                    className='rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50'
                    disabled={!roleId || assignment.isPending}
                    onClick={() => assignment.mutate(roleId)}
                    type='button'
                  >
                    {t('admin.identity.assignRole')}
                  </button>
                </div>
              ))}
          </section>
        </div>
      )}
    </main>
  )
}
