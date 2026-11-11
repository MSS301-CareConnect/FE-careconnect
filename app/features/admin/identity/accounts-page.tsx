import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { accountKeys, fetchAccounts, fetchAccountStatistics } from '~/entities/identity/account-api'
import { useCenterNames } from '~/entities/provider/use-provider-names'
import { AdminStatCards } from '~/features/admin/ui/stat-cards'
import { isForbiddenError } from '~/features/shared/auth/session-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type {
  ListManagedUsersParams,
  ListManagedUsersRole,
  ListManagedUsersStatus
} from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoCard, bentoContainer } from '~/shared/ui/bento-page-header'
import { Button } from '~/shared/ui/button'
import { Select, baseControlClass } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Pagination, pageSizeOf } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

import { AccountAccess } from './components/account-access'
import { AccountAvatar } from './components/account-avatar'
import { CreateAccountDialog } from './components/create-account-dialog'
import { RoleChips } from './components/role-chips'

const key = 'admin.identity.accounts' as const
const DEFAULT_PAGE_SIZE = 10
const ROLES = ['ADMIN', 'CENTER_MANAGER', 'CAREGIVER', 'CUSTOMER'] as const satisfies readonly ListManagedUsersRole[]
const STATUSES = ['ACTIVE', 'LOCKED'] as const satisfies readonly ListManagedUsersStatus[]

/**
 * IdentityService searches, filters and pages every account on the server (A-02); counts are platform-wide. The count
 * cards filter the list (all, active, locked, center managers); each row opens the account or, from its "⋯" menu,
 * locks / unlocks or deactivates it (redesigned 2026-11-11). Filters, page and page size live in URL search parameters.
 */
