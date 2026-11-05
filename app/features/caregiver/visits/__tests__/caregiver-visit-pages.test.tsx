import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  acknowledgeOccurrence,
  checkIn,
  checkOut,
  fetchCareSession,
  fetchMyOccurrences,
  fetchOccurrence,
  saveSessionTask
} from '~/entities/booking/booking-api'
import type { CaregiverOccurrenceRecord, CareSessionRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverVisitDetailPage } from '../caregiver-visit-detail-page'
import { CaregiverVisitsPage } from '../caregiver-visits-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchMyOccurrences: vi.fn(),
  fetchOccurrence: vi.fn(),
  fetchCareSession: vi.fn(),
  acknowledgeOccurrence: vi.fn(),
  checkIn: vi.fn(),
  checkOut: vi.fn(),
  saveSessionTask: vi.fn()
}))

const visit: CaregiverOccurrenceRecord = {
  id: 'occ-1',
  occurrenceNo: 1,
  bookingId: 'bk-1',
  bookingCode: 'BK0001',
  startAt: new Date(Date.now() + 600_000).toISOString(),
  endAt: new Date(Date.now() + 7_800_000).toISOString(),
  status: 'SCHEDULED',
  recipientName: 'Bà Lan',
  serviceAddress: '45 Kim Mã, Ba Đình',
  customerPhone: '0912345678',
  services: [{ careServiceId: 'svc-1', serviceName: 'Chăm sóc người già tại nhà' }]
}

const page = (items: CaregiverOccurrenceRecord[]) => ({
  items,
  page: 0,
  size: 100,
  totalElements: items.length,
  totalPages: 1
})

function renderWith(children: ReactNode, path = '/caregiver/visits') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  // Location is optional: a caregiver who denies it can still check in.
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: (_: unknown, fail: () => void) => fail() }
  })
})

