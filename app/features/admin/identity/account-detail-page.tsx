import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { isForbiddenError } from '~/features/shared/auth/session-api'
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
const inputClass = 'w-full rounded-lg border border-outline-variant bg-white px-3 py-2'

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
    <div className='mx-auto max-w-4xl space-y-6 p-5 sm:p-8'>
      <Link className='text-primary underline' to='/admin/accounts'>
        {t('admin.identity.back')}
      </Link>
      <h1 className='text-2xl font-bold'>{t('admin.identity.detail')}</h1>
      {message && (
        <p role='status' className='rounded-lg bg-surface-container p-3'>
          {message}
        </p>
      )}
      {user.isPending ? (
        <p role='status'>{t('admin.identity.loading')}</p>
      ) : user.isError ? (
        <div role='alert'>
          <p>{t(isForbiddenError(user.error) ? 'admin.identity.forbidden' : 'admin.identity.error')}</p>
          <button onClick={() => void user.refetch()} type='button'>
            {t('admin.identity.retry')}
          </button>
        </div>
      ) : (
        <>
          <section className='space-y-3 rounded-xl border border-outline-variant bg-white p-5'>
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
              <form className='grid gap-3 sm:grid-cols-2' onSubmit={submit}>
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
                  className='rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50'
                  disabled={update.isPending}
                  type='submit'
                >
                  {t('admin.identity.save')}
                </button>
              </form>
            )}
            {canManage && !isSelf && (
              <div className='flex flex-wrap gap-3'>
                <button
                  className='rounded-lg border px-4 py-2 disabled:opacity-50'
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
                  className='rounded-lg border border-error px-4 py-2 text-error disabled:opacity-50'
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
          <section className='space-y-4 rounded-xl border border-outline-variant bg-white p-5'>
            <h2 className='text-lg font-semibold'>{t('admin.identity.role')}</h2>
            {user.data.roles?.length ? (
              <ul className='space-y-2'>
                {user.data.roles.map((code) => (
                  <li className='flex items-center justify-between gap-3 border-b py-2' key={code}>
                    <span>{code}</span>
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
                <div className='flex flex-wrap gap-2'>
                  <select
                    aria-label={t('admin.identity.role')}
                    className={inputClass}
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
                    className='rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50'
                    disabled={!roleId || assignment.isPending}
                    onClick={() => assignment.mutate(roleId)}
                    type='button'
                  >
                    {t('admin.identity.assignRole')}
                  </button>
                </div>
              ))}
          </section>
        </>
      )}
    </div>
  )
}
