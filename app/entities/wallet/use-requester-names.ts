import { useQueries } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { accountKeys, fetchAccount } from '~/entities/identity/account-api'
import { useCenterNames } from '~/entities/provider/use-provider-names'
import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'

const STALE_MS = 60_000

/**
 * Who handles a withdrawal (2026-11-10): the center holding the money for a customer / caregiver request that carries
 * a center, the platform administrator for a center wallet or an older request without a center.
 */
export function withdrawalHandler(withdrawal: WalletWithdrawalRecord): 'center' | 'admin' {
  return withdrawal.ownerType !== 'CENTER' && withdrawal.centerId ? 'center' : 'admin'
}

/**
 * Names for each withdrawal, never the UUID: the owner (center name for a center wallet, the Identity account
 * otherwise), the requesting account, the center whose money it is, and who handles it. Lookups share the account /
 * center detail caches (`GET /users/{id}` is open to managers, so a center queue names its customers too).
 */
export function useRequesterNames(withdrawals: readonly WalletWithdrawalRecord[]) {
  const { t } = useTranslation()
  const centerName = useCenterNames(withdrawals.map((withdrawal) => withdrawal.centerId ?? undefined))
  const userIds = [...new Set(withdrawals.map((withdrawal) => withdrawal.requesterUserId))]
  const accounts = useQueries({
    queries: userIds.map((id) => ({
      queryKey: accountKeys.detail(id),
      queryFn: () => fetchAccount(id),
      retry: false,
      staleTime: STALE_MS
    }))
  })

  function accountName(userId: string) {
    const query = accounts[userIds.indexOf(userId)]
    if (!query) return t('common.ui.unknownName')
    if (query.isPending) return t('common.ui.loadingName')
    return query.data?.fullName || t('common.ui.unknownName')
  }

  return (withdrawal: WalletWithdrawalRecord) => {
    const center = withdrawal.centerId ? centerName(withdrawal.centerId) : t('wallet.review.handledByAdmin')
    return {
      owner: withdrawal.ownerType === 'CENTER' ? center : accountName(withdrawal.requesterUserId),
      requester: accountName(withdrawal.requesterUserId),
      center,
      handler:
        withdrawalHandler(withdrawal) === 'center'
          ? t('wallet.review.handledByCenter', { name: center })
          : t('wallet.review.handledByAdmin')
    }
  }
}
