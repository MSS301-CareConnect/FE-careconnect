import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { BookingSettlementCard } from './booking-settlement-card'
import { fetchBookingSettlement } from './wallet-api'

vi.mock('./wallet-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./wallet-api')>()),
  fetchBookingSettlement: vi.fn()
}))

function renderCard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <BookingSettlementCard bookingId='b1' />
    </QueryClientProvider>
  )
}

const visit = (id: string, startAt: string) => ({
  occurrenceId: id,
  startAt,
  priceAmount: 1000000,
  paidAmount: 1000000,
  refundedAmount: 0,
  keptDepositAmount: 0,
  centerAmount: 900000,
  commissionAmount: 100000,
  finalStatus: 'COMPLETED' as const,
  settledAt: '2026-11-05T00:00:00Z'
})

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
})

describe('BookingSettlementCard', () => {
  it('shows what the center received and the commission of a booking with a missed and two served visits', async () => {
    vi.mocked(fetchBookingSettlement).mockResolvedValue({
      bookingId: 'b1',
      centerId: 'c1',
      commissionPercent: 10,
      paidAmount: 3000000,
      refundedAmount: 1000000,
      centerServiceAmount: 1800000,
      centerKeptDepositAmount: 0,
      caregiverKeptDepositAmount: 0,
      complaintDebitAmount: 0,
      centerNetAmount: 1800000,
      commissionAmount: 200000,
      settledCount: 3,
      pendingCount: 0,
      occurrences: [
        {
          ...visit('o1', '2026-11-02T01:00:00Z'),
          refundedAmount: 1000000,
          centerAmount: 0,
          commissionAmount: 0,
          finalStatus: 'MISSED'
        },
        visit('o2', '2026-11-03T01:00:00Z'),
        visit('o3', '2026-11-04T01:00:00Z')
      ]
    })
    renderCard()

    expect(await screen.findByText('Trung tâm thực nhận')).toBeInTheDocument()
    expect(screen.getByText('Hoa hồng nền tảng (10%)')).toBeInTheDocument()
    expect(screen.getByText('1.800.000 ₫', { selector: 'dd.text-xl' })).toBeInTheDocument()
    expect(screen.getByText('200.000 ₫', { selector: 'dd.text-xl' })).toBeInTheDocument()
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(within(rows[1]).getByText('Người chăm sóc vắng — đã hoàn')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Hoàn tất')).toBeInTheDocument()
  })

  it('explains that an unpaid booking has no settlement yet', async () => {
    vi.mocked(fetchBookingSettlement).mockRejectedValue(
      Object.assign(new Error('not found'), { status: 404, data: { code: 6017 } })
    )
    renderCard()

    expect(await screen.findByText('Lịch đặt chưa thanh toán nên chưa có quyết toán.')).toBeInTheDocument()
  })
})
