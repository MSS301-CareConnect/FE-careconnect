import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cancelBookingRequest, fetchBooking, fetchBookings } from '~/entities/booking/booking-api'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminBookingDetailPage } from './admin-booking-detail-page'
import { AdminBookingsPage } from './admin-bookings-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBookings: vi.fn(),
  fetchBooking: vi.fn(),
  fetchBookingHistory: vi.fn().mockResolvedValue({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }),
  cancelBookingRequest: vi.fn()
}))

function renderUi(ui: ReactNode, path = '/admin/bookings') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

const detail: BookingDetailRecord = {
  id: 'bk-1',
  bookingCode: 'BK-001',
  status: 'CONFIRMED',
  recipientId: 'rc-1',
  centerId: 'ct-1',
  scheduleType: 'ONE_TIME',
  startDate: '2026-11-02',
  startTime: '08:00',
  endTime: '10:00',
  totalAmount: 500000,
  customer: { fullName: 'Nguyễn An' },
  recipientSnapshot: { fullName: 'Bà Lan' } as BookingDetailRecord['recipientSnapshot'],
  occurrences: []
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
})

describe('Admin bookings (M-11, M-13)', () => {
  it('lists every booking with the status filter from the URL', async () => {
    vi.mocked(fetchBookings).mockResolvedValue({
      items: [
        {
          id: 'bk-1',
          bookingCode: 'BK-001',
          status: 'CONFIRMED',
          recipientName: 'Bà Lan',
          scheduleType: 'ONE_TIME',
          startDate: '2026-11-02',
          startTime: '08:00',
          endTime: '10:00',
          customer: { fullName: 'Nguyễn An' }
        }
      ],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    renderUi(<AdminBookingsPage />, '/admin/bookings?status=CONFIRMED')

    expect(await screen.findByText(/BK-001 · Bà Lan/)).toBeInTheDocument()
    expect(fetchBookings).toHaveBeenCalledWith(expect.objectContaining({ status: 'CONFIRMED', page: 0 }))
  })

  it('lets the admin cancel a running booking with a reason', async () => {
    vi.mocked(fetchBooking).mockResolvedValue(detail)
    vi.mocked(cancelBookingRequest).mockResolvedValue({ ...detail, status: 'CANCELLED' })
    renderUi(<AdminBookingDetailPage id='bk-1' />, '/admin/bookings/bk-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Hủy thay nền tảng' }))
    fireEvent.change(screen.getByLabelText('Lý do'), { target: { value: 'Khiếu nại an toàn nghiêm trọng' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Hủy thay nền tảng' }).at(-1)!)
    await waitFor(() =>
      expect(cancelBookingRequest).toHaveBeenCalledWith('bk-1', { reason: 'Khiếu nại an toàn nghiêm trọng' })
    )
  })

  it('hides the cancel action once the booking has ended', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({ ...detail, status: 'COMPLETED' })
    renderUi(<AdminBookingDetailPage id='bk-1' />, '/admin/bookings/bk-1')
    expect(await screen.findByText(/Bà Lan · #BK-001/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hủy thay nền tảng' })).not.toBeInTheDocument()
  })
})
