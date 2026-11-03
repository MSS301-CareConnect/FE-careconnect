import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
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
  const router = createMemoryRouter(
    [
      { path: '/customer/booking', element: <CustomerBookingPage /> },
      { path: '/customer/bookings/:id', element: <DetailRoute /> },
      { path: '/customer/bookings', element: <output data-testid='bookings-list-route' /> }
    ],
    { initialEntries: [path] }
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return router
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

const SERVICES = [{ careServiceId: 'svc-1', centerServiceId: 'offer-1', pricePlanId: 'plan-1' }]

/** The step's primary action; the phone bottom bar repeats it, so the first match is the step footer. */
function continueButton() {
  return screen.getAllByRole('button', { name: 'Tiếp tục' })[0]
}

async function next() {
  await waitFor(() => expect(continueButton()).toBeEnabled())
  fireEvent.click(continueButton())
}

/** Step 1 (the only profile is chosen for the customer) and step 2 (the service with its single plan). */
async function toSchedule() {
  await screen.findByRole('radio', { name: /Bà Lan/ })
  await next()
  fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
  await next()
  await screen.findByRole('radio', { name: /Tự chọn buổi/ })
}

describe('CustomerBookingPage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    selectCenter({ id: 'center-1', name: 'TT An Tâm' })
  })

  it('warns about an overdue invoice before the form is filled', async () => {
    vi.mocked(fetchOutstandingDebt).mockResolvedValue({ hasDebt: true, overdueInvoices: [], pendingInvoices: [] })
    renderPage('/customer/booking')

    expect(
      await screen.findByText('Bạn có hóa đơn quá hạn. Thanh toán xong mới đặt lịch mới được.')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Thanh toán hóa đơn' })).toHaveAttribute('href', '/customer/payments')
  })

  it('shows one step at a time and says why Continue is disabled', async () => {
    renderPage('/customer/booking')

    expect(screen.getByRole('heading', { level: 1, name: 'Đặt lịch chăm sóc tại nhà' })).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: /Bà Lan/ })).toBeChecked()
    expect(screen.queryByRole('checkbox', { name: /Chăm sóc người già/ })).not.toBeInTheDocument()
    await next()

    expect(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ })).not.toBeChecked()
    expect(continueButton()).toBeDisabled()
    expect(screen.getAllByText('Hãy chọn ít nhất 1 dịch vụ').length).toBeGreaterThan(0)
    expect(screen.getByText('Chọn dịch vụ trước')).toBeInTheDocument()
  })

  it('ticks the service from the URL and opens the first step that still needs input', async () => {
    renderPage('/customer/booking?service=svc-1&patient=rec-1')

    expect(await screen.findByRole('radio', { name: /Tự chọn buổi/ })).toBeChecked()
    fireEvent.click(screen.getAllByRole('button', { name: 'Quay lại' })[0])
    expect(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ })).toBeChecked()
    expect(screen.getByText('100.000 ₫ / giờ')).toBeInTheDocument()
    expect(screen.queryByText('ELDERLY_CARE')).not.toBeInTheDocument()
    expect(screen.getByText('Người cao tuổi')).toBeInTheDocument()
  })

  it('lists centers as cards only when there are several and starts from the header center', async () => {
    selectCenter({ id: 'center-2', name: 'TT Bình An' })
    renderPage('/customer/booking')
    await screen.findByRole('radio', { name: /Bà Lan/ })
    await next()

    expect(await screen.findByRole('radio', { name: /TT Bình An/ })).toBeChecked()
    await waitFor(() => expect(fetchCenterOfferings).toHaveBeenCalledWith('center-2'))
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
    await screen.findByRole('radio', { name: /Bà Lan/ })
    await next()
    fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))

    expect(await screen.findByRole('radio', { name: /Cô Mai/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Để trung tâm phân công/ })).toBeChecked()
    expect(searchCaregiversByService).toHaveBeenCalledWith(expect.objectContaining({ page: 1, size: 50 }))
  })

  it('reviews and sends one CUSTOM booking once, with an idempotency key, then shows the success screen', async () => {
    renderPage('/customer/booking?caregiver=cg-1')
    await toSchedule()

    fireEvent.change(screen.getByRole('textbox', { name: 'Ghi chú cho người chăm sóc' }), {
      target: { value: 'Nhắc bà uống thuốc' }
    })
    await next()

    expect(await screen.findByText('Xem lại yêu cầu')).toBeInTheDocument()
    const request = vi.mocked(fetchBookingQuote).mock.calls.at(-1)![0]
    expect(request).toMatchObject({
      recipientId: 'rec-1',
      centerId: 'center-1',
      caregiverId: 'cg-1',
      bookingType: 'CUSTOM',
      services: SERVICES
    })
    expect(request.slots).toHaveLength(1)
    expect(request).not.toHaveProperty('startTime')
    expect(await screen.findByText('Đặt cọc (30%) sau khi có người chăm sóc')).toBeInTheDocument()
    const quotes = vi.mocked(fetchBookingQuote).mock.calls.length

    const submit = screen.getAllByRole('button', { name: 'Gửi yêu cầu đặt lịch' })[0]
    expect(submit).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: /Tôi đồng ý với/ }))
    await waitFor(() => expect(submit).toBeEnabled())
    fireEvent.click(submit)
    fireEvent.click(submit)

    expect(await screen.findByRole('heading', { name: 'Đã gửi yêu cầu!' })).toBeInTheDocument()
    expect(screen.getByText('BK0001')).toBeInTheDocument()
    expect(placeBooking).toHaveBeenCalledTimes(1)
    const [body, key] = vi.mocked(placeBooking).mock.calls[0]
    expect(body).toEqual({ ...request, customerNote: 'Nhắc bà uống thuốc' })
    expect(key).toMatch(/^[0-9a-f-]{36}$/)
    // The note does not change the price, so it never triggers another quote.
    expect(fetchBookingQuote).toHaveBeenCalledTimes(quotes)
    expect(screen.getByRole('link', { name: 'Xem chi tiết lịch đặt' })).toHaveAttribute(
      'href',
      '/customer/bookings/bk-1'
    )
  })

  it('shows overlap on the visit row and blocks Continue until it is fixed', async () => {
    renderPage('/customer/booking')
    await toSchedule()

    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[0], { target: { value: '02/01/2030' } })
    fireEvent.click(screen.getByRole('button', { name: 'Thêm buổi' }))
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[1], { target: { value: '02/01/2030' } })
    fireEvent.change(screen.getAllByRole('combobox', { name: 'Bắt đầu' })[1], { target: { value: '09:00' } })
    fireEvent.change(screen.getAllByRole('combobox', { name: 'Kết thúc' })[1], { target: { value: '11:00' } })

    expect(await screen.findByText('Trùng giờ với buổi khác.')).toBeInTheDocument()
    expect(continueButton()).toBeDisabled()

    fireEvent.change(screen.getAllByRole('combobox', { name: 'Bắt đầu' })[1], { target: { value: '14:00' } })
    fireEvent.change(screen.getAllByRole('combobox', { name: 'Kết thúc' })[1], { target: { value: '17:30' } })
    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0].slots).toEqual([
        { startAt: '2030-01-02T01:00:00.000Z', endAt: '2030-01-02T03:00:00.000Z' },
        { startAt: '2030-01-02T07:00:00.000Z', endAt: '2030-01-02T10:30:00.000Z' }
      ])
    )
  })

  it('sends a weekly RECURRING booking with sorted weekdays', async () => {
    renderPage('/customer/booking')
    await toSchedule()

    fireEvent.click(screen.getByRole('radio', { name: /Định kỳ/ }))
    fireEvent.click(await screen.findByRole('radio', { name: 'Hằng tuần' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'T6' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'T2' }))
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[0], { target: { value: '01/01/2030' } })
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[1], { target: { value: '31/01/2030' } })

    expect(await screen.findByText(/Tổng 8 buổi · T2, T6/)).toBeInTheDocument()
    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0]).toEqual({
        recipientId: 'rec-1',
        centerId: 'center-1',
        bookingType: 'RECURRING',
        caregiverId: undefined,
        frequency: 'WEEKLY',
        startDate: '2030-01-01',
        endDate: '2030-01-31',
        startTime: '08:00',
        endTime: '10:00',
        daysOfWeek: [1, 5],
        services: SERVICES
      })
    )
  })

  it('disables SHIFT while the center assigns, and books a free shift of the chosen caregiver', async () => {
    vi.mocked(fetchBookingQuote).mockResolvedValue({
      lines: [],
      occurrences: [
        { occurrenceNo: 1, startAt: '2030-01-03T06:00:00Z', endAt: '2030-01-03T10:00:00Z', priceAmount: 400000 }
      ],
      totalAmount: 400000,
      depositPercent: 100,
      estimatedDepositAmount: 400000
    })
    renderPage('/customer/booking')
    await toSchedule()
    expect(screen.getByRole('radio', { name: /Theo ca/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Chọn người chăm sóc' }))

    fireEvent.click(await screen.findByRole('radio', { name: /Chị Hoa/ }))
    await next()
    fireEvent.click(await screen.findByRole('radio', { name: /Theo ca/ }))
    fireEvent.click(await screen.findByRole('button', { name: /03\/01/ }))
    fireEvent.click(await screen.findByRole('radio', { name: /13:00–17:00/ }))
    fireEvent.click(screen.getByRole('button', { name: /02\/01/ }))
    expect(await screen.findByRole('radio', { name: /08:00–12:00/ })).toBeDisabled()
    expect(screen.getByText('Đã có người đặt')).toBeInTheDocument()

    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0]).toEqual({
        recipientId: 'rec-1',
        centerId: 'center-1',
        bookingType: 'SHIFT',
        caregiverId: 'cg-1',
        caregiverScheduleId: 'sch-free',
        services: SERVICES
      })
    )
    expect(fetchHeldSchedules).toHaveBeenCalledWith({ caregiverId: 'cg-1' })
  })

  it('shows a translated backend quote error on the review step', async () => {
    vi.mocked(fetchBookingQuote).mockRejectedValue(
      Object.assign(new Error('conflict'), { status: 409, info: { code: 5226 } })
    )
    renderPage('/customer/booking')
    await toSchedule()
    await next()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Người chăm sóc không có ca làm việc (hoặc đang nghỉ) vào thời gian đã chọn.'
    )
    expect(screen.getAllByRole('button', { name: 'Gửi yêu cầu đặt lịch' })[0]).toBeDisabled()
  })
})
