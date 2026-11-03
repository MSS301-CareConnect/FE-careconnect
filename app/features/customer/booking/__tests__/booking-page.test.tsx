import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchBookingQuote,
  fetchCenterBookingPolicy,
  fetchHeldSchedules,
  placeBooking
} from '~/entities/booking/booking-api'
import { fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { fetchOutstandingDebt } from '~/entities/payment/payment-api'
import { selectCenter } from '~/entities/care-center/selected-center'
import {
  fetchBookableSchedules,
  fetchCaregiverCatalog,
  fetchPublicCaregiver,
  fetchPublicCenters,
  searchCaregiversByService
} from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerBookingPage } from '../booking-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBookingQuote: vi.fn(),
  fetchCenterBookingPolicy: vi.fn(),
  fetchHeldSchedules: vi.fn(),
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
vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  fetchOutstandingDebt: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchBookableSchedules: vi.fn(),
  fetchCaregiverCatalog: vi.fn(),
  fetchPublicCaregiver: vi.fn(),
  fetchPublicCenters: vi.fn(),
  searchCaregiversByService: vi.fn()
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
          <Route element={<output data-testid='bookings-list-route' />} path='/customer/bookings' />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const hoa = {
  caregiverId: 'cg-1',
  centerId: 'center-1',
  centerName: 'TT An Tâm',
  fullName: 'Chị Hoa',
  verifiedCertificateCount: 1
}
const nam = {
  ...hoa,
  caregiverId: 'cg-2',
  centerId: 'center-2',
  centerName: 'TT Bình An',
  fullName: 'Anh Nam'
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  selectCenter(null)
  vi.mocked(fetchOutstandingDebt).mockResolvedValue({ hasDebt: false, overdueInvoices: [], pendingInvoices: [] })
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
  vi.mocked(searchCaregiversByService).mockImplementation(async ({ centerId }) => {
    const items = [hoa, nam].filter((item) => item.centerId === centerId)
    return { items, page: 0, size: 100, totalElements: items.length, totalPages: 1 }
  })
  vi.mocked(fetchCenterBookingPolicy).mockImplementation(async (centerId) => ({
    centerId,
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
  }))
  vi.mocked(fetchBookableSchedules).mockResolvedValue([
    {
      id: 'sch-held',
      caregiverId: 'cg-1',
      centerId: 'center-1',
      workDate: '2030-01-02',
      startTime: '08:00:00',
      endTime: '12:00:00'
    },
    {
      id: 'sch-free',
      caregiverId: 'cg-1',
      centerId: 'center-1',
      workDate: '2030-01-03',
      startTime: '13:00:00',
      endTime: '17:00:00'
    }
  ])
  vi.mocked(fetchHeldSchedules).mockResolvedValue({ caregiverId: 'cg-1', heldScheduleIds: ['sch-held'], busySlots: [] })
  vi.mocked(fetchCareRecipients).mockResolvedValue({
    items: [{ id: 'rec-1', fullName: 'Bà Lan', age: 81, status: 'ACTIVE' }],
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1
  })
  vi.mocked(fetchPublicCaregiver).mockResolvedValue({
    caregiverId: 'cg-1',
    centerId: 'center-1',
    centerName: 'TT An Tâm',
    fullName: 'Chị Hoa'
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
    status: 'PENDING_CENTER_CONFIRMATION',
    recipientId: 'rec-1',
    centerId: 'center-1',
    bookingType: 'CUSTOM',
    startDate: '2030-01-02'
  })
})

/** Patient, the elderly-care service and its hourly plan — the steps every booking needs. */
async function fillPatientAndService() {
  fireEvent.click(await screen.findByRole('radio', { name: /Bà Lan/ }))
  fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
  fireEvent.change(await screen.findByRole('combobox', { name: 'Gói giá' }), { target: { value: 'plan-1' } })
}

