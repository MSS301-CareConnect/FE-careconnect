import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBookingQuote, placeBooking } from '~/entities/booking/booking-api'
import { fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { fetchCaregiverByUser } from '~/entities/provider/provider-api'
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
  fetchCaregiverByUser: vi.fn()
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

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
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
  it('asks the customer to start from a caregiver or a service when the URL names neither', () => {
    renderPage('/customer/booking')
    expect(screen.getByRole('heading', { name: 'Bắt đầu từ người chăm sóc hoặc dịch vụ' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tìm người chăm sóc' })).toHaveAttribute('href', '/customer/caregivers')
    expect(fetchBookingQuote).not.toHaveBeenCalled()
  })

  it('quotes the filled request and sends it once with an idempotency key', async () => {
    renderPage('/customer/booking?caregiver=user-1')

    fireEvent.click(await screen.findByRole('radio', { name: /Bà Lan/ }))
    expect(await screen.findByText('Chị Hoa')).toBeInTheDocument()
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
    fireEvent.click(await screen.findByRole('checkbox', { name: /Để trung tâm phân công người chăm sóc/ }))
    fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
    fireEvent.change(await screen.findByRole('combobox', { name: 'Gói giá' }), { target: { value: 'plan-1' } })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Người chăm sóc không có ca làm việc (hoặc đang nghỉ) vào thời gian đã chọn.'
    )
    await waitFor(() => expect(vi.mocked(fetchBookingQuote).mock.calls[0][0].caregiverId).toBeUndefined())
    expect(screen.getByRole('button', { name: 'Gửi yêu cầu đặt lịch' })).toBeDisabled()
  })
})
