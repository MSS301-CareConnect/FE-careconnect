import { useQuery } from '@tanstack/react-query'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { fetchWithdrawals, walletErrorKey, walletKeys } from '~/entities/wallet/wallet-api'
import { maskAccountNumber, WithdrawalStatusBadge } from '~/entities/wallet/wallet-labels'
import type { WalletOwnerType, WalletWithdrawalStatus } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Select } from '~/shared/ui/form-field'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

import { WithdrawalReviewDialog } from './components/withdrawal-review-dialog'
import { useRequesterNames } from './hooks/use-requester-names'

const STATUSES: WalletWithdrawalStatus[] = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED']
const OWNERS: WalletOwnerType[] = ['CUSTOMER', 'CAREGIVER', 'CENTER']

/**
 * The admin withdrawal queue (2026-11-09): filter by state and wallet type (URL search parameters), open a request to
 * approve, reject with a reason or confirm the manual bank transfer (`?withdrawal=<id>`).
 */
export function AdminWithdrawalsPage() {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const id = useId()
  useDocumentTitle(t('wallet.admin.title'))
  const [params, setParams] = useSearchParams()
  const status = STATUSES.find((item) => item === params.get('status'))
  const ownerType = OWNERS.find((item) => item === params.get('owner'))
  const page = Math.max(0, Number(params.get('page')) || 0)
  const selectedId = params.get('withdrawal')
  const withdrawals = useQuery({
    queryKey: walletKeys.withdrawals({ status, ownerType, page }),
    queryFn: () => fetchWithdrawals({ status, ownerType, page }),
    retry: false
  })
  const items = withdrawals.data?.items ?? []
  const namesOf = useRequesterNames(items)
  const selected = items.find((item) => item.id === selectedId)

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
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader description={t('wallet.admin.subtitle')} title={t('wallet.admin.title')} />

      <fieldset className='flex flex-wrap gap-3 rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-xs'>
        <legend className='sr-only'>{t('wallet.admin.filters')}</legend>
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
            {OWNERS.map((item) => (
              <option key={item} value={item}>
                {t(`wallet.liabilities.owners.${item}`)}
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
        <div className='overflow-x-auto rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-xs'>
          <table className='w-full min-w-[760px] text-left text-sm'>
            <thead className='bg-surface-container-low text-xs text-on-surface-variant'>
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
                return (
                  <tr key={withdrawal.id}>
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-on-surface'>{names.owner}</p>
                      <p className='text-xs text-on-surface-variant'>
                        {t(`wallet.liabilities.owners.${withdrawal.ownerType}`)}
                        {withdrawal.ownerType === 'CENTER' ? ` · ${names.requester}` : ''}
                      </p>
                    </td>
                    <td className='px-4 py-3 text-right font-bold tabular-nums'>{money(withdrawal.amount)}</td>
                    <td className='px-4 py-3'>
                      {withdrawal.bankName} · {maskAccountNumber(withdrawal.bankAccountNumber)}
                    </td>
                    <td className='px-4 py-3 text-on-surface-variant'>
                      <time dateTime={withdrawal.createdAt}>{dateTime(withdrawal.createdAt)}</time>
                    </td>
                    <td className='px-4 py-3'>
                      <WithdrawalStatusBadge status={withdrawal.status} />
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <Button onClick={() => update({ withdrawal: withdrawal.id })} size='sm' variant='outline'>
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
          names={namesOf(selected)}
          onClose={() => update({ withdrawal: undefined })}
          withdrawal={selected}
        />
      ) : null}
    </div>
  )
}
