import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { CopyButton } from '~/shared/ui/copy-button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Textarea } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { Skeleton } from '~/shared/ui/skeleton'

import { fetchWallet, fetchWalletTransactions, rejectWithdrawal, walletErrorKey, walletKeys } from './wallet-api'
import { WithdrawalStatusBadge } from './wallet-labels'
import { WalletTransactionRow } from './wallet-transactions'

type Step = 'view' | 'reject'

/**
 * One withdrawal for whoever handles it (2026-11-10): bank details (copyable), the money's center, and — when the viewer
 * is the handler and the request is open — the simulated bank gateway (`transferHref`, 2026-11-11; the request then
 * completes by itself, there is no manual approve / confirm) or a rejection with a reason. The admin also sees the requester wallet and its latest
 * movements (`showWallet`, ADMIN-only endpoints).
 */
export function WithdrawalReviewDialog({
  withdrawal,
  names,
  canHandle,
  handlerLabel,
  showWallet,
  transferHref,
  onClose
}: {
  withdrawal: WalletWithdrawalRecord
  names: { owner: string; requester: string; center: string }
  canHandle: boolean
  handlerLabel: string
  showWallet: boolean
  /** The simulated transfer page of this request. */
  transferHref: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('view')
  const [reason, setReason] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const wallet = useQuery({
    queryKey: walletKeys.wallet(withdrawal.walletId),
    queryFn: () => fetchWallet(withdrawal.walletId),
    enabled: showWallet,
    retry: false
  })
  const ledger = useQuery({
    queryKey: walletKeys.walletTransactions(withdrawal.walletId),
    queryFn: () => fetchWalletTransactions(withdrawal.walletId),
    enabled: showWallet,
    retry: false
  })
  const act = useMutation({
    mutationFn: () => rejectWithdrawal(withdrawal.id, reason.trim()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.all })
      toastSuccess(t('wallet.review.rejected'))
      onClose()
    }
  })
  const open = withdrawal.status === 'PENDING' || withdrawal.status === 'APPROVED'
  const actionable = canHandle && open

  function confirmReject() {
    if (!reason.trim()) {
      setFieldError(t('wallet.admin.rejectReasonRequired'))
      return
    }
    act.mutate()
  }

  const footer = (
    <>
      <Button disabled={act.isPending} onClick={step === 'view' ? onClose : () => setStep('view')} variant='outline'>
        {step === 'view' ? t('wallet.admin.close') : t('wallet.form.cancel')}
      </Button>
      {step === 'view' && actionable ? (
        <>
          <Button onClick={() => setStep('reject')} variant='danger'>
            {t('wallet.admin.reject')}
          </Button>
          <Link
            className='inline-flex min-h-11 items-center gap-2 rounded-full bg-peach-300 px-5 text-sm font-semibold text-forest-950 hover:bg-peach-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
            to={transferHref}
          >
            <Icon className='text-lg' name='send_money' />
            {t('wallet.review.transfer')}
          </Link>
        </>
      ) : null}
      {step === 'reject' ? (
        <Button loading={act.isPending} onClick={confirmReject} variant='danger'>
          {t('wallet.admin.reject')}
        </Button>
      ) : null}
    </>
  )

  return (
    <Modal
      dismissOnBackdrop={false}
      footer={footer}
      onClose={onClose}
      open
      size={showWallet ? 'xl' : 'lg'}
      title={t('wallet.admin.detailTitle', { amount: money(withdrawal.amount) })}
    >
      <div className={showWallet ? 'grid gap-6 md:grid-cols-2' : ''}>
        <div className='space-y-4 text-sm'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <p className='font-semibold text-on-surface'>{names.owner}</p>
              <p className='text-xs text-on-surface-variant'>
                {t(`wallet.review.requesterKinds.${withdrawal.ownerType}`)}
                {withdrawal.ownerType === 'CENTER' ? ` · ${names.requester}` : ''}
                {withdrawal.requesterPhoneNumber ? ` · ${withdrawal.requesterPhoneNumber}` : ''}
              </p>
            </div>
            <WithdrawalStatusBadge status={withdrawal.status} />
          </div>
          <dl className='space-y-2 rounded-2xl bg-surface-container-low p-4'>
            <div className='flex justify-between gap-3'>
              <dt className='text-on-surface-variant'>{t('wallet.withdrawals.bank')}</dt>
              <dd className='font-semibold text-on-surface'>{withdrawal.bankName}</dd>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <dt className='text-on-surface-variant'>{t('wallet.withdrawals.account')}</dt>
              <dd className='flex items-center gap-2 font-semibold tabular-nums text-on-surface'>
                {withdrawal.bankAccountNumber}
                <CopyButton compact value={withdrawal.bankAccountNumber} />
              </dd>
            </div>
            <div className='flex justify-between gap-3'>
              <dt className='text-on-surface-variant'>{t('wallet.form.accountHolderName')}</dt>
              <dd className='font-semibold text-on-surface'>{withdrawal.accountHolderName}</dd>
            </div>
            <div className='flex justify-between gap-3'>
              <dt className='text-on-surface-variant'>{t('wallet.review.handledBy')}</dt>
              <dd className='text-right font-semibold text-on-surface'>{handlerLabel}</dd>
            </div>
            <div className='flex justify-between gap-3'>
              <dt className='text-on-surface-variant'>{t('wallet.withdrawals.createdAt')}</dt>
              <dd className='text-on-surface'>{dateTime(withdrawal.createdAt)}</dd>
            </div>
          </dl>
          {withdrawal.reviewedAt ? (
            <p className='text-xs text-on-surface-variant'>
              {t('wallet.admin.reviewedAt', { time: dateTime(withdrawal.reviewedAt) })}
            </p>
          ) : null}
          {withdrawal.completedAt ? (
            <p className='text-xs text-on-surface-variant'>
              {t('wallet.admin.completedAt', { time: dateTime(withdrawal.completedAt) })}
            </p>
          ) : null}
          {withdrawal.rejectReason ? (
            <p className='text-xs text-error'>
              {t('wallet.withdrawals.rejectReason', { reason: withdrawal.rejectReason })}
            </p>
          ) : null}
          {withdrawal.transferReference ? (
            <p className='flex items-center gap-2 text-xs text-on-surface-variant'>
              {t('wallet.withdrawals.transferReference', { reference: withdrawal.transferReference })}
              <CopyButton compact value={withdrawal.transferReference} />
            </p>
          ) : null}
          {open && !canHandle ? (
            <p className='rounded-xl bg-info-container px-4 py-3 text-on-info-container'>
              {t('wallet.review.readOnly', { handler: handlerLabel })}
            </p>
          ) : null}

          {step === 'reject' ? (
            <FormField error={fieldError} label={t('wallet.admin.rejectReason')}>
              {(control) => (
                <Textarea
                  {...control}
                  maxLength={500}
                  onChange={(event) => {
                    setReason(event.target.value)
                    setFieldError(null)
                  }}
                  rows={3}
                  value={reason}
                />
              )}
            </FormField>
          ) : null}
          {act.isError ? <FormAlert tone='warning'>{t(walletErrorKey(act.error))}</FormAlert> : null}
        </div>

        {showWallet ? (
          <div className='space-y-3 text-sm'>
            <div className='rounded-2xl border border-outline-variant/60 p-4'>
              <p className='text-xs font-semibold text-on-surface-variant'>{t('wallet.admin.walletBalance')}</p>
              {wallet.data ? (
                <p className='mt-1 text-xl font-bold tabular-nums text-on-surface'>
                  {money(wallet.data.availableBalance)}
                  <span className='ml-2 text-xs font-medium text-on-surface-variant'>
                    {t('wallet.transactions.held', { amount: money(wallet.data.heldBalance) })}
                  </span>
                </p>
              ) : (
                <Skeleton className='mt-2 h-6 w-32 rounded-md' />
              )}
            </div>
            <p className='font-semibold text-on-surface'>{t('wallet.admin.ledger')}</p>
            {ledger.isPending ? <Skeleton className='h-24 w-full rounded-xl' /> : null}
            {ledger.isError ? <p className='text-error'>{t(walletErrorKey(ledger.error))}</p> : null}
            {ledger.data ? (
              <ul className='divide-y divide-outline-variant/60'>
                {ledger.data.items.map((transaction) => (
                  <WalletTransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
