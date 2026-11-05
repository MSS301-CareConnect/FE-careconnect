import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  cancelWorkShift,
  createWorkShift,
  fetchCaregivers,
  fetchProviderMedia,
  fetchShiftRegistrations,
  fetchWorkShift,
  fetchWorkShiftStatistics,
  fetchWorkShifts,
  reviewShiftRegistrations
} from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { addDays, calendarDayOf } from '~/shared/lib/format'

import { ManagerWorkShiftDetailPage, ManagerWorkShiftsPage } from './manager-work-shifts-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchWorkShifts: vi.fn(),
  fetchWorkShiftStatistics: vi.fn(),
  createWorkShift: vi.fn(),
  fetchWorkShift: vi.fn(),
  fetchShiftRegistrations: vi.fn(),
  fetchCaregivers: vi.fn(),
  fetchProviderMedia: vi.fn(),
  reviewShiftRegistrations: vi.fn(),
  cancelWorkShift: vi.fn()
}))

const today = calendarDayOf(new Date())
const future = addDays(today, 5)

function shift(overrides: Partial<ProviderWorkShiftRecord> = {}): ProviderWorkShiftRecord {
  return {
    id: 'shift-1',
    centerId: 'center-1',
    workDate: future,
    startTime: '08:00:00',
    endTime: '12:00:00',
    shiftType: 'MORNING',
    shiftStatus: 'OPEN',
    capacity: 3,
    approvedCount: 1,
    pendingCount: 2,
    version: 4,
    createdAt: '2026-11-01T02:00:00Z',
    ...overrides
  }
}

const page = (items: ProviderWorkShiftRecord[]) => ({
  items,
  page: 0,
  size: 20,
  totalElements: items.length,
  totalPages: 1
})

function renderAt(path = '/center-manager/work-shifts') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={{ centerId: 'center-1', roles: ['CENTER_MANAGER'] }}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<ManagerWorkShiftsPage />} path='/center-manager/work-shifts' />
            <Route element={<ManagerWorkShiftDetailPage />} path='/center-manager/work-shifts/:id' />
          </Routes>
        </MemoryRouter>
      </AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchWorkShifts)
    .mockReset()
    .mockResolvedValue(page([shift()]))
  vi.mocked(fetchWorkShiftStatistics).mockReset().mockResolvedValue({
    total: 12,
    draft: 1,
    open: 4,
    closed: 3,
    completed: 3,
    cancelled: 1,
    upcoming7Days: 5,
    understaffed7Days: 3,
    missingStaff7Days: 4,
    pendingRegistrations: 2,
    capacityTotal: 20,
    approvedTotal: 15
  })
  vi.mocked(createWorkShift).mockReset()
  vi.mocked(fetchWorkShift).mockReset().mockResolvedValue(shift())
  vi.mocked(fetchShiftRegistrations).mockReset()
  vi.mocked(fetchCaregivers)
    .mockReset()
    .mockResolvedValue({ items: [], page: 0, size: 1, totalElements: 7, totalPages: 7 })
  vi.mocked(fetchProviderMedia).mockReset().mockResolvedValue([])
  vi.mocked(reviewShiftRegistrations).mockReset()
  vi.mocked(cancelWorkShift).mockReset()
  await setAppLanguage('en', false)
})

