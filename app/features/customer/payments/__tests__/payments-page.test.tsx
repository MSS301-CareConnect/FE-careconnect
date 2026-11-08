import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBookingCollection } from '~/entities/booking/booking-api'
import {
  fetchOutstandingDebt,
  fetchPaymentHistory,
  fetchRefundHistory,
  fetchRemainingInvoices,
  redirectToCheckout,
  startInvoiceCheckout
} from '~/entities/payment/payment-api'
import type { RemainingInvoiceRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { PaymentsPage } from '../payments-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBookingCollection: vi.fn()
}))
vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  fetchOutstandingDebt: vi.fn(),
  fetchPaymentHistory: vi.fn(),
  fetchRefundHistory: vi.fn(),
  fetchRemainingInvoices: vi.fn(),
  startInvoiceCheckout: vi.fn(),
  redirectToCheckout: vi.fn()
}))

const overdue: RemainingInvoiceRecord = {
  id: 'inv-1',
  bookingId: 'bk-1',
  amount: 1400000,
  dueAt: '2026-11-04T01:00:00Z',
  status: 'OVERDUE'
}
const page = { page: 0, size: 10, totalElements: 1, totalPages: 1 }

function renderPage(path = '/customer/payments') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <PaymentsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchBookingCollection).mockResolvedValue({
    items: [
      {
        id: 'bk-1',
        bookingCode: 'BK0001',
        status: 'CONFIRMED',
        recipientName: 'Bà Lan',
        bookingType: 'RECURRING',
        startDate: '2026-11-05',
        totalAmount: 2000000
      },
      {
        id: 'bk-2',
        bookingCode: 'BK0002',
        status: 'AWAITING_INITIAL_PAYMENT',
        recipientName: 'Ông Minh',
        bookingType: 'SHIFT',
        startDate: '2026-11-06',
        totalAmount: 500000
      }
    ],
    totalElements: 2,
    truncated: false
  })
  vi.mocked(fetchOutstandingDebt).mockResolvedValue({
    hasDebt: true,
    overdueInvoices: [overdue],
    pendingInvoices: []
  })
  vi.mocked(fetchRemainingInvoices).mockResolvedValue({ ...page, items: [overdue] })
  vi.mocked(fetchPaymentHistory).mockResolvedValue({
    ...page,
    items: [
      {
        id: 'pay-1',
        bookingId: 'bk-1',
        paymentType: 'DEPOSIT',
        status: 'SUCCESS',
        amount: 600000,
        refundedAmount: 300000,
        currency: 'VND',
        createdAt: '2026-11-01T01:00:00Z'
      }
    ]
  })
  vi.mocked(fetchRefundHistory).mockResolvedValue({
    ...page,
    items: [
      {
        id: 'ref-1',
        bookingId: 'bk-1',
        paymentId: 'pay-1',
        amount: 200000,
        feeAmount: 100000,
        reason: 'CUSTOMER_CANCEL',
        status: 'REFUNDED',
        createdAt: '2026-11-02T01:00:00Z'
      }
    ]
  })
})

describe('Customer payments page', () => {
  it('lists what is due, warns about overdue debt and pays the invoice through VNPay', async () => {
    vi.mocked(startInvoiceCheckout).mockResolvedValue({
      paymentId: 'pay-2',
      bookingId: 'bk-1',
      invoiceId: 'inv-1',
      paymentType: 'REMAINING',
      provider: 'VNPAY',
      status: 'PENDING',
      amount: 1400000,
      currency: 'VND',
      checkoutUrl: 'https://sandbox.vnpayment.vn/pay?ref=2',
      expiresAt: '2026-11-05T01:15:00Z'
    })
    renderPage()

    expect(await screen.findByText(/Bạn có hóa đơn quá hạn/)).toBeInTheDocument()
    const dueTab = screen.getByRole('tab', { name: /Cần thanh toán/ })
    await waitFor(() => expect(dueTab).toHaveTextContent('2'))
    const due = screen.getByRole('region', { name: 'Khoản cần thanh toán' })
    expect(within(due).getByRole('link', { name: /Thanh toán cọc/ })).toHaveAttribute(
      'href',
      '/customer/bookings/bk-2/deposit'
    )
    expect(within(due).getByText('Quá hạn')).toBeInTheDocument()
    expect(within(due).getByRole('link', { name: 'BK0001' })).toHaveAttribute('href', '/customer/bookings/bk-1')
    fireEvent.click(within(due).getByRole('button', { name: 'Thanh toán' }))

    await waitFor(() => expect(startInvoiceCheckout).toHaveBeenCalledWith('inv-1', expect.anything()))
    await waitFor(() => expect(redirectToCheckout).toHaveBeenCalledWith('https://sandbox.vnpayment.vn/pay?ref=2'))
  })

  it('lists payment history, invoices and refunds in their own tabs with translated statuses', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: 'Lịch sử' }))
    const history = await screen.findByRole('region', { name: 'Lịch sử thanh toán' })
    expect(await within(history).findByText('Khoản thanh toán đầu')).toBeInTheDocument()
    expect(within(history).getByText(/Đã hoàn 300\.000/)).toBeInTheDocument()
    const invoices = screen.getByRole('region', { name: 'Hóa đơn phần còn lại' })
    expect(await within(invoices).findByText('Quá hạn')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Hoàn tiền' }))
    const refunds = await screen.findByRole('region', { name: 'Hoàn tiền' })
    expect(await within(refunds).findByText('Bạn hủy buổi chăm sóc')).toBeInTheDocument()
    expect(within(refunds).getByText('Đã hoàn tiền')).toBeInTheDocument()
  })

  it('shows empty states without debt', async () => {
    vi.mocked(fetchOutstandingDebt).mockResolvedValue({ hasDebt: false, overdueInvoices: [], pendingInvoices: [] })
    vi.mocked(fetchBookingCollection).mockResolvedValue({ items: [], totalElements: 0, truncated: false })
    vi.mocked(fetchRefundHistory).mockResolvedValue({ ...page, totalElements: 0, totalPages: 0, items: [] })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Bạn đã thanh toán đủ' })).toBeInTheDocument()
    expect(screen.queryByText(/Bạn có hóa đơn quá hạn/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Hoàn tiền' }))
    expect(await screen.findByRole('heading', { name: 'Chưa có khoản hoàn tiền nào' })).toBeInTheDocument()
  })
})
