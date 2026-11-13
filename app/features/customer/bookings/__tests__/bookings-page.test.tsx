import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBookingCollection } from '~/entities/booking/booking-api'
import { fetchOutstandingDebt } from '~/entities/payment/payment-api'
import type { BookingSummaryRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerBookingsPage } from '../bookings-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBookingCollection: vi.fn()
}))
vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  fetchOutstandingDebt: vi.fn()
}))

function booking(overrides: Partial<BookingSummaryRecord>): BookingSummaryRecord {
  return {
    id: 'bk-1',
    bookingCode: 'BK0001',
    status: 'CONFIRMED',
    recipientName: 'Bà Lan',
    bookingType: 'RECURRING',
    recurrenceFrequency: 'DAILY',
    startDate: '2026-11-01',
    endDate: '2026-11-03',
    startTime: '08:00:00',
    endTime: '10:00:00',
    totalAmount: 600000,
    completedCount: 1,
    totalCount: 3,
    createdAt: '2026-10-30T01:00:00Z',
    ...overrides
  }
}

const bookings = [
  booking({}),
  booking({ id: 'bk-2', bookingCode: 'BK0002', status: 'AWAITING_INITIAL_PAYMENT', recipientName: 'Ông Minh' }),
  booking({ id: 'bk-3', bookingCode: 'BK0003', status: 'CANCELLED', recipientName: 'Cụ Đào' }),
  booking({ id: 'bk-4', bookingCode: 'BK0004', status: 'CONFIRMED', recipientName: 'Bà Hoa' })
]

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
  vi.mocked(fetchBookingCollection).mockResolvedValue({
    items: bookings,
    totalElements: bookings.length,
    truncated: false
  })
  vi.mocked(fetchOutstandingDebt).mockResolvedValue({
    hasDebt: false,
    overdueInvoices: [],
    pendingInvoices: [
      { id: 'inv-1', bookingId: 'bk-4', amount: 300000, dueAt: '2026-11-10T01:00:00Z', status: 'PENDING' }
    ]
  })
})

describe('CustomerBookingsPage', () => {
  it('reads the bookings once and shows each card with progress and a link to the detail', async () => {
    renderPage()

    const card = (await screen.findByRole('link', { name: 'Bà Lan' })).closest('article')!
    expect(within(card).getByText('BK0001')).toBeInTheDocument()
    expect(within(card).getByText('1 / 3')).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: /Xem chi tiết/ })).toHaveAttribute('href', '/customer/bookings/bk-1')
    expect(fetchBookingCollection).toHaveBeenCalledTimes(1)
  })

  it('groups statuses into tabs and offers the payment the booking needs', async () => {
    renderPage()

    const actionTab = await screen.findByRole('tab', { name: /Cần xử lý/ })
    await waitFor(() => expect(actionTab).toHaveTextContent('2'))
    fireEvent.click(actionTab)

    expect(actionTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('link', { name: /Thanh toán cọc/ })).toHaveAttribute(
      'href',
      '/customer/bookings/bk-2/deposit'
    )
    expect(screen.getByRole('link', { name: /Thanh toán phần còn lại/ })).toHaveAttribute(
      'href',
      '/customer/bookings/bk-4'
    )
    expect(screen.queryByRole('link', { name: 'Bà Lan' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /Đã hủy/ }))
    expect(await screen.findByRole('link', { name: 'Cụ Đào' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ông Minh' })).not.toBeInTheDocument()
  })

  it('searches by name without diacritics and offers to clear an empty result', async () => {
    renderPage()
    await screen.findByRole('link', { name: 'Bà Lan' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm theo mã lịch đặt hoặc tên' }), {
      target: { value: 'cu dao' }
    })
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Bà Lan' })).not.toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'Cụ Đào' })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm theo mã lịch đặt hoặc tên' }), {
      target: { value: 'ZZZ999' }
    })
    expect(await screen.findByRole('heading', { name: 'Không có lịch đặt phù hợp' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    expect(await screen.findByRole('link', { name: 'Bà Lan' })).toBeInTheDocument()
  })

  it('keeps an older ?status= link narrowed to that exact status', async () => {
    renderPage('/customer/bookings?status=CANCELLED')

    expect(await screen.findByRole('link', { name: 'Cụ Đào' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Bà Lan' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bỏ lọc Đã hủy' })).toBeInTheDocument()
  })

  it('pages the list with a rows-per-page picker and keeps the size in the URL', async () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      booking({
        id: `bk-${index}`,
        bookingCode: `BK${String(index).padStart(4, '0')}`,
        recipientName: `Người ${index}`
      })
    )
    vi.mocked(fetchBookingCollection).mockResolvedValue({ items: many, totalElements: many.length, truncated: false })
    renderPage('/customer/bookings?size=5')

    expect(await screen.findAllByRole('link', { name: /^Người \d+$/ })).toHaveLength(5)
    const pager = screen.getByRole('navigation', { name: /trang/i })
    expect(within(pager).getByLabelText('Số dòng mỗi trang')).toHaveValue('5')
    fireEvent.change(within(pager).getByLabelText('Số dòng mỗi trang'), { target: { value: '20' } })
    await waitFor(() => expect(screen.getAllByRole('link', { name: /^Người \d+$/ })).toHaveLength(12))
  })

  it('invites a new customer to book when there is no booking at all', async () => {
    vi.mocked(fetchBookingCollection).mockResolvedValue({ items: [], totalElements: 0, truncated: false })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Chưa có lịch đặt nào' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })
})
