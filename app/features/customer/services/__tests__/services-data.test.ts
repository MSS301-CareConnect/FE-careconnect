import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCaregiverCatalog } from '~/entities/provider/provider-api'

import { fetchServiceCenters, sortServices, type CustomerService } from '../services-data'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiverCatalog: vi.fn()
}))

function service(name: string, centerName?: string, price?: number): CustomerService {
  return {
    id: `${name}-${centerName ?? 'none'}`,
    catalogItemId: name,
    name,
    category: 'Chung',
    center: centerName ? { id: centerName, name: centerName } : undefined,
    plans:
      price === undefined
        ? []
        : [
            {
              id: name,
              centerOfferingId: name,
              planName: name,
              pricingUnit: 'HOUR',
              durationMinutes: 60,
              basePrice: price
            }
          ]
  }
}

describe('customer service data', () => {
  beforeEach(() => vi.mocked(fetchCaregiverCatalog).mockReset())

  it('collects unique centers across caregiver catalog pages', async () => {
    const page = (index: number, centerId: string) => ({
      items: [
        {
          id: `cg-${index}`,
          centerId,
          centerName: `Center ${centerId}`,
          fullName: 'A',
          verificationStatus: 'VERIFIED' as const,
          caregiverStatus: 'ACTIVE' as const,
          version: 0
        }
      ],
      page: index,
      size: 100,
      totalElements: 2,
      totalPages: 2
    })
    vi.mocked(fetchCaregiverCatalog).mockResolvedValueOnce(page(0, 'a')).mockResolvedValueOnce(page(1, 'a'))

    await expect(fetchServiceCenters()).resolves.toEqual([{ id: 'a', name: 'Center a' }])
    expect(fetchCaregiverCatalog).toHaveBeenCalledTimes(2)
  })

  it('keeps services without a center or a price last in every sort', () => {
    const services = [service('Zeta', 'B', 300), service('Alpha'), service('Beta', 'A'), service('Gamma', 'A', 100)]
    const names = (sort: Parameters<typeof sortServices>[1]) => sortServices(services, sort).map((item) => item.name)

    expect(names('center')).toEqual(['Beta', 'Gamma', 'Zeta', 'Alpha'])
    expect(names('name')).toEqual(['Alpha', 'Beta', 'Gamma', 'Zeta'])
    expect(names('priceAsc')).toEqual(['Gamma', 'Zeta', 'Alpha', 'Beta'])
    expect(names('priceDesc')).toEqual(['Zeta', 'Gamma', 'Alpha', 'Beta'])
  })
})
