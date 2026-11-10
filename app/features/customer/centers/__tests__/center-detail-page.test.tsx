import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCenterBookingPolicy } from '~/entities/booking/booking-api'
import { fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { closeCenterPicker, selectCenter, useSelectedCenter } from '~/entities/care-center/selected-center'
import { fetchCaregiverCatalog, fetchPublicCenter } from '~/entities/provider/provider-api'
import type { CenterBookingPolicyRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CenterDetailPage } from '../center-detail-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCenter: vi.fn(),
  fetchCaregiverCatalog: vi.fn()
}))
vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCenterOfferings: vi.fn(),
  fetchPricePlans: vi.fn()
}))
vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchCenterBookingPolicy: vi.fn()
}))

const unauthorized = () => Object.assign(new Error('unauthorized'), { status: 401 })

const policy: CenterBookingPolicyRecord = {
  centerId: 'center-b',
  customized: true,
  shiftMinAdvanceMinutes: 120,
  recurringMinAdvanceMinutes: 1440,
  customMinAdvanceMinutes: 1440,
  confirmationTimeoutMinutes: 60,
  assignmentTimeoutMinutes: 120,
  initialPaymentTimeoutMinutes: 30,
  remainingPaymentDueBeforeMinutes: 1440,
  remainingPaymentReminderMinutes: [],
  depositPercent: 30,
  checkInEarlyMinutes: 30,
  checkInLateMinutes: 30,
  refundThresholdMinutes: 1440,
  refundPercentBeforeThreshold: 100,
  refundPercentAfterThreshold: 70,
  lateCancelNoRefundMinutes: 120,
  overduePaymentForfeitPercent: 0
}

function SelectedProbe() {
  const { center } = useSelectedCenter()
  return <output data-testid='selected'>{center?.id ?? 'none'}</output>
}

function renderPage(id = 'center-b') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/customer/centers/${id}`]}>
        <Routes>
          <Route element={<CenterDetailPage />} path='/customer/centers/:centerId' />
        </Routes>
        <SelectedProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('CenterDetailPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    selectCenter(null)
    closeCenterPicker()
    vi.mocked(fetchPublicCenter)
      .mockReset()
      .mockImplementation(async (id) => {
        if (id !== 'center-b') throw Object.assign(new Error('not found'), { status: 404 })
        return {
          centerId: 'center-b',
          centerName: 'Trung tâm Bình An',
          address: '12 Lê Lợi, Quận 1',
          operatingHours: '07:00 - 21:00',
          phoneNumber: '0281234567'
        }
      })
    vi.mocked(fetchCenterOfferings)
      .mockReset()
      .mockResolvedValue([
        {
          id: 'offering-1',
          centerId: 'center-b',
          status: 'ACTIVE',
          catalogItem: { id: 'item-1', name: 'Chăm sóc tại nhà', category: 'Người cao tuổi', status: 'ACTIVE' }
        }
      ])
    vi.mocked(fetchPricePlans)
      .mockReset()
      .mockResolvedValue([
        {
          id: 'plan-1',
          centerOfferingId: 'offering-1',
          planName: 'Theo giờ',
          pricingUnit: 'HOUR',
          durationMinutes: 120,
          basePrice: 100000,
          isActive: true
        }
      ])
    vi.mocked(fetchCaregiverCatalog)
      .mockReset()
      .mockResolvedValue({
        items: [
          {
            caregiverId: 'cg-1',
            centerId: 'center-b',
            centerName: 'Trung tâm Bình An',
            fullName: 'Nguyễn Thị Lan',
            verifiedCertificateCount: 1,
            careServiceIds: []
          }
        ],
        page: 0,
        size: 6,
        totalElements: 1,
        totalPages: 1
      })
    vi.mocked(fetchCenterBookingPolicy).mockReset().mockResolvedValue(policy)
    await setAppLanguage('vi', false)
  })

  it('shows the center, its services with prices, its caregivers and the deposit and refund rules', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Trung tâm Bình An' })).toBeInTheDocument()
    expect(screen.getByText('12 Lê Lợi, Quận 1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Đặt lịch' })).toHaveAttribute('href', '/customer/booking?center=center-b')

    const services = screen.getByRole('region', { name: 'Dịch vụ & bảng giá' })
    expect(await within(services).findByRole('link', { name: 'Chăm sóc tại nhà' })).toHaveAttribute(
      'href',
      '/customer/services/offering-1'
    )
    expect(within(services).getByText('100.000 ₫ / giờ')).toBeInTheDocument()
    expect(within(services).getByRole('link', { name: 'Đặt lịch Chăm sóc tại nhà' })).toHaveAttribute(
      'href',
      '/customer/booking?center=center-b&service=item-1'
    )

    const caregivers = screen.getByRole('region', { name: 'Người chăm sóc' })
    expect(await within(caregivers).findByRole('link', { name: /Nguyễn Thị Lan/ })).toHaveAttribute(
      'href',
      '/customer/caregivers/cg-1'
    )
    expect(fetchCaregiverCatalog).toHaveBeenCalledWith({ page: 0, size: 6, centerId: 'center-b' })

    const rules = screen.getByRole('region', { name: 'Đặt cọc & hoàn tiền' })
    expect(await within(rules).findByText(/đặt cọc 30%/)).toBeInTheDocument()
    expect(within(rules).getByText(/Hủy trước 24 giờ so với buổi chăm sóc: hoàn 100%/)).toBeInTheDocument()
    expect(within(rules).getByText(/Hủy trong vòng 24 giờ: hoàn 70%/)).toBeInTheDocument()

    // Viewing a center never changes the header selection.
    expect(screen.getByTestId('selected')).toHaveTextContent('none')
  })

  it('chooses the center explicitly and then shows it as selected', async () => {
    selectCenter({ id: 'center-a', name: 'Phòng khám An Khang' })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Chọn trung tâm Trung tâm Bình An' }))

    expect(screen.getByTestId('selected')).toHaveTextContent('center-b')
    expect(screen.getByText('Đang chọn')).toBeInTheDocument()
  })

  it('gives a visitor sign-in hints where the data needs a session', async () => {
    vi.mocked(fetchCenterOfferings).mockRejectedValue(unauthorized())
    vi.mocked(fetchCaregiverCatalog).mockRejectedValue(unauthorized())
    vi.mocked(fetchCenterBookingPolicy).mockRejectedValue(unauthorized())
    renderPage()

    expect(await screen.findByText('Đăng nhập để xem dịch vụ và bảng giá của trung tâm.')).toBeInTheDocument()
    expect(await screen.findByText('Đăng nhập để xem đội ngũ chăm sóc của trung tâm.')).toBeInTheDocument()
    expect(await screen.findByText('Đăng nhập để xem quy định đặt cọc và hoàn tiền của trung tâm.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('says when the center no longer takes bookings', async () => {
    renderPage('center-closed')

    expect(await screen.findByRole('heading', { name: 'Không tìm thấy trung tâm' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Về danh sách trung tâm' })).toHaveAttribute('href', '/customer/centers')
  })
})
