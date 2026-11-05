import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  cancelBookingRequest,
  fetchBooking,
  fetchBookingHistory,
  fetchCenterBookingPolicy,
  previewCancellation
} from '~/entities/booking/booking-api'
import { fetchOpenInvoiceOfBooking, redirectToCheckout, startInvoiceCheckout } from '~/entities/payment/payment-api'
import { fetchPublicCaregiver } from '~/entities/provider/provider-api'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerBookingDetailPage } from '../booking-detail-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBooking: vi.fn(),
  fetchBookingHistory: vi.fn(),
  fetchCenterBookingPolicy: vi.fn(),
  previewCancellation: vi.fn(),
  cancelBookingRequest: vi.fn()
}))

vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  fetchOpenInvoiceOfBooking: vi.fn(),
  startInvoiceCheckout: vi.fn(),
  redirectToCheckout: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCaregiver: vi.fn()
}))

const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
const booking: BookingDetailRecord = {
  id: 'bk-1',
  bookingCode: 'BK0001',
  status: 'PENDING_CENTER_CONFIRMATION',
  recipientId: 'rec-1',
  centerId: 'center-1',
  bookingType: 'CUSTOM',
  startDate: '2026-11-01',
  startTime: '08:00',
  endTime: '10:00',
  totalAmount: 200000,
  initialPaymentPercent: 30,
  recipientSnapshot: { fullName: 'Bà Lan' },
  occurrences: [
    {
      id: 'occ-1',
      occurrenceNo: 1,
      startAt: future.toISOString(),
      endAt: new Date(future.getTime() + 7_200_000).toISOString(),
      status: 'SCHEDULED',
      priceAmount: 200000
    }
  ]
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CustomerBookingDetailPage id='bk-1' />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchCenterBookingPolicy).mockResolvedValue({
    centerId: 'center-1',
    customized: false,
    shiftMinAdvanceMinutes: 120,
    recurringMinAdvanceMinutes: 2880,
    customMinAdvanceMinutes: 2880,
    confirmationTimeoutMinutes: 1440,
    assignmentTimeoutMinutes: 1440,
    initialPaymentTimeoutMinutes: 1440,
    remainingPaymentDueBeforeMinutes: 1440,
    remainingPaymentReminderMinutes: [4320, 2880],
    depositPercent: 30,
    checkInEarlyMinutes: 30,
    checkInLateMinutes: 30,
    refundThresholdMinutes: 1440,
    refundPercentBeforeThreshold: 100,
    refundPercentAfterThreshold: 70,
    overduePaymentForfeitPercent: 100
  })
  await setAppLanguage('vi', false)
  vi.mocked(fetchBookingHistory).mockResolvedValue({
    items: [{ eventType: 'BOOKING_STATUS_CHANGED', toStatus: 'PENDING', changedAt: '2026-10-26T01:00:00Z' }],
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1
  })
})

