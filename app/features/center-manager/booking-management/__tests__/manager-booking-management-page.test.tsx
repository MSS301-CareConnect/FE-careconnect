import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CenterManagerLayout } from '~/features/center-manager/layout/center-manager-layout'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { ManagerBookingManagementPage } from '../manager-booking-management-page'
import { ManagerBookingDetailPage } from '../manager-booking-detail-page'

function Location() {
  const location = useLocation()
  return (
    <output data-testid='location'>
      {location.pathname}
      {location.search}
    </output>
  )
}
function renderPage(path = '/center-manager/bookings') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<CenterManagerLayout />} path='/center-manager'>
          <Route element={<ManagerBookingManagementPage />} path='bookings' />
          <Route element={<ManagerBookingDetailPage />} path='bookings/:id' />
        </Route>
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Center Manager booking management', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('uses the Manager menu, filters sample bookings in the URL, and previews the selected booking', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quản lý Lịch đặt & Ca trực')
    expect(screen.getByRole('link', { name: 'Quản lý lịch đặt và phân công' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('row')).toHaveLength(7)
    expect(screen.getByRole('button', { name: 'Tạo lịch đặt khẩn cấp / Điều phối' })).toBeDisabled()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'BK-8822' } })
    expect(screen.getByTestId('location')).toHaveTextContent('q=BK-8822')
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Xem booking BK-8822' })).toHaveAttribute(
      'href',
      '/center-manager/bookings/BK-8822'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Xem nhanh booking BK-8822' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Chi tiết booking #BK-8822')
    expect(screen.getByTestId('location')).toHaveTextContent('booking=BK-8822')
    fireEvent.click(screen.getAllByRole('button', { name: 'Đóng chi tiết' })[1])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('exports only the filtered sample and shows empty results', async () => {
    const create = vi.fn<(blob: Blob) => string>(() => 'blob:bookings')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderPage('/center-manager/bookings?status=pending')
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Gán ngay' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Xuất danh sách (CSV)' }))
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsText(create.mock.calls[0][0])
    })
    expect(csv).toContain('BK-8822')
    expect(csv).not.toContain('BK-8821')
    expect(csv.split('\r\n')).toHaveLength(2)
    expect(click).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:bookings')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unknown' } })
    expect(screen.getByText('Không tìm thấy lịch đặt')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất danh sách (CSV)' })).toBeDisabled()
  })

  it('renders the booking screen in English', async () => {
    renderPage()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Booking & Shift Management')
    expect(screen.getByRole('button', { name: 'Create emergency booking / Assign' })).toBeDisabled()
  })

  it('opens the complete BK-8821 sample with consistent financial values and a read-only cancellation flow', () => {
    renderPage()
    fireEvent.click(screen.getByRole('link', { name: 'Xem booking BK-8821' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/center-manager/bookings/BK-8821')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BK-8821')
    expect(screen.getByRole('heading', { name: 'Tiến trình trạng thái ca trực' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Hồ sơ người được chăm sóc' })).toBeInTheDocument()
    expect(screen.getByText('Tổng thanh toán mẫu').parentElement).toHaveTextContent(/108,00\s*US\$/)
    expect(screen.getByText('Đặt cọc 30% (Escrow)').parentElement).toHaveTextContent(/32,40\s*US\$/)
    expect(screen.getByText('Thu sau ca (70%)').parentElement).toHaveTextContent(/75,60\s*US\$/)
    expect(screen.getByText('Chưa có vị trí GPS trực tuyến')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hủy ca trực' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Hủy ca trực #BK-8821')
    expect(screen.getByRole('button', { name: 'Xác nhận hủy ca' })).toBeDisabled()
    fireEvent.click(screen.getAllByRole('button', { name: 'Đóng' })[1])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps other bookings distinct and allows only a local note draft', () => {
    renderPage('/center-manager/bookings/BK-8822')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BK-8822')
    expect(screen.queryByRole('heading', { name: 'Tiến trình trạng thái ca trực' })).not.toBeInTheDocument()
    expect(screen.queryByText('Di chứng tai biến nhẹ')).not.toBeInTheDocument()
    expect(screen.getByText('Chưa có dữ liệu tài chính cho lịch đặt này.')).toBeInTheDocument()
    expect(screen.getByText('Chưa phân công điều dưỡng')).toBeInTheDocument()
    const note = screen.getByRole('textbox', { name: 'Ghi chú điều phối nội bộ' })
    fireEvent.change(note, { target: { value: 'Test note' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu nháp trên trang' }))
    expect(screen.getByText('Đã cập nhật bản nháp trên trang.')).toBeInTheDocument()
  })

  it('handles an unknown booking ID and switches detail copy to English', async () => {
    const view = renderPage('/center-manager/bookings/UNKNOWN')
    expect(screen.getByRole('heading', { name: 'Không tìm thấy lịch đặt' })).toBeInTheDocument()
    view.unmount()
    renderPage('/center-manager/bookings/BK-8821')
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Care shift booking #BK-8821')
    expect(screen.getByText('No live GPS location available')).toBeInTheDocument()
  })
})
