import { useQuery } from '@tanstack/react-query'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import type { WalletOwnerType, WalletWithdrawalScope, WalletWithdrawalStatus } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Select } from '~/shared/ui/form-field'
import { Pagination } from '~/shared/ui/pagination'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { Skeleton } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import { useRequesterNames, withdrawalHandler } from './use-requester-names'
import { fetchWithdrawals, walletErrorKey, walletKeys } from './wallet-api'
import { maskAccountNumber, WithdrawalStatusBadge } from './wallet-labels'
import { useWalletPeriod, WALLET_PERIODS, type WalletPeriod } from './wallet-period'
import { WithdrawalReviewDialog } from './withdrawal-review-dialog'
import { WithdrawalStatistics } from './withdrawal-statistics'

const STATUSES: WalletWithdrawalStatus[] = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED']
const SCOPES: WalletWithdrawalScope[] = ['REVIEW', 'OWN']
const OWNERS: Record<'admin' | 'manager', WalletOwnerType[]> = {
  admin: ['CUSTOMER', 'CAREGIVER', 'CENTER'],
  manager: ['CUSTOMER', 'CAREGIVER']
}

/**
 * A withdrawal queue with its dashboard (2026-11-10), shared by `/admin/withdrawals` and `/center-manager/withdrawals`.
 * The manager sees the customer / caregiver requests of their center (REVIEW) with the money the center holds for them;
 * the admin handles center wallets and older requests (REVIEW) and can look at every request (OWN) read-only. Filters
 * and the open request live in URL search parameters (`?scope&status&owner&page&withdrawal=`).
 */