describe('Center Manager work shifts', () => {
  it('shows numbers for the whole filter, readable types and the pending badge', async () => {
    vi.mocked(fetchWorkShifts).mockResolvedValue(
      page([shift(), shift({ id: 'old', shiftType: 'DAY', pendingCount: 0 })])
    )
    renderAt()

    expect(await screen.findByText('75%')).toBeInTheDocument()
    expect(screen.getByText('15 of 20 places filled')).toBeInTheDocument()
    expect(screen.getAllByText('Morning').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Other').length).toBeGreaterThan(0)
    expect(screen.queryByText('DAY')).not.toBeInTheDocument()
    expect(screen.getAllByText('2 to review').length).toBeGreaterThan(0)
    expect(screen.queryByText(/current page/i)).not.toBeInTheDocument()
    // The default list starts today and sends every filter to the backend.
    expect(fetchWorkShifts).toHaveBeenCalledWith(
      expect.objectContaining({ centerId: 'center-1', fromDate: today, size: 20 })
    )
  })

  it('filters by sign-ups to review on the server when the pending card is clicked', async () => {
    renderAt()
    const card = await screen.findByRole('button', { name: /Sign-ups to review/ })
    await waitFor(() => expect(card).toBeEnabled())
    fireEvent.click(card)
    await waitFor(() => expect(fetchWorkShifts).toHaveBeenLastCalledWith(expect.objectContaining({ hasPending: true })))
  })

  it('shows understaffed shifts of the next 7 days when that card is clicked', async () => {
    renderAt()
    const card = await screen.findByRole('button', { name: /Understaffed shifts/ })
    expect(await screen.findByText('4 places still unfilled in the next 7 days — click to see')).toBeInTheDocument()
    await waitFor(() => expect(card).toBeEnabled())
    fireEvent.click(card)
    await waitFor(() =>
      expect(fetchWorkShifts).toHaveBeenLastCalledWith(
        expect.objectContaining({ fromDate: today, toDate: addDays(today, 6), hasVacancy: true })
      )
    )
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })

  it('validates the form like the backend and opens sign-up with the chosen type', async () => {
    vi.mocked(createWorkShift).mockResolvedValue(shift({ id: 'new' }))
    renderAt()
    fireEvent.click(await screen.findByRole('button', { name: 'New shift' }))
    const dialog = await screen.findByRole('dialog', { name: 'New work shift' })

    fireEvent.click(within(dialog).getByRole('button', { name: 'Afternoon' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Increase' }))
    fireEvent.change(within(dialog).getByLabelText('Note for caregivers'), { target: { value: 'x'.repeat(501) } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Open sign-up now' }))
    expect(await within(dialog).findByText('The note can be 500 characters at most')).toBeInTheDocument()
    expect(createWorkShift).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText('Note for caregivers'), { target: { value: '  Mang đồ bảo hộ ' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Open sign-up now' }))
    await waitFor(() => expect(createWorkShift).toHaveBeenCalledTimes(1))
    expect(vi.mocked(createWorkShift).mock.calls[0]).toEqual([
      'center-1',
      expect.objectContaining({
        workDate: addDays(today, 1),
        shiftType: 'AFTERNOON',
        startTime: '13:00',
        endTime: '17:00',
        shiftStatus: 'OPEN',
        capacity: 3,
        note: 'Mang đồ bảo hộ'
      })
    ])
  })

  it('asks before throwing away unsaved changes', async () => {
    renderAt()
    fireEvent.click(await screen.findByRole('button', { name: 'New shift' }))
    const dialog = await screen.findByRole('dialog', { name: 'New work shift' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Evening' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(await screen.findByRole('dialog', { name: 'Discard your changes?' })).toBeInTheDocument()
  })

  it('opens the detail route as a dialog and approves several sign-ups at once', async () => {
    vi.mocked(fetchShiftRegistrations).mockResolvedValue({
      items: [
        {
          id: 'r1',
          workShiftId: 'shift-1',
          caregiverId: 'c1',
          caregiverName: 'Lan',
          registrationStatus: 'PENDING',
          version: 0,
          createdAt: '2026-11-02T01:00:00Z'
        },
        {
          id: 'r2',
          workShiftId: 'shift-1',
          caregiverId: 'c2',
          caregiverName: 'Minh',
          registrationStatus: 'PENDING',
          version: 1,
          createdAt: '2026-11-02T02:00:00Z'
        },
        {
          id: 'r3',
          workShiftId: 'shift-1',
          caregiverId: 'c3',
          caregiverName: 'Hoa',
          registrationStatus: 'APPROVED',
          version: 2,
          createdAt: '2026-11-01T02:00:00Z',
          reviewedAt: '2026-11-01T03:00:00Z'
        }
      ],
      page: 0,
      size: 100,
      totalElements: 3,
      totalPages: 1
    })
    vi.mocked(reviewShiftRegistrations).mockResolvedValue([])
    renderAt('/center-manager/work-shifts/shift-1')

    const dialog = await screen.findByRole('dialog', { name: /Shift on/ })
    expect(await within(dialog).findByText('Lan')).toBeInTheDocument()
    expect(within(dialog).getByText('Hoa approved')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByLabelText('Select all'))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Approve 2' }))
    await waitFor(() =>
      expect(reviewShiftRegistrations).toHaveBeenCalledWith('shift-1', {
        status: 'APPROVED',
        reason: undefined,
        items: [
          { registrationId: 'r1', version: 0 },
          { registrationId: 'r2', version: 1 }
        ]
      })
    )
  })

  it('requires a reason to cancel a shift', async () => {
    vi.mocked(fetchShiftRegistrations).mockResolvedValue({
      items: [],
      page: 0,
      size: 100,
      totalElements: 0,
      totalPages: 0
    })
    vi.mocked(cancelWorkShift).mockResolvedValue(shift({ shiftStatus: 'CANCELLED' }))
    renderAt('/center-manager/work-shifts/shift-1')
    const detail = await screen.findByRole('dialog', { name: /Shift on/ })
    fireEvent.click(await within(detail).findByRole('button', { name: 'Cancel shift' }))

    const dialog = await screen.findByRole('dialog', { name: /Cancel the shift on/ })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel shift' }))
    expect(await within(dialog).findByText('Enter a reason (500 characters at most)')).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: 'Nghỉ lễ' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel shift' }))
    await waitFor(() => expect(cancelWorkShift).toHaveBeenCalledWith('shift-1', { reason: 'Nghỉ lễ', version: 4 }))
  })
})
