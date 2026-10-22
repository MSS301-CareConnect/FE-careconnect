import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  careCatalogErrorCode,
  careCatalogErrorStatus,
  createCatalog,
  createOffering,
  createOfferingPricePlan,
  fetchCatalogItems,
  fetchCenterOfferings,
  fetchPricePlans,
  removeCatalog,
  saveCatalog,
  saveOffering,
  saveOfferingPricePlan
} from './care-catalog-api'

function reply(result: unknown, code = 200, status = 200): Response {
  return {
    status,
    ok: status < 400,
    text: async () => JSON.stringify({ code, message: 'Success', result }),
    headers: new Headers()
  } as Response
}

const csrf = { token: 'csrf-token', headerName: 'X-XSRF-TOKEN' }
const item = { id: 'item-1', name: 'Elder care', category: 'Elderly', status: 'ACTIVE' }

afterEach(() => vi.unstubAllGlobals())

describe('CareCatalog gateway API', () => {
  it('reads the catalog, center offerings and price plans with cookies', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply([item]))
      .mockResolvedValueOnce(reply([]))
      .mockResolvedValueOnce(reply([]))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCatalogItems()).resolves.toEqual([item])
    await fetchCenterOfferings('center-1')
    await fetchPricePlans('offering-1')

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/catalog-items',
      '/api/v1/center-services/center/center-1',
      '/api/v1/price-plans/center-offering/offering-1'
    ])
    for (const [, options] of fetchMock.mock.calls)
      expect(options).toMatchObject({ credentials: 'include', method: 'GET' })
  })

  it('sends CSRF and web client headers with every catalog mutation', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply(item))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply(item))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply(null))
    vi.stubGlobal('fetch', fetchMock)

    const request = { name: 'Elder care', category: 'Elderly', status: 'ACTIVE' as const }
    await createCatalog(request)
    await saveCatalog('item-1', request)
    await removeCatalog('item-1')

    const writes = [fetchMock.mock.calls[1], fetchMock.mock.calls[3], fetchMock.mock.calls[5]]
    expect(writes.map(([url, options]) => [url, options?.method])).toEqual([
      ['/api/v1/catalog-items', 'POST'],
      ['/api/v1/catalog-items/item-1', 'PUT'],
      ['/api/v1/catalog-items/item-1', 'DELETE']
    ])
    for (const [, options] of writes) {
      expect(options).toMatchObject({ credentials: 'include' })
      expect(new Headers(options?.headers).get('X-XSRF-TOKEN')).toBe('csrf-token')
      expect(new Headers(options?.headers).get('X-Client-Type')).toBe('web')
    }
    expect(JSON.parse(String(writes[0][1]?.body))).toEqual(request)
  })

  it('exposes the HTTP status and backend error code of a failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(reply(csrf))
        .mockResolvedValueOnce(reply(null, 3101, 400))
    )

    const error = await createCatalog({ name: '', category: 'Elderly', status: 'ACTIVE' }).catch((e: unknown) => e)

    expect(careCatalogErrorStatus(error)).toBe(400)
    expect(careCatalogErrorCode(error)).toBe(3101)
  })

  it('scopes offering and price plan writes and sends CSRF headers', async () => {
    const offering = { catalogItemId: 'item-1', centerId: 'center-1', status: 'ACTIVE' as const }
    const plan = {
      centerOfferingId: 'offering-1',
      planName: 'Four hours',
      pricingUnit: 'HOUR' as const,
      durationMinutes: 240,
      basePrice: 400000,
      isActive: true
    }
    const fetchMock = vi.fn<typeof fetch>()
    for (let index = 0; index < 4; index += 1) {
      fetchMock.mockResolvedValueOnce(reply(csrf)).mockResolvedValueOnce(reply(index < 2 ? offering : plan))
    }
    vi.stubGlobal('fetch', fetchMock)

    await createOffering(offering)
    await saveOffering('offering-1', offering)
    await createOfferingPricePlan(plan)
    await saveOfferingPricePlan('plan-1', plan)

    const writes = [1, 3, 5, 7].map((index) => fetchMock.mock.calls[index])
    expect(writes.map(([url, options]) => [url, options?.method])).toEqual([
      ['/api/v1/center-services', 'POST'],
      ['/api/v1/center-services/offering-1', 'PUT'],
      ['/api/v1/price-plans', 'POST'],
      ['/api/v1/price-plans/plan-1', 'PUT']
    ])
    for (const [, options] of writes) {
      expect(options).toMatchObject({ credentials: 'include' })
      expect(new Headers(options?.headers).get('X-XSRF-TOKEN')).toBe('csrf-token')
      expect(new Headers(options?.headers).get('X-Client-Type')).toBe('web')
    }
    expect(JSON.parse(String(writes[0][1]?.body))).toEqual(offering)
    expect(JSON.parse(String(writes[2][1]?.body))).toEqual(plan)
  })
})
