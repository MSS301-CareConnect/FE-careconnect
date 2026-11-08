import { useQuery } from '@tanstack/react-query'

import { careCatalogKeys, fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { fetchCenters, providerKeys } from '~/entities/provider/provider-api'
import type { PricePlanRecordPricingUnit, ProviderCenterRecord } from '~/shared/api/generated/contracts'

export const PRICING_UNITS = ['HOUR', 'DAY', 'SHIFT'] as const satisfies readonly PricePlanRecordPricingUnit[]
export type PricingUnit = (typeof PRICING_UNITS)[number]

/** One price plan as the board shows it. */
export interface PlanRow {
  planId: string
  serviceId: string
  serviceName: string
  category: string
  centerId: string
  centerName: string
  planName: string
  unit: PricingUnit
  durationMinutes: number
  price: number
  /**
   * A customer can book it: the standard service, the center's offering and the plan are all active (CareCatalog
   * returns only these to customers).
   */
  sellable: boolean
}

export interface ServiceGroup {
  serviceId: string
  serviceName: string
  category: string
  rows: PlanRow[]
  centerCount: number
  /** Lowest and highest price per pricing unit, across the rows shown. */
  ranges: Partial<Record<PricingUnit, { min: number; max: number }>>
}

/** Every plan of the chosen active centers; ADMIN reads offerings and plans of any status (CAT-02). */
async function fetchPlanRows(centers: ProviderCenterRecord[]): Promise<PlanRow[]> {
  const perCenter = await Promise.all(
    centers.map(async (center) => {
      const offerings = await fetchCenterOfferings(center.id)
      const perOffering = await Promise.all(
        offerings.map(async (offering) => {
          const plans = await fetchPricePlans(offering.id)
          return plans.map<PlanRow>((plan) => ({
            planId: plan.id,
            serviceId: offering.catalogItem.id,
            serviceName: offering.catalogItem.name,
            category: offering.catalogItem.category,
            centerId: center.id,
            centerName: center.centerName,
            planName: plan.planName,
            unit: plan.pricingUnit,
            durationMinutes: plan.durationMinutes,
            price: plan.basePrice,
            sellable:
              plan.isActive !== false && offering.status === 'ACTIVE' && offering.catalogItem.status === 'ACTIVE'
          }))
        })
      )
      return perOffering.flat()
    })
  )
  return perCenter.flat()
}

export function groupByService(rows: readonly PlanRow[]): ServiceGroup[] {
  const groups = new Map<string, ServiceGroup>()
  for (const row of rows) {
    const group = groups.get(row.serviceId) ?? {
      serviceId: row.serviceId,
      serviceName: row.serviceName,
      category: row.category,
      rows: [],
      centerCount: 0,
      ranges: {}
    }
    group.rows.push(row)
    const range = group.ranges[row.unit]
    group.ranges[row.unit] = range
      ? { min: Math.min(range.min, row.price), max: Math.max(range.max, row.price) }
      : { min: row.price, max: row.price }
    groups.set(row.serviceId, group)
  }
  for (const group of groups.values()) {
    group.centerCount = new Set(group.rows.map((row) => row.centerId)).size
    group.rows.sort(
      (a, b) =>
        PRICING_UNITS.indexOf(a.unit) - PRICING_UNITS.indexOf(b.unit) ||
        a.price - b.price ||
        a.centerName.localeCompare(b.centerName, 'vi')
    )
  }
  return [...groups.values()].sort((a, b) => a.serviceName.localeCompare(b.serviceName, 'vi'))
}

/** Active centers for the filter, and the plans of the chosen one (or of every active center). */
export function usePricePlanBoard(centerId: string | undefined) {
  const centers = useQuery({
    queryKey: [...providerKeys.centers, 'price-board'],
    queryFn: () => fetchCenters({ status: 'ACTIVE', page: 0, size: 100 }),
    retry: false
  })
  const chosen = (centers.data?.items ?? []).filter((center) => !centerId || center.id === centerId)
  const plans = useQuery({
    queryKey: [...careCatalogKeys.all, 'price-board', chosen.map((center) => center.id)],
    queryFn: () => fetchPlanRows(chosen),
    enabled: centers.isSuccess,
    retry: false
  })
  return { centers, plans }
}
