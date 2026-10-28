import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCenterSchedules, fetchMySchedules, updateCaregiverSchedule } from './provider-api'
import { ProviderSchedulePage } from './provider-schedule-page'
import type { ProviderScheduleRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

vi.mock('./provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./provider-api')>()),
  fetchCenterSchedules: vi.fn(),
  fetchMySchedules: vi.fn(),
  updateCaregiverSchedule: vi.fn()
}))

const schedule: ProviderScheduleRecord = {
  id: 'schedule-1',
  caregiverId: 'caregiver-1',
  caregiverName: 'Lan Nguyen',
  workShiftId: 'shift-1',
  centerId: 'center-1',
  workDate: '2026-10-20',
  startTime: '08:00:00',
  endTime: '16:00:00',
  scheduleStatus: 'SCHEDULED',
  version: 3
}

const page = { items: [schedule], page: 0, size: 20, totalElements: 1, totalPages: 1 }

function renderPage(centerId?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ProviderSchedulePage centerId={centerId} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchCenterSchedules).mockReset()
  vi.mocked(fetchMySchedules).mockReset()
  vi.mocked(updateCaregiverSchedule).mockReset()
  await setAppLanguage('en', false)
})

describe('Provider schedules', () => {
  it('only lets a caregiver cancel an availability slot, with its version and a reason', async () => {
    vi.mocked(fetchMySchedules).mockResolvedValue(page)
    vi.mocked(updateCaregiverSchedule).mockResolvedValue({ ...schedule, scheduleStatus: 'CANCELLED', version: 4 })
    renderPage()

    expect(await screen.findByText('Lan Nguyen')).toBeInTheDocument()
    // Availability is not a care session: starting and completing happen on assigned visits (D11).
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Cancellation reason' }), { target: { value: 'Sick leave' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel schedule' }))
    await waitFor(() =>
      expect(updateCaregiverSchedule).toHaveBeenCalledWith('schedule-1', {
        status: 'CANCELLED',
        version: 3,
        reason: 'Sick leave'
      })
    )
    expect(fetchCenterSchedules).not.toHaveBeenCalled()
  })

  it('shows center schedules without controls for the removed manager mutation', async () => {
    vi.mocked(fetchCenterSchedules).mockResolvedValue(page)
    renderPage('center-1')

    expect(await screen.findByText('Lan Nguyen')).toBeInTheDocument()
    expect(fetchCenterSchedules).toHaveBeenCalledWith('center-1', { page: 0, size: 20 })
    expect(screen.queryByRole('button', { name: 'Cancel schedule' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Cancellation reason' })).not.toBeInTheDocument()
    expect(fetchMySchedules).not.toHaveBeenCalled()
  })
})
