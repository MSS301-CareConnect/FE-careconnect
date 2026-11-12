import {
  getBookingSettlement,
  getMyWallet,
  getMyWalletStatistics,
  getWallet,
  listMyWalletCenterBalances,
  listMyWalletTransactions,
  listWalletTransactions
} from '~/shared/api/generated/api/wallet/wallet'
import {
  createWalletWithdrawal,
  getWalletWithdrawal,
  getWalletWithdrawalStatistics,
  listWalletWithdrawals,
  rejectWalletWithdrawal,
  transferWalletWithdrawal
} from '~/shared/api/generated/api/wallet-withdrawal/wallet-withdrawal'
import type {
  CreateWalletWithdrawalRequest,
  WalletOwnerType,
  WalletStatisticsGroupBy,
  WalletWithdrawalScope,
  WalletWithdrawalStatus
} from '~/shared/api/generated/contracts'
import { readOptions, serviceResponse, writeOptions } from '~/shared/api/request'
import { apiErrorCode, apiErrorStatus, apiRequestErrorKey, type ApiRequestErrorKey } from '~/shared/api/error-details'

export const WALLET_PAGE_SIZE = 10
// Whole history for the admin ledger view: PaymentService needs a range, the ledger starts with the 2026 rollout.
const HISTORY_FROM = '2026-01-01T00:00:00.000Z'

const { result } = serviceResponse('PaymentService')

export interface WithdrawalFilters {
  /** OWN (default): the caller's wallet, ADMIN everything. REVIEW: the queue the caller handles. */
  scope?: WalletWithdrawalScope
  status?: WalletWithdrawalStatus
  ownerType?: WalletOwnerType
  page: number
  size?: number
}

/** Every wallet query sits under `['wallet']`, so one invalidation refreshes balance, ledger, dashboard and requests. */
export const walletKeys = {
  all: ['wallet'] as const,
  mine: ['wallet', 'me'] as const,
  statistics: (from: string, to: string, groupBy: WalletStatisticsGroupBy) =>
    ['wallet', 'me', 'statistics', from, to, groupBy] as const,
  transactions: (from: string, to: string, page: number, size: number) =>
    ['wallet', 'me', 'transactions', from, to, page, size] as const,
  withdrawals: (filters: WithdrawalFilters) => ['wallet', 'withdrawals', filters] as const,
  withdrawal: (withdrawalId: string) => ['wallet', 'withdrawals', 'detail', withdrawalId] as const,
  withdrawalStatistics: (scope: WalletWithdrawalScope, from: string, to: string, groupBy: WalletStatisticsGroupBy) =>
    ['wallet', 'withdrawals', 'statistics', scope, from, to, groupBy] as const,
  centerBalances: ['wallet', 'me', 'center-balances'] as const,
  settlement: (bookingId: string) => ['wallet', 'settlement', bookingId] as const,
  wallet: (walletId: string) => ['wallet', 'detail', walletId] as const,
  walletTransactions: (walletId: string) => ['wallet', 'detail', walletId, 'transactions'] as const
}

/** The caller's wallet: customer / caregiver own, center manager the center of the session, admin the platform. */
export async function fetchMyWallet() {
  return result(await getMyWallet(readOptions))
}

/** 2026-11-11: settlement of one booking for its center manager or an admin (404 until the booking is paid). */
export async function fetchBookingSettlement(bookingId: string) {
  return result(await getBookingSettlement(bookingId, readOptions))
}

export async function fetchMyWalletStatistics(from: string, to: string, groupBy: WalletStatisticsGroupBy) {
  return result(await getMyWalletStatistics({ from, to, groupBy }, readOptions))
}

export async function fetchMyWalletTransactions(from: string, to: string, page: number, size = WALLET_PAGE_SIZE) {
  return result(await listMyWalletTransactions({ from, to, page, size }, readOptions))
}

export async function fetchWithdrawals({ scope, status, ownerType, page, size = WALLET_PAGE_SIZE }: WithdrawalFilters) {
  return result(await listWalletWithdrawals({ scope, status, ownerType, page, size }, readOptions))
}

/** Withdrawal dashboard of the caller's scope; the center REVIEW queue adds the money held for customers / caregivers. */
export async function fetchWithdrawalStatistics(
  scope: WalletWithdrawalScope,
  from: string,
  to: string,
  groupBy: WalletStatisticsGroupBy
) {
  return result(await getWalletWithdrawalStatistics({ scope, from, to, groupBy }, readOptions))
}

/** CUSTOMER / CAREGIVER: available balance per center holding the money — the center that handles a withdrawal. */
export async function fetchMyCenterBalances() {
  return result(await listMyWalletCenterBalances(readOptions))
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

export async function fetchWithdrawal(withdrawalId: string) {
  return result(await getWalletWithdrawal(withdrawalId, readOptions))
}

export async function requestWithdrawal(request: CreateWalletWithdrawalRequest) {
  return result(await createWalletWithdrawal(request, await writeOptions()))
}

export async function rejectWithdrawal(withdrawalId: string, reason: string) {
  return result(await rejectWalletWithdrawal(withdrawalId, { reason }, await writeOptions()))
}

/** Simulated bank transfer: on success PaymentService completes the request by itself and notifies the requester. */
export async function transferWithdrawal(withdrawalId: string) {
  return result(await transferWalletWithdrawal(withdrawalId, await writeOptions()))
}

const KNOWN_ERROR_CODES = [6027, 6040, 6041, 6042, 6043, 6052, 6053, 6054, 6055] as const
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
