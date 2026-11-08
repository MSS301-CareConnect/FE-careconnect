import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { acceptAsCaregiverRequest, fetchCaregiverBookingRequest } from '~/entities/booking/booking-api'
import { fetchMySchedules, fetchWorkShift } from '~/entities/provider/provider-api'
import type {
  CaregiverBookingRequestRecord,
  ProviderScheduleRecord,
  ProviderWorkShiftRecord
} from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverRequestDetailPage } from '../caregiver-request-detail-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchCaregiverBookingRequest: vi.fn(),
  acceptAsCaregiverRequest: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchMySchedules: vi.fn(),
  fetchWorkShift: vi.fn()
}))

// SHIFT booking split into two service slots inside one work shift (2026-11-05 multi-service slots).
const request: CaregiverBookingRequestRecord = {
  id: 'bk-1',
  bookingCode: 'BK-20301105-AAAA',
  status: 'PENDING_CAREGIVER_CONFIRMATION',
  bookingType: 'SHIFT',
  centerId: 'center-1',
  startDate: '2030-11-10',
  endDate: '2030-11-10',
  recipientName: 'Bà Lan',
  recipientAge: 81,
  recipientGender: 'FEMALE',
  mobilityLevel: 'WHEELCHAIR',
  chronicConditions: 'Tiểu đường type 2',
  allergies: 'Penicillin',
  careRequirements: 'Đo đường huyết trước bữa trưa',
  medicationCount: 2,
  customerName: 'Nguyễn Văn An',
  ward: 'Phường Kim Mã',
  district: 'Ba Đình',
  province: 'Hà Nội',
  customerNote: 'Nhẹ nhàng với bà',
  totalAmount: 450000,
  acceptanceDueAt: '2030-11-09T11:00:00Z',
  services: [
    {
      id: 'item-1',
      careServiceId: 'svc-1',
      serviceName: 'Chăm sóc người già tại nhà',
      planName: 'Theo giờ',
      unitType: 'HOUR',
      unitPrice: 100000,
      quantity: 2,
      totalPrice: 200000
    },
    {
      id: 'item-2',
      careServiceId: 'svc-2',
      serviceName: 'Vật lý trị liệu',
      unitType: 'SHIFT',
      unitPrice: 250000,
      quantity: 1,
      totalPrice: 250000
    }
  ],
  occurrences: [
    {
      id: 'occ-2',
      occurrenceNo: 2,
      startAt: '2030-11-10T02:00:00Z',
      endAt: '2030-11-10T04:00:00Z',
      status: 'RESERVED',
      careServiceId: 'svc-1',
      priceAmount: 200000,
      caregiverScheduleId: 'sch-1'
    },
    {
      id: 'occ-1',
      occurrenceNo: 1,
      startAt: '2030-11-10T01:00:00Z',
      endAt: '2030-11-10T02:00:00Z',
      status: 'RESERVED',
      careServiceId: 'svc-2',
      priceAmount: 250000,
      caregiverScheduleId: 'sch-1'
    }
  ]
}

const schedule = {
  id: 'sch-1',
  caregiverId: 'cg-1',
  workShiftId: 'shift-1',
  centerId: 'center-1',
  workDate: '2030-11-10',
  startTime: '07:00:00',
  endTime: '13:00:00',
  scheduleStatus: 'SCHEDULED',
  version: 0
} as ProviderScheduleRecord

function renderPage() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/caregiver/requests/bk-1']}>
        <Routes>
          <Route element={<CaregiverRequestDetailPage id='bk-1' />} path='/caregiver/requests/:id' />
          <Route element={<p data-testid='respond-tab' />} path='/caregiver/visits' />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchCaregiverBookingRequest).mockResolvedValue(request)
  vi.mocked(fetchMySchedules).mockResolvedValue({
    items: [schedule],
    page: 0,
    size: 100,
    totalElements: 1,
    totalPages: 1
  })
  vi.mocked(fetchWorkShift).mockResolvedValue({ id: 'shift-1', shiftType: 'MORNING' } as ProviderWorkShiftRecord)
  await setAppLanguage('vi', false)
})

describe('Caregiver booking request detail', () => {
  it('shows the shift, every visit, the health summary, the customer and the price lines', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Chăm sóc Bà Lan' })).toBeInTheDocument()
    expect(await screen.findByText(/Ca sáng · CN, 10\/11 · 07:00–13:00/)).toBeInTheDocument()

    const schedule = screen.getByRole('region', { name: 'Lịch làm việc' })
    const visits = within(schedule).getAllByRole('listitem')
    expect(visits[0]).toHaveTextContent('08:00–09:00')
    expect(visits[0]).toHaveTextContent('Vật lý trị liệu')
    expect(visits[1]).toHaveTextContent('Chăm sóc người già tại nhà')

    const recipient = screen.getByRole('region', { name: 'Người được chăm sóc' })
    expect(within(recipient).getByText('Penicillin')).toBeInTheDocument()
    expect(within(recipient).getByText('Dùng xe lăn')).toBeInTheDocument()
    expect(within(recipient).getByText('Tiểu đường type 2')).toBeInTheDocument()
    expect(within(recipient).getByText('Đang dùng 2 loại thuốc thường xuyên')).toBeInTheDocument()

    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
    const pricing = screen.getByRole('region', { name: 'Dịch vụ & chi phí' })
    expect(within(pricing).getByText('Gói Theo giờ · Theo giờ')).toBeInTheDocument()
    expect(within(pricing).getByText(/450\.000/)).toBeInTheDocument()
    expect(screen.getByText('Từ chối: lịch theo ca này sẽ đóng.')).toBeInTheDocument()
  })

  it('accepts and returns to the answer tab', async () => {
    vi.mocked(acceptAsCaregiverRequest).mockResolvedValue({ ...request, status: 'AWAITING_INITIAL_PAYMENT' })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Nhận lịch' }))
    await waitFor(() => expect(acceptAsCaregiverRequest).toHaveBeenCalledWith('bk-1'))
    expect(await screen.findByTestId('respond-tab')).toBeInTheDocument()
  })

  it('says the request no longer waits once it is answered', async () => {
    vi.mocked(fetchCaregiverBookingRequest).mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }))
    renderPage()
    expect(await screen.findByText('Yêu cầu này không còn chờ bạn')).toBeInTheDocument()
  })
})
