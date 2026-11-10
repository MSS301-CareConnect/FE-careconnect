import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  approveWithdrawal,
  completeWithdrawal,
  fetchWallet,
  fetchWalletTransactions,
  rejectWithdrawal,
  walletErrorKey,
  walletKeys
} from '~/entities/wallet/wallet-api'
import { WithdrawalStatusBadge } from '~/entities/wallet/wallet-labels'
import { WalletTransactionRow } from '~/entities/wallet/wallet-transactions'
import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { CopyButton } from '~/shared/ui/copy-button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input, Textarea } from '~/shared/ui/form-field'
import { Modal } from '~/shared/ui/modal'
import { Skeleton } from '~/shared/ui/skeleton'

type Step = 'view' | 'reject' | 'complete'
type Action = 'approve' | 'reject' | 'complete'

/**
 * One withdrawal for the admin: bank details to transfer to (copyable), the requester wallet and its latest movements,
 * and the action its state allows — approve or reject a pending request, confirm the transfer of an approved one (or
 * still reject it). Rejecting needs a reason; confirming needs the bank reference.
 */
export function WithdrawalReviewDialog({
  withdrawal,
  names,
  onClose
}: {
  withdrawal: WalletWithdrawalRecord
  names: { owner: string; requester: string }
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('view')
  const [reason, setReason] = useState('')
  const [reference, setReference] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const wallet = useQuery({
    queryKey: walletKeys.wallet(withdrawal.walletId),
    queryFn: () => fetchWallet(withdrawal.walletId),
    retry: false
  })
  const ledger = useQuery({
    queryKey: walletKeys.walletTransactions(withdrawal.walletId),
    queryFn: () => fetchWalletTransactions(withdrawal.walletId),
    retry: false
  })
  const act = useMutation({
    mutationFn: (action: Action) =>
      action === 'approve'
        ? approveWithdrawal(withdrawal.id)
        : action === 'reject'
          ? rejectWithdrawal(withdrawal.id, reason.trim())
          : completeWithdrawal(withdrawal.id, reference.trim()),
    onSuccess: async (_, action) => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.all })
      toastSuccess(
        t(
          action === 'approve'
            ? 'wallet.admin.approved'
            : action === 'reject'
              ? 'wallet.admin.rejected'
              : 'wallet.admin.completed'
        )
      )
      if (action === 'approve') setStep('view')
      else onClose()
    }
  })
  const open = withdrawal.status === 'PENDING' || withdrawal.status === 'APPROVED'

  function confirm() {
    if (step === 'reject') {
      if (!reason.trim()) return setFieldError(t('wallet.admin.rejectReasonRequired'))
      act.mutate('reject')
    } else if (step === 'complete') {
      if (!reference.trim()) return setFieldError(t('wallet.admin.transferReferenceRequired'))
      act.mutate('complete')
    }
  }

  const footer = (
    <>
      <Button disabled={act.isPending} onClick={step === 'view' ? onClose : () => setStep('view')} variant='outline'>
        {step === 'view' ? t('wallet.admin.close') : t('wallet.form.cancel')}
      </Button>
      {step === 'view' && open ? (
        <Button disabled={act.isPending} onClick={() => setStep('reject')} variant='danger'>
          {t('wallet.admin.reject')}
        </Button>
      ) : null}
      {step === 'view' && withdrawal.status === 'PENDING' ? (
        <Button loading={act.isPending} onClick={() => act.mutate('approve')}>
          {t('wallet.admin.approve')}
        </Button>
      ) : null}
      {step === 'view' && withdrawal.status === 'APPROVED' ? (
        <Button onClick={() => setStep('complete')}>{t('wallet.admin.complete')}</Button>
      ) : null}
      {step !== 'view' ? (
        <Button loading={act.isPending} onClick={confirm} variant={step === 'reject' ? 'danger' : 'primary'}>
          {step === 'reject' ? t('wallet.admin.reject') : t('wallet.admin.complete')}
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
      size='xl'
      title={t('wallet.admin.detailTitle', { amount: money(withdrawal.amount) })}
    >
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-4 text-sm'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <p className='font-semibold text-on-surface'>{names.owner}</p>
              <p className='text-xs text-on-surface-variant'>
                {t(`wallet.liabilities.owners.${withdrawal.ownerType}`)} · {names.requester}
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
            <p className='text-xs text-on-surface-variant'>
              {t('wallet.withdrawals.transferReference', { reference: withdrawal.transferReference })}
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
          {step === 'complete' ? (
            <>
              <p className='rounded-xl bg-info-container px-4 py-3 text-on-info-container'>
                {t('wallet.admin.transferHint', {
                  amount: money(withdrawal.amount),
                  bank: withdrawal.bankName,
                  account: withdrawal.bankAccountNumber,
                  holder: withdrawal.accountHolderName
                })}
              </p>
              <FormField error={fieldError} label={t('wallet.admin.transferReference')}>
                {(control) => (
                  <Input
                    {...control}
                    maxLength={100}
                    onChange={(event) => {
                      setReference(event.target.value)
                      setFieldError(null)
                    }}
                    value={reference}
                  />
                )}
              </FormField>
            </>
          ) : null}
          {act.isError ? <FormAlert tone='warning'>{t(walletErrorKey(act.error))}</FormAlert> : null}
        </div>

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
      </div>
    </Modal>
  )
}
