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
  services: [{ careServiceId: 'svc-1', serviceName: 'Chăm sóc người già tại nhà' }]
}

function renderWith(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
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

describe('Caregiver assigned visits', () => {
  it('lists assigned visits from today and links to each visit', async () => {
    vi.mocked(fetchMyOccurrences).mockResolvedValue({
      items: [visit],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    renderWith(<CaregiverVisitsPage />)

    expect(await screen.findByRole('heading', { name: 'Bà Lan' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mở buổi 1 của Bà Lan' })).toHaveAttribute(
      'href',
      '/caregiver/visits/occ-1'
    )
    expect(vi.mocked(fetchMyOccurrences).mock.calls[0][0]).toMatchObject({ page: 0, size: 20 })
    expect(vi.mocked(fetchMyOccurrences).mock.calls[0][0]?.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    fireEvent.click(screen.getByRole('button', { name: 'Tất cả' }))
    await waitFor(() => expect(vi.mocked(fetchMyOccurrences).mock.lastCall?.[0]).toEqual({ page: 0, size: 20 }))
  })

  it('acknowledges the visit and checks in without blocking on location', async () => {
    vi.mocked(fetchOccurrence).mockResolvedValue(visit)
    vi.mocked(acknowledgeOccurrence).mockResolvedValue({ ...visit, status: 'ACKNOWLEDGED' })
    vi.mocked(checkIn).mockRejectedValue(Object.assign(new Error('early'), { status: 409, info: { code: 5222 } }))
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)

    fireEvent.click(await screen.findByRole('button', { name: 'Nhận buổi' }))
    await waitFor(() => expect(acknowledgeOccurrence).toHaveBeenCalledWith('occ-1'))

    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu ca' }))
    await waitFor(() => expect(checkIn).toHaveBeenCalledWith({ occurrenceId: 'occ-1' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Chỉ check-in được từ 30 phút trước')
    // The visit has not started, so a no-show cannot be reported yet.
    expect(screen.queryByRole('button', { name: 'Báo khách vắng mặt' })).not.toBeInTheDocument()
  })

  it('keeps check-in closed outside 30 minutes either side of the start (D22)', async () => {
    const early = new Date(Date.now() + 2 * 3_600_000).toISOString()
    vi.mocked(fetchOccurrence).mockResolvedValue({ ...visit, startAt: early })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)
    expect(await screen.findByRole('button', { name: 'Bắt đầu ca' })).toBeDisabled()
    cleanup()

    const late = new Date(Date.now() - 3_600_000).toISOString()
    vi.mocked(fetchOccurrence).mockResolvedValue({ ...visit, status: 'ACKNOWLEDGED', startAt: late })
    renderWith(<CaregiverVisitDetailPage id='occ-1' />)
    expect(await screen.findByRole('button', { name: 'Bắt đầu ca' })).toBeDisabled()
    expect(screen.getByText(/Đã hết giờ bắt đầu ca/)).toBeInTheDocument()
    expect(checkIn).not.toHaveBeenCalled()
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
    const checkOutButton = screen.getByRole('button', { name: 'Kết thúc ca' })
    expect(checkOutButton).toBeDisabled()

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