describe('CustomerBookingPage', () => {
  it('warns about an overdue invoice before the form is filled and blocks sending', async () => {
    vi.mocked(fetchOutstandingDebt).mockResolvedValue({ hasDebt: true, overdueInvoices: [], pendingInvoices: [] })
    renderPage('/customer/booking')

    expect(await screen.findByRole('alert')).toHaveTextContent('Bạn có hóa đơn quá hạn')
    expect(screen.getByRole('link', { name: 'Thanh toán hóa đơn' })).toHaveAttribute('href', '/customer/payments')
    expect(screen.getByRole('button', { name: 'Gửi yêu cầu đặt lịch' })).toBeDisabled()
  })

  it('starts from the center chosen in the header', async () => {
    selectCenter({ id: 'center-2', name: 'TT Bình An' })
    renderPage('/customer/booking')

    expect(await screen.findByRole('combobox', { name: 'Trung tâm chăm sóc' })).toHaveValue('center-2')
    await waitFor(() => expect(fetchCenterOfferings).toHaveBeenCalledWith('center-2'))
    expect(fetchPublicCenters).toHaveBeenCalledWith({ page: 0, size: 100 })
  })

  it('reads every page of caregivers who provide the chosen services (search caps a page at 50)', async () => {
    vi.mocked(searchCaregiversByService).mockImplementation(async ({ page }) => ({
      items: page === 0 ? [hoa] : [{ ...hoa, caregiverId: 'cg-3', fullName: 'Cô Mai' }],
      page: page ?? 0,
      size: 50,
      totalElements: 51,
      totalPages: 2
    }))
    renderPage('/customer/booking')
    fireEvent.change(await screen.findByRole('combobox', { name: 'Trung tâm chăm sóc' }), {
      target: { value: 'center-1' }
    })
    await fillPatientAndService()

    expect(await screen.findByRole('radio', { name: /Cô Mai/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Chị Hoa/ })).toBeInTheDocument()
    expect(searchCaregiversByService).toHaveBeenCalledWith(expect.objectContaining({ page: 1, size: 50 }))
    expect(screen.queryByText('Không tải được người chăm sóc của trung tâm.')).not.toBeInTheDocument()
  })

  it('picks the center, then services, then only caregivers who provide them (Q10)', async () => {
    renderPage('/customer/booking')

    expect(screen.getByRole('heading', { level: 1, name: 'Đặt lịch chăm sóc tại nhà' })).toBeInTheDocument()
    expect(await screen.findByText('Chọn trung tâm chăm sóc trước để xem dịch vụ.')).toBeInTheDocument()
    expect(fetchCenterOfferings).not.toHaveBeenCalled()

    fireEvent.change(await screen.findByRole('combobox', { name: 'Trung tâm chăm sóc' }), {
      target: { value: 'center-2' }
    })
    await waitFor(() => expect(fetchCenterOfferings).toHaveBeenCalledWith('center-2'))
    await fillPatientAndService()
    await waitFor(() =>
      expect(searchCaregiversByService).toHaveBeenCalledWith({
        centerId: 'center-2',
        careServiceIds: ['svc-1'],
        page: 0,
        size: 50
      })
    )
    expect(screen.getByRole('radio', { name: /Để trung tâm phân công/ })).toBeChecked()
    expect(screen.queryByRole('radio', { name: /Chị Hoa/ })).not.toBeInTheDocument()
    fireEvent.click(await screen.findByRole('radio', { name: /Anh Nam/ }))

    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0]).toMatchObject({
        centerId: 'center-2',
        caregiverId: 'cg-2'
      })
    )
  })

  it('quotes one CUSTOM booking and sends it once with an idempotency key', async () => {
    renderPage('/customer/booking?caregiver=cg-1')

    await fillPatientAndService()
    expect(await screen.findByRole('radio', { name: /Chị Hoa/ })).toBeChecked()
    expect(fetchPublicCaregiver).toHaveBeenCalledWith('cg-1')

    expect(await screen.findByText('Số buổi chăm sóc: 1')).toBeInTheDocument()
    const request = vi.mocked(fetchBookingQuote).mock.calls.at(-1)![0]
    expect(request).toMatchObject({
      recipientId: 'rec-1',
      centerId: 'center-1',
      caregiverId: 'cg-1',
      bookingType: 'CUSTOM',
      services: [{ careServiceId: 'svc-1', centerServiceId: 'offer-1', pricePlanId: 'plan-1' }]
    })
    expect(request.slots).toHaveLength(1)
    expect(request).not.toHaveProperty('startTime')
    expect(await screen.findByText('Thanh toán đầu dự kiến · 30%')).toBeInTheDocument()
    expect(await screen.findByText(/60\.000/)).toBeInTheDocument()
    const quotes = vi.mocked(fetchBookingQuote).mock.calls.length

    fireEvent.change(screen.getByRole('textbox', { name: 'Ghi chú cho người chăm sóc' }), {
      target: { value: 'Nhắc bà uống thuốc' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu đặt lịch' }))

    expect(await screen.findByTestId('booking-detail-route')).toBeInTheDocument()
    expect(placeBooking).toHaveBeenCalledTimes(1)
    const [body, key] = vi.mocked(placeBooking).mock.calls[0]
    expect(body).toEqual({ ...request, customerNote: 'Nhắc bà uống thuốc' })
    expect(key).toMatch(/^[0-9a-f-]{36}$/)
    // The note does not change the price, so it never triggers another quote.
    expect(fetchBookingQuote).toHaveBeenCalledTimes(quotes)
  })

  it('gives each CUSTOM visit its own time and blocks overlapping visits', async () => {
    renderPage('/customer/booking?caregiver=cg-1')
    await fillPatientAndService()

    fireEvent.change(screen.getAllByLabelText('Ngày')[0], { target: { value: '2030-01-02' } })
    fireEvent.click(screen.getByRole('button', { name: 'Thêm buổi' }))
    fireEvent.change(screen.getAllByLabelText('Ngày')[1], { target: { value: '2030-01-02' } })
    fireEvent.change(screen.getAllByLabelText('Giờ bắt đầu')[1], { target: { value: '09:00' } })
    fireEvent.change(screen.getAllByLabelText('Giờ kết thúc')[1], { target: { value: '11:00' } })

    expect(await screen.findByText('Buổi 2 trùng giờ với một buổi khác.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gửi yêu cầu đặt lịch' })).toBeDisabled()

    fireEvent.change(screen.getAllByLabelText('Giờ bắt đầu')[1], { target: { value: '14:00' } })
    fireEvent.change(screen.getAllByLabelText('Giờ kết thúc')[1], { target: { value: '17:30' } })
    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0].slots).toEqual([
        { startAt: '2030-01-02T01:00:00.000Z', endAt: '2030-01-02T03:00:00.000Z' },
        { startAt: '2030-01-02T07:00:00.000Z', endAt: '2030-01-02T10:30:00.000Z' }
      ])
    )
  })

  it('books a SHIFT on one free caregiver shift; shifts already held are locked', async () => {
    vi.mocked(fetchBookingQuote).mockResolvedValue({
      lines: [],
      occurrences: [
        { occurrenceNo: 1, startAt: '2030-01-03T06:00:00Z', endAt: '2030-01-03T10:00:00Z', priceAmount: 400000 }
      ],
      totalAmount: 400000,
      depositPercent: 100,
      estimatedDepositAmount: 400000
    })
    renderPage('/customer/booking?caregiver=cg-1')
    await fillPatientAndService()
    fireEvent.click(screen.getByRole('radio', { name: 'Theo ca' }))

    expect(screen.queryByRole('radio', { name: /Để trung tâm phân công/ })).not.toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: /02\/01\/2030/ })).toBeDisabled()
    expect(screen.getByText('Đã có người đặt')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /03\/01\/2030/ }))

    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0]).toEqual({
        recipientId: 'rec-1',
        centerId: 'center-1',
        bookingType: 'SHIFT',
        caregiverId: 'cg-1',
        caregiverScheduleId: 'sch-free',
        services: [{ careServiceId: 'svc-1', centerServiceId: 'offer-1', pricePlanId: 'plan-1' }]
      })
    )
    expect(fetchHeldSchedules).toHaveBeenCalledWith({ caregiverId: 'cg-1' })
    expect(await screen.findByText('Thanh toán đầu dự kiến · 100%')).toBeInTheDocument()
  })

  it('lets the center assign the caregiver and shows a translated backend error', async () => {
    vi.mocked(fetchBookingQuote).mockRejectedValue(
      Object.assign(new Error('conflict'), { status: 409, info: { code: 5226 } })
    )
    renderPage('/customer/booking?caregiver=cg-1')

    await fillPatientAndService()
    fireEvent.click(await screen.findByRole('radio', { name: /Để trung tâm phân công người chăm sóc/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Người chăm sóc không có ca làm việc (hoặc đang nghỉ) vào thời gian đã chọn.'
    )
    await waitFor(() => expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0].caregiverId).toBeUndefined())
    expect(screen.getByRole('button', { name: 'Gửi yêu cầu đặt lịch' })).toBeDisabled()
  })
})
