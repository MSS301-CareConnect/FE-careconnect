import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { careCatalogKeys, fetchCatalogItems } from '~/entities/care-catalog/care-catalog-api'
import { CatalogItemRequestStatus } from '~/shared/api/generated/contracts'

import { serviceCategoryGroup } from '~/entities/care-catalog/service-category'

export const CATALOG_PAGE_SIZE = 10
export const catalogStatuses = Object.values(CatalogItemRequestStatus)

/** Lowercases and strips Vietnamese diacritics so "cham soc" matches "Chăm sóc". */
function searchable(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd').replaceAll('Đ', 'D').toLowerCase()
}

/**
 * The catalog endpoint returns every non-deleted item at once, so search, filters and
 * pagination run on the cached list while their values live in the URL.
 */
export function useCatalogList() {
  const [params, setParams] = useSearchParams()
  const query = useQuery({ queryKey: careCatalogKeys.items, queryFn: fetchCatalogItems, retry: false })
  const keyword = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const status = catalogStatuses.find((item) => item === params.get('status'))

  const items = query.data ?? []
  // Groups present in the catalog, in the fixed order of the six categories ("other" last).
  const categories = [...new Set(items.map((item) => serviceCategoryGroup(item.category)))]
  const needle = searchable(keyword.trim())
  const filtered = items.filter(
    (item) =>
      (!needle || searchable(`${item.name} ${item.category} ${item.description ?? ''}`).includes(needle)) &&
      (!category || serviceCategoryGroup(item.category) === category) &&
      (!status || item.status === status)
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE))
  const page = Math.min(Math.max(0, Number(params.get('page')) || 0), pageCount - 1)
  const rows = filtered.slice(page * CATALOG_PAGE_SIZE, (page + 1) * CATALOG_PAGE_SIZE)

  function update(name: 'q' | 'category' | 'status' | 'page', value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all' && !(name === 'page' && value === '0')) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }

  function reset() {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const name of ['q', 'category', 'status', 'page']) next.delete(name)
      return next
    })
  }

  return {
    query,
    items,
    categories,
    filtered,
    rows,
    page,
    pageCount,
    keyword,
    category,
    status,
    update,
    reset
  }
}
