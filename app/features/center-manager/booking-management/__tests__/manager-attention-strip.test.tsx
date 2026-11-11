import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchCaregiverAbsences,
  fetchCaregiverWithdrawals,
  fetchSessionsForReview
} from '~/entities/booking/booking-api'
import type { CaregiverAbsenceRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { ManagerAttentionStrip } from '../components/manager-attention-strip'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchCaregiverAbsences: vi.fn(),
  fetchCaregiverWithdrawals: vi.fn(),
  fetchSessionsForReview: vi.fn()
}))

const absence: CaregiverAbsenceRecord = {
  id: 'abs-1',
  bookingId: 'bk-1',
  bookingCode: 'BK0001',
  recipientName: 'Bà Lan',
  occurrenceId: 'occ-1',
  occurrenceNo: 2,
  startAt: '2030-01-02T01:00:00Z',
  endAt: '2030-01-02T03:00:00Z',
  centerId: 'center-1',
  caregiverId: 'cg-1',
  source: 'MISSED_CHECK_IN',
  status: 'PENDING'
}

function page<T>(items: T[], totalElements: number, size: number) {
  return { items, page: 0, size, totalElements, totalPages: Math.ceil(totalElements / size) }
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchCaregiverWithdrawals).mockResolvedValue(page([], 0, 1))
  vi.mocked(fetchSessionsForReview).mockResolvedValue(page([], 0, 1))
  // 7 absences wait: the card reads one row for the count, the popup its first page of 5.
  vi.mocked(fetchCaregiverAbsences).mockImplementation(async (params) =>
    page(
      Array.from({ length: Math.min(params?.size ?? 5, 7) }, (_, index) => ({ ...absence, id: `abs-${index}` })),
      7,
      params?.size ?? 5
    )
  )
})

describe('ManagerAttentionStrip', () => {
  it('shows only the queues with work and opens a paged popup', async () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <ManagerAttentionStrip />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Người chăm sóc vắng ca')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.queryByText('Người chăm sóc xin rút ca')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Chi tiết — Người chăm sóc vắng ca/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Người chăm sóc vắng ca (7)' })
    await waitFor(() =>
      expect(fetchCaregiverAbsences).toHaveBeenCalledWith(expect.objectContaining({ page: 0, size: 5 }))
    )
    expect(within(dialog).getByLabelText('Số dòng mỗi trang')).toBeInTheDocument()
  })
})
