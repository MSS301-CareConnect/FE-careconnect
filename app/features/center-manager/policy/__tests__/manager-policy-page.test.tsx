import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCenterBookingPolicy } from '~/entities/booking/booking-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { ManagerPolicyPage } from '../manager-policy-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchCenterBookingPolicy: vi.fn()
}))

function renderAs(user: UserResponse | null, children: ReactNode = <ManagerPolicyPage />) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
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
    lateCancelNoRefundMinutes: 120,
    overduePaymentForfeitPercent: 100
  })
})

describe('ManagerPolicyPage (spec §8, §12)', () => {
  it('edits the policy of the manager’s own center', async () => {
    renderAs({ centerId: 'center-1', roles: ['CENTER_MANAGER'] })

    expect(screen.getByRole('heading', { level: 1, name: 'Chính sách đặt lịch của trung tâm' })).toBeInTheDocument()
    expect(await screen.findByRole('textbox', { name: 'Tỷ lệ đặt cọc' })).toHaveValue('30')
    expect(fetchCenterBookingPolicy).toHaveBeenCalledWith('center-1')
  })

  it('explains an account without a center instead of loading a policy', () => {
    renderAs({ roles: ['CENTER_MANAGER'] })

    expect(screen.getByRole('alert')).toHaveTextContent('Tài khoản chưa được gán trung tâm')
    expect(fetchCenterBookingPolicy).not.toHaveBeenCalled()
  })
})
