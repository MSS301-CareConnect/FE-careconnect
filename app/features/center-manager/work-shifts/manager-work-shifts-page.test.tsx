import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getManagedUser } from '~/shared/api/generated/api/account/account'
import {
  createWorkShift,
  fetchCaregiver,
  fetchProviderMedia,
  fetchShiftRegistrations,
  fetchWorkShift,
  fetchWorkShifts,
  reviewShiftRegistration
} from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { ManagerWorkShiftDetailPage, ManagerWorkShiftsPage } from './manager-work-shifts-page'

vi.mock('~/shared/api/generated/api/account/account', () => ({ getManagedUser: vi.fn() }))

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchWorkShifts: vi.fn(),
  createWorkShift: vi.fn(),
  fetchWorkShift: vi.fn(),
  fetchShiftRegistrations: vi.fn(),
  fetchCaregiver: vi.fn(),
  fetchProviderMedia: vi.fn(),
  reviewShiftRegistration: vi.fn()
}))

const day = 24 * 60 * 60 * 1000
const isoDate = (offsetDays: number) => {
  const date = new Date(Date.now() + offsetDays * day)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const future = isoDate(5)
const past = isoDate(-2)

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={{ centerId: 'center-1', roles: ['CENTER_MANAGER'] }}>
        <MemoryRouter>
          <ManagerWorkShiftsPage />
        </MemoryRouter>
      </AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

function renderDetailPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={{ centerId: 'center-1', roles: ['CENTER_MANAGER'] }}>
        <MemoryRouter initialEntries={['/center-manager/work-shifts/shift-1']}>
          <Routes>
            <Route path='/center-manager/work-shifts/:id' element={<ManagerWorkShiftDetailPage />} />
            <Route path='/center-manager/caregivers/:id' element={<div data-testid='caregiver-detail' />} />
          </Routes>
        </MemoryRouter>
      </AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchWorkShifts).mockReset()
  vi.mocked(createWorkShift).mockReset()
  vi.mocked(fetchWorkShift).mockReset()
  vi.mocked(fetchShiftRegistrations).mockReset()
  vi.mocked(fetchCaregiver).mockReset()
  vi.mocked(fetchProviderMedia).mockReset()
  vi.mocked(reviewShiftRegistration).mockReset()
  vi.mocked(getManagedUser).mockReset()
  await setAppLanguage('en', false)
})

