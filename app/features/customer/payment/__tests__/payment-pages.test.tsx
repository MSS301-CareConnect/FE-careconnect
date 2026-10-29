import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBooking } from '~/entities/booking/booking-api'
import { fetchPayment, redirectToCheckout, startDepositCheckout, verifyReturn } from '~/entities/payment/payment-api'
import { getEffectivePaymentPolicy } from '~/shared/api/generated/api/payment-policy/payment-policy'
import type { BookingDetailRecord, PaymentRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { DepositPage } from '../deposit-page'
import { PaymentResultPage } from '../payment-result-page'
import { PaymentReturnPage } from '../payment-return-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBooking: vi.fn()
}))
vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  startDepositCheckout: vi.fn(),
  redirectToCheckout: vi.fn(),
  verifyReturn: vi.fn(),
  fetchPayment: vi.fn()
}))
vi.mock('~/shared/api/generated/api/payment-policy/payment-policy', () => ({
  getEffectivePaymentPolicy: vi.fn()
}))

const BOOKING_ID = 'bk-1'
const PAYMENT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
const CHECKOUT_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=VNPAY-1'
const booking: BookingDetailRecord = {
  id: BOOKING_ID,
  bookingCode: 'BK0001',
  status: 'AWAITING_DEPOSIT',
  recipientId: 'rec-1',
  centerId: 'center-1',
  scheduleType: 'ONE_TIME',
  startDate: '2026-11-01',
  startTime: '08:00',
  endTime: '10:00',
  totalAmount: 200000,
  depositDueAt: '2026-11-01T00:00:00Z',
  recipientSnapshot: { fullName: 'Bà Lan' },
  occurrences: []
}
const pending: PaymentRecord = {
  id: PAYMENT_ID,
  bookingId: BOOKING_ID,
  paymentType: 'DEPOSIT',
  amount: 60000,
  refundedAmount: 0,
  currency: 'VND',
  status: 'PENDING'
}

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<DepositPage bookingId={BOOKING_ID} />} path='/customer/bookings/:id/deposit' />
          <Route element={<PaymentReturnPage />} path='/customer/payments/vnpay-return' />
          <Route
            element={<PaymentResultPage outcome='success' paymentId={PAYMENT_ID} />}
            path='/customer/payments/:paymentId/success'
          />
          <Route
            element={<PaymentResultPage outcome='failure' paymentId={PAYMENT_ID} />}
            path='/customer/payments/:paymentId/failure'
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchBooking).mockResolvedValue(booking)
  vi.mocked(getEffectivePaymentPolicy).mockResolvedValue({
    data: { code: 200, message: 'OK', result: { policyId: 'policy-1', depositPercent: 30 } },
    status: 200,
    headers: new Headers()
  })
})

