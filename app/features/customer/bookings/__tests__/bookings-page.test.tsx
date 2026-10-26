import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBookings } from '~/entities/booking/booking-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerBookingsPage } from '../bookings-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBookings: vi.fn()
}))

function renderPage(path = '/customer/bookings') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <CustomerBookingsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
})

describe('CustomerBookingsPage', () => {
  it('lists the customer bookings from BookingService with progress and links', async () => {
    vi.mocked(fetchBookings).mockResolvedValue({
      items: [
        {
          id: 'bk-1',
          bookingCode: 'BK0001',
          status: 'CONFIRMED',
          recipientName: 'Bà Lan',
          scheduleType: 'DAILY',
          startDate: '2026-11-01',
          endDate: '2026-11-03',
          startTime: '08:00:00',
          endTime: '10:00:00',
          totalAmount: 600000,
          completedCount: 1,
          totalCount: 3
        }
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1
    })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Bà Lan' })).toBeInTheDocument()
    expect(screen.getByText('Booking #BK0001')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem lịch đặt' })).toHaveAttribute('href', '/customer/bookings/bk-1')
    expect(fetchBookings).toHaveBeenCalledWith({ sort: 'createdAt,desc', page: 0, size: 10 })
  })

  it('sends the status tab and code search to the backend and offers to clear an empty result', async () => {
    vi.mocked(fetchBookings).mockResolvedValue({ items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Chờ trung tâm duyệt' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm theo mã booking' }), { target: { value: 'A1B2C3' } })
    fireEvent.submit(screen.getByRole('search'))

    await waitFor(() =>
      expect(fetchBookings).toHaveBeenLastCalledWith({
        status: 'PENDING',
        keyword: 'A1B2C3',
        sort: 'createdAt,desc',
        page: 0,
        size: 10
      })
    )
    expect(await screen.findByRole('heading', { name: 'Không có lịch đặt phù hợp' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() => expect(fetchBookings).toHaveBeenLastCalledWith({ sort: 'createdAt,desc', page: 0, size: 10 }))
  })
})