export function AccountsPage() {
  const { t, i18n } = useTranslation()
  const authUser = useAuthUser()
  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number(params.get('page')) || 0)
  const pageSize = pageSizeOf(params.get('size'), DEFAULT_PAGE_SIZE)
  const keyword = params.get('q') ?? ''
  const role = ROLES.find((item) => item === params.get('role'))
  const status = STATUSES.find((item) => item === params.get('status'))
  const [draft, setDraft] = useState(keyword)
  const [creating, setCreating] = useState(false)
  useDocumentTitle(t(`${key}.documentTitle`))

  const query: ListManagedUsersParams = { page, size: pageSize, role, status, keyword: keyword || undefined }
  const accounts = useQuery({
    queryKey: accountKeys.list(query),
    queryFn: () => fetchAccounts(query),
    placeholderData: keepPreviousData,
    retry: false
  })
  const statistics = useQuery({ queryKey: accountKeys.statistics, queryFn: fetchAccountStatistics, retry: false })
  const rows = accounts.data?.content ?? []
  const centerName = useCenterNames(rows.map((user) => user.centerId))
  const canManage = Boolean(authUser?.permissions?.includes('user:manage'))
  const canCreate = canManage || authUser?.permissions?.includes('manager:create')
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

  const byStatus = statistics.data?.usersByStatus
  const loaded = statistics.isSuccess
  const metrics = [
    {
      id: 'total',
      icon: 'groups',
      label: t(`${key}.metrics.total`),
      value: loaded ? Object.values(byStatus ?? {}).reduce((sum, count) => sum + count, 0) : undefined,
      selected: !role && !status,
      onSelect: () => update({ role: undefined, status: undefined })
    },
    {
      id: 'active',
      icon: 'verified_user',
      label: t(`${key}.metrics.active`),
      value: loaded ? (byStatus?.ACTIVE ?? 0) : undefined,
      selected: status === 'ACTIVE',
      onSelect: () => update({ status: status === 'ACTIVE' ? undefined : 'ACTIVE' })
    },
    {
      id: 'locked',
      icon: 'lock',
      label: t(`${key}.metrics.locked`),
      value: loaded ? (byStatus?.LOCKED ?? 0) : undefined,
      selected: status === 'LOCKED',
      onSelect: () => update({ status: status === 'LOCKED' ? undefined : 'LOCKED' })
    },
    {
      id: 'managers',
      icon: 'manage_accounts',
      label: t(`${key}.metrics.managers`),
      value: loaded ? (statistics.data.usersByRole?.CENTER_MANAGER ?? 0) : undefined,
      selected: role === 'CENTER_MANAGER',
      onSelect: () => update({ role: role === 'CENTER_MANAGER' ? undefined : 'CENTER_MANAGER' })
    }
  ]
  const hasFilters = Boolean(keyword || role || status)

  return (
    <main className={bentoContainer}>
      <BentoPageHeader
        actions={
          canCreate ? (
            <Button leftIcon={<Icon name='person_add' />} onClick={() => setCreating(true)}>
              {t(`${key}.create`)}
            </Button>
          ) : undefined
        }
        description={t(`${key}.subtitle`)}
        title={t(`${key}.title`)}
      />

      <AdminStatCards items={metrics} label={t(`${key}.metrics.title`)} />

      <section className={`${bentoCard} flex flex-wrap items-end gap-3 p-4`}>
        <form className='flex min-w-64 flex-1 gap-2' onSubmit={submitSearch} role='search'>
          <label className='sr-only' htmlFor='accounts-search'>
            {t(`${key}.search`)}
          </label>
          <input
            className={`${baseControlClass} flex-1`}
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
        <label className='flex min-w-44 flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
          {t(`${key}.role`)}
          <Select onChange={(event) => update({ role: event.target.value })} value={role ?? ''}>
            <option value=''>{t(`${key}.allRoles`)}</option>
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {t(`admin.identity.roles.${item}`)}
              </option>
            ))}
          </Select>
        </label>
        <label className='flex min-w-44 flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
          {t(`${key}.status`)}
          <Select onChange={(event) => update({ status: event.target.value })} value={status ?? ''}>
            <option value=''>{t(`${key}.allStatuses`)}</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`admin.identity.status.${item}`)}
              </option>
            ))}
          </Select>
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
        <section className={`${bentoCard} overflow-hidden`}>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-240 text-left text-sm'>
              <thead className='bg-surface-container-low/70 text-xs font-semibold text-on-surface-variant'>
                <tr>
                  {(['user', 'phone', 'roles', 'center', 'status', 'createdAt', 'action'] as const).map((column) => (
                    <th className={`px-5 py-3 ${column === 'action' ? 'text-right' : ''}`} key={column} scope='col'>
                      {t(`${key}.columns.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-outline-variant/25'>
                {rows.map((user) => {
                  const name = user.fullName || user.email || ''
                  return (
                    <tr className='transition-colors hover:bg-mint-50/60' key={user.id}>
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-3'>
                          <AccountAvatar
                            className='h-10 w-10 rounded-full text-xs'
                            name={name}
                            roles={user.roles}
                            userId={user.id}
                          />
                          <span className='min-w-0'>
                            <Link
                              className='block font-semibold text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-primary'
                              to={`/admin/accounts/${user.id}`}
                            >
                              {name}
                            </Link>
                            <span className='block truncate text-xs text-on-surface-variant'>{user.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-5 py-3.5 tabular-nums'>{user.phoneNumber || '—'}</td>
                      <td className='px-5 py-3.5'>
                        <RoleChips roles={user.roles} />
                      </td>
                      <td className='whitespace-nowrap px-5 py-3.5'>
                        {user.centerId ? centerName(user.centerId) : '—'}
                      </td>
                      <td className='px-5 py-3.5'>
                        <StatusBadge dot tone={user.status === 'ACTIVE' ? 'success' : 'error'}>
                          {t(`admin.identity.status.${user.status ?? 'ACTIVE'}`)}
                        </StatusBadge>
                      </td>
                      <td className='whitespace-nowrap px-5 py-3.5 tabular-nums text-on-surface-variant'>
                        {user.createdAt ? date.format(new Date(user.createdAt)) : '—'}
                      </td>
                      <td className='px-5 py-3.5'>
                        <span className='flex justify-end'>
                          <AccountAccess
                            menuLabel={t(`${key}.rowActions`, { name })}
                            readOnly={!canManage || user.id === authUser?.id}
                            user={user}
                          />
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {accounts.isSuccess ? (
        <Pagination
          ariaLabel={t(`${key}.pagination`)}
          onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
          onPageSizeChange={(size) => update({ size: size === DEFAULT_PAGE_SIZE ? undefined : String(size) })}
          page={page}
          pageSize={pageSize}
          totalElements={accounts.data.totalElements}
          totalPages={accounts.data.totalPages}
        />
      ) : null}
      {creating ? <CreateAccountDialog onClose={() => setCreating(false)} /> : null}
    </main>
  )
}