describe('Deposit payment flow', () => {
  it('opens a VNPay checkout and leaves the app for the VNPay page', async () => {
    vi.mocked(startDepositCheckout).mockResolvedValue({
      paymentId: PAYMENT_ID,
      bookingId: BOOKING_ID,
      paymentType: 'DEPOSIT',
      provider: 'VNPAY',
      status: 'PENDING',
      amount: 60000,
      currency: 'VND',
      checkoutUrl: CHECKOUT_URL,
      expiresAt: '2026-10-31T01:15:00Z'
    })
    renderAt(`/customer/bookings/${BOOKING_ID}/deposit`)

    expect(await screen.findByRole('heading', { level: 1, name: 'Đặt cọc giữ lịch' })).toBeInTheDocument()
    expect(await screen.findByText('Bà Lan')).toBeInTheDocument()
    // BookingService sends no deposit amount, so the page shows 30% of the total from the center's policy.
    expect(await screen.findByRole('heading', { name: 'Số tiền cọc dự kiến' })).toBeInTheDocument()
    expect(screen.getByText(/140\.000/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Thanh toán qua VNPay' })).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: /Thanh toán 60\.000/ }))

    await waitFor(() => expect(startDepositCheckout).toHaveBeenCalledWith(BOOKING_ID))
    await waitFor(() => expect(redirectToCheckout).toHaveBeenCalledWith(CHECKOUT_URL))
  })

  it('shows the PaymentService error when the checkout cannot open', async () => {
    vi.mocked(startDepositCheckout).mockRejectedValue(
      Object.assign(new Error('missing price'), { status: 409, info: { code: 6018 } })
    )
    renderAt(`/customer/bookings/${BOOKING_ID}/deposit`)

    fireEvent.click(await screen.findByRole('button', { name: /Thanh toán 60\.000/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('còn buổi chưa có giá')
    expect(redirectToCheckout).not.toHaveBeenCalled()
  })

  it('does not offer a payment for a booking that no longer awaits its deposit', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'CONFIRMED' })
    renderAt(`/customer/bookings/${BOOKING_ID}/deposit`)

    expect(await screen.findByRole('heading', { name: 'Lịch đặt này không cần đặt cọc lúc này.' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Thanh toán/ })).not.toBeInTheDocument()
  })

  it('verifies the VNPay return and waits for the IPN before showing success', async () => {
    vi.mocked(verifyReturn).mockResolvedValue({ paymentId: PAYMENT_ID, bookingId: BOOKING_ID, status: 'PENDING' })
    vi.mocked(fetchPayment)
      .mockResolvedValueOnce(pending)
      .mockResolvedValue({ ...pending, status: 'SUCCESS', paidAt: '2026-10-31T01:05:00Z' })
    vi.mocked(fetchBooking)
      .mockResolvedValueOnce(booking)
      .mockResolvedValue({ ...booking, status: 'CONFIRMED' })
    renderAt('/customer/payments/vnpay-return?vnp_TxnRef=VNPAY-1&vnp_ResponseCode=00&vnp_SecureHash=abc')

    await waitFor(() =>
      expect(verifyReturn).toHaveBeenCalledWith({
        vnp_TxnRef: 'VNPAY-1',
        vnp_ResponseCode: '00',
        vnp_SecureHash: 'abc'
      })
    )
    // A pending payment is never presented as a success.
    expect(await screen.findByRole('heading', { level: 1, name: 'Đang xác nhận thanh toán' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Đang chờ ngân hàng xác nhận…' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Đặt cọc thành công' }, { timeout: 4000 })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Thanh toán thành công' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem lịch đặt' })).toHaveAttribute(
      'href',
      `/customer/bookings/${BOOKING_ID}`
    )
  })

  it('shows an invalid VNPay return as an error', async () => {
    vi.mocked(verifyReturn).mockRejectedValue(Object.assign(new Error('bad'), { status: 400, info: { code: 6008 } }))
    renderAt('/customer/payments/vnpay-return?vnp_TxnRef=VNPAY-1&vnp_SecureHash=forged')

    expect(await screen.findByRole('alert')).toHaveTextContent('Chữ ký kết quả thanh toán không hợp lệ.')
    expect(screen.getByRole('link', { name: 'Xem thanh toán của tôi' })).toHaveAttribute('href', '/customer/payments')
  })

  it('offers a new deposit attempt after a failed payment while the booking still awaits it', async () => {
    vi.mocked(fetchPayment).mockResolvedValue({ ...pending, status: 'FAILED' })
    renderAt(`/customer/payments/${PAYMENT_ID}/failure`)

    expect(await screen.findByRole('heading', { level: 1, name: 'Thanh toán chưa thành công' })).toBeInTheDocument()
    expect(
      await screen.findByText('Giao dịch đã bị hủy ở trang thanh toán hoặc bị ngân hàng từ chối.')
    ).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /Thử thanh toán lại/ })).toHaveAttribute(
      'href',
      `/customer/bookings/${BOOKING_ID}/deposit`
    )
  })

  it('sends a failed remaining-balance payment back to the invoices', async () => {
    vi.mocked(fetchPayment).mockResolvedValue({ ...pending, paymentType: 'REMAINING', status: 'EXPIRED' })
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'COMPLETED' })
    renderAt(`/customer/payments/${PAYMENT_ID}/failure`)

    expect(await screen.findByRole('link', { name: /Thanh toán lại hóa đơn/ })).toHaveAttribute(
      'href',
      '/customer/payments'
    )
  })

  it('names a paid remaining-balance invoice instead of a deposit', async () => {
    vi.mocked(fetchPayment).mockResolvedValue({ ...pending, paymentType: 'REMAINING', status: 'SUCCESS' })
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'COMPLETED' })
    renderAt(`/customer/payments/${PAYMENT_ID}/success`)

    expect(await screen.findByRole('heading', { level: 1, name: 'Đã thanh toán hóa đơn' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Đặt cọc thành công' })).not.toBeInTheDocument()
  })

  it('stops waiting after a minute and points to the payments list', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      vi.mocked(fetchPayment).mockResolvedValue(pending)
      renderAt(`/customer/payments/${PAYMENT_ID}/success`)
      expect(await screen.findByRole('heading', { name: 'Đang chờ ngân hàng xác nhận…' })).toBeInTheDocument()

      await vi.advanceTimersByTimeAsync(60_000)
      expect(await screen.findByRole('heading', { name: 'Chưa nhận được xác nhận từ ngân hàng' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Xem thanh toán của tôi' })).toHaveAttribute('href', '/customer/payments')
      const calls = vi.mocked(fetchPayment).mock.calls.length
      await vi.advanceTimersByTimeAsync(10_000)
      expect(vi.mocked(fetchPayment).mock.calls.length).toBe(calls)

      fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra lại' }))
      await waitFor(() => expect(vi.mocked(fetchPayment).mock.calls.length).toBeGreaterThan(calls))
    } finally {
      vi.useRealTimers()
    }
  })

  it('sends the customer to the page that matches the real payment status', async () => {
    vi.mocked(fetchPayment).mockResolvedValue({ ...pending, status: 'SUCCESS' })
    renderAt(`/customer/payments/${PAYMENT_ID}/failure`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Đặt cọc thành công' })).toBeInTheDocument()
  })
})
