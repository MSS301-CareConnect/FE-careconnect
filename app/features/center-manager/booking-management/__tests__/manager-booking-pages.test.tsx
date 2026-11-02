import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  acceptBookingRequest,
  assignBookingCaregiver,
  cancelBookingRequest,
  decideNoShow,
  fetchBooking,
  fetchBookingHistory,
  fetchBookings,
  fetchOccurrence,
  rejectBookingRequest
} from '~/entities/booking/booking-api'
import { fetchCaregivers, searchCaregiversByService } from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { ManagerBookingDetailPage } from '../manager-booking-detail-page'
import { ManagerBookingManagementPage } from '../manager-booking-management-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBookings: vi.fn(),
  fetchBooking: vi.fn(),
  fetchBookingHistory: vi.fn(),
  fetchOccurrence: vi.fn(),
  acceptBookingRequest: vi.fn(),
  assignBookingCaregiver: vi.fn(),
  rejectBookingRequest: vi.fn(),
  cancelBookingRequest: vi.fn(),
  decideNoShow: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregivers: vi.fn(),
  searchCaregiversByService: vi.fn()
}))

const emptyPage = { items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }
const booking: BookingDetailRecord = {
  id: 'bk-1',
  bookingCode: 'BK0001',
  status: 'PENDING_CENTER_CONFIRMATION',
  recipientId: 'rec-1',
  centerId: 'center-1',
  bookingType: 'CUSTOM',
  startDate: '2026-11-01',
  totalAmount: 200000,
  customer: { fullName: 'Nguyễn Minh', phoneNumber: '0901234567' },
  recipientSnapshot: { fullName: 'Bà Lan', allergies: 'Hải sản' },
  occurrences: [
    {
      id: 'occ-1',
      occurrenceNo: 1,
      startAt: new Date(Date.now() + 86_400_000).toISOString(),
      endAt: new Date(Date.now() + 93_600_000).toISOString(),
      status: 'PENDING_ASSIGNMENT'
    }
  ]
}

function wrap(children: ReactNode, path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={{ centerId: 'center-1', roles: ['CENTER_MANAGER'] }}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={children} path='/center-manager/bookings/:id?' />
          </Routes>
        </MemoryRouter>
      </AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchBookingHistory).mockResolvedValue({ ...emptyPage, size: 50 })
  vi.mocked(fetchCaregivers).mockResolvedValue({
    items: [
      {
        id: 'cg-1',
        centerId: 'center-1',
        fullName: 'Chị Hoa',
        verificationStatus: 'VERIFIED',
        caregiverStatus: 'ACTIVE',
        version: 1
      },
      {
        id: 'cg-2',
        centerId: 'center-1',
        fullName: 'Anh Nam',
        verificationStatus: 'VERIFIED',
        caregiverStatus: 'ACTIVE',
        version: 1
      }
    ],
    page: 0,
    size: 100,
    totalElements: 2,
    totalPages: 1
  })
})