describe('Caregiver care visits list', () => {
  it('groups upcoming visits by day, links to each one and accepts from the card', async () => {
    vi.mocked(fetchMyOccurrences).mockResolvedValue(page([visit]))
    vi.mocked(acknowledgeOccurrence).mockResolvedValue({ ...visit, status: 'ACKNOWLEDGED' })
    renderWith(<CaregiverVisitsPage />)

    const link = await screen.findByRole('link', { name: 'Mở buổi 1 của Bà Lan' })
    expect(link).toHaveAttribute('href', '/caregiver/visits/occ-1')
    expect(screen.getByRole('heading', { level: 2, name: /Hôm nay|Ngày mai/ })).toBeInTheDocument()
    const upcoming = vi.mocked(fetchMyOccurrences).mock.calls.find(([params]) => !params?.status)?.[0]
    expect(upcoming).toMatchObject({ page: 0, size: 100 })
    expect(upcoming?.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    fireEvent.click(screen.getByRole('button', { name: 'Nhận buổi' }))
    await waitFor(() => expect(acknowledgeOccurrence).toHaveBeenCalledWith('occ-1'))
  })

  it('reads one period for finished visits and lists them newest first', async () => {
    vi.mocked(fetchMyOccurrences).mockResolvedValue(
      page([
        { ...visit, id: 'old', status: 'COMPLETED', startAt: '2026-10-01T01:00:00Z', endAt: '2026-10-01T03:00:00Z' },
        { ...visit, id: 'new', status: 'COMPLETED', startAt: '2026-10-20T01:00:00Z', endAt: '2026-10-20T03:00:00Z' }
      ])
    )
    renderWith(<CaregiverVisitsPage />, '/caregiver/visits?tab=done&range=custom&from=2026-10-01&to=2026-10-31')

    await waitFor(() =>
      expect(fetchMyOccurrences).toHaveBeenCalledWith({ from: '2026-10-01', to: '2026-10-31', page: 0, size: 100 })
    )
    const links = await screen.findAllByRole('link', { name: /Mở buổi 1 của Bà Lan/ })
    expect(links.map((item) => item.getAttribute('href'))).toEqual(['/caregiver/visits/new', '/caregiver/visits/old'])
    expect(screen.getByRole('tab', { name: 'Đã xong' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Caregiver visit detail', () => {
  it('accepts the visit, then starts it without blocking on location', async () => {
    vi.mocked(fetchOccurrence)
      .mockResolvedValueOnce(visit)
      .mockResolvedValue({ ...visit, status: 'ACKNOWLEDGED' })
    vi.mocked(acknowledgeOccurrence).mockResolvedValue({ ...visit, status: 'ACKNOWLEDGED' })
    vi.mocked(checkIn).mockResolvedValue({ sessionId: 's-1', occurrenceId: 'occ-1', status: 'IN_PROGRESS' })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)

    fireEvent.click(await screen.findByRole('button', { name: 'Nhận buổi' }))
    await waitFor(() => expect(acknowledgeOccurrence).toHaveBeenCalledWith('occ-1'))

    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu ca' }))
    await waitFor(() => expect(checkIn).toHaveBeenCalledWith({ occurrenceId: 'occ-1' }))
    // The visit has not started, so a no-show cannot be reported yet.
    expect(screen.queryByRole('button', { name: 'Báo khách vắng mặt' })).not.toBeInTheDocument()
  })

  it('shows the allergy alert first and offers directions and a call', async () => {
    vi.mocked(fetchOccurrence).mockResolvedValue({
      ...visit,
      recipientSnapshot: { fullName: 'Bà Lan', age: 82, gender: 'FEMALE', allergies: 'Penicillin' }
    })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)

    expect(await screen.findByRole('note')).toHaveTextContent('Penicillin')
    expect(screen.getByRole('link', { name: 'Chỉ đường' })).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps/dir/?api=1&destination=45%20Kim')
    )
    expect(screen.getByRole('link', { name: 'Gọi 0912 345 678' })).toHaveAttribute('href', 'tel:0912345678')
    expect(screen.getByText(/82 tuổi/)).toBeInTheDocument()
  })

  it('shows the booking: who booked, this visit price, the plan and the other visits of the booking', async () => {
    vi.mocked(fetchOccurrence).mockResolvedValue({
      ...visit,
      bookingType: 'CUSTOM',
      customerName: 'Nguyễn Văn An',
      priceAmount: 250000,
      services: [{ careServiceId: 'svc-1', serviceName: 'Chăm sóc người già tại nhà', planName: 'Gói 2 giờ' }],
      bookingVisits: [
        { id: 'occ-1', occurrenceNo: 1, startAt: visit.startAt, endAt: visit.endAt, status: 'SCHEDULED' },
        {
          id: 'occ-2',
          occurrenceNo: 2,
          startAt: '2030-01-14T01:00:00Z',
          endAt: '2030-01-14T03:00:00Z',
          status: 'SCHEDULED'
        }
      ]
    })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)

    const booking = await screen.findByRole('region', { name: 'Lịch đặt' })
    expect(within(booking).getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(within(booking).getByText('Tự chọn buổi')).toBeInTheDocument()
    expect(within(booking).getByText(/250\.000/)).toBeInTheDocument()
    expect(within(booking).getByText('Gói Gói 2 giờ')).toBeInTheDocument()
    const visits = screen.getByRole('region', { name: 'Các buổi của bạn trong lịch này (2)' })
    expect(within(visits).getByRole('link', { name: 'Buổi 2' })).toHaveAttribute('href', '/caregiver/visits/occ-2')
  })

  it('keeps check-in closed outside 30 minutes either side of the start (D22)', async () => {
    const early = new Date(Date.now() + 2 * 3_600_000).toISOString()
    vi.mocked(fetchOccurrence).mockResolvedValue({ ...visit, status: 'ACKNOWLEDGED', startAt: early })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)
    expect(await screen.findByRole('button', { name: /Mở lúc/ })).toBeDisabled()
    cleanup()

    const late = new Date(Date.now() - 3_600_000).toISOString()
    vi.mocked(fetchOccurrence).mockResolvedValue({ ...visit, status: 'ACKNOWLEDGED', startAt: late })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)
    expect(await screen.findByText(/Đã hết giờ bắt đầu ca/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Bắt đầu ca' })).not.toBeInTheDocument()
    expect(checkIn).not.toHaveBeenCalled()
  })

  it('opens check-in by the window the center policy set on the booking (Q12)', async () => {
    const start = Date.now() + 50 * 60_000
    vi.mocked(fetchOccurrence).mockResolvedValue({
      ...visit,
      status: 'ACKNOWLEDGED',
      startAt: new Date(start).toISOString(),
      checkInOpensAt: new Date(start - 60 * 60_000).toISOString(),
      checkInClosesAt: new Date(start + 10 * 60_000).toISOString()
    })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)
    // 50 minutes ahead: closed by the old fixed 30-minute window, open under a 60-minute policy.
    expect(await screen.findByRole('button', { name: 'Bắt đầu ca' })).toBeEnabled()
  })

  it('works through the checklist and checks out once nothing is pending', async () => {
    const session: CareSessionRecord = {
      sessionId: 's-1',
      occurrenceId: 'occ-1',
      status: 'IN_PROGRESS',
      checkInAt: new Date().toISOString(),
      tasks: [
        { id: 't-1', taskType: 'SERVICE', title: 'Tắm rửa', status: 'DONE', sortOrder: 1 },
        { id: 't-2', taskType: 'MEDICATION', title: 'Amlodipine 5mg', status: 'PENDING', sortOrder: 2 }
      ]
    }
    vi.mocked(fetchOccurrence).mockResolvedValue({ ...visit, status: 'IN_PROGRESS', sessionId: 's-1' })
    vi.mocked(fetchCareSession)
      .mockResolvedValueOnce(session)
      .mockResolvedValue({
        ...session,
        tasks: [session.tasks![0], { ...session.tasks![1], status: 'SKIPPED', skipReason: 'Đang ngủ' }]
      })
    vi.mocked(saveSessionTask).mockResolvedValue({ ...session.tasks![1], status: 'SKIPPED' })
    vi.mocked(checkOut).mockResolvedValue({ ...session, status: 'ENDED' })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)

    expect(await screen.findByText('Còn 1 việc trước khi kết thúc ca.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kết thúc ca' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }))
    const dialog = screen.getByRole('dialog', { name: 'Bỏ qua “Amlodipine 5mg”' })
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Lý do bỏ qua' }), { target: { value: 'Đang ngủ' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Bỏ qua' }))

    await waitFor(() =>
      expect(saveSessionTask).toHaveBeenCalledWith('s-1', 't-2', { status: 'SKIPPED', skipReason: 'Đang ngủ' })
    )
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kết thúc ca' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Kết thúc ca' }))
    await waitFor(() => expect(checkOut).toHaveBeenCalledWith('s-1', {}))
  })
})
