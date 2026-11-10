import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CenterBookingPolicyRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { fetchCenterBookingPolicy, updateCenterBookingPolicyRequest } from './booking-api'
import { CenterBookingPolicyForm } from './center-booking-policy-form'

vi.mock('./booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./booking-api')>()),
  fetchCenterBookingPolicy: vi.fn(),
  updateCenterBookingPolicyRequest: vi.fn()
}))

// Spec §8 defaults as BookingService returns them for a center without its own policy.
const defaults: CenterBookingPolicyRecord = {
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
}

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <CenterBookingPolicyForm centerId='center-1' />
    </QueryClientProvider>
  )
}

function field(name: string) {
  return screen.getByRole('textbox', { name })
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchCenterBookingPolicy).mockResolvedValue(defaults)
})

describe('CenterBookingPolicyForm', () => {
  it('shows the policy in hours and saves it back in minutes, as a new policy of the center', async () => {
    vi.mocked(updateCenterBookingPolicyRequest).mockResolvedValue({ ...defaults, customized: true, version: 0 })
    renderForm()

    expect(await screen.findByText(/đang dùng chính sách mặc định/)).toBeInTheDocument()
    expect(field('SHIFT')).toHaveValue('2')
    expect(field('RECURRING')).toHaveValue('48')
    expect(field('Nhắc trả nốt (giờ trước hạn)')).toHaveValue('72, 48')
    expect(field('Hủy sát giờ, không hoàn')).toHaveValue('2')
    // The defaults are already tight for RECURRING / CUSTOM (48h − 24h < 3 × 24h): warned, not blocked.
    expect(screen.getByRole('status')).toHaveTextContent('RECURRING')

    fireEvent.change(field('SHIFT'), { target: { value: '1,5' } })
    fireEvent.change(field('Tỷ lệ cọc (RECURRING / CUSTOM)'), { target: { value: '40' } })
    fireEvent.change(field('Nhắc trả nốt (giờ trước hạn)'), { target: { value: '48 72' } })
    fireEvent.change(field('Hủy sát giờ, không hoàn'), { target: { value: '0,5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu chính sách' }))

    await waitFor(() =>
      expect(updateCenterBookingPolicyRequest).toHaveBeenCalledWith('center-1', {
        shiftMinAdvanceMinutes: 90,
        recurringMinAdvanceMinutes: 2880,
        customMinAdvanceMinutes: 2880,
        confirmationTimeoutMinutes: 1440,
        assignmentTimeoutMinutes: 1440,
        initialPaymentTimeoutMinutes: 1440,
        remainingPaymentDueBeforeMinutes: 1440,
        remainingPaymentReminderMinutes: [4320, 2880],
        depositPercent: 40,
        checkInEarlyMinutes: 30,
        checkInLateMinutes: 30,
        refundThresholdMinutes: 1440,
        refundPercentBeforeThreshold: 100,
        refundPercentAfterThreshold: 70,
        lateCancelNoRefundMinutes: 30,
        overduePaymentForfeitPercent: 100,
        version: undefined
      })
    )
  })

  it('checks every field and the consistency rules of BookingService before sending', async () => {
    renderForm()
    await screen.findByText(/đang dùng chính sách mặc định/)

    fireEvent.change(field('RECURRING'), { target: { value: '24' } })
    fireEvent.change(field('Hoàn khi hủy dưới mốc'), { target: { value: '120' } })
    fireEvent.change(field('Hạn trung tâm xác nhận'), { target: { value: '' } })
    fireEvent.change(field('Nhắc trả nốt (giờ trước hạn)'), { target: { value: '48, 48' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu chính sách' }))

    expect(await screen.findByText(/Phải lớn hơn thời gian “Trả nốt trước buổi đầu”/)).toBeInTheDocument()
    expect(screen.getByText(/Giá trị lớn hơn mức cho phép/)).toBeInTheDocument()
    expect(screen.getByText('Nhập giá trị.')).toBeInTheDocument()
    expect(screen.getByText('Các mốc nhắc không được trùng nhau.')).toBeInTheDocument()
    expect(field('RECURRING')).toHaveAttribute('aria-invalid', 'true')
    expect(updateCenterBookingPolicyRequest).not.toHaveBeenCalled()

    fireEvent.change(field('Hoàn khi hủy dưới mốc'), { target: { value: '100' } })
    fireEvent.change(field('Hoàn khi hủy từ mốc trở lên'), { target: { value: '90' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu chính sách' }))
    expect(await screen.findByText('Không được hoàn nhiều hơn mức hủy sớm.')).toBeInTheDocument()

    // The no-refund window cannot outlast the refund cut-off (BookingService 400 5413).
    fireEvent.change(field('Mốc hủy sớm'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu chính sách' }))
    expect(await screen.findByText(/Không được dài hơn mốc hủy sớm/)).toBeInTheDocument()
  })

  it('sends the version of an own policy and reports a concurrent change at the end of the form', async () => {
    vi.mocked(fetchCenterBookingPolicy).mockResolvedValue({
      ...defaults,
      customized: true,
      version: 3,
      updatedAt: '2026-11-01T02:00:00Z'
    })
    vi.mocked(updateCenterBookingPolicyRequest).mockRejectedValue(
      Object.assign(new Error('conflict'), { status: 409, info: { code: 5006 } })
    )
    renderForm()

    expect(await screen.findByText(/Chính sách riêng của trung tâm, cập nhật lần cuối/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu chính sách' }))

    await waitFor(() =>
      expect(updateCenterBookingPolicyRequest).toHaveBeenCalledWith('center-1', expect.objectContaining({ version: 3 }))
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('Thông tin vừa được người khác cập nhật')
  })
})
