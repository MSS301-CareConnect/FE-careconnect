import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { AdminLayout } from '~/features/admin/layout/admin-layout'
import { AdminRevenuePage } from '~/features/admin/revenue/admin-revenue-page'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminDashboardPage } from '../admin-dashboard-page'

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
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminLayout />} path='/admin'>
          <Route element={<AdminDashboardPage />} path='dashboard' />
          <Route element={<AdminRevenuePage />} path='revenue' />
        </Route>
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Admin dashboard', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('uses a separate Admin shell and navigates to revenue reporting', () => {
    renderAdmin()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tổng quan nền tảng')
    expect(screen.getByRole('navigation', { name: 'Menu quản trị hệ thống' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Bảng điều khiển/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Quản lý Khách hàng/ })).toHaveAttribute('href', '/admin/customers')
    expect(screen.getByRole('link', { name: /Quản lý Trung tâm/ })).toHaveAttribute('href', '/admin/centers')
    expect(screen.getByRole('link', { name: /Dịch vụ & Bảng giá/ })).toHaveAttribute('href', '/admin/services')
    expect(screen.getByRole('link', { name: /Kiểm soát chất lượng/ })).toHaveAttribute('href', '/admin/quality')
    expect(screen.getByRole('link', { name: /Cấu hình chính sách/ })).toHaveAttribute('href', '/admin/policies')
    expect(screen.getByRole('button', { name: 'Làm mới trực tiếp' })).toBeDisabled()
    expect(screen.getByText('Kỳ báo cáo: 01–30/09/2026')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: /Giao dịch & Báo cáo/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/revenue')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quản lý Giao dịch & Doanh thu')
  })

  it('shows sample insights and switches to English', async () => {
    renderAdmin()
    expect(screen.getByRole('heading', { name: 'Thống kê lịch hẹn' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Đội ngũ điều dưỡng & CCHN' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem báo cáo doanh thu' })).toHaveAttribute('href', '/admin/revenue')
    expect(screen.getAllByText(/1[.,]482[.,]500[.,]000\s*₫/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Phí nền tảng mẫu \(15%\):.*222[.,]375[.,]000\s*₫/)).toBeInTheDocument()
    expect(screen.getByText(/dữ liệu minh họa tháng 09\/2026/)).toBeInTheDocument()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Platform overview')
    expect(screen.getByRole('heading', { name: 'GMV by service' })).toBeInTheDocument()
  })

  it('groups the sidebar menu and shows the current page in the topbar breadcrumb', () => {
    renderAdmin()
    const navigation = screen.getByRole('navigation', { name: 'Menu quản trị hệ thống' })
    expect(
      within(navigation)
        .getAllByRole('list')
        .map((list) => list.getAttribute('aria-labelledby'))
    ).toEqual(['admin-nav-overview', 'admin-nav-operations', 'admin-nav-customerCare', 'admin-nav-system'])
    const operations = screen.getByRole('list', { name: 'Vận hành' })
    expect(within(operations).getByRole('button', { name: /Quản lý Lịch đặt/ })).toBeDisabled()
    expect(within(operations).getByRole('link', { name: /Dịch vụ & Bảng giá/ })).toHaveAttribute(
      'href',
      '/admin/services'
    )
    const system = screen.getByRole('list', { name: 'Hệ thống' })
    expect(within(system).getByRole('link', { name: /Tài khoản/ })).toHaveAttribute('href', '/admin/accounts')
    const breadcrumb = screen.getByRole('navigation', { name: 'Đường dẫn trang quản trị' })
    expect(within(breadcrumb).getByText('Tổng quan')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('Bảng điều khiển')).toHaveAttribute('aria-current', 'page')
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
    fireEvent.click(within(navigation).getByRole('link', { name: /Giao dịch & Báo cáo/ }))
    expect(screen.getByRole('button', { name: 'Mở menu quản trị' })).toHaveAttribute('aria-expanded', 'false')
    const breadcrumb = screen.getByRole('navigation', { name: 'Đường dẫn trang quản trị' })
    expect(within(breadcrumb).getByText('Giao dịch & Báo cáo')).toHaveAttribute('aria-current', 'page')
  })
})
