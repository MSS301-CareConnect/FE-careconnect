import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
    expect(screen.getByText('Ảnh chụp dữ liệu mẫu: 01–30/09/2026')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: /Giao dịch & Báo cáo/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/revenue')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quản lý Giao dịch & Doanh thu')
  })

  it('shows sample insights and switches to English', async () => {
    renderAdmin()
    expect(screen.getByRole('heading', { name: 'Thống kê lịch hẹn' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Đội ngũ điều dưỡng & CCHN' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem báo cáo doanh thu' })).toHaveAttribute('href', '/admin/revenue')
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Platform overview')
    expect(screen.getByRole('heading', { name: 'Revenue by service' })).toBeInTheDocument()
  })

  it('moves the desktop menu with carousel controls', () => {
    renderAdmin()
    const navigation = screen.getByRole('navigation', { name: 'Menu quản trị hệ thống' })
    const scrollBy = vi.fn()
    Object.defineProperties(navigation, {
      clientWidth: { configurable: true, value: 320 },
      scrollWidth: { configurable: true, value: 1000 },
      scrollBy: { configurable: true, value: scrollBy }
    })
    fireEvent.scroll(navigation)
    fireEvent.click(screen.getByRole('button', { name: 'Xem các mục menu tiếp theo' }))
    expect(scrollBy).toHaveBeenCalledWith({ left: 240, behavior: 'smooth' })
    expect(screen.getByRole('button', { name: 'Xem các mục menu trước' })).toBeDisabled()
  })
})