describe('CustomerBookingDetailPage', () => {
  it('shows the next step, the visits and the history of a booking', async () => {
    vi.mocked(fetchBooking).mockResolvedValue(booking)
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Bà Lan' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Đang chờ trung tâm xác nhận' })).toBeInTheDocument()
    expect(screen.getByText(/Buổi 1/)).toBeInTheDocument()
    expect(await screen.findByText('Lịch đặt được cập nhật trạng thái')).toBeInTheDocument()
  })

  it('cancels an unpaid booking as a whole without a refund preview', async () => {
    const cancelled = { ...booking, status: 'CANCELLED' as const, cancelReason: 'Đổi kế hoạch' }
    vi.mocked(fetchBooking).mockResolvedValueOnce(booking).mockResolvedValue(cancelled)
    vi.mocked(cancelBookingRequest).mockResolvedValue(cancelled)
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Thao tác khác' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hủy lịch đặt' }))
    const dialog = screen.getByRole('dialog', { name: 'Hủy lịch đặt #BK0001' })
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Lý do hủy' }), { target: { value: 'Đổi kế hoạch' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy lịch đặt' }))

    await waitFor(() =>
      expect(cancelBookingRequest).toHaveBeenCalledWith('bk-1', {
        reason: 'Đổi kế hoạch',
        occurrenceIds: undefined,
        previewToken: undefined
      })
    )
    expect(previewCancellation).not.toHaveBeenCalled()
    expect(await screen.findByRole('heading', { name: 'Lịch đặt đã hủy' })).toBeInTheDocument()
  })

  it('requires a refund preview before cancelling selected visits of a paid booking', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'CONFIRMED' })
    vi.mocked(previewCancellation).mockResolvedValue({
      items: [
        {
          occurrenceId: 'occ-1',
          startAt: booking.occurrences![0].startAt,
          feeAmount: 18000,
          refundAmount: 42000,
          rule: 'AFTER_THRESHOLD'
        }
      ],
      totalRefund: 60000,
      previewToken: 'preview-1'
    })
    vi.mocked(cancelBookingRequest).mockResolvedValue({ ...booking, status: 'CONFIRMED' })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Thao tác khác' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hủy lịch đặt' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Lý do hủy' }), { target: { value: 'Ốm' } })
    const confirm = within(dialog).getByRole('button', { name: 'Hủy lịch đặt' })
    expect(confirm).toBeDisabled()

    fireEvent.click(within(dialog).getByRole('radio', { name: 'Chỉ một số buổi' }))
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /Buổi 1/ }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xem trước tiền hoàn' }))

    await waitFor(() => expect(previewCancellation).toHaveBeenCalledWith('bk-1', ['occ-1']))
    // The rule code is read out in words, never shown raw.
    const ruleLines = await within(dialog).findAllByText('Hủy sát giờ, trung tâm giữ lại một phần')
    expect(ruleLines.some((line) => line.closest('li'))).toBe(true)
    expect(within(dialog).getByText(/Giữ lại 18/)).toBeInTheDocument()
    expect(within(dialog).queryByText(/AFTER_THRESHOLD/)).not.toBeInTheDocument()
    // The policy panel reads the center booking policy (spec §10.2), not the old platform tiers.
    expect(within(dialog).getByText('Từ 24 giờ trở lên')).toBeInTheDocument()
    expect(within(dialog).getByText('Dưới 24 giờ')).toBeInTheDocument()
    expect(within(dialog).getByText(/70\s?%/)).toBeInTheDocument()
    await waitFor(() => expect(confirm).toBeEnabled())
    fireEvent.click(confirm)
    await waitFor(() =>
      expect(cancelBookingRequest).toHaveBeenCalledWith('bk-1', {
        reason: 'Ốm',
        occurrenceIds: ['occ-1'],
        previewToken: 'preview-1'
      })
    )
  })

  it('shows the assigned caregiver to the family', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'CONFIRMED', caregiverId: 'cg-1' })
    vi.mocked(fetchPublicCaregiver).mockResolvedValue({ caregiverId: 'cg-1', fullName: 'Trần Thị Mai' })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Người chăm sóc được phân công' })).toBeInTheDocument()
    expect(await screen.findByText('Trần Thị Mai')).toBeInTheDocument()
    expect(fetchPublicCaregiver).toHaveBeenCalledWith('cg-1')
  })

  it('offers the initial payment once the center has accepted the booking', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'AWAITING_INITIAL_PAYMENT' })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Thanh toán để xác nhận lịch' })).toBeInTheDocument()
    // The percent BookingService fixed at creation (30%) of the total, never a rate held in the browser.
    expect(screen.getByRole('link', { name: /Thanh toán 60\.000/ })).toHaveAttribute(
      'href',
      '/customer/bookings/bk-1/deposit'
    )
  })

  it('asks for the remaining balance before the first visit and opens its checkout', async () => {
    const dueAt = new Date(future.getTime() - 24 * 60 * 60 * 1000).toISOString()
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'CONFIRMED', remainingPaymentDueAt: dueAt })
    vi.mocked(fetchOpenInvoiceOfBooking).mockResolvedValue({
      id: 'inv-1',
      bookingId: 'bk-1',
      amount: 140000,
      dueAt,
      status: 'PENDING'
    })
    vi.mocked(startInvoiceCheckout).mockResolvedValue({
      paymentId: 'pay-2',
      bookingId: 'bk-1',
      invoiceId: 'inv-1',
      paymentType: 'REMAINING',
      provider: 'VNPAY',
      status: 'PENDING',
      currency: 'VND',
      amount: 140000,
      checkoutUrl: 'https://vnpay.test/remaining',
      expiresAt: dueAt
    })
    renderPage()

    expect(await screen.findByText(/Hãy thanh toán phần còn lại 140\.000/)).toBeInTheDocument()
    expect(screen.getByText('Phần còn lại')).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: /Thanh toán phần còn lại 140\.000/ }))
    await waitFor(() => expect(startInvoiceCheckout).toHaveBeenCalledWith('inv-1'))
    await waitFor(() => expect(redirectToCheckout).toHaveBeenCalledWith('https://vnpay.test/remaining'))
  })

  it('shows a booking paid in full without asking for more', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({
      ...booking,
      status: 'CONFIRMED',
      remainingPaymentDueAt: future.toISOString(),
      fullyPaidAt: '2026-11-01T02:00:00Z'
    })
    renderPage()

    expect(await screen.findByText('Đã thanh toán đủ')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /phần còn lại/ })).not.toBeInTheDocument()
    expect(fetchOpenInvoiceOfBooking).not.toHaveBeenCalled()
  })

  it('shows a not-found state for a booking of another account', async () => {
    vi.mocked(fetchBooking).mockRejectedValue(Object.assign(new Error('missing'), { status: 404 }))
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Không tìm thấy lịch đặt' })).toBeInTheDocument()
  })

  it('opens and closes the occurrence details dialog when clicking view detail', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({
      ...booking,
      serviceAddress: '45 Kim Mã, Ba Đình, Hà Nội',
      services: [
        {
          id: 'svc-1',
          careServiceId: 'cs-1',
          serviceName: 'Vật lý trị liệu phục hồi chức năng',
          unitPrice: 200000,
          totalPrice: 200000
        }
      ]
    })
    renderPage()

    const viewDetailBtn = await screen.findByRole('button', { name: 'Xem chi tiết' })
    fireEvent.click(viewDetailBtn)

    const dialog = await screen.findByRole('dialog', { name: 'Chi tiết buổi chăm sóc #1' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('Vật lý trị liệu phục hồi chức năng')).toBeInTheDocument()
    expect(within(dialog).getByText('45 Kim Mã, Ba Đình, Hà Nội')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Chi tiết buổi chăm sóc #1' })).not.toBeInTheDocument()
    })
  })
})
