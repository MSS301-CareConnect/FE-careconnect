import {
  getMyWallet,
  getMyWalletStatistics,
  getWallet,
  listMyWalletTransactions,
  listWalletTransactions
} from '~/shared/api/generated/api/wallet/wallet'
import {
  approveWalletWithdrawal,
  completeWalletWithdrawal,
  createWalletWithdrawal,
  listWalletWithdrawals,
  rejectWalletWithdrawal
} from '~/shared/api/generated/api/wallet-withdrawal/wallet-withdrawal'
import type {
  CreateWalletWithdrawalRequest,
  WalletOwnerType,
  WalletStatisticsGroupBy,
  WalletWithdrawalStatus
} from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'
import { apiErrorCode, apiErrorStatus, apiRequestErrorKey, type ApiRequestErrorKey } from '~/shared/api/error-details'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })
export const WALLET_PAGE_SIZE = 10
// Whole history for the admin ledger view: PaymentService needs a range, the ledger starts with the 2026 rollout.
const HISTORY_FROM = '2026-01-01T00:00:00.000Z'

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`PaymentService returned code ${response.data.code}`)
  return response.data.result
}

export interface WithdrawalFilters {
  status?: WalletWithdrawalStatus
  ownerType?: WalletOwnerType
  page: number
}

/** Every wallet query sits under `['wallet']`, so one invalidation refreshes balance, ledger, dashboard and requests. */
export const walletKeys = {
  all: ['wallet'] as const,
  mine: ['wallet', 'me'] as const,
  statistics: (from: string, to: string, groupBy: WalletStatisticsGroupBy) =>
    ['wallet', 'me', 'statistics', from, to, groupBy] as const,
  transactions: (from: string, to: string, page: number) => ['wallet', 'me', 'transactions', from, to, page] as const,
  withdrawals: (filters: WithdrawalFilters) => ['wallet', 'withdrawals', filters] as const,
  wallet: (walletId: string) => ['wallet', 'detail', walletId] as const,
  walletTransactions: (walletId: string) => ['wallet', 'detail', walletId, 'transactions'] as const
}

/** The caller's wallet: customer / caregiver own, center manager the center of the session, admin the platform. */
export async function fetchMyWallet() {
  return result(await getMyWallet(readOptions))
}

export async function fetchMyWalletStatistics(from: string, to: string, groupBy: WalletStatisticsGroupBy) {
  return result(await getMyWalletStatistics({ from, to, groupBy }, readOptions))
}

export async function fetchMyWalletTransactions(from: string, to: string, page: number) {
  return result(await listMyWalletTransactions({ from, to, page, size: WALLET_PAGE_SIZE }, readOptions))
}

export async function fetchWithdrawals({ status, ownerType, page }: WithdrawalFilters) {
  return result(await listWalletWithdrawals({ status, ownerType, page, size: WALLET_PAGE_SIZE }, readOptions))
}

/** ADMIN: a requester's wallet and its latest movements while reviewing a withdrawal. */
export async function fetchWallet(walletId: string) {
  return result(await getWallet(walletId, readOptions))
}

export async function fetchWalletTransactions(walletId: string) {
  return result(
    await listWalletTransactions(
      walletId,
      { from: HISTORY_FROM, to: new Date().toISOString(), page: 0, size: WALLET_PAGE_SIZE },
      readOptions
    )
  )
}

export async function requestWithdrawal(request: CreateWalletWithdrawalRequest) {
  return result(await createWalletWithdrawal(request, await writeOptions()))
}

export async function approveWithdrawal(withdrawalId: string) {
  return result(await approveWalletWithdrawal(withdrawalId, await writeOptions()))
}

export async function rejectWithdrawal(withdrawalId: string, reason: string) {
  return result(await rejectWalletWithdrawal(withdrawalId, { reason }, await writeOptions()))
}

export async function completeWithdrawal(withdrawalId: string, transferReference: string) {
  return result(await completeWalletWithdrawal(withdrawalId, { transferReference }, await writeOptions()))
}

const KNOWN_ERROR_CODES = [6027, 6040, 6041, 6042, 6043, 6052] as const
type WalletErrorKey =
  | `wallet.errors.e${(typeof KNOWN_ERROR_CODES)[number]}`
  | 'wallet.errors.generic'
  | 'wallet.errors.unavailable'
  | ApiRequestErrorKey

/** PaymentService wallet codes as translated sentences; anything else falls back to the shared request errors. */
export function walletErrorKey(error: unknown): WalletErrorKey {
  const code = apiErrorCode(error)
  const known = KNOWN_ERROR_CODES.find((item) => item === code)
  if (known) return `wallet.errors.e${known}`
  const status = apiErrorStatus(error)
  return status === 503 || status === 502
    ? 'wallet.errors.unavailable'
    : apiRequestErrorKey(error, 'wallet.errors.generic')
}
