import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMyOccurrences } from '~/entities/booking/booking-api'
import {
  fetchCertificates,
  fetchMyCaregiverProfile,
  fetchMyShiftRegistrations,
  fetchWorkShifts
} from '~/entities/provider/provider-api'
import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverTodayPage } from '../caregiver-today-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchMyOccurrences: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCertificates: vi.fn(),
  fetchMyCaregiverProfile: vi.fn(),
  fetchMyShiftRegistrations: vi.fn(),
  fetchWorkShifts: vi.fn()
}))

const empty = { items: [], page: 0, size: 100, totalElements: 0, totalPages: 0 }

function renderToday() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <CaregiverTodayPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchMyCaregiverProfile).mockResolvedValue({
    id: 'caregiver-1',
    centerId: 'center-1',
    fullName: 'Nguyễn Thị Hoa',
    caregiverStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    version: 1
  })
  vi.mocked(fetchCertificates).mockResolvedValue([])
  vi.mocked(fetchWorkShifts).mockResolvedValue(empty)
  vi.mocked(fetchMyShiftRegistrations).mockResolvedValue(empty)
  await setAppLanguage('vi', false)
})

describe('Caregiver today', () => {
  it('puts the next visit first with its countdown, allergy alert and the accept action', async () => {
    const next: CaregiverOccurrenceRecord = {
      id: 'occ-1',
      occurrenceNo: 1,
      bookingId: 'bk-1',
      status: 'SCHEDULED',
      startAt: new Date(Date.now() + 45 * 60_000).toISOString(),
      endAt: new Date(Date.now() + 165 * 60_000).toISOString(),
      recipientName: 'Bà Lan',
      serviceAddress: '45 Kim Mã',
      specialNotes: { allergies: 'Hải sản' }
    }
    vi.mocked(fetchMyOccurrences).mockImplementation(async (params) =>
      params?.status === 'SCHEDULED' ? { ...empty, items: [next], totalElements: 1 } : { ...empty, items: [next] }
    )
    renderToday()

    expect(await screen.findByRole('heading', { name: /Hoa$/ })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Buổi kế tiếp' })).toBeInTheDocument()
    expect(screen.getByText(/Bắt đầu sau 45 phút/)).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent('Dị ứng: Hải sản')
    expect(screen.getAllByRole('button', { name: 'Nhận buổi' }).length).toBeGreaterThan(0)
    expect(await screen.findByText('1 buổi đang chờ bạn nhận')).toBeInTheDocument()
    expect(await screen.findByText('Hồ sơ của bạn chưa có chứng chỉ nào')).toBeInTheDocument()
  })

  it('invites the caregiver to sign up for shifts when today is free', async () => {
    vi.mocked(fetchMyOccurrences).mockResolvedValue(empty)
    renderToday()
    expect(await screen.findByText('Hôm nay bạn chưa có buổi nào')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Đăng ký ca' })).toHaveAttribute('href', '/caregiver/work-shifts')
  })
})
