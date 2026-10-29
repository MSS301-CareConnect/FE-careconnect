import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'
import { useCenterOptions } from './hooks/use-center-options'
import { addUser, fetchUsers } from './identity-api'

const key = 'admin.identity' as const
// Built-in roles read as words; custom roles keep the code an administrator gave them.
const roleLabels: Record<string, 'customer' | 'manager' | 'roleCaregiver' | 'roleAdmin'> = {
  CUSTOMER: 'customer',
  CENTER_MANAGER: 'manager',
  CAREGIVER: 'roleCaregiver',
  ADMIN: 'roleAdmin'
}
const centerStatusKeys = {
  PENDING: 'admin.provider.pending',
  ACTIVE: 'admin.provider.active',
  INACTIVE: 'admin.provider.inactive',
  SUSPENDED: 'admin.provider.suspended',
  REJECTED: 'admin.provider.rejected',
  ARCHIVED: 'admin.provider.archived'
} as const
const size = 20
const inputClass =
  'mt-1 block w-full rounded-lg bg-surface-container-low px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'

export function AccountsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const authUser = useAuthUser()
  const client = useQueryClient()
  const [search, setSearch] = useSearchParams()
  const page = Math.max(0, Number.parseInt(search.get('page') || '0', 10) || 0)
  const keyword = search.get('q') ?? ''
  const statusFilter = search.get('status') ?? 'all'
  const roleFilter = search.get('role') ?? 'all'
  const users = useQuery({ queryKey: ['identity', 'users', page], queryFn: () => fetchUsers(page, size), retry: false })
  const [showCreate, setShowCreate] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [roleCode, setRoleCode] = useState<'CUSTOMER' | 'CENTER_MANAGER'>('CUSTOMER')
  const [centerId, setCenterId] = useState('')
  const [message, setMessage] = useState('')
  const centerOptions = useCenterOptions(showCreate && roleCode === 'CENTER_MANAGER')
  const canCreateCustomer = authUser?.permissions?.includes('user:manage')
  const canCreateManager = authUser?.permissions?.includes('manager:create')
  const rows = users.data?.content ?? []
  const visible = rows.filter((user) => {
    const matchesKeyword =
      !keyword ||
      [user.fullName, user.email, user.id, user.phoneNumber].some((value) =>
        value?.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase())
      )
    return (
      matchesKeyword &&
      (statusFilter === 'all' || user.status === statusFilter) &&
      (roleFilter === 'all' || user.roles?.includes(roleFilter))
    )
  })
  const metrics = [
    { label: 'accountsMetricTotal', value: rows.length, icon: 'groups' },
    {
      label: 'accountsMetricActive',
      value: rows.filter((user) => user.status === 'ACTIVE').length,
      icon: 'verified_user'
    },
    { label: 'accountsMetricLocked', value: rows.filter((user) => user.status === 'LOCKED').length, icon: 'lock' },
    {
      label: 'accountsMetricManagers',
      value: rows.filter((user) => user.roles?.includes('CENTER_MANAGER')).length,
      icon: 'manage_accounts'
    }
  ] as const
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  useDocumentTitle(t(`${key}.accountsTitle`))

  const create = useMutation({
    mutationFn: () =>
      addUser({
        email: email.trim(),
        fullName: fullName.trim(),
        phoneNumber: phone.trim() || undefined,
        roleCode,
        centerId: roleCode === 'CENTER_MANAGER' ? centerId : undefined
      }),
    onSuccess: () => {
      setMessage(t(`${key}.created`))
      setShowCreate(false)
      setEmail('')
      setFullName('')
      setPhone('')
      setCenterId('')
      void client.invalidateQueries({ queryKey: ['identity', 'users'] })
    },
    onError: () => setMessage(t(`${key}.actionError`))
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (phone && !/^\d{10,11}$/.test(phone)) {
      setMessage(t(`${key}.invalidPhone`))
      return
    }
    if (roleCode === 'CENTER_MANAGER' && !centerId) {
      setMessage(t(`${key}.requiredCenter`))
      return
    }
    create.mutate()
  }
  function update(name: string, value: string) {
    setSearch((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all') next.set(name, value)
      else next.delete(name)
      return next
    })
  }

  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.accountsTitle`)}</h1>
          <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.accountsSubtitle`)}</p>
        </div>
        {(canCreateCustomer || canCreateManager) && (
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            onClick={() => {
              if (!canCreateCustomer) setRoleCode('CENTER_MANAGER')
              setMessage('')
              setShowCreate(true)
            }}
            type='button'
          >
            <Icon name='person_add' />
            {t(`${key}.createAccount`)}
          </button>
        )}
      </header>
      <section aria-label={t(`${key}.accountsMetricsTitle`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metrics.map((metric) => (
          <div className='rounded-xl bg-white p-5 shadow-sm' key={metric.label}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
              <span>{t(`${key}.${metric.label}`)}</span>
              <Icon className='text-xl text-primary' name={metric.icon} />
            </div>
            <strong className='mt-4 block text-3xl tabular-nums'>
              {users.isSuccess ? number.format(metric.value) : '—'}
            </strong>
            <p className='mt-2 text-xs text-outline'>{t(`${key}.currentPageScope`)}</p>
          </div>
        ))}
      </section>
      {message && !showCreate && (
        <p className='rounded-lg bg-secondary-container px-4 py-3 text-sm text-primary' role='status'>
          {message}
        </p>
      )}
      <section aria-label={t(`${key}.accountsFiltersTitle`)} className='space-y-4 rounded-xl bg-white p-5 shadow-sm'>
        <div className='relative'>
          <Icon className='absolute left-3 top-3 text-xl text-outline' name='search' />
          <input
            aria-label={t(`${key}.searchAccounts`)}
            className='w-full rounded-lg bg-surface-container-low py-3 pl-11 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'
            onChange={(event) => update('q', event.target.value)}
            placeholder={t(`${key}.searchAccounts`)}
            type='search'
            value={keyword}
          />
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.status`)}
            <select
              className={inputClass}
              onChange={(event) => update('status', event.target.value)}
              value={statusFilter}
            >
              <option value='all'>{t(`${key}.allStatuses`)}</option>
              <option value='ACTIVE'>{t(`${key}.active`)}</option>
              <option value='LOCKED'>{t(`${key}.locked`)}</option>
            </select>
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.role`)}
            <select className={inputClass} onChange={(event) => update('role', event.target.value)} value={roleFilter}>
              <option value='all'>{t(`${key}.allRoles`)}</option>
              {['ADMIN', 'CENTER_MANAGER', 'CAREGIVER', 'CUSTOMER'].map((role) => (
                <option key={role} value={role}>
                  {t(`${key}.${roleLabels[role]}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className='flex items-center justify-between gap-3 text-sm'>
          <span className='text-on-surface-variant'>
            {t(`${key}.accountsResults`, { count: visible.length })} · {t(`${key}.currentPageScope`)}
          </span>
          <button
            className='font-semibold text-primary'
            onClick={() => setSearch({ page: String(page) })}
            type='button'
          >
            {t(`${key}.resetFilters`)}
          </button>
        </div>
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        {users.isPending ? (
          <p className='p-8' role='status'>
            {t(`${key}.loading`)}
          </p>
        ) : users.isError ? (
          <div className='p-8' role='alert'>
            <p>{t(isForbiddenError(users.error) ? `${key}.forbidden` : `${key}.error`)}</p>
            <button
              className='mt-2 font-semibold text-primary underline'
              onClick={() => void users.refetch()}
              type='button'
            >
              {t(`${key}.retry`)}
            </button>
          </div>
        ) : (
          <>
            <div className='max-h-[70vh] overflow-x-auto'>
              <table className='w-full min-w-[900px] text-left text-sm'>
                <thead className='sticky top-0 z-10 bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
                  <tr>
                    {(['fullName', 'email', 'phone', 'role', 'status', 'detail'] as const).map((column) => (
                      <th className='px-4 py-4' key={column} scope='col'>
                        {t(`${key}.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/20'>
                  {visible.map((user) => (
                    <tr
                      className={user.id ? 'cursor-pointer hover:bg-surface-container-low/60' : undefined}
                      key={user.id}
                      onClick={user.id ? () => navigate(`/admin/accounts/${user.id}`) : undefined}
                    >
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-3'>
                          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-primary'>
                            {user.fullName
                              ?.split(' ')
                              .slice(-2)
                              .map((part) => part[0])
                              .join('') || '—'}
                          </span>
                          <span>
                            {user.id ? (
                              <Link className='font-bold hover:text-primary' to={`/admin/accounts/${user.id}`}>
                                {user.fullName || user.email}
                              </Link>
                            ) : (
                              <strong>{user.fullName || user.email}</strong>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className='px-4 py-4'>{user.email || '—'}</td>
                      <td className='px-4 py-4 tabular-nums'>{user.phoneNumber || '—'}</td>
                      <td className='px-4 py-4'>
                        <div className='flex flex-wrap gap-1'>
                          {user.roles?.map((role) => (
                            <span
                              className='rounded-md bg-surface-container-low px-2 py-1 text-xs font-semibold'
                              key={role}
                            >
                              {roleLabels[role] ? t(`${key}.${roleLabels[role]}`) : role}
                            </span>
                          )) || '—'}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <StatusBadge tone={user.status === 'ACTIVE' ? 'success' : 'error'}>
                          {t(user.status === 'ACTIVE' ? `${key}.active` : `${key}.locked`)}
                        </StatusBadge>
                      </td>
                      <td className='px-4 py-4'>
                        {user.id && (
                          <Link
                            aria-label={`${t(`${key}.detail`)}: ${user.fullName || user.email}`}
                            className='inline-flex rounded-lg p-2 text-primary hover:bg-surface-container-low'
                            to={`/admin/accounts/${user.id}`}
                          >
                            <Icon name='visibility' />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!visible.length && <p className='p-8 text-center text-sm text-outline'>{t(`${key}.empty`)}</p>}
            <div className='flex items-center justify-between border-t border-outline-variant/25 px-4 py-4 text-sm'>
              <button
                className='font-semibold text-primary disabled:opacity-40'
                disabled={page === 0}
                onClick={() => update('page', String(page - 1))}
                type='button'
              >
                {t(`${key}.previous`)}
              </button>
              <span>{t(`${key}.pageNumber`, { page: page + 1 })}</span>
              <button
                className='font-semibold text-primary disabled:opacity-40'
                disabled={page + 1 >= (users.data?.totalPages ?? 0)}
                onClick={() => update('page', String(page + 1))}
                type='button'
              >
                {t(`${key}.next`)}
              </button>
            </div>
          </>
        )}
      </section>
      {showCreate && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false)
          }}
        >
          <section
            aria-labelledby='create-account-title'
            aria-modal='true'
            className='max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl'
            role='dialog'
          >
            <div className='mb-5 flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-xl font-bold' id='create-account-title'>
                  {t(`${key}.createAccount`)}
                </h2>
                <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.accountSetup`)}</p>
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
                {t(`${key}.email`)}
                <input
                  className={inputClass}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type='email'
                  value={email}
                />
              </label>
              <label className='text-sm font-semibold'>
                {t(`${key}.fullName`)}
                <input
                  className={inputClass}
                  maxLength={255}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  value={fullName}
                />
              </label>
              <label className='text-sm font-semibold'>
                {t(`${key}.phone`)}
                <input
                  className={inputClass}
                  inputMode='numeric'
                  onChange={(event) => setPhone(event.target.value)}
                  value={phone}
                />
              </label>
              <label className='text-sm font-semibold'>
                {t(`${key}.role`)}
                <select
                  className={inputClass}
                  onChange={(event) => setRoleCode(event.target.value as 'CUSTOMER' | 'CENTER_MANAGER')}
                  value={roleCode}
                >
                  {canCreateCustomer && <option value='CUSTOMER'>{t(`${key}.customer`)}</option>}
                  {canCreateManager && <option value='CENTER_MANAGER'>{t(`${key}.manager`)}</option>}
                </select>
              </label>
              {roleCode === 'CENTER_MANAGER' && (
                <div className='text-sm font-semibold sm:col-span-2'>
                  <label>
                    {t(`${key}.centerId`)}
                    <select
                      className={inputClass}
                      disabled={!centerOptions.isSuccess}
                      onChange={(event) => setCenterId(event.target.value)}
                      value={centerId}
                    >
                      <option disabled value=''>
                        {t(
                          centerOptions.isPending
                            ? `${key}.centerLoading`
                            : centerOptions.isError
                              ? `${key}.centerUnavailable`
                              : `${key}.chooseCenter`
                        )}
                      </option>
                      {(centerOptions.data ?? []).map((center) => (
                        <option key={center.id} value={center.id}>
                          {center.centerStatus === 'ACTIVE'
                            ? center.centerName
                            : t(`${key}.centerWithStatus`, {
                                name: center.centerName,
                                status: t(centerStatusKeys[center.centerStatus])
                              })}
                        </option>
                      ))}
                    </select>
                  </label>
                  {centerOptions.isError ? (
                    <p className='mt-1 text-xs font-normal text-outline'>
                      {t(`${key}.centerError`)}{' '}
                      <button
                        className='text-primary underline'
                        onClick={() => void centerOptions.refetch()}
                        type='button'
                      >
                        {t(`${key}.retry`)}
                      </button>
                    </p>
                  ) : centerOptions.isSuccess && centerOptions.data.length === 0 ? (
                    <p className='mt-1 text-xs font-normal text-outline'>{t(`${key}.centerEmpty`)}</p>
                  ) : null}
                </div>
              )}
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
                  {t(`${key}.createAccount`)}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
