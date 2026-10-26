import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  acceptBookingRequest,
  bookingErrorCode,
  cancelBookingRequest,
  checkIn,
  fetchBookings,
  fetchMyOccurrences,
  placeBooking,
  saveSessionTask
} from './booking-api'

function reply(result: unknown, code = 200): Response {
  return {
    status: 200,
    ok: true,
    text: async () => JSON.stringify({ code, message: 'Success', result }),
    headers: new Headers()
  } as Response
}

const csrf = { token: 'csrf-token', headerName: 'X-XSRF-TOKEN' }
const page = { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }
const booking = { id: 'bk-1', bookingCode: 'BK1', status: 'PENDING' }

function headersOf(options: RequestInit | undefined) {
  return new Headers(options?.headers)
}

afterEach(() => vi.unstubAllGlobals())

describe('BookingService gateway API', () => {
  it('reads bookings and assigned visits with cookies and query filters', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(reply(page)).mockResolvedValueOnce(reply(page))
    vi.stubGlobal('fetch', fetchMock)

    await fetchBookings({ status: 'PENDING', sort: 'createdAt,desc', page: 0, size: 10 })
    await fetchMyOccurrences({ from: '2026-11-01', to: '2026-11-01' })

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      '/api/v1/bookings?status=PENDING&sort=createdAt%2Cdesc&page=0&size=10'
    )
    expect(String(fetchMock.mock.calls[1][0])).toBe('/api/v1/booking-occurrences?from=2026-11-01&to=2026-11-01')
    for (const [, options] of fetchMock.mock.calls)
      expect(options).toMatchObject({ credentials: 'include', method: 'GET' })
  })

  it('creates a booking with the CSRF header, web client type and the Idempotency-Key', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(reply(csrf)).mockResolvedValueOnce(reply(booking))
    vi.stubGlobal('fetch', fetchMock)
    const request = {
      recipientId: 'rec-1',
      centerId: 'center-1',
      scheduleType: 'ONE_TIME' as const,
      startDate: '2026-11-01',
      startTime: '08:00',
      endTime: '10:00',
      services: [{ careServiceId: 'svc-1', pricePlanId: 'plan-1' }]
    }

    await expect(placeBooking(request, 'key-1')).resolves.toEqual(booking)

    const [url, options] = fetchMock.mock.calls[1]
    expect(url).toBe('/api/v1/bookings')
    expect(options).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(JSON.parse(String(options?.body))).toEqual(request)
    const headers = headersOf(options)
    expect(headers.get('X-XSRF-TOKEN')).toBe('csrf-token')
    expect(headers.get('X-Client-Type')).toBe('web')
    expect(headers.get('Idempotency-Key')).toBe('key-1')
  })

  it('posts the cancel, accept, check-in and task contracts to their endpoints', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply(booking))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply(booking))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ sessionId: 's-1', occurrenceId: 'occ-1', status: 'IN_PROGRESS' }))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ id: 't-1', taskType: 'SERVICE', title: 'Bath', status: 'SKIPPED' }))
    vi.stubGlobal('fetch', fetchMock)

    await cancelBookingRequest('bk-1', { reason: 'Đổi kế hoạch', occurrenceIds: ['occ-2'], previewToken: 'tok' })
    await acceptBookingRequest('bk-1')
    await checkIn({ occurrenceId: 'occ-1' })
    await saveSessionTask('s-1', 't-1', { status: 'SKIPPED', skipReason: 'Ngủ' })

    const writes = fetchMock.mock.calls.filter((_, index) => index % 2 === 1)
    expect(writes.map(([url, options]) => [url, options?.method])).toEqual([
      ['/api/v1/bookings/bk-1/cancel', 'POST'],
      ['/api/v1/bookings/bk-1/accept', 'POST'],
      ['/api/v1/care-sessions', 'POST'],
      ['/api/v1/care-sessions/s-1/tasks/t-1', 'PATCH']
    ])
    expect(JSON.parse(String(writes[0][1]?.body))).toEqual({
      reason: 'Đổi kế hoạch',
      occurrenceIds: ['occ-2'],
      previewToken: 'tok'
    })
    // Accepting without a caregiver keeps the one the customer chose.
    expect(JSON.parse(String(writes[1][1]?.body))).toEqual({})
  })

  it('exposes the backend application code of a failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue({
        status: 409,
        ok: false,
        text: async () => JSON.stringify({ code: 5226, message: 'Người chăm sóc không có lịch' }),
        headers: new Headers()
      } as Response)
    )

    const error = await fetchBookings().catch((caught: unknown) => caught)
    expect(bookingErrorCode(error)).toBe(5226)
  })
})
