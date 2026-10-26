import { describe, expect, it } from 'vitest'

import { catalogServices, sortServices, type CustomerService } from '../services-data'

function service(name: string, price?: number): CustomerService {
  return {
    id: name,
    catalogItemId: name,
    name,
    category: 'Chung',
    center: { id: 'center-a', name: 'An Khang' },
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
  it('keeps services without a price last in every sort', () => {
    const services = [service('Zeta', 300), service('Alpha'), service('Beta'), service('Gamma', 100)]
    const names = (sort: Parameters<typeof sortServices>[1]) => sortServices(services, sort).map((item) => item.name)

    expect(names('name')).toEqual(['Alpha', 'Beta', 'Gamma', 'Zeta'])
    expect(names('priceAsc')).toEqual(['Gamma', 'Zeta', 'Alpha', 'Beta'])
    expect(names('priceDesc')).toEqual(['Zeta', 'Gamma', 'Alpha', 'Beta'])
  })

  it('turns only active catalog items into platform-wide services without prices', () => {
    const services = catalogServices([
      { id: 'a', name: 'A', category: 'C', status: 'ACTIVE' },
      { id: 'b', name: 'B', category: 'C', status: 'INACTIVE' }
    ])
    expect(services).toEqual([{ id: 'a', catalogItemId: 'a', name: 'A', category: 'C', plans: [] }])
  })
})