export function WithdrawalQueue({ portal }: { portal: 'admin' | 'manager' }) {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const id = useId()
  const [params, setParams] = useSearchParams()
  const { period, range, choose } = useWalletPeriod()
  const scope: WalletWithdrawalScope =
    portal === 'manager' ? 'REVIEW' : (SCOPES.find((item) => item === params.get('scope')) ?? 'REVIEW')
  const status = STATUSES.find((item) => item === params.get('status'))
  const ownerType = OWNERS[portal].find((item) => item === params.get('owner'))
  const page = Math.max(0, Number(params.get('page')) || 0)
  const selectedId = params.get('withdrawal')
  const filters = { scope, status, ownerType, page }
  const withdrawals = useQuery({
    queryKey: walletKeys.withdrawals(filters),
    queryFn: () => fetchWithdrawals(filters),
    retry: false
  })
  const items = withdrawals.data?.items ?? []
  const namesOf = useRequesterNames(items)
  const selected = items.find((item) => item.id === selectedId)
  const handles = (item: (typeof items)[number]) =>
    withdrawalHandler(item) === (portal === 'admin' ? 'admin' : 'center')

  function update(changes: Record<string, string | undefined>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(changes)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        return next
      },
      { replace: true }
    )
  }

  return (
    <div className='space-y-6'>
      <section className='space-y-4'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-[22px] font-bold tracking-tight text-forest-950'>{t('wallet.stats.title')}</h2>
            <p className='text-sm text-on-surface-variant'>{t('wallet.stats.hint')}</p>
          </div>
          <SegmentedControl
            className='w-full sm:w-[22rem]'
            legend={t('wallet.period.label')}
            onChange={(next: WalletPeriod) => choose(next)}
            options={WALLET_PERIODS.map((item) => ({ value: item, label: t(`wallet.period.${item}`) }))}
            value={period}
          />
        </div>
        <WithdrawalStatistics range={range} scope={portal === 'manager' ? 'REVIEW' : 'OWN'} />
      </section>

      <fieldset className='flex flex-wrap items-end gap-3 rounded-3xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'>
        <legend className='sr-only'>{t('wallet.admin.filters')}</legend>
        {portal === 'admin' ? (
          <SegmentedControl
            className='w-full sm:w-80'
            legend={t('wallet.review.filtersTitle')}
            onChange={(next: WalletWithdrawalScope) =>
              update({ scope: next === 'REVIEW' ? undefined : next, page: undefined })
            }
            options={SCOPES.map((item) => ({ value: item, label: t(`wallet.review.scopes.${item}`) }))}
            value={scope}
          />
        ) : null}
        <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-status`}>
          {t('wallet.withdrawals.status')}
          <Select
            className='mt-1 w-auto'
            id={`${id}-status`}
            onChange={(event) => update({ status: event.target.value || undefined, page: undefined })}
            value={status ?? ''}
          >
            <option value=''>{t('wallet.admin.allStatuses')}</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`wallet.withdrawals.statuses.${item}`)}
              </option>
            ))}
          </Select>
        </label>
        <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-owner`}>
          {t('wallet.admin.owner')}
          <Select
            className='mt-1 w-auto'
            id={`${id}-owner`}
            onChange={(event) => update({ owner: event.target.value || undefined, page: undefined })}
            value={ownerType ?? ''}
          >
            <option value=''>{t('wallet.admin.allOwners')}</option>
            {OWNERS[portal].map((item) => (
              <option key={item} value={item}>
                {t(`wallet.review.requesterKinds.${item}`)}
              </option>
            ))}
          </Select>
        </label>
      </fieldset>

      {withdrawals.isPending ? (
        <div aria-label={t('wallet.loading')} className='space-y-3' role='status'>
          <Skeleton className='h-16 w-full rounded-2xl' />
          <Skeleton className='h-16 w-full rounded-2xl' />
        </div>
      ) : null}
      {withdrawals.isError ? (
        <ErrorState message={t(walletErrorKey(withdrawals.error))} onRetry={() => void withdrawals.refetch()} />
      ) : null}
      {withdrawals.data && items.length === 0 ? (
        <EmptyState icon='account_balance' title={t('wallet.admin.empty')} />
      ) : null}
      {items.length > 0 ? (
        <div className='overflow-x-auto rounded-3xl border border-forest-900/[0.06] bg-surface-container-lowest shadow-[var(--shadow-card)]'>
          <table className='w-full min-w-[820px] text-left text-sm'>
            <thead className='bg-mint-50/70 text-xs text-on-surface-variant'>
              <tr>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('wallet.admin.requester')}
                </th>
                <th className='px-4 py-3 text-right font-semibold' scope='col'>
                  {t('wallet.withdrawals.amount')}
                </th>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('wallet.withdrawals.bank')}
                </th>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('wallet.review.handledBy')}
                </th>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('wallet.withdrawals.createdAt')}
                </th>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('wallet.withdrawals.status')}
                </th>
                <th className='px-4 py-3' scope='col'>
                  <span className='sr-only'>{t('wallet.admin.open')}</span>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/60'>
              {items.map((withdrawal) => {
                const names = namesOf(withdrawal)
                const open = withdrawal.status === 'PENDING' || withdrawal.status === 'APPROVED'
                return (
                  <tr className={open && handles(withdrawal) ? 'bg-peach-50/40' : ''} key={withdrawal.id}>
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-on-surface'>{names.owner}</p>
                      <p className='text-xs text-on-surface-variant'>
                        {t(`wallet.review.requesterKinds.${withdrawal.ownerType}`)}
                        {withdrawal.ownerType === 'CENTER' ? ` · ${names.requester}` : ''}
                      </p>
                    </td>
                    <td className='px-4 py-3 text-right font-bold tabular-nums'>{money(withdrawal.amount)}</td>
                    <td className='px-4 py-3'>
                      {withdrawal.bankName} · {maskAccountNumber(withdrawal.bankAccountNumber)}
                    </td>
                    <td className='px-4 py-3 text-on-surface-variant'>{names.handler}</td>
                    <td className='px-4 py-3 text-on-surface-variant'>
                      <time dateTime={withdrawal.createdAt}>{dateTime(withdrawal.createdAt)}</time>
                    </td>
                    <td className='px-4 py-3'>
                      <WithdrawalStatusBadge status={withdrawal.status} />
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <Button
                        onClick={() => update({ withdrawal: withdrawal.id })}
                        size='sm'
                        variant={open && handles(withdrawal) ? 'dark' : 'outline'}
                      >
                        {t('wallet.admin.open')}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      {withdrawals.data ? (
        <Pagination
          onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
          page={page}
          totalPages={withdrawals.data.totalPages}
        />
      ) : null}

      {selected ? (
        <WithdrawalReviewDialog
          canHandle={handles(selected)}
          handlerLabel={namesOf(selected).handler}
          names={namesOf(selected)}
          onClose={() => update({ withdrawal: undefined })}
          showWallet={portal === 'admin'}
          withdrawal={selected}
        />
      ) : null}
    </div>
  )
}