describe('Center Manager bookings', () => {
  it('lists the center bookings and opens the pending review queue', async () => {
    vi.mocked(fetchBookings).mockImplementation(async (params) =>
      params?.status === 'PENDING_CENTER_CONFIRMATION' && params.size === 1
        ? { ...emptyPage, size: 1, totalElements: 2, totalPages: 2 }
        : {
            ...emptyPage,
            totalElements: 1,
            totalPages: 1,
            items: [{ ...booking, recipientName: 'Bà Lan', customer: booking.customer }]
          }
    )
    wrap(<ManagerBookingManagementPage />, '/center-manager/bookings')

    expect(await screen.findByRole('link', { name: '#BK0001' })).toHaveAttribute(
      'href',
      '/center-manager/bookings/bk-1'
    )
    expect(screen.getByText('Nguyễn Minh')).toBeInTheDocument()
    expect(await screen.findByText(/2 yêu cầu đang chờ duyệt/)).toBeInTheDocument()
    // BookingService scopes the list from the session, so no centerId is sent.
    expect(vi.mocked(fetchBookings).mock.calls[0][0]).not.toHaveProperty('centerId')

    fireEvent.click(screen.getByRole('button', { name: 'Xem yêu cầu chờ duyệt' }))
    await waitFor(() =>
      expect(fetchBookings).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'PENDING_CENTER_CONFIRMATION', size: 20 })
      )
    )
  })

  it('accepts a pending booking with the caregiver the manager chooses', async () => {
    vi.mocked(fetchBooking).mockResolvedValue(booking)
    vi.mocked(acceptBookingRequest).mockResolvedValue({
      ...booking,
      status: 'AWAITING_INITIAL_PAYMENT',
      caregiverId: 'cg-2'
    })
    wrap(<ManagerBookingDetailPage />, '/center-manager/bookings/bk-1')

    expect(await screen.findByRole('heading', { level: 1, name: 'Bà Lan' })).toBeInTheDocument()
    expect(screen.getByText('Hải sản')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Chấp nhận' }))
    const dialog = screen.getByRole('dialog', { name: 'Chấp nhận lịch đặt #BK0001' })
    const confirm = within(dialog).getByRole('button', { name: 'Chấp nhận' })
    // Spec §5.2: a CUSTOM booking without caregiver may be confirmed first and assigned later.
    expect(confirm).toBeEnabled()
    expect(within(dialog).getByRole('option', { name: 'Phân công sau' })).toBeInTheDocument()

    await within(dialog).findByRole('option', { name: 'Anh Nam' })
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'Người chăm sóc' }), { target: { value: 'cg-2' } })
    fireEvent.click(confirm)

    await waitFor(() => expect(acceptBookingRequest).toHaveBeenCalledWith('bk-1', 'cg-2'))
  })

  it('assigns a caregiver to a confirmed booking that is waiting for one (spec §5.3)', async () => {
    const waiting: BookingDetailRecord = {
      ...booking,
      status: 'PENDING_CAREGIVER_ASSIGNMENT',
      assignmentDueAt: '2026-10-31T10:00:00Z'
    }
    vi.mocked(fetchBooking).mockResolvedValue(waiting)
    vi.mocked(assignBookingCaregiver).mockResolvedValue({
      ...waiting,
      status: 'AWAITING_INITIAL_PAYMENT',
      caregiverId: 'cg-2'
    })
    wrap(<ManagerBookingDetailPage />, '/center-manager/bookings/bk-1')

    expect(await screen.findByText(/Cần phân người chăm sóc trước/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Chấp nhận' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Phân người chăm sóc' }))
    const dialog = screen.getByRole('dialog', { name: 'Phân người chăm sóc cho lịch đặt #BK0001' })
    await within(dialog).findByRole('option', { name: /Anh Nam/ })
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'Người chăm sóc' }), { target: { value: 'cg-2' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Phân người chăm sóc' }))

    await waitFor(() => expect(assignBookingCaregiver).toHaveBeenCalledWith('bk-1', 'cg-2'))
  })

  it('marks which caregivers are free for every upcoming visit (M-16)', async () => {
    vi.mocked(fetchBooking).mockResolvedValue({
      ...booking,
      services: [{ id: 'item-1', careServiceId: 'svc-1' }]
    })
    vi.mocked(searchCaregiversByService).mockResolvedValue({
      items: [{ caregiverId: 'cg-2', centerId: 'center-1', fullName: 'Anh Nam' }],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1
    } as never)
    wrap(<ManagerBookingDetailPage />, '/center-manager/bookings/bk-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Chấp nhận' }))
    const dialog = screen.getByRole('dialog', { name: 'Chấp nhận lịch đặt #BK0001' })
    expect(await within(dialog).findByRole('option', { name: 'Anh Nam — rảnh' })).toBeInTheDocument()
    expect(within(dialog).getByRole('option', { name: 'Chị Hoa — bận hoặc không làm đủ dịch vụ' })).toBeInTheDocument()
    expect(searchCaregiversByService).toHaveBeenCalledWith(
      expect.objectContaining({
        centerId: 'center-1',
        careServiceIds: ['svc-1'],
        slots: [expect.stringContaining('/')]
      })
    )
  })

  it('rejects a pending booking with the reason the customer will see', async () => {
    vi.mocked(fetchBooking).mockResolvedValue(booking)
    vi.mocked(rejectBookingRequest).mockRejectedValue(
      Object.assign(new Error('conflict'), { status: 409, info: { code: 5101 } })
    )
    wrap(<ManagerBookingDetailPage />, '/center-manager/bookings/bk-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Lý do' }), { target: { value: 'Không đủ nhân sự' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Từ chối' }))

    await waitFor(() => expect(rejectBookingRequest).toHaveBeenCalledWith('bk-1', 'Không đủ nhân sự'))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Không thể thực hiện thao tác này với lịch đặt ở tình trạng hiện tại.'
    )
  })

  it('decides a no-show report on a visit that has started', async () => {
    const started = {
      ...booking.occurrences![0],
      startAt: new Date(Date.now() - 600_000).toISOString(),
      status: 'ACKNOWLEDGED' as const
    }
    vi.mocked(fetchBooking).mockResolvedValue({
      ...booking,
      status: 'CONFIRMED',
      caregiverId: 'cg-1',
      occurrences: [started]
    })
    vi.mocked(fetchOccurrence).mockResolvedValue({
      ...started,
      bookingId: 'bk-1',
      noShowReportedAt: new Date().toISOString(),
      noShowNote: 'Gọi 3 lần không ai mở cửa'
    })
    vi.mocked(decideNoShow).mockResolvedValue({ ...started, bookingId: 'bk-1', status: 'CUSTOMER_NO_SHOW' })
    wrap(<ManagerBookingDetailPage />, '/center-manager/bookings/bk-1')

    expect(await screen.findByText(/Gọi 3 lần không ai mở cửa/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận khách vắng' }))
    const dialog = screen.getByRole('dialog', { name: 'Xác nhận khách vắng mặt' })
    fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'Đã gọi khách' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận khách vắng' }))

    await waitFor(() => expect(decideNoShow).toHaveBeenCalledWith('occ-1', { approved: true, note: 'Đã gọi khách' }))
  })

  it('cancels one upcoming visit of a paid booking (B16) and only that visit', async () => {
    const upcoming = { ...booking.occurrences![0], status: 'SCHEDULED' as const, caregiverId: 'cg-1' }
    const confirmed = { ...booking, status: 'CONFIRMED' as const, caregiverId: 'cg-1', occurrences: [upcoming] }
    vi.mocked(fetchBooking).mockResolvedValue(confirmed)
    vi.mocked(cancelBookingRequest).mockResolvedValue(confirmed)
    wrap(<ManagerBookingDetailPage />, '/center-manager/bookings/bk-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Hủy buổi' }))
    const dialog = screen.getByRole('dialog', { name: 'Hủy buổi 1' })
    expect(within(dialog).getByText(/khách được hoàn toàn bộ số đã trả cho buổi/)).toBeInTheDocument()
    fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'Người chăm sóc ốm' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy buổi' }))

    await waitFor(() =>
      expect(cancelBookingRequest).toHaveBeenCalledWith('bk-1', {
        reason: 'Người chăm sóc ốm',
        occurrenceIds: ['occ-1']
      })
    )
  })

  it('offers no single-visit cancel before the customer has paid', async () => {
    const upcoming = { ...booking.occurrences![0], status: 'RESERVED' as const, caregiverId: 'cg-1' }
    vi.mocked(fetchBooking).mockResolvedValue({
      ...booking,
      status: 'AWAITING_INITIAL_PAYMENT',
      caregiverId: 'cg-1',
      occurrences: [upcoming]
    })
    wrap(<ManagerBookingDetailPage />, '/center-manager/bookings/bk-1')

    expect(await screen.findByRole('button', { name: 'Hủy lịch đặt' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hủy buổi' })).not.toBeInTheDocument()
  })
})
