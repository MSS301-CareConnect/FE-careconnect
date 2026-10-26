import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBookingQuote, placeBooking } from '~/entities/booking/booking-api'
import { fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { selectCenter } from '~/entities/care-center/selected-center'
import { fetchCaregiverByUser, fetchCaregiverCatalog, fetchPublicCenters } from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerBookingPage } from '../booking-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBookingQuote: vi.fn(),
  placeBooking: vi.fn()
}))
vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCenterOfferings: vi.fn(),
  fetchPricePlans: vi.fn()
}))
vi.mock('~/entities/care-recipient/care-recipient-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-api')>()),
  fetchCareRecipients: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiverByUser: vi.fn(),
  fetchCaregiverCatalog: vi.fn(),
  fetchPublicCenters: vi.fn()
}))

function DetailRoute() {
  return <output data-testid='booking-detail-route' />
}

function renderPage(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<CustomerBookingPage />} path='/customer/booking' />
          <Route element={<DetailRoute />} path='/customer/bookings/:id' />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const hoa = {
  id: 'cg-1',
  userId: 'user-1',
  centerId: 'center-1',
  centerName: 'TT An Tâm',
  fullName: 'Chị Hoa',
  verificationStatus: 'VERIFIED' as const,
  caregiverStatus: 'ACTIVE' as const,
  version: 1
}
const nam = {
  ...hoa,
  id: 'cg-2',
  userId: 'user-2',
  centerId: 'center-2',
  centerName: 'TT Bình An',
  fullName: 'Anh Nam'
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  selectCenter(null)
  vi.mocked(fetchPublicCenters).mockResolvedValue({
    items: [
      { centerId: 'center-1', centerName: 'TT An Tâm' },
      { centerId: 'center-2', centerName: 'TT Bình An' }
    ],
    page: 0,
    size: 100,
    totalElements: 2,
    totalPages: 1
  })
  vi.mocked(fetchCaregiverCatalog).mockImplementation(async ({ centerId } = {}) => {
    const items = [hoa, nam].filter((item) => item.centerId === centerId)
    return { items, page: 0, size: 100, totalElements: items.length, totalPages: 1 }
  })
  vi.mocked(fetchCareRecipients).mockResolvedValue({
    items: [{ id: 'rec-1', fullName: 'Bà Lan', age: 81, status: 'ACTIVE' }],
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1
  })
  vi.mocked(fetchCaregiverByUser).mockResolvedValue({
    id: 'cg-1',
    userId: 'user-1',
    centerId: 'center-1',
    centerName: 'TT An Tâm',
    fullName: 'Chị Hoa',
    verificationStatus: 'VERIFIED',
    caregiverStatus: 'ACTIVE',
    version: 1
  })
  vi.mocked(fetchCenterOfferings).mockResolvedValue([
    {
      id: 'offer-1',
      centerId: 'center-1',
      status: 'ACTIVE',
      catalogItem: { id: 'svc-1', name: 'Chăm sóc người già tại nhà', category: 'ELDERLY_CARE', status: 'ACTIVE' }
    }
  ])
  vi.mocked(fetchPricePlans).mockResolvedValue([
    {
      id: 'plan-1',
      centerOfferingId: 'offer-1',
      planName: 'Theo giờ',
      pricingUnit: 'HOUR',
      durationMinutes: 60,
      basePrice: 100000,
      isActive: true
    }
  ])
  vi.mocked(fetchBookingQuote).mockResolvedValue({
    lines: [
      {
        careServiceId: 'svc-1',
        serviceName: 'Chăm sóc người già tại nhà',
        pricingUnit: 'HOUR',
        unitPrice: 100000,
        unitsPerOccurrence: 2,
        occurrenceCount: 1,
        lineTotal: 200000
      }
    ],
    occurrences: [
      { occurrenceNo: 1, startAt: '2030-01-02T01:00:00Z', endAt: '2030-01-02T03:00:00Z', priceAmount: 200000 }
    ],
    totalAmount: 200000,
    depositPercent: 30,
    estimatedDepositAmount: 60000
  })
  vi.mocked(placeBooking).mockResolvedValue({
    id: 'bk-1',
    bookingCode: 'BK0001',
    status: 'PENDING',
    recipientId: 'rec-1',
    centerId: 'center-1',
    scheduleType: 'ONE_TIME',
    startDate: '2030-01-02',
    startTime: '08:00',
    endTime: '10:00'
  })
})

