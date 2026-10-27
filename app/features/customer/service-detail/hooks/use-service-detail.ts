import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import {
  careCatalogErrorStatus,
  careCatalogKeys,
  fetchCenterOffering,
  fetchPricePlans
} from '~/entities/care-catalog/care-catalog-api'
import { fetchPublicCenter, providerKeys, searchCaregiversByService } from '~/entities/provider/provider-api'

/** Caregiver cards shown under the service; the full team stays on the caregiver catalog. */
export const SERVICE_CAREGIVERS_SIZE = 6

/**
 * One center offering with its price plans, its center and the center's caregivers who provide the
 * service. Plans load beside the offering; the center and caregivers wait for the offering's IDs.
 */
export function useServiceDetail() {
  const { offeringId = '' } = useParams()

  const offering = useQuery({
    queryKey: careCatalogKeys.centerOffering(offeringId),
    queryFn: () => fetchCenterOffering(offeringId),
    enabled: Boolean(offeringId),
    retry: false
  })
  const plans = useQuery({
    queryKey: careCatalogKeys.pricePlans(offeringId),
    queryFn: async () => {
      try {
        return await fetchPricePlans(offeringId)
      } catch (error) {
        // An offering without plans answers 404; that is an empty price list, not a failure.
        if (careCatalogErrorStatus(error) === 404) return []
        throw error
      }
    },
    enabled: Boolean(offeringId),
    retry: false,
    select: (items) => items.filter((plan) => plan.isActive !== false).sort((a, b) => a.basePrice - b.basePrice)
  })

  const centerId = offering.data?.centerId ?? ''
  const careServiceId = offering.data?.catalogItem.id ?? ''
  const center = useQuery({
    queryKey: providerKeys.publicCenter(centerId),
    queryFn: () => fetchPublicCenter(centerId),
    enabled: Boolean(centerId),
    retry: false
  })
  const searchParams = { centerId, careServiceIds: [careServiceId], page: 0, size: SERVICE_CAREGIVERS_SIZE }
  const caregivers = useQuery({
    queryKey: providerKeys.serviceCaregivers(searchParams),
    queryFn: () => searchCaregiversByService(searchParams),
    enabled: Boolean(centerId && careServiceId),
    retry: false
  })

  return { offering, plans, center, caregivers }
}
