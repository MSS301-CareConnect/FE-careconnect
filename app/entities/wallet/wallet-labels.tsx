import { useTranslation } from 'react-i18next'

import type { WalletTransactionType, WalletWithdrawalStatus } from '~/shared/api/generated/contracts'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

const WITHDRAWAL_TONES: Record<WalletWithdrawalStatus, StatusTone> = {
  PENDING: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  COMPLETED: 'success'
}

/** How a movement changes what the owner can spend: money in (+) or money leaving the available balance (−). */
export function transactionSign(type: WalletTransactionType) {
  return type === 'COMPLAINT_DEBIT' || type === 'WITHDRAWAL_HOLD' || type === 'WITHDRAWAL_PAID' ? -1 : 1
}

export function WithdrawalStatusBadge({ status }: { status: WalletWithdrawalStatus }) {
  const { t } = useTranslation()
  return (
    <StatusBadge dot tone={WITHDRAWAL_TONES[status]}>
      {t(`wallet.withdrawals.statuses.${status}`)}
    </StatusBadge>
  )
}

/** Shows only the last four digits of an account number in lists; the full number is kept for the admin review. */
export function maskAccountNumber(accountNumber: string) {
  return accountNumber.length <= 4 ? accountNumber : `•••• ${accountNumber.slice(-4)}`
}
