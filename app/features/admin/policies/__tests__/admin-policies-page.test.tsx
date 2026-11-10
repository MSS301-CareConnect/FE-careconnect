import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCenterBookingPolicy } from '~/entities/booking/booking-api'
import { fetchPublicCenters } from '~/entities/provider/provider-api'
import type { CenterBookingPolicyRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminPoliciesPage } from '../admin-policies-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchCenterBookingPolicy: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCenters: vi.fn()
}))

const policy: CenterBookingPolicyRecord = {
  centerId: 'center-2',
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
  lateCancelNoRefundMinutes: 120,
  overduePaymentForfeitPercent: 100
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminPoliciesPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Admin booking policies (spec §8)', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await setAppLanguage('vi', false)
    vi.mocked(fetchPublicCenters).mockResolvedValue({
      items: [
        { centerId: 'center-1', centerName: 'Trung tâm An Bình' },
        { centerId: 'center-2', centerName: 'Trung tâm Bình An' }
      ],
      page: 0,
      size: 100,
      totalElements: 2,
      totalPages: 1
    })
    vi.mocked(fetchCenterBookingPolicy).mockResolvedValue(policy)
  })

  it('loads the policy of the center the admin chooses', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Chính sách đặt lịch theo trung tâm' })
    ).toBeInTheDocument()
    expect(await screen.findByText('Chọn một trung tâm để xem và sửa chính sách đặt lịch.')).toBeInTheDocument()
    fireEvent.change(await screen.findByRole('combobox', { name: 'Trung tâm' }), { target: { value: 'center-2' } })

    expect(await screen.findByRole('textbox', { name: 'SHIFT' })).toHaveValue('2')
    expect(fetchCenterBookingPolicy).toHaveBeenCalledWith('center-2')
    expect(screen.getByRole('button', { name: 'Lưu chính sách' })).toBeInTheDocument()
  })

  it('translates the page', async () => {
    renderPage()
    await screen.findByRole('combobox', { name: 'Trung tâm' })
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Booking policies per center')
  })
})
