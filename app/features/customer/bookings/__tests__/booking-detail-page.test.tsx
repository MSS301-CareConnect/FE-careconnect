import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useParams } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerBookingDetailPage } from '../booking-detail-page'
import { CustomerBookingsPage } from '../bookings-page'

function DetailFromRoute() {
  const { code } = useParams()
  return <CustomerBookingDetailPage code={code ?? ''} />
}

function renderBookingRoute(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/customer/bookings' element={<CustomerBookingsPage />} />
        <Route path='/customer/bookings/:code' element={<DetailFromRoute />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CustomerBookingDetailPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('links each booking preview to its own detail URL', () => {
    renderBookingRoute('/customer/bookings')

    const detailLinks = screen.getAllByRole('link', { name: 'Xem chi tiết' })
    expect(detailLinks).toHaveLength(4)
    expect(detailLinks[0]).toHaveAttribute('href', '/customer/bookings/CC-BK-9810')
    fireEvent.click(detailLinks[0])
    expect(screen.getByRole('heading', { level: 1, name: 'Chi tiết ca chăm sóc' })).toBeInTheDocument()
  })

  it('shows the selected ongoing booking with clearly labelled sample clinical data', () => {
    renderBookingRoute('/customer/bookings/CC-BK-9810')

    expect(screen.getByRole('heading', { level: 1, name: 'Chi tiết ca chăm sóc' })).toBeInTheDocument()
    expect(screen.getAllByText(/#CC-BK-9810/)).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Chỉ số sinh hiệu mẫu' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nhật ký chăm sóc mẫu' })).toBeInTheDocument()
    expect(screen.getByText('ĐĐ. Nguyễn Thị Bích Loan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gọi điện cho điều dưỡng' })).toBeDisabled()
  })

  it('shows the selected cancelled booking without ongoing care data', () => {
    renderBookingRoute('/customer/bookings/CC-BK-9640')

    expect(screen.getByText('ĐĐ. Trần Hữu Nam')).toBeInTheDocument()
    expect(screen.getByText('Lịch đặt đã bị hủy. Hiện không có ca chăm sóc nào đang diễn ra.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Chỉ số sinh hiệu mẫu' })).not.toBeInTheDocument()
  })

  it.each([
    ['CC-BK-9824', 'ĐD. Trần B', 'Sắp diễn ra'],
    ['CC-BK-9750', 'ĐD. Lê Thị Thanh Mai', 'Đã hoàn thành']
  ])('shows booking %s with its own caregiver and status', (code, caregiver, status) => {
    renderBookingRoute(`/customer/bookings/${code}`)

    expect(screen.getByText(caregiver)).toBeInTheDocument()
    expect(screen.getAllByText(status).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: 'Chỉ số sinh hiệu mẫu' })).not.toBeInTheDocument()
  })

  it('handles an unknown booking code and supports English', async () => {
    renderBookingRoute('/customer/bookings/UNKNOWN')
    expect(screen.getByRole('heading', { name: 'Không tìm thấy lịch đặt' })).toBeInTheDocument()

    await setAppLanguage('en', false)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Booking not found' })).toBeInTheDocument()
    })
  })
})
