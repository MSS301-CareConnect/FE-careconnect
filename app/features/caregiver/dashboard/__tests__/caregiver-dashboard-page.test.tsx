import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'
import { CaregiverLayout } from '../../layout/caregiver-layout'
import { CaregiverDashboardPage } from '../caregiver-dashboard-page'

function renderPortal() {
  return render(
    <MemoryRouter initialEntries={['/caregiver/dashboard']}>
      <Routes>
        <Route element={<CaregiverLayout />}>
          <Route path='/caregiver/dashboard' element={<CaregiverDashboardPage />} />
          <Route path='*' element={<div />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('Caregiver dashboard portal', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders a dedicated caregiver shell and explicitly labeled sample sessions', () => {
    renderPortal()
    expect(screen.getByRole('heading', { level: 1, name: 'Xin chào, ĐĐ. Nguyễn Mai' })).toBeInTheDocument()
    expect(screen.getByText(/Bản xem thử • Dữ liệu mẫu/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cụ Nguyễn Văn B' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bà Trần Thị C' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Lịch đặt của tôi' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lịch trực' })).toHaveAttribute('href', '/caregiver/schedule')
  })

  it('keeps the sample schedule date relative to the day the page opens', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      vi.setSystemTime(new Date('2027-03-01T02:00:00Z'))
      renderPortal()
      expect(screen.getByText(/Lịch mẫu:.*2027/)).toBeInTheDocument()
      expect(screen.getByText(/02\/03\/2027/)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('toggles preview availability without persisting a server status', () => {
    renderPortal()
    const toggle = screen.getByRole('switch', { name: 'Trạng thái nhận lịch' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Tạm ngừng nhận lịch')).toBeInTheDocument()
    expect(screen.getByText('Thay đổi chỉ áp dụng trong bản xem thử.')).toBeInTheDocument()
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(localStorage.length).toBe(0)
  })

  it('opens mobile navigation and closes it after selecting a dashboard section', () => {
    renderPortal()
    fireEvent.click(screen.getByRole('button', { name: 'Mở menu' }))
    const menu = document.getElementById('caregiver-mobile-menu')!
    fireEvent.click(within(menu).getByRole('link', { name: 'Ca trực' }))
    expect(document.getElementById('caregiver-mobile-menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps clinical, emergency and unconnected remote actions disabled', () => {
    renderPortal()
    for (const name of [
      'Báo cáo sinh hiệu',
      'Gọi khẩn cấp (SOS)',
      'Đánh dấu đã thực hiện',
      'Liên hệ người nhà',
      'Xem hồ sơ bệnh án'
    ]) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }
    expect(screen.getByText(/Y lệnh minh họa/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nộp báo cáo sinh hiệu/ })).toBeDisabled()
    expect(screen.getByText(/chưa liên thông VNeID/)).toBeInTheDocument()
  })

  it('switches the entire portal to English and updates the document title', async () => {
    renderPortal()
    fireEvent.click(screen.getByRole('button', { name: /Chuyển sang Tiếng Anh/ }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Hello, Nurse Nguyễn Mai' })).toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'Schedule' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Emergency call (SOS)' })).toBeDisabled()
    expect(document.title).toBe('Caregiver dashboard | CareConnect')
  })
})
