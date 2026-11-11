import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaregiverAbsenceRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { concludeAbsence, explainAbsence, fetchCaregiverAbsences } from './booking-api'
import { CaregiverAbsenceQueue } from './caregiver-absence-queue'

vi.mock('./booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./booking-api')>()),
  fetchCaregiverAbsences: vi.fn(),
  explainAbsence: vi.fn(),
  concludeAbsence: vi.fn()
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

function page(items: CaregiverAbsenceRecord[]) {
  return { items, page: 0, size: 50, totalElements: items.length, totalPages: 1 }
}

function renderQueue(role: 'manager' | 'caregiver') {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <CaregiverAbsenceQueue nameOf={(id) => (id === 'cg-1' ? 'Trần Thị Hoa' : undefined)} role={role} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeAll(() => {
  // jsdom has no native <dialog> modal support.
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.open = false
  }
})

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi')
})

describe('CaregiverAbsenceQueue', () => {
  it('renders nothing when no absence waits', async () => {
    vi.mocked(fetchCaregiverAbsences).mockResolvedValue(page([]))
    renderQueue('manager')
    await waitFor(() => expect(fetchCaregiverAbsences).toHaveBeenCalled())
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('lets the manager record a violation with a note, naming the caregiver', async () => {
    vi.mocked(fetchCaregiverAbsences).mockResolvedValue(page([absence]))
    vi.mocked(concludeAbsence).mockResolvedValue({ ...absence, status: 'CONFIRMED' })
    renderQueue('manager')

    expect(await screen.findByText('Người chăm sóc: Trần Thị Hoa')).toBeInTheDocument()
    expect(screen.getByText('Chưa có giải trình')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ghi nhận vi phạm' }))
    const dialog = screen.getByRole('dialog', { name: 'Ghi nhận vi phạm buổi 2' })
    fireEvent.change(within(dialog).getByLabelText(/Ghi chú kết luận/), { target: { value: 'Không báo trước' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ghi nhận vi phạm' }))

    await waitFor(() =>
      expect(concludeAbsence).toHaveBeenCalledWith('abs-1', { decision: 'CONFIRMED', note: 'Không báo trước' })
    )
  })

  it('lets the caregiver send an explanation of at least 10 characters', async () => {
    vi.mocked(fetchCaregiverAbsences).mockResolvedValue(page([absence]))
    vi.mocked(explainAbsence).mockResolvedValue({ ...absence, explanation: 'Xe hỏng giữa đường' })
    renderQueue('caregiver')

    fireEvent.click(await screen.findByRole('button', { name: 'Gửi giải trình' }))
    const dialog = screen.getByRole('dialog', { name: 'Giải trình vắng buổi 2' })
    const submit = within(dialog).getByRole('button', { name: 'Gửi giải trình' })
    fireEvent.change(within(dialog).getByLabelText(/Nội dung giải trình/), { target: { value: 'ngắn' } })
    expect(submit).toBeDisabled()
    fireEvent.change(within(dialog).getByLabelText(/Nội dung giải trình/), {
      target: { value: 'Xe hỏng giữa đường, đã gọi trung tâm' }
    })
    fireEvent.click(submit)

    await waitFor(() =>
      expect(explainAbsence).toHaveBeenCalledWith('abs-1', { explanation: 'Xe hỏng giữa đường, đã gọi trung tâm' })
    )
  })
})
