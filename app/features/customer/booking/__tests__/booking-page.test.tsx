import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
import { pickTime } from '~/shared/test/pickers'

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
    lateCancelNoRefundMinutes: 120,
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

/** A second service (bathing) priced per 4-hour shift, next to the hourly elderly care. */
function withTwoServices() {
  vi.mocked(fetchCenterOfferings).mockResolvedValue([
    {
      id: 'offer-1',
      centerId: 'center-1',
      status: 'ACTIVE',
      catalogItem: { id: 'svc-1', name: 'Chăm sóc người già tại nhà', category: 'ELDERLY_CARE', status: 'ACTIVE' }
    },
    {
      id: 'offer-2',
      centerId: 'center-1',
      status: 'ACTIVE',
      catalogItem: { id: 'svc-2', name: 'Tắm rửa', category: 'ELDERLY_CARE', status: 'ACTIVE' }
    }
  ])
  vi.mocked(fetchPricePlans).mockImplementation(async (offeringId) =>
    offeringId === 'offer-2'
      ? [
          {
            id: 'plan-2',
            centerOfferingId: 'offer-2',
            planName: 'Ca 4 giờ',
            pricingUnit: 'SHIFT',
            durationMinutes: 240,
            basePrice: 400000,
            isActive: true
          }
        ]
      : [
          {
            id: 'plan-1',
            centerOfferingId: 'offer-1',
            planName: 'Theo giờ',
            pricingUnit: 'HOUR',
            durationMinutes: 60,
            basePrice: 100000,
            isActive: true
          }
        ]
  )
}

/** The step's primary action; the phone bottom bar repeats it, so the first match is the step footer. */
function continueButton() {
  return screen.getAllByRole('button', { name: 'Tiếp tục' })[0]
}

async function next() {
  await waitFor(() => expect(continueButton()).toBeEnabled())
  fireEvent.click(continueButton())
}

