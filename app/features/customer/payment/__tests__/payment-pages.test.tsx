import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useParams } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBooking } from '~/entities/booking/booking-api'
import { fetchPayment, startDepositPayment, submitDemoPayment } from '~/entities/payment/payment-api'
import { getEffectivePaymentPolicy } from '~/shared/api/generated/api/payment-policy/payment-policy'
import type { BookingDetailRecord, PaymentRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { DepositPage } from '../deposit-page'
import { PaymentGatewayPage } from '../payment-gateway-page'
import { PaymentResultPage } from '../payment-result-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBooking: vi.fn()
}))
vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  startDepositPayment: vi.fn(),
  fetchPayment: vi.fn(),
  submitDemoPayment: vi.fn()
}))
vi.mock('~/shared/api/generated/api/payment-policy/payment-policy', () => ({
  getEffectivePaymentPolicy: vi.fn()
}))

const BOOKING_ID = 'bk-1'
const PAYMENT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
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
  type: 'DEPOSIT',
  amount: 60000,
  status: 'PENDING',
  expiresAt: '2026-10-31T01:15:00Z'
}

function Outcome() {
  const { outcome } = useParams()
  return <output data-testid={`outcome-${outcome}`} />
}

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<DepositPage bookingId={BOOKING_ID} />} path='/customer/bookings/:id/deposit' />
          <Route element={<PaymentGatewayPage paymentId={PAYMENT_ID} />} path='/customer/payments/:paymentId/gateway' />
          <Route
            element={<PaymentResultPage outcome='success' paymentId={PAYMENT_ID} />}
            path='/customer/payments/:paymentId/success'
          />
          <Route
            element={<PaymentResultPage outcome='failure' paymentId={PAYMENT_ID} />}
            path='/customer/payments/:paymentId/failure'
          />
          <Route element={<Outcome />} path='/test/:outcome' />
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
  it('opens a deposit session with the chosen method and goes to the payment gateway', async () => {
    vi.mocked(startDepositPayment).mockResolvedValue({
      paymentId: PAYMENT_ID,
      bookingId: BOOKING_ID,
      amount: 60000,
      paymentUrl: `/customer/payments/${PAYMENT_ID}/gateway`,
      expiresAt: pending.expiresAt!,
      status: 'PENDING'
    })
    vi.mocked(fetchPayment).mockResolvedValue(pending)
    renderAt(`/customer/bookings/${BOOKING_ID}/deposit`)

    expect(await screen.findByRole('heading', { level: 1, name: 'Đặt cọc giữ lịch' })).toBeInTheDocument()
    expect(await screen.findByText('Bà Lan')).toBeInTheDocument()
    // BookingService sends no deposit amount, so the page shows 30% of the total from the center's policy.
    expect(await screen.findByRole('heading', { name: 'Số tiền cọc dự kiến' })).toBeInTheDocument()
    expect(screen.getByText(/140\.000/)).toBeInTheDocument()
    expect(getEffectivePaymentPolicy).toHaveBeenCalledWith({ centerId: 'center-1' }, expect.anything())
    fireEvent.click(screen.getByRole('radio', { name: /Thẻ quốc tế/ }))
    fireEvent.click(await screen.findByRole('button', { name: /Thanh toán 60\.000/ }))

    await waitFor(() =>
      expect(startDepositPayment).toHaveBeenCalledWith(
        { bookingId: BOOKING_ID, bankCode: 'INTCARD' },
        expect.stringMatching(/^[0-9a-f-]{36}$/)
      )
    )
    expect(await screen.findByRole('heading', { level: 1, name: 'Thanh toán thử nghiệm' })).toBeInTheDocument()
  })

  it('does not offer a payment for a booking that no longer awaits its deposit', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'CONFIRMED' })
    renderAt(`/customer/bookings/${BOOKING_ID}/deposit`)

    expect(await screen.findByRole('heading', { name: 'Lịch đặt này không cần đặt cọc lúc này.' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Thanh toán/ })).not.toBeInTheDocument()
  })

  it('confirms a successful demo payment and shows the confirmed booking', async () => {
    vi.mocked(fetchPayment)
      .mockResolvedValueOnce(pending)
      .mockResolvedValue({ ...pending, status: 'SUCCESS', paidAt: '2026-10-31T01:05:00Z' })
    vi.mocked(fetchBooking)
      .mockResolvedValueOnce(booking)
      .mockResolvedValue({ ...booking, status: 'CONFIRMED' })
    vi.mocked(submitDemoPayment).mockResolvedValue({ ...pending, status: 'SUCCESS' })
    renderAt(`/customer/payments/${PAYMENT_ID}/gateway`)

    fireEvent.click(await screen.findByRole('button', { name: 'Thanh toán thành công' }))
    await waitFor(() => expect(submitDemoPayment).toHaveBeenCalledWith(PAYMENT_ID, 'SUCCESS'))

    expect(await screen.findByRole('heading', { level: 1, name: 'Đặt cọc thành công' })).toBeInTheDocument()
    expect(await screen.findByText('Đã xác nhận')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem lịch đặt' })).toHaveAttribute(
      'href',
      `/customer/bookings/${BOOKING_ID}`
    )
  })

  it('lands on the failure page when the customer fails the payment or the booking refuses it', async () => {
    vi.mocked(fetchPayment)
      .mockResolvedValueOnce(pending)
      .mockResolvedValue({ ...pending, status: 'FAILED', failureReason: 'BOOKING_NOT_CONFIRMABLE' })
    vi.mocked(submitDemoPayment).mockRejectedValue(
      Object.assign(new Error('refused'), { status: 409, info: { code: 6205 } })
    )
    renderAt(`/customer/payments/${PAYMENT_ID}/gateway`)

    fireEvent.click(await screen.findByRole('button', { name: 'Thanh toán thành công' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Thanh toán chưa thành công' })).toBeInTheDocument()
    expect(await screen.findByText('Trung tâm không thể xác nhận lịch đặt này nữa.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Thử thanh toán lại/ })).toHaveAttribute(
      'href',
      `/customer/bookings/${BOOKING_ID}/deposit`
    )
  })

  it('sends the customer to the page that matches the real payment status', async () => {
    vi.mocked(fetchPayment).mockResolvedValue({ ...pending, status: 'SUCCESS' })
    renderAt(`/customer/payments/${PAYMENT_ID}/failure`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Đặt cọc thành công' })).toBeInTheDocument()
  })
})