describe('CustomerBookingPage', () => {
  it('starts from the center chosen in the header', async () => {
    selectCenter({ id: 'center-2', name: 'TT Bình An' })
    renderPage('/customer/booking')

    expect(await screen.findByRole('combobox', { name: 'Trung tâm chăm sóc' })).toHaveValue('center-2')
    await waitFor(() => expect(fetchCenterOfferings).toHaveBeenCalledWith('center-2'))
    expect(fetchPublicCenters).toHaveBeenCalledWith({ page: 0, size: 100 })
  })

  it('lets the customer choose the center and caregiver in the form when opened from the homepage', async () => {
    renderPage('/customer/booking')

    expect(screen.getByRole('heading', { level: 1, name: 'Đặt lịch chăm sóc tại nhà' })).toBeInTheDocument()
    expect(await screen.findByText('Chọn trung tâm chăm sóc trước để xem dịch vụ.')).toBeInTheDocument()
    expect(fetchCenterOfferings).not.toHaveBeenCalled()

    fireEvent.change(await screen.findByRole('combobox', { name: 'Trung tâm chăm sóc' }), {
      target: { value: 'center-2' }
    })
    await waitFor(() => expect(fetchCenterOfferings).toHaveBeenCalledWith('center-2'))
    // Only caregivers of the chosen center are offered, next to the center's own assignment.
    expect(screen.getByRole('radio', { name: /Để trung tâm phân công/ })).toBeChecked()
    expect(screen.queryByRole('radio', { name: /Chị Hoa/ })).not.toBeInTheDocument()
    fireEvent.click(await screen.findByRole('radio', { name: /Anh Nam/ }))
    expect(fetchCaregiverCatalog).toHaveBeenCalledWith({ centerId: 'center-2', page: 0, size: 100 })

    fireEvent.click(await screen.findByRole('radio', { name: /Bà Lan/ }))
    fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
    fireEvent.change(await screen.findByRole('combobox', { name: 'Gói giá' }), { target: { value: 'plan-1' } })

    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls[0][0]).toMatchObject({ centerId: 'center-2', caregiverId: 'cg-2' })
    )
  })

  it('quotes the filled request and sends it once with an idempotency key', async () => {
    renderPage('/customer/booking?caregiver=user-1')

    fireEvent.click(await screen.findByRole('radio', { name: /Bà Lan/ }))
    expect(await screen.findByRole('radio', { name: /Chị Hoa/ })).toBeChecked()
    fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
    fireEvent.change(await screen.findByRole('combobox', { name: 'Gói giá' }), { target: { value: 'plan-1' } })

    expect(await screen.findByText('Số buổi chăm sóc: 1')).toBeInTheDocument()
    const request = vi.mocked(fetchBookingQuote).mock.calls[0][0]
    expect(request).toMatchObject({
      recipientId: 'rec-1',
      centerId: 'center-1',
      caregiverId: 'cg-1',
      scheduleType: 'ONE_TIME',
      startTime: '08:00',
      endTime: '10:00',
      services: [{ careServiceId: 'svc-1', centerServiceId: 'offer-1', pricePlanId: 'plan-1' }]
    })

    fireEvent.change(screen.getByRole('textbox', { name: 'Ghi chú cho người chăm sóc' }), {
      target: { value: 'Nhắc bà uống thuốc' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu đặt lịch' }))

    expect(await screen.findByTestId('booking-detail-route')).toBeInTheDocument()
    const [body, key] = vi.mocked(placeBooking).mock.calls[0]
    expect(body).toEqual({ ...request, customerNote: 'Nhắc bà uống thuốc' })
    expect(key).toMatch(/^[0-9a-f-]{36}$/)
    // The note does not change the price, so it never triggers another quote.
    expect(fetchBookingQuote).toHaveBeenCalledTimes(1)
  })

  it('lets the center assign the caregiver and shows a translated backend error', async () => {
    vi.mocked(fetchBookingQuote).mockRejectedValue(
      Object.assign(new Error('conflict'), { status: 409, info: { code: 5226 } })
    )
    renderPage('/customer/booking?caregiver=user-1')

    fireEvent.click(await screen.findByRole('radio', { name: /Bà Lan/ }))
    fireEvent.click(await screen.findByRole('radio', { name: /Để trung tâm phân công người chăm sóc/ }))
    fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
    fireEvent.change(await screen.findByRole('combobox', { name: 'Gói giá' }), { target: { value: 'plan-1' } })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Người chăm sóc không có ca làm việc (hoặc đang nghỉ) vào thời gian đã chọn.'
    )
    await waitFor(() => expect(vi.mocked(fetchBookingQuote).mock.calls[0][0].caregiverId).toBeUndefined())
    expect(screen.getByRole('button', { name: 'Gửi yêu cầu đặt lịch' })).toBeDisabled()
  })
})
