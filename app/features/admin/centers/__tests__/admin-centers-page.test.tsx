import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { changeCenterStatus, fetchCenter, fetchCenters, saveCenter } from '~/entities/provider/provider-api'
import { fetchProviderStatistics } from '~/entities/statistics/statistics-api'
import { listManagedUsers } from '~/shared/api/generated/api/account/account'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminCentersPage } from '../admin-centers-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenters: vi.fn(),
  fetchCenter: vi.fn(),
  changeCenterStatus: vi.fn(),
  saveCenter: vi.fn()
}))
vi.mock('~/entities/statistics/statistics-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/statistics/statistics-api')>()),
  fetchProviderStatistics: vi.fn().mockRejectedValue(new Error('offline'))
}))
vi.mock('~/shared/api/generated/api/account/account', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/shared/api/generated/api/account/account')>()),
  listManagedUsers: vi.fn()
}))

const accounts = [
  {
    id: 'mgr-1',
    fullName: 'Lan Tran',
    email: 'lan@example.com',
    status: 'ACTIVE',
    roles: ['CENTER_MANAGER'],
    centerId: 'center-1'
  },
  // H-12: a manager provisioned for another center is not offered for this one.
  {
    id: 'mgr-3',
    fullName: 'Other Center Manager',
    email: 'other@example.com',
    status: 'ACTIVE',
    roles: ['CENTER_MANAGER'],
    centerId: 'center-9'
  },
  { id: 'mgr-2', fullName: 'Locked Manager', email: 'locked@example.com', status: 'LOCKED', roles: ['CENTER_MANAGER'] },
  { id: 'cus-1', fullName: 'A Customer', email: 'customer@example.com', status: 'ACTIVE', roles: ['CUSTOMER'] }
] as const

const center: ProviderCenterRecord = {
  id: 'center-1',
  centerName: 'Care One',
  centerStatus: 'PENDING',
  address: 'Main Street',
  email: 'center@example.com',
  version: 2
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminCentersPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchCenters).mockReset()
  vi.mocked(fetchCenter).mockReset()
  vi.mocked(changeCenterStatus).mockReset()
  vi.mocked(saveCenter).mockReset()
  vi.mocked(listManagedUsers)
    .mockReset()
    .mockResolvedValue({
      status: 200,
      headers: new Headers(),
      data: {
        code: 200,
        message: 'OK',
        result: { content: [...accounts], page: 0, size: 100, totalElements: accounts.length, totalPages: 1 }
      }
    } as unknown as Awaited<ReturnType<typeof listManagedUsers>>)
  await setAppLanguage('en', false)
})

describe('Admin provider centers', () => {
  it('shows platform-wide status counts instead of counting the current page (M-15)', async () => {
    vi.mocked(fetchCenters).mockResolvedValue({ items: [center], page: 0, size: 20, totalElements: 1, totalPages: 1 })
    vi.mocked(fetchProviderStatistics).mockResolvedValueOnce({
      centersByStatus: { PENDING: 7, ACTIVE: 12, SUSPENDED: 3 }
    })
    renderPage()

    expect(await screen.findByText('12')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getAllByText('Across the platform')).toHaveLength(3)
  })

  it('loads centers, opens the real detail, and sends its version when updating status', async () => {
    vi.mocked(fetchCenters).mockResolvedValue({ items: [center], page: 0, size: 20, totalElements: 1, totalPages: 1 })
    vi.mocked(fetchCenter).mockResolvedValue(center)
    vi.mocked(changeCenterStatus).mockResolvedValue({ ...center, centerStatus: 'ACTIVE', version: 3 })
    renderPage()

    expect(await screen.findByText('Care One')).toBeInTheDocument()
    expect(fetchCenters).toHaveBeenCalledWith({ page: 0, size: 20, status: undefined, keyword: undefined })
    fireEvent.click(screen.getByRole('button', { name: 'Center details' }))
    expect(await screen.findByText('center@example.com')).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: 'Update status' }))
    await waitFor(() =>
      expect(changeCenterStatus).toHaveBeenCalledWith('center-1', { status: 'ACTIVE', reason: undefined, version: 2 })
    )
  })

  it('shows a retry state when the center list fails', async () => {
    vi.mocked(fetchCenters)
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValueOnce({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
    renderPage()
    expect(await screen.findByText('Unable to load centers.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('No matching centers found.')).toBeInTheDocument()
  })

  it('explains that a center needs an active manager instead of a generic failure', async () => {
    vi.mocked(fetchCenters).mockResolvedValue({ items: [center], page: 0, size: 20, totalElements: 1, totalPages: 1 })
    vi.mocked(fetchCenter).mockResolvedValue(center)
    vi.mocked(changeCenterStatus).mockRejectedValue(
      Object.assign(new Error('Conflict'), { status: 409, info: { code: 4120, message: 'Trung tâm phải có manager' } })
    )
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Center details' }))
    expect(await screen.findByText('A center needs a manager before it can be activated.')).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: 'Update status' }))
    expect(
      await screen.findByText(/This center cannot be activated yet because it has no active manager\./)
    ).toHaveAttribute('role', 'alert')
  })

  it('assigns a manager from active center manager accounts by name and email', async () => {
    vi.mocked(fetchCenters).mockResolvedValue({ items: [center], page: 0, size: 20, totalElements: 1, totalPages: 1 })
    vi.mocked(fetchCenter).mockResolvedValue(center)
    vi.mocked(saveCenter).mockResolvedValue({ ...center, managerUserId: 'mgr-1', version: 3 })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Center details' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Choose a manager' }))
    const picker = screen.getByRole('combobox', { name: 'Center manager' })
    await waitFor(() => expect(picker).toBeEnabled())
    expect(
      within(picker)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['No manager selected', 'Lan Tran · lan@example.com'])
    expect(screen.queryByRole('textbox', { name: /manager/i })).not.toBeInTheDocument()

    fireEvent.change(picker, { target: { value: 'mgr-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(saveCenter).toHaveBeenCalledWith(
        'center-1',
        expect.objectContaining({ managerUserId: 'mgr-1', version: 2 })
      )
    )
    expect(listManagedUsers).toHaveBeenCalledWith({ page: 0, size: 100 }, { credentials: 'include' })
  })
})
