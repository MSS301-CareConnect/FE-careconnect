import { useQueries } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { accountKeys, fetchAccount } from '~/entities/identity/account-api'
import { useCenterNames } from '~/entities/provider/use-provider-names'
import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'

const STALE_MS = 60_000

/**
 * Who asked for each withdrawal, never the UUID: the center name for a center wallet, the Identity account name
 * otherwise. Lookups share the account / center detail caches.
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

  return (withdrawal: WalletWithdrawalRecord) => ({
    owner:
      withdrawal.ownerType === 'CENTER'
        ? centerName(withdrawal.centerId ?? undefined)
        : accountName(withdrawal.requesterUserId),
    requester: accountName(withdrawal.requesterUserId)
  })
}
