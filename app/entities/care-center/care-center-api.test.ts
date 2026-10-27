import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchPublicCenters } from '~/entities/provider/provider-api'

import { fetchServiceCenters } from './care-center-api'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCenters: vi.fn()
}))

function page(index: number, centers: [string, string, string?][]) {
  return {
    items: centers.map(([centerId, centerName, address]) => ({ centerId, centerName, address })),
    page: index,
    size: 100,
    totalElements: 3,
    totalPages: 2
  }
}

describe('service centers', () => {
  beforeEach(() => vi.mocked(fetchPublicCenters).mockReset())

  it('reads every page of the customer center list, sorted by name with addresses', async () => {
    vi.mocked(fetchPublicCenters)
      .mockResolvedValueOnce(
        page(0, [
          ['b', 'Trung tâm Bình An', '12 Lê Lợi, Quận 1'],
          ['a', 'An Khang', '']
        ])
      )
      .mockResolvedValueOnce(page(1, [['c', 'Cẩm Tú']]))

    await expect(fetchServiceCenters()).resolves.toEqual([
      { id: 'a', name: 'An Khang', address: undefined },
      { id: 'c', name: 'Cẩm Tú', address: undefined },
      { id: 'b', name: 'Trung tâm Bình An', address: '12 Lê Lợi, Quận 1' }
    ])
    expect(fetchPublicCenters).toHaveBeenNthCalledWith(1, { page: 0, size: 100 })
    expect(fetchPublicCenters).toHaveBeenNthCalledWith(2, { page: 1, size: 100 })
  })
})