/** The visit list of the schedule step (one card per day). */
function visitList(name = 'Các buổi chăm sóc') {
  return within(screen.getByRole('group', { name }))
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
    const service = await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ })
    expect(service).toBeChecked()
    expect(service.closest('label')).toHaveTextContent('100.000 ₫ / giờ')
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

    // 2026-11-11: no visit is made up front.
    expect(screen.getByText('Chưa có buổi nào. Dùng thêm nhanh hoặc thêm từng ngày.')).toBeInTheDocument()
    expect(continueButton()).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ngày' }))
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
    expect(await screen.findByText('Đặt cọc (30%) ngay khi gửi')).toBeInTheDocument()
    // Unit price, quantity and amount of each service, in the review and in the summary column.
    expect(screen.getAllByText('Đơn giá: 100.000 ₫ / giờ').length).toBe(2)
    expect(screen.getAllByText('2 giờ × 1 buổi').length).toBe(2)
    expect(screen.getAllByText('Thành tiền').length).toBe(2)
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

    fireEvent.click(screen.getByRole('button', { name: 'Thêm ngày' }))
    fireEvent.change(visitList().getByPlaceholderText('dd/mm/yyyy'), { target: { value: '02/01/2030' } })
    // The new day copies the last one; moving it onto 02/01 puts two visits at the same time in one day card.
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ngày' }))
    fireEvent.change(visitList().getAllByPlaceholderText('dd/mm/yyyy')[1], { target: { value: '02/01/2030' } })

    expect(await screen.findByText('Trùng giờ với buổi khác.')).toBeInTheDocument()
    expect(visitList().getAllByPlaceholderText('dd/mm/yyyy')).toHaveLength(1)
    expect(continueButton()).toBeDisabled()

    pickTime(visitList().getAllByRole('combobox', { name: 'Bắt đầu' })[1], '14:00')
    pickTime(visitList().getAllByRole('combobox', { name: 'Kết thúc' })[1], '17:30')
    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0].slots).toEqual([
        { startAt: '2030-01-02T01:00:00.000Z', endAt: '2030-01-02T03:00:00.000Z' },
        { startAt: '2030-01-02T07:00:00.000Z', endAt: '2030-01-02T10:30:00.000Z' }
      ])
    )
  })

  it('builds a weekly RECURRING booking only when asked, and sends its visits', async () => {
    renderPage('/customer/booking')
    await toSchedule()

    fireEvent.click(screen.getByRole('radio', { name: /Định kỳ/ }))
    fireEvent.click(await screen.findByRole('radio', { name: 'Hằng tuần' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'T6' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'T2' }))
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[0], { target: { value: '01/01/2030' } })
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[1], { target: { value: '31/01/2030' } })

    expect(await screen.findByText('Sẽ tạo 8 buổi trong 8 ngày.')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Các buổi theo lịch lặp' })).not.toBeInTheDocument()
    expect(continueButton()).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Tạo 8 buổi' }))

    expect(await screen.findByText('8/60 buổi')).toBeInTheDocument()
    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0]).toMatchObject({
        recipientId: 'rec-1',
        centerId: 'center-1',
        bookingType: 'RECURRING',
        frequency: 'WEEKLY',
        startDate: '2030-01-01',
        endDate: '2030-01-31',
        startTime: '08:00',
        endTime: '10:00',
        daysOfWeek: [1, 5],
        services: SERVICES
      })
    )
    expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0].slots).toHaveLength(8)
  })

  it('lets the customer edit one recurring visit and sends the edited list (CR-1)', async () => {
    renderPage('/customer/booking')
    await toSchedule()

    fireEvent.click(screen.getByRole('radio', { name: /Định kỳ/ }))
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[0], { target: { value: '01/01/2030' } })
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[1], { target: { value: '02/01/2030' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Tạo 2 buổi' }))
    expect(await screen.findByText('2/60 buổi')).toBeInTheDocument()

    const list = visitList('Các buổi theo lịch lặp')
    pickTime(list.getAllByRole('combobox', { name: 'Bắt đầu' })[1], '14:00')
    pickTime(list.getAllByRole('combobox', { name: 'Kết thúc' })[1], '16:00')
    expect(screen.getByRole('button', { name: 'Tạo lại 2 buổi (thay 2 buổi hiện có)' })).toBeInTheDocument()
    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0]).toMatchObject({
        bookingType: 'RECURRING',
        frequency: 'DAILY',
        slots: [
          { startAt: '2030-01-01T01:00:00.000Z', endAt: '2030-01-01T03:00:00.000Z' },
          { startAt: '2030-01-02T07:00:00.000Z', endAt: '2030-01-02T09:00:00.000Z' }
        ]
      })
    )
  })

  it('flags a visit longer than the others and sets the time of the chosen days at once', async () => {
    renderPage('/customer/booking')
    await toSchedule()

    fireEvent.click(screen.getByRole('radio', { name: /Định kỳ/ }))
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[0], { target: { value: '01/01/2030' } })
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[1], { target: { value: '03/01/2030' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Tạo 3 buổi' }))
    expect(await screen.findByText('3/60 buổi')).toBeInTheDocument()

    // Day 2 ends an hour later than the other visits of the service: the row says so and offers 2 hours again.
    const list = visitList('Các buổi theo lịch lặp')
    pickTime(list.getAllByRole('combobox', { name: 'Kết thúc' })[1], '11:00')
    expect(await screen.findByText('Dài 3 giờ, các buổi khác của dịch vụ này 2 giờ.')).toBeInTheDocument()

    // Choose days 1 and 3 and move both to the afternoon in one go.
    fireEvent.click(screen.getByRole('checkbox', { name: /Chọn .*01\/01\/2030/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Chọn .*03\/01\/2030/ }))
    const bulk = screen.getByRole('group', { name: 'Sửa các ngày đã chọn' })
    expect(within(bulk).getByText('Đã chọn 2 ngày')).toBeInTheDocument()
    pickTime(within(bulk).getByRole('combobox', { name: 'Bắt đầu' }), '13:00')
    pickTime(within(bulk).getByRole('combobox', { name: 'Kết thúc' }), '16:00')
    fireEvent.click(within(bulk).getByRole('button', { name: 'Đặt giờ' }))

    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0].slots).toEqual([
        { startAt: '2030-01-01T06:00:00.000Z', endAt: '2030-01-01T09:00:00.000Z' },
        { startAt: '2030-01-02T01:00:00.000Z', endAt: '2030-01-02T04:00:00.000Z' },
        { startAt: '2030-01-03T06:00:00.000Z', endAt: '2030-01-03T09:00:00.000Z' }
      ])
    )
    // Every visit now lasts 3 hours: no more warning.
    expect(screen.queryByText(/Dài 3 giờ/)).not.toBeInTheDocument()
  })

  it('quick-adds the visits of a weekly pattern to a custom booking (CR-1)', async () => {
    renderPage('/customer/booking')
    await toSchedule()

    // Open while the list is empty.
    expect(screen.getByRole('button', { name: /Thêm nhanh/ })).toHaveAttribute('aria-expanded', 'true')
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[0], { target: { value: '01/01/2030' } })
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[1], { target: { value: '14/01/2030' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'T2' }))
    pickTime(screen.getAllByRole('combobox', { name: 'Bắt đầu' })[0], '09:00')
    fireEvent.click(screen.getByRole('button', { name: 'Thêm 2 buổi' }))

    expect(await screen.findByText('Đã thêm 2 buổi.')).toBeInTheDocument()
    expect(screen.getByText('2/60 buổi')).toBeInTheDocument()
    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0].slots).toEqual([
        { startAt: '2030-01-07T02:00:00.000Z', endAt: '2030-01-07T04:00:00.000Z' },
        { startAt: '2030-01-14T02:00:00.000Z', endAt: '2030-01-14T04:00:00.000Z' }
      ])
    )
  })

  it('blocks quick add up front when a visit clashes with the caregiver, and can skip it', async () => {
    // Chị Hoa is busy on Monday 07/01/2030 from 08:00 to 10:00 (Vietnam time).
    vi.mocked(fetchHeldSchedules).mockImplementation(async ({ caregiverId }) => ({
      caregiverId,
      heldScheduleIds: [],
      travelBufferMinutes: 60,
      busySlots: [{ startAt: '2030-01-07T01:00:00Z', endAt: '2030-01-07T03:00:00Z' }]
    }))
    renderPage('/customer/booking?caregiver=cg-1')
    await toSchedule()

    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[0], { target: { value: '01/01/2030' } })
    fireEvent.change(screen.getAllByPlaceholderText('dd/mm/yyyy')[1], { target: { value: '14/01/2030' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'T2' }))

    // Nothing is built yet, but the clash is named under the service and the button stays locked.
    expect(await screen.findByText('07/01: Chị Hoa đã có lịch khác vào giờ này.')).toBeInTheDocument()
    expect(screen.getByText(/1 buổi không đặt được/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thêm 2 buổi' })).toBeDisabled()
    expect(screen.getByText('0/60 buổi')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua 1 buổi vướng, dùng 1 buổi còn lại' }))
    expect(await screen.findByText('Đã thêm 1 buổi.')).toBeInTheDocument()
    expect(screen.getByText('1/60 buổi')).toBeInTheDocument()

    // Moving the time to the afternoon clears the clash.
    pickTime(screen.getAllByRole('combobox', { name: 'Bắt đầu' })[0], '14:00')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Thêm 2 buổi' })).toBeEnabled())
  })

  it('removes every day at once after a confirmation', async () => {
    renderPage('/customer/booking')
    await toSchedule()

    fireEvent.click(screen.getByRole('button', { name: 'Thêm ngày' }))
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ngày' }))
    expect(await screen.findByText('2/60 buổi')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Xóa tất cả' }))
    const dialog = await screen.findByRole('dialog', { name: 'Xóa tất cả các ngày?' })
    expect(within(dialog).getByText(/2 ngày cùng 2 buổi sẽ bị xóa/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xóa tất cả các ngày' }))

    expect(await screen.findByText('Chưa có buổi nào. Dùng thêm nhanh hoặc thêm từng ngày.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xóa tất cả' })).not.toBeInTheDocument()
    expect(continueButton()).toBeDisabled()
  })

  it('marks visits that clash with another booking of the chosen caregiver and removes them in one go', async () => {
    // Every day the form asks about is taken by another booking of Chị Hoa.
    vi.mocked(fetchHeldSchedules).mockImplementation(async ({ caregiverId, from, to }) => ({
      caregiverId,
      heldScheduleIds: [],
      travelBufferMinutes: 60,
      busySlots: from && to ? [{ startAt: `${from}T00:00:00+07:00`, endAt: `${to}T23:59:00+07:00` }] : []
    }))
    renderPage('/customer/booking?caregiver=cg-1')
    await toSchedule()

    fireEvent.click(screen.getByRole('button', { name: 'Thêm ngày' }))
    expect(await screen.findByText('Chị Hoa đã có lịch khác vào giờ này.')).toBeInTheDocument()
    expect(screen.getByText(/1 buổi trùng lịch khác của Chị Hoa/)).toBeInTheDocument()
    expect(continueButton()).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ 1 buổi bị trùng' }))
    expect(await screen.findByText('Chưa có buổi nào. Dùng thêm nhanh hoặc thêm từng ngày.')).toBeInTheDocument()
  })

  it('disables SHIFT while the center assigns, and books a time slot in a free shift of the chosen caregiver', async () => {
    vi.mocked(fetchBookingQuote).mockResolvedValue({
      lines: [],
      occurrences: [
        { occurrenceNo: 1, startAt: '2030-01-03T06:00:00Z', endAt: '2030-01-03T10:00:00Z', priceAmount: 400000 }
      ],
      totalAmount: 400000,
      depositPercent: 100,
      estimatedDepositAmount: 400000
    })
    vi.mocked(fetchHeldSchedules).mockResolvedValue({
      caregiverId: 'cg-1',
      heldScheduleIds: ['sch-held'],
      busySlots: [],
      travelBufferMinutes: 60,
      scheduleBookingCounts: { 'sch-held': 1 }
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
    // The hourly plan suggests 4-hour slots: the whole 13:00–17:00 shift is one slot.
    fireEvent.click(await screen.findByRole('button', { name: /^13:00–17:00$/ }))
    expect(screen.getByRole('button', { name: /Bỏ 13:00–17:00/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /02\/01/ }))
    // The shift without maxBookings takes one booking and already holds one.
    expect(await screen.findByRole('radio', { name: /08:00–12:00/ })).toBeDisabled()
    expect(screen.getByText('Đã đủ số lượng booking')).toBeInTheDocument()

    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0]).toEqual({
        recipientId: 'rec-1',
        centerId: 'center-1',
        bookingType: 'SHIFT',
        caregiverId: 'cg-1',
        caregiverScheduleId: 'sch-free',
        slots: [{ startAt: '2030-01-03T06:00:00.000Z', endAt: '2030-01-03T10:00:00.000Z', careServiceId: 'svc-1' }],
        services: SERVICES
      })
    )
    expect(fetchHeldSchedules).toHaveBeenCalledWith({ caregiverId: 'cg-1' })
  })

  it('keeps every caregiver listed and locks one who lacks a chosen service (2026-11-05)', async () => {
    const mai = { ...hoa, caregiverId: 'cg-3', fullName: 'Cô Mai' }
    withTwoServices()
    vi.mocked(fetchCaregiverCatalog).mockResolvedValue({
      items: [hoa, mai],
      page: 0,
      size: 100,
      totalElements: 2,
      totalPages: 1
    })
    vi.mocked(searchCaregiversByService).mockImplementation(async ({ careServiceIds }) => {
      const items = careServiceIds?.includes('svc-2') ? [hoa] : [hoa, mai]
      return { items, page: 0, size: 50, totalElements: items.length, totalPages: 1 }
    })
    renderPage('/customer/booking')
    await screen.findByRole('radio', { name: /Bà Lan/ })
    await next()
    fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
    fireEvent.click(await screen.findByRole('checkbox', { name: /Tắm rửa/ }))

    const maiCard = await screen.findByRole('radio', { name: /Cô Mai/ })
    await waitFor(() => expect(maiCard).toBeDisabled())
    expect(maiCard.closest('label')).toHaveTextContent('Chưa đảm nhận: Tắm rửa')
    expect(screen.getByRole('radio', { name: /Chị Hoa/ })).toBeEnabled()
  })

  it('splits a shift into slots per service, keeping the travel buffer around another booking', async () => {
    withTwoServices()
    vi.mocked(fetchBookableSchedules).mockResolvedValue([
      {
        id: 'sch-day',
        caregiverId: 'cg-1',
        centerId: 'center-1',
        workDate: '2030-01-04',
        startTime: '08:00:00',
        endTime: '20:00:00',
        maxBookings: 2
      }
    ])
    // Another booking holds 08:00–10:00 of the shift (01:00–03:00 UTC).
    vi.mocked(fetchHeldSchedules).mockResolvedValue({
      caregiverId: 'cg-1',
      heldScheduleIds: ['sch-day'],
      busySlots: [{ startAt: '2030-01-04T01:00:00Z', endAt: '2030-01-04T03:00:00Z', caregiverScheduleId: 'sch-day' }],
      travelBufferMinutes: 60,
      scheduleBookingCounts: { 'sch-day': 1 }
    })
    renderPage('/customer/booking?caregiver=cg-1')
    await screen.findByRole('radio', { name: /Bà Lan/ })
    await next()
    fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
    fireEvent.click(await screen.findByRole('checkbox', { name: /Tắm rửa/ }))
    await next()
    fireEvent.click(await screen.findByRole('radio', { name: /Theo ca/ }))
    fireEvent.click(await screen.findByRole('radio', { name: /08:00–20:00/ }))
    expect(screen.getByText('Còn nhận 1 booking')).toBeInTheDocument()

    // Hourly service, 4-hour slots: 09:00 overlaps the other booking, 10:00 is inside its 60-minute buffer.
    expect(await screen.findByRole('button', { name: /^09:00–13:00/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^10:00–14:00/ })).toHaveTextContent('Trừ hao di chuyển (1 giờ)')
    fireEvent.click(screen.getByRole('button', { name: /^11:00–15:00$/ }))

    // The per-shift plan fixes 4 hours; the next slot may follow right after the first one.
    fireEvent.click(screen.getByRole('button', { name: /Tắm rửa/ }))
    expect(screen.getByText('Ca 4 giờ: mỗi khung giờ dài 4 giờ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^12:00–16:00/ })).toHaveTextContent('Trùng khung bạn đã chọn')
    fireEvent.click(screen.getByRole('button', { name: /^15:00–19:00$/ }))

    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0]).toMatchObject({
        bookingType: 'SHIFT',
        caregiverScheduleId: 'sch-day',
        slots: [
          { startAt: '2030-01-04T04:00:00.000Z', endAt: '2030-01-04T08:00:00.000Z', careServiceId: 'svc-1' },
          { startAt: '2030-01-04T08:00:00.000Z', endAt: '2030-01-04T12:00:00.000Z', careServiceId: 'svc-2' }
        ]
      })
    )
  })

  it('puts every chosen service of a day in one card, each at its own time', async () => {
    withTwoServices()
    renderPage('/customer/booking')
    await screen.findByRole('radio', { name: /Bà Lan/ })
    await next()
    fireEvent.click(await screen.findByRole('checkbox', { name: /Chăm sóc người già tại nhà/ }))
    fireEvent.click(await screen.findByRole('checkbox', { name: /Tắm rửa/ }))
    await next()
    await screen.findByRole('radio', { name: /Tự chọn buổi/ })

    // The pattern has a time per service; a day may leave a service out.
    expect(screen.getByRole('checkbox', { name: 'Tắm rửa' })).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ngày' }))
    const list = visitList()
    // One day, two services back to back: hourly care 08:00–10:00, then the 4-hour shift 10:00–14:00.
    expect(list.getAllByPlaceholderText('dd/mm/yyyy')).toHaveLength(1)
    expect(list.getByText('2 dịch vụ')).toBeInTheDocument()
    await waitFor(() => expect(continueButton()).toBeEnabled())

    pickTime(list.getAllByRole('combobox', { name: 'Kết thúc' })[1], '12:00')
    expect(await screen.findByText('Ca 4 giờ cần buổi dài đúng 4 giờ.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Kết thúc lúc 14:00' }))

    fireEvent.click(list.getByRole('button', { name: /Bỏ Tắm rửa ngày/ }))
    expect(await screen.findByText('Chưa có buổi cho: Tắm rửa')).toBeInTheDocument()
    expect(continueButton()).toBeDisabled()
    fireEvent.click(list.getByRole('button', { name: 'Thêm Tắm rửa' }))
    await waitFor(() =>
      expect(vi.mocked(fetchBookingQuote).mock.calls.at(-1)?.[0].slots).toMatchObject([
        { careServiceId: 'svc-1' },
        { careServiceId: 'svc-2' }
      ])
    )
  })

  it('shows a translated backend quote error on the review step', async () => {
    vi.mocked(fetchBookingQuote).mockRejectedValue(
      Object.assign(new Error('conflict'), { status: 409, info: { code: 5226 } })
    )
    renderPage('/customer/booking')
    await toSchedule()
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ngày' }))
    await next()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Người chăm sóc không có ca làm việc (hoặc đang nghỉ) vào thời gian đã chọn.'
    )
    expect(screen.getAllByRole('button', { name: 'Gửi yêu cầu đặt lịch' })[0]).toBeDisabled()
  })

  it('hides centers outside the recipient province and says how many were hidden', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue({
      items: [{ id: 'rec-1', fullName: 'Bà Lan', age: 81, province: 'Thành phố Hà Nội', status: 'ACTIVE' }],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(fetchPublicCenters).mockResolvedValue({
      items: [
        { centerId: 'center-1', centerName: 'TT An Tâm', address: '45 Kim Mã, Ba Đình, Hà Nội' },
        { centerId: 'center-2', centerName: 'TT Bình An', address: '1 Lê Lợi, Quận 1, TP Hồ Chí Minh' }
      ],
      page: 0,
      size: 100,
      totalElements: 2,
      totalPages: 1
    })
    renderPage('/customer/booking?center=center-1')
    await next()

    expect(await screen.findByRole('heading', { name: 'Dịch vụ' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('radio', { name: /TT Bình An/ })).not.toBeInTheDocument())
    expect(screen.getByRole('radio', { name: /TT An Tâm/ })).toBeInTheDocument()
    expect(screen.getByText('Đã ẩn 1 trung tâm ngoài Thành phố Hà Nội.')).toBeInTheDocument()
  })
})
