import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchCaregivers,
  fetchCenterSchedules,
  fetchCenterTimeOffs,
  fetchProviderMedia,
  removeTimeOff
} from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { ProviderScheduleRecord, ProviderTimeOffRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { addDays, calendarDayOf, isoWeekday } from '~/shared/lib/format'

import { leaveOnDay } from './calendar-model'
import { ManagerWorkCalendarPage } from './manager-work-calendar-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregivers: vi.fn(),
  fetchCenterSchedules: vi.fn(),
  fetchCenterTimeOffs: vi.fn(),
  fetchProviderMedia: vi.fn(),
  removeTimeOff: vi.fn()
}))

const today = calendarDayOf(new Date())
const monday = addDays(today, 1 - isoWeekday(today))
const page = <T,>(items: T[]) => ({ items, page: 0, size: 100, totalElements: items.length, totalPages: 1 })

const shift: ProviderScheduleRecord = {
  id: 'schedule-1',
  caregiverId: 'cg-1',
  caregiverName: 'Chị Hoa',
  workShiftId: 'shift-1',
  centerId: 'center-1',
  workDate: monday,
  startTime: '08:00:00',
  endTime: '12:00:00',
  shiftType: 'MORNING',
  scheduleStatus: 'SCHEDULED',
  version: 1
}
const leave: ProviderTimeOffRecord = {
  id: 'off-1',
  caregiverId: 'cg-1',
  caregiverName: 'Chị Hoa',
  startAt: `${monday}T00:00:00+07:00`,
  endAt: `${addDays(monday, 1)}T00:00:00+07:00`,
  reason: 'Việc gia đình'
}

function renderAt(path = '/center-manager/schedules') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={{ centerId: 'center-1', roles: ['CENTER_MANAGER'] }}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<ManagerWorkCalendarPage />} path='/center-manager/schedules' />
          </Routes>
        </MemoryRouter>
      </AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

describe('Center Manager work schedule & time off', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await setAppLanguage('en')
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    vi.mocked(fetchCaregivers).mockResolvedValue(
      page([
        {
          id: 'cg-1',
          centerId: 'center-1',
          fullName: 'Chị Hoa',
          caregiverStatus: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          version: 1
        },
        {
          id: 'cg-2',
          centerId: 'center-1',
          fullName: 'Anh Nam',
          caregiverStatus: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          version: 1
        }
      ])
    )
    vi.mocked(fetchCenterSchedules).mockResolvedValue(page([shift]))
    vi.mocked(fetchCenterTimeOffs).mockResolvedValue(page([leave]))
  })

  it('reads the week of the center and flags a shift that falls in time off', async () => {
    renderAt()

    const grid = await screen.findByRole('table', { name: 'Work schedule by caregiver and day of the week' })
    expect(within(grid).getByRole('link', { name: 'Anh Nam' })).toBeInTheDocument()
    expect(within(grid).getByText('Off all day')).toBeInTheDocument()
    expect(within(grid).getByRole('link', { name: /Morning shift 08:00–12:00/ })).toHaveAttribute(
      'href',
      '/center-manager/work-shifts/shift-1'
    )
    expect(fetchCenterSchedules).toHaveBeenCalledWith(
      'center-1',
      expect.objectContaining({ fromDate: monday, toDate: addDays(monday, 6) })
    )
    expect(await screen.findByText('Shifts fall in time off — reassign or cancel them')).toBeInTheDocument()
  })

  it('filters by caregiver from the URL and lists and deletes time off', async () => {
    vi.mocked(removeTimeOff).mockResolvedValue(undefined)
    const upcoming = {
      ...leave,
      startAt: `${addDays(today, 2)}T08:00:00+07:00`,
      endAt: `${addDays(today, 2)}T17:00:00+07:00`
    }
    vi.mocked(fetchCenterTimeOffs).mockResolvedValue(page([upcoming]))
    renderAt('/center-manager/schedules?view=timeOff&caregiver=cg-1')

    const table = await screen.findByRole('table', { name: 'Time off of the center’s caregivers' })
    expect(within(table).getByText('Việc gia đình')).toBeInTheDocument()
    expect(fetchCenterTimeOffs).toHaveBeenCalledWith('center-1', expect.objectContaining({ caregiverId: 'cg-1' }))
    fireEvent.click(within(table).getByRole('button', { name: /Delete time off/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(removeTimeOff).toHaveBeenCalledWith('cg-1', 'off-1'))
  })

  it('cuts a multi-day time off into the part of each day', () => {
    const long = { ...leave, startAt: `${monday}T14:00:00+07:00`, endAt: `${addDays(monday, 2)}T10:00:00+07:00` }
    expect(leaveOnDay(long, monday)).toMatchObject({ wholeDay: false, start: '14:00', end: '24:00' })
    expect(leaveOnDay(long, addDays(monday, 1))).toMatchObject({ wholeDay: true })
    expect(leaveOnDay(long, addDays(monday, 2))).toMatchObject({ wholeDay: false, start: '00:00', end: '10:00' })
    expect(leaveOnDay(long, addDays(monday, 3))).toBeUndefined()
  })
})
