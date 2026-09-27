import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CustomerBookingPage } from '../booking-page'

describe('CustomerBookingPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders booking page with all steps and summary in Vietnamese', () => {
    render(
      <MemoryRouter>
        <CustomerBookingPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Tạo lịch hẹn chăm sóc y tế tại nhà'
      })
    ).toBeInTheDocument()

    // Step 1: Patient
    expect(screen.getByText('Cụ Nguyễn Văn An')).toBeInTheDocument()
    expect(
      screen.getByText('Căn hộ 18.04 Tòa Landmark 2, Vinhomes Central Park, P. 22, Bình Thạnh, TP.HCM')
    ).toBeInTheDocument()

    // Step 2: Service plan
    expect(screen.getByText('Chăm sóc Phục hồi sau Tai biến & Mãn tính')).toBeInTheDocument()

    // Step 3: Caregiver
    expect(screen.getAllByText('ĐD. Nguyễn Thị Bích Loan').length).toBeGreaterThanOrEqual(1)

    // Step 4: Schedule
    expect(screen.getByText('Lịch trình & Khung giờ chăm sóc')).toBeInTheDocument()

    // Step 5: Summary sidebar
    expect(screen.getByText('Xác nhận chi phí ca trực')).toBeInTheDocument()
    expect(screen.getByText(/6\.325\.000/)).toBeInTheDocument()
    expect(screen.getByText('Chuyển khoản QR Napas 24/7')).toBeInTheDocument()
  })

  it('allows switching patient between father and mother', () => {
    render(
      <MemoryRouter>
        <CustomerBookingPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Cụ Nguyễn Văn An')).toBeInTheDocument()

    const motherRadio = screen.getByLabelText('Bà Lê Thị Mai - 74 tuổi (Mẹ)')
    fireEvent.click(motherRadio)

    expect(screen.getByText('Bà Lê Thị Mai')).toBeInTheDocument()
  })

  it('allows selecting a different service plan', () => {
    render(
      <MemoryRouter>
        <CustomerBookingPage />
      </MemoryRouter>
    )

    const surgeryPlan = screen.getByText('Hậu phẫu Ngoại khoa & Chăm sóc Vết thương')
    fireEvent.click(surgeryPlan)

    expect(surgeryPlan).toBeInTheDocument()
  })

  it('submits booking and navigates to deposit confirmation', () => {
    render(
      <MemoryRouter initialEntries={['/customer/booking']}>
        <Routes>
          <Route path='/customer/booking' element={<CustomerBookingPage />} />
          <Route path='/customer/booking/deposit' element={<div data-testid='deposit-page' />} />
        </Routes>
      </MemoryRouter>
    )

    const submitBtn = screen.getByRole('button', {
      name: /Xác nhận & Đặt lịch chăm sóc/i
    })
    fireEvent.click(submitBtn)

    expect(screen.getByTestId('deposit-page')).toBeInTheDocument()
  })

  it('switches text to English when language is changed', async () => {
    render(
      <MemoryRouter>
        <CustomerBookingPage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Schedule Home Healthcare Appointment'
        })
      ).toBeInTheDocument()
    })

    expect(screen.getByText('Confirm & Book Care Appointment')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
