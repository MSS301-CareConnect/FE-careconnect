import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchProviderStatistics, fetchSystemStatistics } from '~/entities/statistics/statistics-api'
import { AdminLayout } from '~/features/admin/layout/admin-layout'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminDashboardPage } from '../admin-dashboard-page'

vi.mock('~/entities/statistics/statistics-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/statistics/statistics-api')>()),
  fetchSystemStatistics: vi.fn(),
  fetchProviderStatistics: vi.fn()
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
    vi.mocked(fetchSystemStatistics).mockResolvedValue({ bookingsByStatus: {}, occurrences: {} })
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
    expect(screen.getByRole('link', { name: /Khách hàng/ })).toHaveAttribute('href', '/admin/customers')
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

  it('groups the sidebar menu without a topbar breadcrumb', () => {
    renderAdmin()
    const navigation = screen.getByRole('navigation', { name: 'Menu quản trị hệ thống' })
    expect(
      within(navigation)
        .getAllByRole('list')
        .map((list) => list.getAttribute('aria-labelledby'))
    ).toEqual([null, 'admin-nav-operations', 'admin-nav-customerCare', 'admin-nav-system'])
    const operations = screen.getByRole('list', { name: 'Vận hành' })
    expect(within(operations).getByRole('link', { name: /Lịch đặt/ })).toHaveAttribute('href', '/admin/bookings')
    expect(within(operations).queryByRole('button')).not.toBeInTheDocument()
    expect(within(operations).getByRole('link', { name: /^Dịch vụ$/ })).toHaveAttribute('href', '/admin/services')
    const system = screen.getByRole('list', { name: 'Hệ thống' })
    expect(within(system).getByRole('link', { name: /Tài khoản/ })).toHaveAttribute('href', '/admin/accounts')
    expect(within(system).getByRole('link', { name: /Sự cố/ })).toHaveAttribute('href', '/admin/incidents')
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
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
