import { useTranslation } from 'react-i18next'

import { useCenterNames } from '~/entities/provider/use-provider-names'
import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'

/**
 * Who handles a withdrawal (2026-11-10): the center holding the money for a customer / caregiver request that carries
 * a center, the platform administrator for a center wallet or an older request without a center.
 */
export function withdrawalHandler(withdrawal: WalletWithdrawalRecord): 'center' | 'admin' {
  return withdrawal.ownerType !== 'CENTER' && withdrawal.centerId ? 'center' : 'admin'
}

/**
 * Names for each withdrawal, never the UUID: the owner (center name for a center wallet, the requester otherwise), the
 * requesting account, the center whose money it is, and who handles it. PaymentService adds `requesterName` from
 * Identity (2026-11-11) because a manager may not read a customer's account directly.
 */
export function useRequesterNames(withdrawals: readonly WalletWithdrawalRecord[]) {
  const { t } = useTranslation()
  const centerName = useCenterNames(withdrawals.map((withdrawal) => withdrawal.centerId ?? undefined))

  return (withdrawal: WalletWithdrawalRecord) => {
    const requester = withdrawal.requesterName || t('common.ui.unknownName')
    const center = withdrawal.centerId ? centerName(withdrawal.centerId) : t('wallet.review.handledByAdmin')
    return {
      owner: withdrawal.ownerType === 'CENTER' ? center : requester,
      requester,
      center,
      handler:
        withdrawalHandler(withdrawal) === 'center'
          ? t('wallet.review.handledByCenter', { name: center })
          : t('wallet.review.handledByAdmin')
    }
  }
}
