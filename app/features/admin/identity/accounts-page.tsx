import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { addUser, fetchUsers } from './identity-api'

const size = 20
const inputClass = 'w-full rounded-lg border border-outline-variant bg-white px-3 py-2'

export function AccountsPage() {
  const { t } = useTranslation()
  const authUser = useAuthUser()
  const client = useQueryClient()
  const [search, setSearch] = useSearchParams()
  const page = Math.max(0, Number.parseInt(search.get('page') || '0', 10) || 0)
  const users = useQuery({ queryKey: ['identity', 'users', page], queryFn: () => fetchUsers(page, size), retry: false })
  const [showCreate, setShowCreate] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [roleCode, setRoleCode] = useState<'CUSTOMER' | 'CENTER_MANAGER'>('CUSTOMER')
  const [centerId, setCenterId] = useState('')
  const [message, setMessage] = useState('')
  const create = useMutation({
    mutationFn: () =>
      addUser({
        email: email.trim(),
        fullName: fullName.trim(),
        phoneNumber: phone.trim() || undefined,
        roleCode,
        centerId: roleCode === 'CENTER_MANAGER' ? centerId.trim() : undefined
      }),
    onSuccess: () => {
      setMessage(t('admin.identity.created'))
      setShowCreate(false)
      setEmail('')
      setFullName('')
      setPhone('')
      setCenterId('')
      void client.invalidateQueries({ queryKey: ['identity', 'users'] })
    },
    onError: () => setMessage(t('admin.identity.actionError'))
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (phone && !/^\d{10,11}$/.test(phone)) {
      setMessage(t('admin.identity.invalidPhone'))
      return
    }
    if (roleCode === 'CENTER_MANAGER' && !centerId.trim()) {
      setMessage(t('admin.identity.requiredCenter'))
      return
    }
    create.mutate()
  }
  const canCreateCustomer = authUser?.permissions?.includes('user:manage')
  const canCreateManager = authUser?.permissions?.includes('manager:create')
  return (
    <div className='mx-auto max-w-6xl space-y-6 p-5 sm:p-8'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold'>{t('admin.identity.accountsTitle')}</h1>
        {(canCreateCustomer || canCreateManager) && (
          <button
            className='rounded-lg bg-primary px-4 py-2 font-semibold text-white'
            onClick={() => {
              if (!canCreateCustomer) setRoleCode('CENTER_MANAGER')
              setShowCreate(!showCreate)
            }}
            type='button'
          >
            {t('admin.identity.createAccount')}
          </button>
        )}
      </div>
      {message && (
        <p role='status' className='rounded-lg bg-surface-container px-4 py-3'>
          {message}
        </p>
      )}
      {showCreate && (
        <form
          className='grid gap-4 rounded-xl border border-outline-variant bg-white p-5 sm:grid-cols-2'
          onSubmit={submit}
        >
          <label className='text-sm'>
            {t('admin.identity.email')}
            <input
              className={inputClass}
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className='text-sm'>
            {t('admin.identity.fullName')}
            <input
              className={inputClass}
              required
              maxLength={255}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label className='text-sm'>
            {t('admin.identity.phone')}
            <input
              className={inputClass}
              inputMode='numeric'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className='text-sm'>
            {t('admin.identity.role')}
            <select
              className={inputClass}
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value as 'CUSTOMER' | 'CENTER_MANAGER')}
            >
              {canCreateCustomer && <option value='CUSTOMER'>{t('admin.identity.customer')}</option>}
              {canCreateManager && <option value='CENTER_MANAGER'>{t('admin.identity.manager')}</option>}
            </select>
          </label>
          {roleCode === 'CENTER_MANAGER' && (
            <label className='text-sm'>
              {t('admin.identity.centerId')}
              <input className={inputClass} value={centerId} onChange={(e) => setCenterId(e.target.value)} />
            </label>
          )}
          <p className='sm:col-span-2 text-sm text-on-surface-variant'>{t('admin.identity.accountSetup')}</p>
          <button
            className='rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50'
            disabled={create.isPending}
            type='submit'
          >
            {t('admin.identity.createAccount')}
          </button>
        </form>
      )}
      {users.isPending ? (
        <p role='status'>{t('admin.identity.loading')}</p>
      ) : users.isError ? (
        <div role='alert'>
          <p>{t(isForbiddenError(users.error) ? 'admin.identity.forbidden' : 'admin.identity.error')}</p>
          <button className='mt-2 underline' onClick={() => void users.refetch()} type='button'>
            {t('admin.identity.retry')}
          </button>
        </div>
      ) : users.data.length === 0 ? (
        <p>{t('admin.identity.empty')}</p>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-outline-variant bg-white'>
          <table className='w-full min-w-[600px] text-left text-sm'>
            <thead className='bg-surface-container'>
              <tr>
                <th className='p-3'>{t('admin.identity.fullName')}</th>
                <th className='p-3'>{t('admin.identity.email')}</th>
                <th className='p-3'>{t('admin.identity.role')}</th>
                <th className='p-3'>{t('admin.identity.status')}</th>
                <th className='p-3'></th>
              </tr>
            </thead>
            <tbody>
              {users.data.map((user) => (
                <tr className='border-t border-outline-variant' key={user.id}>
                  <td className='p-3'>{user.fullName}</td>
                  <td className='p-3'>{user.email}</td>
                  <td className='p-3'>{user.roles?.join(', ')}</td>
                  <td className='p-3'>
                    {t(user.status === 'ACTIVE' ? 'admin.identity.active' : 'admin.identity.locked')}
                  </td>
                  <td className='p-3'>
                    {user.id && (
                      <Link className='font-semibold text-primary underline' to={`/admin/accounts/${user.id}`}>
                        {t('admin.identity.detail')}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className='flex gap-3'>
        <button
          className='rounded-lg border px-4 py-2 disabled:opacity-40'
          disabled={page === 0}
          onClick={() => setSearch({ page: String(page - 1) })}
          type='button'
        >
          {t('admin.identity.previous')}
        </button>
        <button
          className='rounded-lg border px-4 py-2 disabled:opacity-40'
          disabled={!users.data || users.data.length < size}
          onClick={() => setSearch({ page: String(page + 1) })}
          type='button'
        >
          {t('admin.identity.next')}
        </button>
      </div>
    </div>
  )
}
