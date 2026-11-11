import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAccountStatistics } from '~/entities/identity/account-api'
import { fetchRevenue } from '~/entities/payment/payment-api'
import { fetchProviderStatistics, fetchSystemStatisticsBetween } from '~/entities/statistics/statistics-api'
import { fetchMyWalletStatistics, fetchWithdrawalStatistics } from '~/entities/wallet/wallet-api'
import { AdminLayout } from '~/features/admin/layout/admin-layout'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminDashboardPage } from '../admin-dashboard-page'

vi.mock('~/entities/statistics/statistics-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/statistics/statistics-api')>()),
  fetchSystemStatisticsBetween: vi.fn(),
  fetchProviderStatistics: vi.fn()
}))
vi.mock('~/entities/identity/account-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/identity/account-api')>()),
  fetchAccountStatistics: vi.fn()
}))
vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  fetchRevenue: vi.fn()
}))
vi.mock('~/entities/wallet/wallet-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/wallet/wallet-api')>()),
  fetchMyWalletStatistics: vi.fn(),
  fetchWithdrawalStatistics: vi.fn()
}))

function Location() {
  const location = useLocation()
  return (
    <output data-testid='location'>
      {location.pathname}
      {location.search}
    </output>
  )
}
function renderAdmin(path = '/admin/dashboard') {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AdminLayout />} path='/admin'>
            <Route element={<AdminDashboardPage />} path='dashboard' />
          </Route>
        </Routes>
        <Location />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Admin dashboard', () => {
  beforeEach(async () => {
    vi.mocked(fetchSystemStatisticsBetween).mockResolvedValue({
      bookingsByStatus: { CONFIRMED: 3, PENDING_CENTER_CONFIRMATION: 1 },
      occurrences: { completed: 4, cancelled: 1 },
      complaints: { escalated: 2 },
      completionRate: 80,
      avgRating: 4.5,
      reviewCount: 2,
      ratingDistribution: { '5': 1, '4': 1 },
      trendGroupBy: 'DAY',
      trend: [{ period: '2026-11-01', bookings: 4, completedVisits: 4, cancelledVisits: 1, missedVisits: 0 }],
      byCenter: { items: [], page: 0, size: 100, totalElements: 0, totalPages: 0 }
    })
    vi.mocked(fetchAccountStatistics).mockResolvedValue({
      usersByRole: { CUSTOMER: 10, CAREGIVER: 4 },
      usersByStatus: { ACTIVE: 14 },
      newCustomers: 3
    })
    vi.mocked(fetchRevenue).mockResolvedValue({
      successfulPaymentCount: 5,
      grossRevenue: 5000000,
      totalRefunded: 500000,
      totalRevenue: 4500000,
      averagePayment: 900000
    })
    vi.mocked(fetchMyWalletStatistics).mockResolvedValue({
      ownerType: 'PLATFORM',
      from: '2026-11-01T00:00:00Z',
      to: '2026-11-10T00:00:00Z',
      groupBy: 'DAY',
      availableBalance: 450000,
      heldBalance: 0,
      totalIncome: 450000,
      totalWithdrawn: 0,
      bookingCount: 4,
      byType: [],
      series: [{ period: '2026-11-01', income: 450000, withdrawn: 0 }],
      commissionIncome: 450000,
      liabilities: [{ ownerType: 'CUSTOMER', walletCount: 2, availableBalance: 300000, heldBalance: 0 }]
    })
    vi.mocked(fetchWithdrawalStatistics).mockResolvedValue({
      scope: 'REVIEW',
      from: '2026-11-01T00:00:00Z',
      to: '2026-11-10T00:00:00Z',
      groupBy: 'DAY',
      pendingCount: 1,
      pendingAmount: 200000,
      requestedCount: 1,
      requestedAmount: 200000,
      completedCount: 0,
      completedAmount: 0,
      rejectedCount: 0,
      rejectedAmount: 0,
      byOwnerType: [],
      series: []
    })
    vi.mocked(fetchProviderStatistics).mockResolvedValue({
      centersByStatus: {},
      caregiversByStatus: {},
      caregiversByVerification: {}
    })
    await setAppLanguage('vi', false)
  })

  it('uses a separate Admin shell, hides preview-only pages and shows only live panels', async () => {
    renderAdmin()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tổng quan nền tảng')
    expect(screen.getByRole('navigation', { name: 'Menu quản trị hệ thống' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Tổng quan/ })).toHaveAttribute('aria-current', 'page')
    // "Khách hàng" and "Tài khoản" were the same list: one "Tài khoản" item under the Khách hàng section (2026-11-10).
    expect(screen.queryByRole('link', { name: /^Khách hàng$/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /^Tài khoản$/ })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /^Trung tâm$/ })).toHaveAttribute('href', '/admin/centers')
    expect(screen.getByRole('link', { name: /^Dịch vụ$/ })).toHaveAttribute('href', '/admin/services')
    // Pages without a backend stay out of the menu (D26).
    expect(screen.queryByRole('link', { name: /Kiểm soát chất lượng/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Cấu hình chính sách/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Giao dịch & Báo cáo/ })).not.toBeInTheDocument()
    // Sample financial charts are no longer rendered under the live numbers (A-15).
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Xem báo cáo doanh thu' })).not.toBeInTheDocument()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Platform overview')
  })

  it('shows the admin queues, live operations and platform money for the chosen period', async () => {
    renderAdmin()
    expect(await screen.findByRole('heading', { name: 'Việc cần xử lý' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Mở Yêu cầu rút tiền chờ xử lý' })).toHaveAttribute(
      'href',
      '/admin/withdrawals'
    )
    // Revenue only (2026-11-11): the platform has no wallet balance to show and links to its revenue page.
    expect(await screen.findByText('Thu trên 4 lịch đặt')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Xem doanh thu nền tảng/ })).toHaveAttribute('href', '/admin/revenue')
    expect(screen.queryByText(/Ví nền tảng/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mở Khiếu nại chuyển lên admin' })).toHaveAttribute(
      'href',
      '/admin/reviews-complaints'
    )
    expect(await screen.findByText('Hoa hồng nền tảng', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Xu hướng lịch đặt & buổi chăm sóc' })).toBeInTheDocument()
    const [fromDate, toDate] = vi.mocked(fetchSystemStatisticsBetween).mock.calls[0]
    expect(fromDate).toMatch(/-01$/)
    expect(toDate >= fromDate).toBe(true)

    fireEvent.click(screen.getByRole('radio', { name: 'Năm nay' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/dashboard?period=year')
    await waitFor(() =>
      expect(vi.mocked(fetchSystemStatisticsBetween).mock.calls.some(([from]) => from.endsWith('-01-01'))).toBe(true)
    )
  })

  it('groups the sidebar menu without a topbar breadcrumb', () => {
    renderAdmin()
    const navigation = screen.getByRole('navigation', { name: 'Menu quản trị hệ thống' })
    expect(
      within(navigation)
        .getAllByRole('list')
        .map((list) => list.getAttribute('aria-labelledby'))
    ).toEqual([
      null,
      'admin-sidebar-operations',
      'admin-sidebar-finance',
      'admin-sidebar-customerCare',
      'admin-sidebar-system'
    ])
    const operations = screen.getByRole('list', { name: 'Vận hành' })
    expect(within(operations).getByRole('link', { name: /Lịch đặt/ })).toHaveAttribute('href', '/admin/bookings')
    expect(within(operations).queryByRole('button')).not.toBeInTheDocument()
    expect(within(operations).getByRole('link', { name: /^Dịch vụ$/ })).toHaveAttribute('href', '/admin/services')
    const customerCare = screen.getByRole('list', { name: 'Khách hàng' })
    expect(within(customerCare).getByRole('link', { name: /Tài khoản/ })).toHaveAttribute('href', '/admin/accounts')
    const system = screen.getByRole('list', { name: 'Hệ thống' })
    expect(within(system).queryByRole('link', { name: /Tài khoản/ })).not.toBeInTheDocument()
    expect(within(system).getByRole('link', { name: /Sự cố/ })).toHaveAttribute('href', '/admin/incidents')
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
  })

  it('opens and closes a parent section and remembers the choice', () => {
    localStorage.removeItem('careconnect.admin.navOpenGroups')
    const { unmount } = renderAdmin()
    const operations = screen.getByRole('button', { name: 'Vận hành' })
    expect(operations).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(operations)
    expect(operations).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById(operations.getAttribute('aria-controls') ?? '')).toHaveAttribute('inert')
    expect(JSON.parse(localStorage.getItem('careconnect.admin.navOpenGroups') ?? '{}')).toEqual({ operations: false })

    unmount()
    renderAdmin()
    expect(screen.getByRole('button', { name: 'Vận hành' })).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Vận hành' }))
    expect(screen.getByRole('button', { name: 'Vận hành' })).toHaveAttribute('aria-expanded', 'true')
    localStorage.removeItem('careconnect.admin.navOpenGroups')
  })

  it('opens the sidebar as a drawer and closes it on Escape or navigation', () => {
    renderAdmin()
    expect(screen.getByRole('button', { name: 'Mở menu quản trị' })).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'Mở menu quản trị' }))
    expect(screen.getByRole('button', { name: 'Đóng menu quản trị', expanded: true })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'Mở menu quản trị' })).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'Mở menu quản trị' }))
    const navigation = screen.getByRole('navigation', { name: 'Menu quản trị hệ thống' })
    fireEvent.click(within(navigation).getByRole('link', { name: /Tổng quan/ }))
    expect(screen.getByRole('button', { name: 'Mở menu quản trị' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
  })
})
