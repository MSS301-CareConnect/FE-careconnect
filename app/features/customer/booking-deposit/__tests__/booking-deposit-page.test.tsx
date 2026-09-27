import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { BookingDepositPage } from '../booking-deposit-page'

describe('BookingDepositPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders booking deposit page with all sections in Vietnamese', () => {
    render(
      <MemoryRouter>
        <BookingDepositPage />
      </MemoryRouter>
    )

    // Breadcrumb & Banner
    expect(screen.getByText('Trang chủ')).toBeInTheDocument()
    expect(screen.getByText('Lịch hẹn đang được giữ chỗ tạm thời')).toBeInTheDocument()
    expect(screen.getByText('Ca trực độc quyền')).toBeInTheDocument()
    expect(screen.getByText('Thời gian giữ chỗ')).toBeInTheDocument()

    // Overview Header & Details
    expect(screen.getByText('Chi tiết lịch hẹn y tế')).toBeInTheDocument()
    expect(screen.getByText('Chờ đặt cọc')).toBeInTheDocument()
    expect(screen.getByText('#CC-BK-9284')).toBeInTheDocument()
    expect(screen.getByText('ĐĐ. Nguyễn Thị Bích Loan')).toBeInTheDocument()
    expect(screen.getByText('Cụ Nguyễn Văn An (78 tuổi • Bố ruột)')).toBeInTheDocument()
    expect(screen.getByText('Căn hộ 18.04 • Tòa Landmark 2')).toBeInTheDocument()

    // Schedule & Protocols
    expect(screen.getByText('28/10 - 01/11/2024')).toBeInTheDocument()
    expect(screen.getByText('08:00 - 16:00 (Ca ngày)')).toBeInTheDocument()
    expect(screen.getByText('Đo sinh hiệu liên tục: Huyết áp, SpO2, Đường huyết')).toBeInTheDocument()

    // Policies
    expect(screen.getByText('Hoàn cọc 100% linh hoạt')).toBeInTheDocument()
    expect(screen.getByText('Bảo hiểm y tế trách nhiệm')).toBeInTheDocument()

    // Payment Widget
    expect(screen.getByText('Thanh toán tiền cọc')).toBeInTheDocument()
    expect(screen.getByText('Quét mã VietQR 24/7')).toBeInTheDocument()
    expect(screen.getByText('0381000599999 (Vietcombank)')).toBeInTheDocument()
    expect(screen.getByText('CC 9284 COC')).toBeInTheDocument()
    expect(screen.getByText('Thanh toán đặt cọc $30 (750.000 đ)')).toBeInTheDocument()
  })

  it('allows switching payment method between VietQR, Card, and Wallet', () => {
    render(
      <MemoryRouter>
        <BookingDepositPage />
      </MemoryRouter>
    )

    // Initial: VietQR is active with account details visible
    expect(screen.getByText('0381000599999 (Vietcombank)')).toBeInTheDocument()

    // Switch to Card
    const cardRadio = screen.getByLabelText(/Thẻ quốc tế \(Visa \/ Master \/ JCB\)/i)
    fireEvent.click(cardRadio)
    expect(cardRadio).toBeChecked()
    expect(screen.queryByText('0381000599999 (Vietcombank)')).not.toBeInTheDocument()

    // Switch to Wallet
    const walletRadio = screen.getByLabelText(/Ví MoMo \/ ZaloPay/i)
    fireEvent.click(walletRadio)
    expect(walletRadio).toBeChecked()

    // Switch back to VietQR
    const vietqrRadio = screen.getByLabelText(/Quét mã VietQR 24\/7/i)
    fireEvent.click(vietqrRadio)
    expect(vietqrRadio).toBeChecked()
    expect(screen.getByText('0381000599999 (Vietcombank)')).toBeInTheDocument()
  })

  it('processes deposit payment and shows confirmation modal', async () => {
    render(
      <MemoryRouter>
        <BookingDepositPage />
      </MemoryRouter>
    )

    const payBtn = screen.getByRole('button', {
      name: /Thanh toán đặt cọc \$30 \(750\.000 đ\)/i
    })
    fireEvent.click(payBtn)

    // Modal should appear after processing timeout
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Đặt cọc thành công!' })).toBeInTheDocument()
      },
      { timeout: 2000 }
    )

    expect(
      screen.getByText(/Điều dưỡng viên ĐĐ\. Nguyễn Thị Bích Loan đã chính thức nhận ca trực/i)
    ).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: 'Đóng' })
    fireEvent.click(closeBtn)

    expect(screen.queryByRole('heading', { name: 'Đặt cọc thành công!' })).not.toBeInTheDocument()
  })

  it('switches text to English when language is changed', async () => {
    render(
      <MemoryRouter>
        <BookingDepositPage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(screen.getByText('Appointment is temporarily reserved')).toBeInTheDocument()
    })

    expect(screen.getByText('Medical Appointment Details')).toBeInTheDocument()
    expect(screen.getByText('Pay Deposit')).toBeInTheDocument()
    expect(screen.getByText('Commitment Policy & Rights Protection')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
