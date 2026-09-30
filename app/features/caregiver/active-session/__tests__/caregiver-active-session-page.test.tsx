import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { readCareReportDraft } from '~/entities/care-session/care-report-draft'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CaregiverActiveSessionPage } from '../caregiver-active-session-page'

function LocationObserver() {
  return <output data-testid='location'>{useLocation().pathname}</output>
}

describe('CaregiverActiveSessionPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders active care session hero, patient dossier, vitals and care plan in Vietnamese', () => {
    render(
      <MemoryRouter>
        <CaregiverActiveSessionPage />
      </MemoryRouter>
    )

    // Hero & Identification
    expect(screen.getByText(/CA TRỰC ĐANG DIỄN RA • LIVE GPS/i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: /Ca sáng: Chăm sóc phục hồi sau tai biến/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/#CC-BK-882194/i)).toBeInTheDocument()

    // Patient card
    expect(screen.getByText('Cụ Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText('78 tuổi')).toBeInTheDocument()
    expect(screen.getByText('Anh Nguyễn Bình')).toBeInTheDocument()
    expect(screen.getByText(/LƯU Ý Y KHOA ĐẶC BIỆT/i)).toBeInTheDocument()

    // Care plan
    expect(screen.getByRole('heading', { level: 2, name: 'Kế hoạch chăm sóc hôm nay' })).toBeInTheDocument()
    expect(screen.getByText('2/5 Hoàn thành')).toBeInTheDocument()

    // Vitals
    expect(screen.getByRole('heading', { level: 2, name: 'Chỉ số sinh hiệu' })).toBeInTheDocument()
    expect(screen.getByText('128/82')).toBeInTheDocument()
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(screen.getByText('76')).toBeInTheDocument()
    expect(screen.getByText('36.8')).toBeInTheDocument()

    // Equipment
    expect(screen.getByText('Máy đo HA điện tử Omron HEM-7120')).toBeInTheDocument()
  })

  it('allows completing in-progress care task and updates progress count', () => {
    render(
      <MemoryRouter>
        <CaregiverActiveSessionPage />
      </MemoryRouter>
    )

    expect(screen.getByText('2/5 Hoàn thành')).toBeInTheDocument()

    const completeTaskBtn = screen.getByRole('button', { name: /Đánh dấu đã hoàn tất/i })
    fireEvent.click(completeTaskBtn)

    expect(screen.getByText('3/5 Hoàn thành')).toBeInTheDocument()
  })

  it('allows adding an ad-hoc task via modal', () => {
    render(
      <MemoryRouter>
        <CaregiverActiveSessionPage />
      </MemoryRouter>
    )

    const addTaskBtn = screen.getByRole('button', { name: /\+ Nhiệm vụ phát sinh/i })
    fireEvent.click(addTaskBtn)

    expect(screen.getByRole('heading', { level: 3, name: 'Thêm nhiệm vụ phát sinh trong ca' })).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText(/Tên nhiệm vụ phát sinh/i)
    fireEvent.change(titleInput, { target: { value: 'Thay băng vết trầy xước khuỷu tay' } })

    const confirmBtn = screen.getByRole('button', { name: 'Thêm nhiệm vụ' })
    fireEvent.click(confirmBtn)

    expect(
      screen.queryByRole('heading', { level: 3, name: 'Thêm nhiệm vụ phát sinh trong ca' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Thay băng vết trầy xước khuỷu tay')).toBeInTheDocument()
  })

  it('allows re-measuring vitals with alert notification', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <CaregiverActiveSessionPage />
      </MemoryRouter>
    )

    const remeasureBtn = screen.getByRole('button', { name: /Đo lại/i })
    fireEvent.click(remeasureBtn)

    expect(window.alert).toHaveBeenCalled()
    expect(screen.getByText('126/80')).toBeInTheDocument()
  })

  it('handles emergency SOS activation flow', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <CaregiverActiveSessionPage />
      </MemoryRouter>
    )

    const sosBtn = screen.getByRole('button', { name: /SOS KHẨN CẤP/i })
    fireEvent.click(sosBtn)

    expect(screen.getByRole('heading', { level: 3, name: 'XÁC NHẬN KÍCH HOẠT SOS KHẨN CẤP' })).toBeInTheDocument()

    const confirmSosBtn = screen.getByRole('button', { name: 'KÍCH HOẠT NGAY' })
    fireEvent.click(confirmSosBtn)

    expect(window.alert).toHaveBeenCalled()
    expect(screen.queryByRole('heading', { level: 3, name: 'XÁC NHẬN KÍCH HOẠT SOS KHẨN CẤP' })).not.toBeInTheDocument()
  })

  it('opens a report draft preserving nursing notes, unfinished tasks and measured vitals', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <CaregiverActiveSessionPage />
        <LocationObserver />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Ghi chú bàn giao cần giữ lại.' } })

    const completeBtn = screen.getByRole('button', { name: /HOÀN TẤT & KÝ NHẬN CA TRỰC/i })
    fireEvent.click(completeBtn)

    expect(
      screen.getByRole('heading', { level: 2, name: /Xác nhận Kết thúc Ca trực & Lập Báo cáo/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Đo sinh hiệu đầu & cuối ca trực')).toBeInTheDocument()
    expect(screen.getByText('4 giờ 00 phút')).toBeInTheDocument()

    const confirmEndBtn = screen.getByRole('button', { name: /XÁC NHẬN KẾT THÚC & LẬP BÁO CÁO/i })
    fireEvent.click(confirmEndBtn)

    expect(screen.getByTestId('location')).toHaveTextContent('/caregiver/shifts/BK-8821/report')
    const draft = readCareReportDraft('BK-8821')
    expect(draft?.notes).toBe('Ghi chú bàn giao cần giữ lại.')
    expect(draft?.tasks.filter((task) => task.done)).toHaveLength(2)
    expect(draft?.tasks).toHaveLength(5)
    expect(draft?.vitals?.pressure).toBe('128/82')
    expect(
      screen.queryByRole('heading', { level: 2, name: /Xác nhận Kết thúc Ca trực & Lập Báo cáo/i })
    ).not.toBeInTheDocument()
  })

  it('switches content to English when language is changed', async () => {
    render(
      <MemoryRouter>
        <CaregiverActiveSessionPage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Morning Shift: Stroke Recovery & Rehabilitation Care/i
        })
      ).toBeInTheDocument()
    })

    expect(screen.getByText('ACTIVE CARE SESSION • LIVE GPS')).toBeInTheDocument()
    expect(screen.getByText('Cụ Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText("Today's Care Plan")).toBeInTheDocument()
    expect(screen.getByText('Vital Signs')).toBeInTheDocument()
  })
})
