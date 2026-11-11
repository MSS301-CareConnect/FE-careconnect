import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchRevenue } from '~/entities/payment/payment-api'
import { fetchCaregiver } from '~/entities/provider/provider-api'
import { fetchCenterStatisticsBetween } from '~/entities/statistics/statistics-api'
import { fetchMyWalletStatistics } from '~/entities/wallet/wallet-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { ManagerStatisticsPage } from '../manager-statistics-page'

vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  fetchRevenue: vi.fn()
}))
vi.mock('~/entities/statistics/statistics-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/statistics/statistics-api')>()),
  fetchCenterStatisticsBetween: vi.fn()
}))
vi.mock('~/entities/wallet/wallet-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/wallet/wallet-api')>()),
  fetchMyWalletStatistics: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiver: vi.fn()
}))

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/center-manager/statistics']}>
        <ManagerStatisticsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchCenterStatisticsBetween).mockResolvedValue({
    bookingsByStatus: { CONFIRMED: 2, PENDING_CENTER_CONFIRMATION: 1 },
    bookingsByType: { SHIFT: 2, RECURRING: 1 },
    occurrences: { completed: 3, cancelled: 1, missed: 0, customerNoShow: 0 },
    completionRate: 75,
    avgRating: 4.5,
    reviewCount: 2,
    ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 1 },
    complaints: { open: 1, inProgress: 0, resolved: 0, escalated: 0 },
    topCaregivers: [{ caregiverId: 'cg1', completedSessions: 3, avgRating: 4.5 }],
    trendGroupBy: 'DAY',
    trend: [
      { period: '2026-11-01', bookings: 2, completedVisits: 1, cancelledVisits: 0, missedVisits: 0 },
      { period: '2026-11-02', bookings: 1, completedVisits: 2, cancelledVisits: 1, missedVisits: 0 }
    ]
  })
  vi.mocked(fetchRevenue).mockResolvedValue({
    successfulPaymentCount: 3,
    grossRevenue: 1500000,
    totalRefunded: 300000,
    totalRevenue: 1200000,
    averagePayment: 400000
  })
  vi.mocked(fetchMyWalletStatistics).mockResolvedValue({
    ownerType: 'CENTER',
    from: '2026-11-01T00:00:00Z',
    to: '2026-11-10T00:00:00Z',
    groupBy: 'DAY',
    availableBalance: 900000,
    heldBalance: 0,
    totalIncome: 900000,
    totalWithdrawn: 0,
    bookingCount: 2,
    byType: [],
    series: [{ period: '2026-11-02', income: 900000, withdrawn: 0 }],
    serviceIncome: 900000,
    commissionDeducted: 100000,
    forfeitIncome: 0,
    complaintDebits: 0
  })
  vi.mocked(fetchCaregiver).mockResolvedValue({ id: 'cg1', fullName: 'Lê Thị Hoa' } as Awaited<
    ReturnType<typeof fetchCaregiver>
  >)
})

describe('ManagerStatisticsPage', () => {
  it('shows operations, money and quality for this month and switches the period for every section', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Xu hướng lịch đặt & buổi chăm sóc' })).toBeInTheDocument()
    // The trend opens as grouped columns and switches to lines.
    expect(screen.getByRole('radio', { name: 'Cột' })).toBeChecked()
    expect(screen.queryByRole('img', { name: /Lịch đặt mới/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Đường' }))
    expect(screen.getByRole('img', { name: /Lịch đặt mới/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Kết quả buổi chăm sóc' })).toBeInTheDocument()
    expect(await screen.findByText('Doanh thu thuần', { selector: 'p' })).toBeInTheDocument()
    expect(await screen.findByText('Lê Thị Hoa')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Phân bố đánh giá' })).toBeInTheDocument()
    // Revenue only (2026-11-11): what the center received, no wallet balance and nothing withdrawn.
    expect(await screen.findByText('Trung tâm thực nhận', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Xem trang doanh thu/ })).toHaveAttribute('href', '/center-manager/revenue')
    expect(screen.queryByText(/ví trung tâm/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Đã rút')).not.toBeInTheDocument()
    // Every number of the page uses one period: Vietnam calendar days for BookingService, instants for payments.
    const [fromDate, toDate] = vi.mocked(fetchCenterStatisticsBetween).mock.calls[0]
    expect(fromDate).toMatch(/^\d{4}-\d{2}-01$/)
    expect(toDate >= fromDate).toBe(true)
    const [from, to] = vi.mocked(fetchRevenue).mock.calls[0]
    expect(Date.parse(to)).toBeGreaterThan(Date.parse(from))

    fireEvent.click(screen.getByRole('radio', { name: '30 ngày qua' }))
    await waitFor(() => expect(fetchCenterStatisticsBetween).toHaveBeenCalledTimes(2))
    const [lastFrom, lastTo] = vi.mocked(fetchCenterStatisticsBetween).mock.calls[1]
    expect((Date.parse(lastTo) - Date.parse(lastFrom)) / 86_400_000).toBe(29)
    await waitFor(() => expect(fetchRevenue).toHaveBeenCalledTimes(2))
  })

  it('explains a manager account without a center', async () => {
    vi.mocked(fetchRevenue).mockRejectedValue(Object.assign(new Error('scope'), { status: 403, info: { code: 6027 } }))
    renderPage()
    expect(await screen.findByText('Tài khoản quản lý chưa được gán trung tâm.')).toBeInTheDocument()
  })
})
