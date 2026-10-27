import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverShiftDetailPage } from '../caregiver-shift-detail-page'

describe('CaregiverShiftDetailPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
    vi.restoreAllMocks()
  })

  it('renders shift details, patient profile, checklist, and earnings in Vietnamese', () => {
    render(
      <MemoryRouter>
        <CaregiverShiftDetailPage />
      </MemoryRouter>
    )

    // Heading and status
    expect(screen.getByRole('heading', { level: 1, name: 'Chi tiết Ca trực #BK-8821' })).toBeInTheDocument()
    expect(screen.getByText('Sẵn sàng vào ca')).toBeInTheDocument()
    expect(screen.getByText('Phân công cá nhân')).toBeInTheDocument()

    // Countdown banner
    expect(screen.getByText('Đếm ngược giờ bắt đầu')).toBeInTheDocument()
    expect(screen.getByText('Đã có chỉ đường tới nhà bệnh nhân')).toBeInTheDocument()

    // Patient Profile & Guardian
    expect(screen.getByText('Hồ sơ người cần chăm sóc')).toBeInTheDocument()
    expect(screen.getByText('Cụ Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText('Nam, 78 tuổi')).toBeInTheDocument()
    expect(screen.getByText('Nhóm máu O+')).toBeInTheDocument()
    expect(screen.getByText('Anh Nguyễn Bình (Con trai)')).toBeInTheDocument()

    // Checklist
    expect(screen.getByText('Dịch vụ & danh sách công việc')).toBeInTheDocument()
    expect(screen.getByText('1. Đo sinh hiệu đầu ca')).toBeInTheDocument()
    expect(screen.getByText('5. Bàn giao & Lập phiếu báo cáo')).toBeInTheDocument()

    // Warnings & Equipment
    expect(screen.getByText('Yêu cầu đặc biệt & Cảnh báo lâm sàng')).toBeInTheDocument()
    expect(screen.getByText('Máy đo HA điện tử Omron')).toBeInTheDocument()

    // Family notes
    expect(screen.getByText('Ghi chú & Dặn dò điều dưỡng')).toBeInTheDocument()

    // Timing & Earnings
    expect(screen.getByText('Thời gian & Thù lao')).toBeInTheDocument()
    expect(screen.getByText('350.000')).toBeInTheDocument()

    // Location
    expect(screen.getByText('Địa chỉ & Định vị')).toBeInTheDocument()
    expect(screen.getByText('Căn hộ 804, Tháp Ruby, Chung cư Sunrise City')).toBeInTheDocument()

    // Start shift CTA
    expect(screen.getByRole('button', { name: /BẮT ĐẦU VÀO CA/i })).toBeInTheDocument()
  })

  it('allows checking and unchecking clinical checklist items', () => {
    render(
      <MemoryRouter>
        <CaregiverShiftDetailPage />
      </MemoryRouter>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(5)

    // Check first item
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).toBeChecked()
    expect(screen.getByText('Đã hoàn thành 1/5 mục')).toBeInTheDocument()

    // Check second item
    fireEvent.click(checkboxes[1])
    expect(checkboxes[1]).toBeChecked()
    expect(screen.getByText('Đã hoàn thành 2/5 mục')).toBeInTheDocument()

    // Uncheck first item
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).not.toBeChecked()
    expect(screen.getByText('Đã hoàn thành 1/5 mục')).toBeInTheDocument()
  })

  it('handles starting the shift after user confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <CaregiverShiftDetailPage />
      </MemoryRouter>
    )

    const startBtn = screen.getByRole('button', { name: /BẮT ĐẦU VÀO CA/i })
    fireEvent.click(startBtn)

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getAllByText(/Đang trong ca trực/i).length).toBeGreaterThanOrEqual(1)
  })

  it('handles arrival reporting', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <CaregiverShiftDetailPage />
      </MemoryRouter>
    )

    const arriveBtn = screen.getByRole('button', { name: /Báo đã đến nơi/i })
    fireEvent.click(arriveBtn)

    expect(screen.getByRole('button', { name: /Đã báo tới nơi/i })).toBeDisabled()
  })

  it('opens incident modal, inputs reason and submits successfully', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <CaregiverShiftDetailPage />
      </MemoryRouter>
    )

    const incidentBtn = screen.getByRole('button', { name: /Báo sự cố \/ Hỗ trợ đổi ca trực/i })
    fireEvent.click(incidentBtn)

    expect(screen.getByRole('heading', { level: 3, name: 'Báo sự cố / Yêu cầu hỗ trợ khẩn cấp' })).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText(/Nhập lý do sự cố/i)
    fireEvent.change(textarea, { target: { value: 'Bị kẹt xe nghiêm trọng trên cầu Kênh Tẻ' } })

    const submitBtn = screen.getByRole('button', { name: /Gửi yêu cầu hỗ trợ/i })
    fireEvent.click(submitBtn)

    expect(
      screen.queryByRole('heading', { level: 3, name: 'Báo sự cố / Yêu cầu hỗ trợ khẩn cấp' })
    ).not.toBeInTheDocument()
  })

  it('switches content to English when language is changed', async () => {
    render(
      <MemoryRouter>
        <CaregiverShiftDetailPage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Care Session Detail #BK-8821' })).toBeInTheDocument()
    })

    expect(screen.getByText('Ready for shift')).toBeInTheDocument()
    expect(screen.getByText('Care Recipient Profile')).toBeInTheDocument()
    expect(screen.getByText('Services & Task List')).toBeInTheDocument()
    expect(screen.getByText('START SHIFT NOW')).toBeInTheDocument()
    expect(screen.getByText('Special Requirements & Clinical Warnings')).toBeInTheDocument()
  })
})
