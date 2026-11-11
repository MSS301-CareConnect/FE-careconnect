import { useState } from 'react'

/**
 * Pages through a list already in memory (2026-11-10) for lists whose endpoint returns everything at once or whose
 * filter runs in the browser. Changing `resetKey` (a filter, a tab) goes back to the first page.
 */
export function useClientPage<T>(items: T[], size: number, resetKey?: unknown) {
  const [state, setState] = useState<{ key: unknown; page: number }>({ key: resetKey, page: 0 })
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  const requested = Object.is(state.key, resetKey) ? state.page : 0
  const page = Math.min(requested, totalPages - 1)
  return {
    page,
    totalPages,
    items: items.slice(page * size, (page + 1) * size),
    setPage: (next: number) => setState({ key: resetKey, page: next })
  }
}
