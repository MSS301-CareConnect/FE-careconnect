import { useState } from 'react'

import type { WalletStatisticsGroupBy } from '~/shared/api/generated/contracts'

export const WALLET_PERIODS = ['month', 'last30', 'year'] as const
export type WalletPeriod = (typeof WALLET_PERIODS)[number]

export interface WalletRange {
  from: string
  to: string
  groupBy: WalletStatisticsGroupBy
}

const DAY = 24 * 60 * 60 * 1000

/** Periods end now; a month or a year starts at local midnight of its first day. A year is charted per month. */
export function walletRange(period: WalletPeriod, now: Date): WalletRange {
  const start =
    period === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : period === 'year'
        ? new Date(now.getFullYear(), 0, 1)
        : new Date(now.getTime() - 30 * DAY)
  return { from: start.toISOString(), to: now.toISOString(), groupBy: period === 'year' ? 'MONTH' : 'DAY' }
}

/** The chosen period and its range; the range is fixed per choice so query keys stay stable between renders. */
export function useWalletPeriod(initial: WalletPeriod = 'month') {
  const [period, setPeriod] = useState<WalletPeriod>(initial)
  const [range, setRange] = useState(() => walletRange(initial, new Date()))
  function choose(next: WalletPeriod) {
    setPeriod(next)
    setRange(walletRange(next, new Date()))
  }
  return { period, range, choose }
}
