import { useQueries, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { careCatalogKeys, fetchCatalogItems } from '~/entities/care-catalog/care-catalog-api'
import { providerKeys } from '~/entities/provider/provider-api'

import {
  fetchCenterServices,
  fetchServiceCenters,
  searchable,
  SERVICE_SORTS,
  sortServices,
  unofferedServices,
  type CustomerService
} from '../services-data'

export const SERVICES_PAGE_SIZE = 8

type FilterName = 'q' | 'category' | 'center' | 'sort' | 'page'

/** Search, filters, sort and page live in the URL; the service list is assembled from cached queries. */
export function useCustomerServices() {
  const [params, setParams] = useSearchParams()
  const keyword = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const centerId = params.get('center') ?? ''
  const sort = SERVICE_SORTS.find((item) => item === params.get('sort')) ?? 'center'

  const catalog = useQuery({ queryKey: careCatalogKeys.items, queryFn: fetchCatalogItems, retry: false })
  const centers = useQuery({
    queryKey: [...providerKeys.catalog, 'service-centers'],
    queryFn: fetchServiceCenters,
    retry: false
  })
  const centerServices = useQueries({
    queries: (centers.data ?? []).map((center) => ({
      queryKey: [...careCatalogKeys.centerOfferings(center.id), 'with-price-plans'],
      queryFn: () => fetchCenterServices(center),
      retry: false
    }))
  })

  const offered = centerServices.flatMap((query) => query.data ?? [])
  const all: CustomerService[] = [...offered, ...unofferedServices(catalog.data ?? [], offered)]
  const centerOptions = [...(centers.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  const categories = [...new Set(all.map((service) => service.category))].sort((a, b) => a.localeCompare(b, 'vi'))
  const needle = searchable(keyword.trim())
  const filtered = sortServices(
    all.filter(
      (service) =>
        (!needle || searchable(`${service.name} ${service.category} ${service.center?.name ?? ''}`).includes(needle)) &&
        (!category || service.category === category) &&
        (!centerId || service.center?.id === centerId)
    ),
    sort
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / SERVICES_PAGE_SIZE))
  const page = Math.min(Math.max(0, Number(params.get('page')) || 0), pageCount - 1)
  const rows = filtered.slice(page * SERVICES_PAGE_SIZE, (page + 1) * SERVICES_PAGE_SIZE)

  const isPending = catalog.isPending || centers.isPending || centerServices.some((query) => query.isPending)
  const failedCenters = centerServices.filter((query) => query.isError)
  // Only a page with nothing loadable is an error; having no services yet is the empty state.
  const isError = catalog.isError && offered.length === 0
  const hasPartialError = all.length > 0 && (catalog.isError || centers.isError || failedCenters.length > 0)

  function update(name: FilterName, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      const isDefault = !value || (name === 'sort' && value === 'center') || (name === 'page' && value === '0')
      if (isDefault) next.delete(name)
      else next.set(name, value)
      if (name !== 'page') next.delete('page')
      return next
    })
  }

  function reset() {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const name of ['q', 'category', 'center', 'page']) next.delete(name)
      return next
    })
  }

  function retry() {
    if (catalog.isError) void catalog.refetch()
    if (centers.isError) void centers.refetch()
    for (const query of failedCenters) void query.refetch()
  }

  return {
    keyword,
    category,
    centerId,
    sort,
    centerOptions,
    categories,
    filtered,
    rows,
    page,
    pageCount,
    isPending,
    isError,
    hasPartialError,
    hasFilters: Boolean(keyword || category || centerId),
    update,
    reset,
    retry
  }
}
