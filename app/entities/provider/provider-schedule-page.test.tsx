import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

const day = 24 * 60 * 60 * 1000
const isoDate = (offsetDays: number) => {
  const date = new Date(Date.now() + offsetDays * day)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const schedule: ProviderScheduleRecord = {
  id: 'schedule-1',
  caregiverId: 'caregiver-1',
  caregiverName: 'Lan Nguyen',
  workShiftId: 'shift-1',
  centerId: 'center-1',
  workDate: isoDate(3),
  startTime: '08:00:00',
  endTime: '16:00:00',
  scheduleStatus: 'SCHEDULED',
  version: 3
}
const pastSlot: ProviderScheduleRecord = { ...schedule, id: 'schedule-0', workDate: isoDate(-3), version: 1 }

const page = { items: [schedule, pastSlot], page: 0, size: 20, totalElements: 2, totalPages: 1 }

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

describe('Provider availability', () => {
  it('explains availability and only offers cancelling an upcoming open slot (D11)', async () => {
    vi.mocked(fetchMySchedules).mockResolvedValue(page)
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Availability' })).toBeInTheDocument()
    expect(screen.getByText(/Customers can only book you within these slots/)).toBeInTheDocument()
    // Availability is not a care session: there is nothing to start, complete or count as in progress.
    expect(screen.queryByText('In progress')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    expect(await screen.findAllByRole('listitem')).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Cancel slot' })).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Past' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Cancel slot' })).not.toBeInTheDocument()
  })

  it('asks for a reason in the dialog and cancels with the slot version', async () => {
    vi.mocked(fetchMySchedules).mockResolvedValue(page)
    vi.mocked(updateCaregiverSchedule).mockResolvedValue({ ...schedule, scheduleStatus: 'CANCELLED', version: 4 })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel slot' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel slot' }))
    expect(await within(dialog).findByText('Enter a reason so the center knows why.')).toBeInTheDocument()
    expect(updateCaregiverSchedule).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Cancellation reason' }), {
      target: { value: 'Sick leave' }
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel slot' }))
    await waitFor(() =>
      expect(updateCaregiverSchedule).toHaveBeenCalledWith('schedule-1', {
        status: 'CANCELLED',
        version: 3,
        reason: 'Sick leave'
      })
    )
    expect(fetchCenterSchedules).not.toHaveBeenCalled()
  })

  it('shows center availability read-only for the manager', async () => {
    vi.mocked(fetchCenterSchedules).mockResolvedValue(page)
    renderPage('center-1')

    expect(await screen.findByRole('heading', { level: 1, name: 'Caregiver availability' })).toBeInTheDocument()
    expect((await screen.findAllByText('Lan Nguyen')).length).toBe(2)
    expect(fetchCenterSchedules).toHaveBeenCalledWith('center-1', { page: 0, size: 20 })
    expect(screen.queryByRole('button', { name: 'Cancel slot' })).not.toBeInTheDocument()
    expect(fetchMySchedules).not.toHaveBeenCalled()
  })
})
