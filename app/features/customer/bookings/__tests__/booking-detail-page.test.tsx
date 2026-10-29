import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  cancelBookingRequest,
  fetchBooking,
  fetchBookingHistory,
  previewCancellation
} from '~/entities/booking/booking-api'
import { fetchEffectivePolicy } from '~/entities/payment/payment-api'
import { fetchPublicCaregiver } from '~/entities/provider/provider-api'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerBookingDetailPage } from '../booking-detail-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBooking: vi.fn(),
  fetchBookingHistory: vi.fn(),
  previewCancellation: vi.fn(),
  cancelBookingRequest: vi.fn()
}))

vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  fetchEffectivePolicy: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCaregiver: vi.fn()
}))

const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
const booking: BookingDetailRecord = {
  id: 'bk-1',
  bookingCode: 'BK0001',
  status: 'PENDING',
  recipientId: 'rec-1',
  centerId: 'center-1',
  scheduleType: 'ONE_TIME',
  startDate: '2026-11-01',
  startTime: '08:00',
  endTime: '10:00',
  totalAmount: 200000,
  depositAmount: 60000,
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
  vi.mocked(fetchEffectivePolicy).mockResolvedValue({
    depositPercent: 30,
    refundTiers: [
      { minLeadHours: 0, maxLeadHours: 24, feePercent: 30 },
      { minLeadHours: 24, maxLeadHours: 72, feePercent: 10 },
      { minLeadHours: 72, maxLeadHours: null, feePercent: 0 }
    ]
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
    expect(screen.getByRole('heading', { name: 'Đang chờ trung tâm duyệt' })).toBeInTheDocument()
    expect(screen.getByText(/Buổi 1/)).toBeInTheDocument()
    expect(await screen.findByText('Lịch đặt được cập nhật trạng thái')).toBeInTheDocument()
  })

  it('cancels an unpaid booking as a whole without a refund preview', async () => {
    const cancelled = { ...booking, status: 'CANCELLED' as const, cancelReason: 'Đổi kế hoạch' }
    vi.mocked(fetchBooking).mockResolvedValueOnce(booking).mockResolvedValue(cancelled)
    vi.mocked(cancelBookingRequest).mockResolvedValue(cancelled)
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Hủy lịch đặt' }))
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
          feeAmount: 20000,
          refundAmount: 40000,
          rule: 'TIER_24_72'
        }
      ],
      totalRefund: 60000,
      previewToken: 'preview-1'
    })
    vi.mocked(cancelBookingRequest).mockResolvedValue({ ...booking, status: 'CONFIRMED' })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Hủy lịch đặt' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Lý do hủy' }), { target: { value: 'Ốm' } })
    const confirm = within(dialog).getByRole('button', { name: 'Hủy lịch đặt' })
    expect(confirm).toBeDisabled()

    fireEvent.click(within(dialog).getByRole('radio', { name: 'Chỉ một số buổi' }))
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /Buổi 1/ }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xem trước tiền hoàn' }))

    await waitFor(() => expect(previewCancellation).toHaveBeenCalledWith('bk-1', ['occ-1']))
    // The rule code is read out in words, never shown raw.
    const ruleLines = await within(dialog).findAllByText('Còn 24–72 giờ trước buổi')
    expect(ruleLines.some((line) => line.closest('li'))).toBe(true)
    expect(within(dialog).getByText(/Giữ lại 20/)).toBeInTheDocument()
    expect(within(dialog).queryByText(/TIER_/)).not.toBeInTheDocument()
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

  it('offers the deposit payment once the center has accepted the booking', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({ ...booking, status: 'AWAITING_DEPOSIT' })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Đặt cọc để xác nhận lịch' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Đặt cọc 60\.000/ })).toHaveAttribute(
      'href',
      '/customer/bookings/bk-1/deposit'
    )
  })

  it('shows a not-found state for a booking of another account', async () => {
    vi.mocked(fetchBooking).mockRejectedValue(Object.assign(new Error('missing'), { status: 404 }))
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Không tìm thấy lịch đặt' })).toBeInTheDocument()
  })
})
