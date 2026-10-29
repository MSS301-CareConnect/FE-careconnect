import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PaymentsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
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
  it('warns about overdue debt and pays the invoice through VNPay', async () => {
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
    const invoices = screen.getByRole('region', { name: 'Hóa đơn phần còn lại' })
    expect(await within(invoices).findByText('Quá hạn')).toBeInTheDocument()
    fireEvent.click(within(invoices).getByRole('button', { name: 'Thanh toán' }))

    await waitFor(() => expect(startInvoiceCheckout).toHaveBeenCalledWith('inv-1', expect.anything()))
    await waitFor(() => expect(redirectToCheckout).toHaveBeenCalledWith('https://sandbox.vnpayment.vn/pay?ref=2'))
  })

  it('lists payment and refund history with translated statuses and reasons', async () => {
    renderPage()

    const history = await screen.findByRole('region', { name: 'Lịch sử thanh toán' })
    expect(await within(history).findByText('Tiền cọc')).toBeInTheDocument()
    expect(within(history).getByText(/300\.000/)).toBeInTheDocument()
    const refunds = screen.getByRole('region', { name: 'Hoàn tiền' })
    expect(await within(refunds).findByText('Bạn hủy buổi chăm sóc')).toBeInTheDocument()
    expect(within(refunds).getByText('Đã hoàn tiền')).toBeInTheDocument()
  })

  it('shows empty states without debt', async () => {
    vi.mocked(fetchOutstandingDebt).mockResolvedValue({ hasDebt: false, overdueInvoices: [], pendingInvoices: [] })
    vi.mocked(fetchRemainingInvoices).mockResolvedValue({ ...page, totalElements: 0, totalPages: 0, items: [] })
    vi.mocked(fetchRefundHistory).mockResolvedValue({ ...page, totalElements: 0, totalPages: 0, items: [] })
    renderPage()

    expect(await screen.findByText('Bạn không có hóa đơn nào.')).toBeInTheDocument()
    expect(await screen.findByText('Chưa có khoản hoàn tiền nào.')).toBeInTheDocument()
    expect(screen.queryByText(/Bạn có hóa đơn quá hạn/)).not.toBeInTheDocument()
  })
})
