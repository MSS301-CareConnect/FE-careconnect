import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { accountKeys, fetchAccounts, fetchAccountStatistics } from '~/entities/identity/account-api'
import { useCenterNames } from '~/entities/provider/use-provider-names'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type {
  ListManagedUsersParams,
  ListManagedUsersRole,
  ListManagedUsersStatus
} from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

import { AccountAvatar } from './components/account-avatar'
import { CreateAccountDialog } from './components/create-account-dialog'
import { RoleChips } from './components/role-chips'

const key = 'admin.identity.accounts' as const
const PAGE_SIZE = 20
const ROLES = ['ADMIN', 'CENTER_MANAGER', 'CAREGIVER', 'CUSTOMER'] as const satisfies readonly ListManagedUsersRole[]
const STATUSES = ['ACTIVE', 'LOCKED'] as const satisfies readonly ListManagedUsersStatus[]
const control =
  'min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'

/** IdentityService searches, filters and pages every account on the server (A-02); counts are platform-wide. */
export function AccountsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const authUser = useAuthUser()
  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number(params.get('page')) || 0)
  const keyword = params.get('q') ?? ''
  const role = ROLES.find((item) => item === params.get('role'))
  const status = STATUSES.find((item) => item === params.get('status'))
  const [draft, setDraft] = useState(keyword)
  const [creating, setCreating] = useState(false)
  useDocumentTitle(t(`${key}.documentTitle`))

  const query: ListManagedUsersParams = { page, size: PAGE_SIZE, role, status, keyword: keyword || undefined }
  const accounts = useQuery({
    queryKey: accountKeys.list(query),
    queryFn: () => fetchAccounts(query),
    placeholderData: keepPreviousData,
    retry: false
  })
  const statistics = useQuery({ queryKey: accountKeys.statistics, queryFn: fetchAccountStatistics, retry: false })
  const rows = accounts.data?.content ?? []
  const centerName = useCenterNames(rows.map((user) => user.centerId))
  const canCreate = authUser?.permissions?.includes('user:manage') || authUser?.permissions?.includes('manager:create')
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  const date = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { dateStyle: 'medium' })

  function update(next: Record<string, string | undefined>) {
    setParams((previous) => {
      const search = new URLSearchParams(previous)
      for (const [name, value] of Object.entries(next)) {
        if (value) search.set(name, value)
        else search.delete(name)
      }
      if (!('page' in next)) search.delete('page')
      return search
    })
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    update({ q: draft.trim() || undefined })
  }

  const byStatus = statistics.data?.usersByStatus ?? {}
  const metrics = [
    { name: 'total', value: Object.values(byStatus).reduce((sum, count) => sum + count, 0), icon: 'groups' },
    { name: 'active', value: byStatus.ACTIVE ?? 0, icon: 'verified_user' },
    { name: 'locked', value: byStatus.LOCKED ?? 0, icon: 'lock' },
    { name: 'managers', value: statistics.data?.usersByRole?.CENTER_MANAGER ?? 0, icon: 'manage_accounts' }
  ] as const
  const hasFilters = Boolean(keyword || role || status)

  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
        </div>
        {canCreate ? (
          <Button leftIcon={<Icon name='person_add' />} onClick={() => setCreating(true)}>
            {t(`${key}.create`)}
          </Button>
        ) : null}
      </header>

      <section aria-label={t(`${key}.metrics.title`)} className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
        {metrics.map((metric) => (
          <div className='rounded-xl border border-outline-variant/40 bg-white px-5 py-4' key={metric.name}>
            <p className='flex items-center justify-between text-sm font-medium text-on-surface-variant'>
              {t(`${key}.metrics.${metric.name}`)}
              <Icon className='text-xl text-primary' name={metric.icon} />
            </p>
            <strong className='mt-2 block text-2xl tabular-nums'>
              {statistics.isSuccess ? number.format(metric.value) : '—'}
            </strong>
          </div>
        ))}
      </section>

      <section className='flex flex-wrap items-end gap-3 rounded-xl border border-outline-variant/40 bg-white p-4'>
        <form className='flex min-w-64 flex-1 gap-2' onSubmit={submitSearch} role='search'>
          <label className='sr-only' htmlFor='accounts-search'>
            {t(`${key}.search`)}
          </label>
          <input
            className={`${control} flex-1`}
            id='accounts-search'
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t(`${key}.search`)}
            type='search'
            value={draft}
          />
          <Button type='submit' variant='secondary'>
            {t(`${key}.searchAction`)}
          </Button>
        </form>
        <label className='flex flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
          {t(`${key}.role`)}
          <select className={control} onChange={(event) => update({ role: event.target.value })} value={role ?? ''}>
            <option value=''>{t(`${key}.allRoles`)}</option>
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {t(`admin.identity.roles.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
          {t(`${key}.status`)}
          <select className={control} onChange={(event) => update({ status: event.target.value })} value={status ?? ''}>
            <option value=''>{t(`${key}.allStatuses`)}</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`admin.identity.status.${item}`)}
              </option>
            ))}
          </select>
        </label>
        {hasFilters ? (
          <Button
            onClick={() => {
              setDraft('')
              update({ q: undefined, role: undefined, status: undefined })
            }}
            variant='ghost'
          >
            {t(`${key}.reset`)}
          </Button>
        ) : null}
      </section>

      {accounts.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={6} />
      ) : accounts.isError ? (
        <ErrorState
          message={t(isForbiddenError(accounts.error) ? `${key}.forbidden` : `${key}.error`)}
          onRetry={() => void accounts.refetch()}
          retryLabel={t(`${key}.retry`)}
        />
      ) : rows.length === 0 ? (
        <EmptyState description={t(`${key}.emptyHint`)} icon='person_search' title={t(`${key}.empty`)} />
      ) : (
        <section className='overflow-hidden rounded-xl border border-outline-variant/40 bg-white'>
          <p className='border-b border-outline-variant/30 px-5 py-3 text-sm text-on-surface-variant'>
            {t(`${key}.results`, { count: accounts.data.totalElements })}
          </p>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-220 text-left text-sm'>
              <thead className='bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
                <tr>
                  {(['user', 'phone', 'roles', 'center', 'status', 'createdAt'] as const).map((column) => (
                    <th className='px-4 py-3' key={column} scope='col'>
                      {t(`${key}.columns.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-outline-variant/25'>
                {rows.map((user) => (
                  <tr
                    className='cursor-pointer transition-colors hover:bg-surface-container-low/60'
                    key={user.id}
                    onClick={() => navigate(`/admin/accounts/${user.id}`)}
                  >
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <AccountAvatar
                          className='h-9 w-9 rounded-full text-xs'
                          name={user.fullName || user.email}
                          roles={user.roles}
                          userId={user.id}
                        />
                        <span className='min-w-0'>
                          <Link
                            className='block font-semibold text-on-surface hover:text-primary'
                            onClick={(event) => event.stopPropagation()}
                            to={`/admin/accounts/${user.id}`}
                          >
                            {user.fullName || user.email}
                          </Link>
                          <span className='block truncate text-xs text-on-surface-variant'>{user.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-4 py-3 tabular-nums'>{user.phoneNumber || '—'}</td>
                    <td className='px-4 py-3'>
                      <RoleChips roles={user.roles} />
                    </td>
                    <td className='whitespace-nowrap px-4 py-3'>{user.centerId ? centerName(user.centerId) : '—'}</td>
                    <td className='px-4 py-3'>
                      <StatusBadge dot tone={user.status === 'ACTIVE' ? 'success' : 'error'}>
                        {t(`admin.identity.status.${user.status ?? 'ACTIVE'}`)}
                      </StatusBadge>
                    </td>
                    <td className='whitespace-nowrap px-4 py-3 tabular-nums text-on-surface-variant'>
                      {user.createdAt ? date.format(new Date(user.createdAt)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {accounts.isSuccess ? (
        <Pagination
          ariaLabel={t(`${key}.pagination`)}
          onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
          page={page}
          totalPages={accounts.data.totalPages}
        />
      ) : null}
      {creating ? <CreateAccountDialog onClose={() => setCreating(false)} /> : null}
    </main>
  )
}