describe('Center Manager work shifts', () => {
  it('shows caregiver details across the registration card and reviews without a reason field', async () => {
    vi.mocked(fetchWorkShift).mockResolvedValue({
      id: 'shift-1',
      centerId: 'center-1',
      workDate: future,
      startTime: '08:00:00',
      endTime: '17:00:00',
      shiftType: 'DAILY',
      shiftStatus: 'CLOSED',
      capacity: 1,
      version: 1
    })
    vi.mocked(fetchShiftRegistrations).mockResolvedValue({
      items: [
        {
          id: 'registration-1',
          workShiftId: 'shift-1',
          caregiverId: 'caregiver-1',
          caregiverName: 'Quân',
          registrationStatus: 'PENDING',
          version: 2
        }
      ],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(fetchCaregiver).mockResolvedValue({
      id: 'caregiver-1',
      userId: 'user-1',
      centerId: 'center-1',
      fullName: 'Quân',
      gender: 'MALE',
      dateOfBirth: '1996-08-01',
      experienceYears: 4,
      bio: 'Experienced home caregiver',
      verificationStatus: 'VERIFIED',
      caregiverStatus: 'ACTIVE',
      version: 1
    })
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    vi.mocked(getManagedUser).mockResolvedValue({
      data: {
        code: 200,
        message: 'OK',
        result: { id: 'user-1', centerId: 'center-1', email: 'quan@example.com' }
      },
      status: 200,
      headers: new Headers()
    })
    vi.mocked(reviewShiftRegistration).mockResolvedValue({
      id: 'registration-1',
      workShiftId: 'shift-1',
      caregiverId: 'caregiver-1',
      registrationStatus: 'REJECTED',
      version: 3
    })

    renderDetailPage()

    expect(await screen.findByRole('link', { name: 'View details for Quân' })).toHaveAttribute(
      'href',
      '/center-manager/caregivers/caregiver-1'
    )
    expect(screen.queryByText('Experienced home caregiver')).not.toBeInTheDocument()
    expect(screen.getByText('4 years')).toBeInTheDocument()
    expect(await screen.findByText('quan@example.com')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'quan@example.com' })).not.toBeInTheDocument()
    expect(screen.queryByText('View details for Quân')).not.toBeInTheDocument()
    expect(getManagedUser).toHaveBeenCalledWith('user-1', { credentials: 'include' })
    expect(screen.queryByRole('textbox', { name: 'Reason' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
    await waitFor(() =>
      expect(reviewShiftRegistration).toHaveBeenCalledWith('registration-1', {
        version: 2,
        status: 'REJECTED'
      })
    )
    fireEvent.click(screen.getByRole('link', { name: 'View details for Quân' }))
    expect(screen.getByTestId('caregiver-detail')).toBeInTheDocument()
  })

  it('shows live shifts in the management table and filters the loaded page', async () => {
    vi.mocked(fetchWorkShifts).mockResolvedValue({
      items: [
        {
          id: 'morning',
          centerId: 'center-1',
          workDate: '2026-11-01',
          startTime: '08:00:00',
          endTime: '12:00:00',
          shiftType: 'Morning',
          shiftStatus: 'OPEN',
          capacity: 2,
          version: 1
        },
        {
          id: 'evening',
          centerId: 'center-1',
          workDate: '2026-11-02',
          startTime: '17:00:00',
          endTime: '21:00:00',
          shiftType: 'Evening',
          shiftStatus: 'DRAFT',
          capacity: 3,
          version: 1
        }
      ],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1
    })
    renderPage()
    expect(await screen.findByRole('link', { name: 'Nov 1, 2026' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Work shift overview' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Evening' } })
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.queryByRole('link', { name: 'Nov 1, 2026' })).not.toBeInTheDocument()
  })

  it('loads the assigned center and creates a shift with contract fields', async () => {
    vi.mocked(fetchWorkShifts).mockResolvedValue({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
    vi.mocked(createWorkShift).mockResolvedValue({
      id: 'shift-1',
      centerId: 'center-1',
      workDate: future,
      startTime: '08:00:00',
      endTime: '12:00:00',
      shiftType: 'WEEKLY',
      shiftStatus: 'DRAFT',
      capacity: 2,
      version: 1
    })
    renderPage()

    expect(await screen.findByText('No work shifts yet.')).toBeInTheDocument()
    expect(fetchWorkShifts).toHaveBeenCalledWith({ centerId: 'center-1', page: 0, size: 20 })
    fireEvent.click(screen.getByRole('button', { name: 'Create work shift' }))
    fireEvent.change(screen.getByLabelText('Work date'), { target: { value: future } })
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } })
    fireEvent.change(screen.getByLabelText('Shift type'), { target: { value: 'WEEKLY' } })
    fireEvent.change(screen.getByLabelText('Caregivers who can register'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(createWorkShift).toHaveBeenCalledWith(
        'center-1',
        expect.objectContaining({
          workDate: future,
          startTime: '08:00',
          endTime: '12:00',
          shiftType: 'WEEKLY',
          capacity: 2,
          shiftStatus: 'DRAFT'
        })
      )
    )
  })

  it('explains a rejected shift creation without exposing the backend error code', async () => {
    vi.mocked(fetchWorkShifts).mockResolvedValue({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
    vi.mocked(createWorkShift).mockRejectedValue({ status: 403, info: { code: 3403 } })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Create work shift' }))
    fireEvent.change(screen.getByLabelText('Work date'), { target: { value: future } })
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } })
    fireEvent.change(screen.getByLabelText('Shift type'), { target: { value: 'WEEKLY' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('You cannot create or edit work shifts for this center.')
    expect(screen.getByRole('alert')).not.toHaveTextContent('3403')
  })

  it('blocks a registration deadline after the shift starts', async () => {
    vi.mocked(fetchWorkShifts).mockResolvedValue({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
    vi.mocked(createWorkShift).mockResolvedValue({
      id: 'shift-1',
      centerId: 'center-1',
      workDate: future,
      startTime: '07:00:00',
      endTime: '18:00:00',
      shiftType: 'WEEKLY',
      shiftStatus: 'DRAFT',
      capacity: 1,
      version: 1
    })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Create work shift' }))
    fireEvent.change(screen.getByLabelText('Work date'), { target: { value: future } })
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '07:00' } })
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '18:00' } })
    fireEvent.change(screen.getByLabelText('Shift type'), { target: { value: 'WEEKLY' } })
    fireEvent.change(screen.getByLabelText('Registration deadline'), { target: { value: `${isoDate(7)}T00:00` } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The registration deadline must be before the work shift starts.'
    )
    expect(screen.getByLabelText('Registration deadline')).toHaveAttribute('aria-invalid', 'true')
    expect(createWorkShift).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Registration deadline'), { target: { value: `${future}T06:00` } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(createWorkShift).toHaveBeenCalledOnce())
  })

  it('does not create a shift that would already have started', async () => {
    vi.mocked(fetchWorkShifts).mockResolvedValue({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Create work shift' }))
    expect(screen.getByLabelText('Work date')).toHaveAttribute('min', isoDate(0))
    // Today passes the date picker's minimum, but midnight has already gone by.
    fireEvent.change(screen.getByLabelText('Work date'), { target: { value: isoDate(0) } })
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '00:00' } })
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } })
    fireEvent.change(screen.getByLabelText('Shift type'), { target: { value: 'WEEKLY' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('alert')).toHaveTextContent('The work shift must start after the current time.')
    expect(screen.getByLabelText('Work date')).toHaveAttribute('aria-invalid', 'true')
    expect(createWorkShift).not.toHaveBeenCalled()
  })

  it('flags an open shift whose time has passed', async () => {
    vi.mocked(fetchWorkShifts).mockResolvedValue({
      items: [
        {
          id: 'shift-old',
          centerId: 'center-1',
          workDate: past,
          startTime: '08:00:00',
          endTime: '12:00:00',
          shiftType: 'Morning',
          shiftStatus: 'OPEN',
          capacity: 2,
          version: 1
        }
      ],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    renderPage()
    expect(await screen.findByText('Past')).toBeInTheDocument()
  })
})
