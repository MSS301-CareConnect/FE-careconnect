import { useQueries, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { fetchCaregiver, fetchCenter, providerKeys } from './provider-api'

const STALE_MS = 60_000

/**
 * Display names for ProviderService IDs that other services return bare (BookingService rows, outbox rows). The
 * lookups share the detail caches, so a page listing many rows of one center asks once. A name that cannot be read
 * shows "Unknown" — never the UUID.
 */
export function useCenterName(centerId: string | undefined) {
  const { t } = useTranslation()
  const center = useQuery({
    queryKey: providerKeys.center(centerId ?? ''),
    queryFn: () => fetchCenter(centerId!),
    enabled: Boolean(centerId),
    retry: false,
    staleTime: STALE_MS
  })
  if (!centerId) return t('common.ui.unknownName')
  if (center.isPending) return t('common.ui.loadingName')
  return center.data?.centerName || t('common.ui.unknownName')
}

/** Resolves many center IDs at once; returns a lookup function for list rows. */
export function useCenterNames(centerIds: readonly (string | undefined)[]) {
  const { t } = useTranslation()
  const unique = [...new Set(centerIds.filter((id): id is string => Boolean(id)))]
  const queries = useQueries({
    queries: unique.map((id) => ({
      queryKey: providerKeys.center(id),
      queryFn: () => fetchCenter(id),
      retry: false,
      staleTime: STALE_MS
    }))
  })
  return (centerId: string | undefined) => {
    const query = centerId ? queries[unique.indexOf(centerId)] : undefined
    if (!query) return t('common.ui.unknownName')
    if (query.isPending) return t('common.ui.loadingName')
    return query.data?.centerName || t('common.ui.unknownName')
  }
}

/** Resolves caregiver profile IDs to full names for occurrence lists and staff rows. */
export function useCaregiverNames(caregiverIds: readonly (string | undefined)[]) {
  const { t } = useTranslation()
  const unique = [...new Set(caregiverIds.filter((id): id is string => Boolean(id)))]
  const queries = useQueries({
    queries: unique.map((id) => ({
      queryKey: providerKeys.caregiver(id),
      queryFn: () => fetchCaregiver(id),
      retry: false,
      staleTime: STALE_MS
    }))
  })
  return (caregiverId: string) => {
    const query = queries[unique.indexOf(caregiverId)]
    if (!query) return t('common.ui.unknownName')
    if (query.isPending) return t('common.ui.loadingName')
    return query.data?.fullName || t('common.ui.unknownName')
  }
}
