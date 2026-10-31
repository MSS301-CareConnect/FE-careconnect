import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { careCatalogKeys, fetchCatalogItems } from '~/entities/care-catalog/care-catalog-api'
import {
  SERVICE_CATEGORIES,
  serviceCategoryGroup,
  type ServiceCategoryGroup
} from '~/entities/care-catalog/service-category'
import { useSelectedCenter } from '~/entities/care-center/selected-center'

import {
  catalogServices,
  fetchCenterServices,
  searchable,
  SERVICE_SORTS,
  sortServices,
  type CustomerService
} from '../services-data'

export const SERVICES_PAGE_SIZE = 8

type FilterName = 'q' | 'category' | 'sort' | 'page'

/**
 * The header's chosen center decides the source: that center's offerings with their prices, or the
 * platform-wide catalog without prices. Search, filters, sort and page live in the URL.
 */
export function useCustomerServices() {
  const [params, setParams] = useSearchParams()
  const { center } = useSelectedCenter()
  const keyword = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const sort = SERVICE_SORTS.find((item) => item === params.get('sort')) ?? 'name'

  const catalog = useQuery({
    queryKey: careCatalogKeys.items,
    queryFn: fetchCatalogItems,
    enabled: !center,
    retry: false
  })
  const centerServices = useQuery({
    queryKey: [...careCatalogKeys.centerOfferings(center?.id ?? ''), 'with-price-plans', center],
    queryFn: () => (center ? fetchCenterServices(center) : Promise.resolve([])),
    enabled: Boolean(center),
    retry: false
  })
  // A disabled query stays pending, so only the active source decides the state.
  const source = center ? centerServices : catalog

  const all: CustomerService[] = center ? (centerServices.data ?? []) : catalogServices(catalog.data ?? [])
  // The six platform groups present in this list, in their fixed order; "other" stays last.
  const present = new Set(all.map((service) => serviceCategoryGroup(service.category)))
  const categories: ServiceCategoryGroup[] = [
    ...SERVICE_CATEGORIES.map((item) => item.key).filter((item) => present.has(item)),
    ...(present.has('other') ? (['other'] as const) : [])
  ]
  const needle = searchable(keyword.trim())
  const filtered = sortServices(
    all.filter(
      (service) =>
        (!needle || searchable(`${service.name} ${service.category}`).includes(needle)) &&
        (!category || serviceCategoryGroup(service.category) === category)
    ),
    sort
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / SERVICES_PAGE_SIZE))
  const page = Math.min(Math.max(0, Number(params.get('page')) || 0), pageCount - 1)
  const rows = filtered.slice(page * SERVICES_PAGE_SIZE, (page + 1) * SERVICES_PAGE_SIZE)

  function update(name: FilterName, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      const isDefault = !value || (name === 'sort' && value === 'name') || (name === 'page' && value === '0')
      if (isDefault) next.delete(name)
      else next.set(name, value)
      if (name !== 'page') next.delete('page')
      return next
    })
  }

  function reset() {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const name of ['q', 'category', 'page']) next.delete(name)
      return next
    })
  }

  return {
    center,
    keyword,
    category,
    sort,
    categories,
    filtered,
    rows,
    page,
    pageCount,
    isPending: source.isPending,
    isError: source.isError,
    hasFilters: Boolean(keyword || category),
    update,
    reset,
    retry: () => void source.refetch()
  }
}
