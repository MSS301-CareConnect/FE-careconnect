import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  acceptAsCaregiverRequest,
  declineAsCaregiverRequest,
  fetchCaregiverBookingRequests
} from '~/entities/booking/booking-api'
import type { CaregiverBookingRequestRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { BookingRequestsList } from '../booking-requests-list'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchCaregiverBookingRequests: vi.fn(),
  acceptAsCaregiverRequest: vi.fn(),
  declineAsCaregiverRequest: vi.fn()
}))

const request: CaregiverBookingRequestRecord = {
  id: 'bk-1',
  bookingCode: 'BK0001',
  status: 'PENDING_CAREGIVER_CONFIRMATION',
  bookingType: 'RECURRING',
  recurrenceFrequency: 'WEEKLY',
  centerId: 'center-1',
  startDate: '2030-01-07',
  endDate: '2030-01-14',
  recipientAge: 78,
  recipientGender: 'FEMALE',
  ward: 'Phường Hàng Bài',
  district: 'Hoàn Kiếm',
  province: 'Hà Nội',
  customerNote: 'Bà đi lại bằng gậy',
  totalAmount: 400000,
  acceptanceDueAt: '2030-01-05T01:00:00Z',
  services: [{ careServiceId: 'svc-1', serviceName: 'Chăm sóc người cao tuổi' }],
  occurrences: [
    {
      id: 'occ-1',
      occurrenceNo: 1,
      startAt: '2030-01-07T01:00:00Z',
      endAt: '2030-01-07T03:00:00Z',
      status: 'RESERVED'
    },
    { id: 'occ-2', occurrenceNo: 2, startAt: '2030-01-14T01:00:00Z', endAt: '2030-01-14T03:00:00Z', status: 'RESERVED' }
  ]
} as CaregiverBookingRequestRecord

function renderPage() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <BookingRequestsList />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchCaregiverBookingRequests).mockResolvedValue({
    items: [request],
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1
  })
  await setAppLanguage('vi', false)
})

describe('Caregiver booking requests (CR-3)', () => {
  it('shows the area, the person and the visits without the care profile, and accepts', async () => {
    vi.mocked(acceptAsCaregiverRequest).mockResolvedValue({ ...request, status: 'AWAITING_INITIAL_PAYMENT' })
    renderPage()

    expect(await screen.findByText('Phường Hàng Bài, Hoàn Kiếm, Hà Nội')).toBeInTheDocument()
    expect(screen.getByText('78 tuổi · Nữ')).toBeInTheDocument()
    expect(screen.getByText('Chăm sóc người cao tuổi')).toBeInTheDocument()
    expect(screen.getByText('Hồ sơ chăm sóc đầy đủ sẽ mở khi khách đã thanh toán.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Nhận lịch' }))
    await waitFor(() => expect(acceptAsCaregiverRequest).toHaveBeenCalledWith('bk-1'))
  })

  it('declines with a reason', async () => {
    vi.mocked(declineAsCaregiverRequest).mockResolvedValue({ ...request, status: 'PENDING_CAREGIVER_ASSIGNMENT' })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }))
    fireEvent.change(screen.getByLabelText('Lý do gửi khách và trung tâm'), { target: { value: 'Bận việc gia đình' } })
    fireEvent.click(screen.getByRole('button', { name: 'Từ chối lịch' }))
    await waitFor(() => expect(declineAsCaregiverRequest).toHaveBeenCalledWith('bk-1', 'Bận việc gia đình'))
  })

  it('says when nothing is waiting', async () => {
    vi.mocked(fetchCaregiverBookingRequests).mockResolvedValue({
      items: [],
      page: 0,
      size: 50,
      totalElements: 0,
      totalPages: 0
    })
    renderPage()
    expect(await screen.findByText('Chưa có yêu cầu nào')).toBeInTheDocument()
  })
})
