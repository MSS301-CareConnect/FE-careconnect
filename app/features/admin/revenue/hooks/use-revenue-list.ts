import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { revenuePreview, type RevenueStatus } from '../revenue-preview'

export const revenueTabs = ['all', 'escrow', 'pending', 'settled', 'refunded', 'failed'] as const
export const revenueTypes = ['deposit', 'settlement', 'payout', 'refund', 'fee'] as const
export const revenueGateways = ['visa', 'vietqr', 'bank', 'system'] as const

function matchesStatus(status: RevenueStatus, filter: string) {
  return (
    !filter ||
    filter === 'all' ||
    (filter === 'settled' ? status === 'settled' || status === 'reconciled' : status === filter)
  )
}

export function useRevenueList() {
  const { i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const get = (key: string) => params.get(key) ?? ''
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page' && key !== 'transaction') next.delete('page')
        return next
      },
      { replace: true }
    )
  }
  function reset() {
    setParams({})
  }
  const query = get('q').trim().toLocaleLowerCase(locale)
  const filtered = revenuePreview.transactions
    .filter((transaction) => {
      const searchable = [
        transaction.id,
        transaction.bookingId ?? '',
        transaction.party,
        transaction.counterparty ?? '',
        transaction.method
      ]
        .join(' ')
        .toLocaleLowerCase(locale)
      return (
        searchable.includes(query) &&
        (!get('type') || transaction.type === get('type')) &&
        (!get('gateway') || transaction.gateway === get('gateway')) &&
        matchesStatus(transaction.status, get('status'))
      )
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const perPage = [5, 10, 25].includes(Number(get('size'))) ? Number(get('size')) : 10
  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const page = Math.min(pages, Math.max(1, Math.floor(Number(get('page')) || 1)))
  const shown = filtered.slice((page - 1) * perPage, page * perPage)
  const counts = Object.fromEntries(
    revenueTabs.map((tab) => [
      tab,
      tab === 'all'
        ? revenuePreview.transactions.length
        : revenuePreview.transactions.filter((transaction) => matchesStatus(transaction.status, tab)).length
    ])
  ) as Record<(typeof revenueTabs)[number], number>
  return { get, update, reset, locale, filtered, shown, perPage, pages, page, counts }
}
export type RevenueList = ReturnType<typeof useRevenueList>
