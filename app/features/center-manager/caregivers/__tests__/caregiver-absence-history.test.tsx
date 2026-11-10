import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCaregiverAbsences, fetchCaregiverAbsenceStatistics } from '~/entities/booking/booking-api'
import type { CaregiverAbsenceRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverAbsenceHistory } from '../components/caregiver-absence-history'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchCaregiverAbsences: vi.fn(),
  fetchCaregiverAbsenceStatistics: vi.fn()
}))

const absence: CaregiverAbsenceRecord = {
  id: 'abs-1',
  bookingId: 'bk-1',
  bookingCode: 'BK0001',
  occurrenceId: 'occ-1',
  occurrenceNo: 2,
  startAt: '2030-01-02T01:00:00Z',
  endAt: '2030-01-02T03:00:00Z',
  centerId: 'center-1',
  caregiverId: 'cg-1',
  source: 'MISSED_CHECK_IN',
  status: 'CONFIRMED',
  conclusionNote: 'Không báo trước'
}

function renderHistory() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <CaregiverAbsenceHistory caregiverId='cg-1' />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi')
})

describe('CaregiverAbsenceHistory', () => {
  it('counts the caregiver absences by conclusion and lists the latest ones', async () => {
    vi.mocked(fetchCaregiverAbsenceStatistics).mockResolvedValue({ pending: 1, excused: 2, confirmed: 3, total: 6 })
    vi.mocked(fetchCaregiverAbsences).mockResolvedValue({
      items: [absence],
      page: 0,
      size: 5,
      totalElements: 6,
      totalPages: 2
    })
    renderHistory()

    const violations = await screen.findByText('Vi phạm', { selector: 'dt' })
    expect(violations.nextElementSibling).toHaveTextContent('3')
    expect(screen.getByText('Tổng số lần', { selector: 'dt' }).nextElementSibling).toHaveTextContent('6')
    expect(screen.getByText(/Kết luận của trung tâm: Không báo trước/)).toBeInTheDocument()
    expect(screen.getByText('Còn 5 lần khác')).toBeInTheDocument()
    // One pending absence → link to the queue where it is concluded.
    expect(screen.getByRole('link', { name: /Kết luận các lần chờ/ })).toHaveAttribute(
      'href',
      '/center-manager/bookings'
    )
    expect(fetchCaregiverAbsenceStatistics).toHaveBeenCalledWith({ caregiverId: 'cg-1' })
    expect(fetchCaregiverAbsences).toHaveBeenCalledWith({ caregiverId: 'cg-1', page: 0, size: 5 })
    const section = screen.getByRole('region', { name: 'Vắng ca' })
    expect(within(section).getByRole('link', { name: 'Xem lịch đặt' })).toHaveAttribute(
      'href',
      '/center-manager/bookings/bk-1'
    )
  })

  it('says so when the caregiver never missed a visit', async () => {
    vi.mocked(fetchCaregiverAbsenceStatistics).mockResolvedValue({ pending: 0, excused: 0, confirmed: 0, total: 0 })
    vi.mocked(fetchCaregiverAbsences).mockResolvedValue({
      items: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 0
    })
    renderHistory()

    expect(await screen.findByText('Chưa vắng ca lần nào.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Kết luận các lần chờ/ })).not.toBeInTheDocument()
  })
})
