import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCenterSchedules, fetchMySchedules, updateCaregiverSchedule, updateCenterSchedule } from './provider-api'
import { ProviderSchedulePage } from './provider-schedule-page'
import type { ProviderScheduleRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

vi.mock('./provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./provider-api')>()),
  fetchCenterSchedules: vi.fn(),
  fetchMySchedules: vi.fn(),
  updateCaregiverSchedule: vi.fn(),
  updateCenterSchedule: vi.fn()
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
  vi.mocked(updateCenterSchedule).mockReset()
  await setAppLanguage('en', false)
})

describe('Provider schedules', () => {
  it('starts a caregiver schedule using its current version', async () => {
    vi.mocked(fetchMySchedules).mockResolvedValue(page)
    vi.mocked(updateCaregiverSchedule).mockResolvedValue({ ...schedule, scheduleStatus: 'IN_PROGRESS', version: 4 })
    renderPage()

    expect(await screen.findByText('Lan Nguyen')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await waitFor(() =>
      expect(updateCaregiverSchedule).toHaveBeenCalledWith('schedule-1', {
        status: 'IN_PROGRESS',
        version: 3,
        reason: undefined
      })
    )
    expect(fetchCenterSchedules).not.toHaveBeenCalled()
  })

  it('requires a reason to cancel a manager schedule', async () => {
    vi.mocked(fetchCenterSchedules).mockResolvedValue(page)
    vi.mocked(updateCenterSchedule).mockResolvedValue({ ...schedule, scheduleStatus: 'CANCELLED', version: 4 })
    renderPage('center-1')

    expect(await screen.findByText('Lan Nguyen')).toBeInTheDocument()
    expect(fetchCenterSchedules).toHaveBeenCalledWith('center-1', { page: 0, size: 20 })
    const cancel = screen.getByRole('button', { name: 'Cancel schedule' })
    expect(cancel).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Cancellation reason' }), {
      target: { value: '  Change of care plan  ' }
    })
    fireEvent.click(cancel)
    await waitFor(() =>
      expect(updateCenterSchedule).toHaveBeenCalledWith('schedule-1', {
        status: 'CANCELLED',
        version: 3,
        reason: 'Change of care plan'
      })
    )
    expect(fetchMySchedules).not.toHaveBeenCalled()
  })
})
