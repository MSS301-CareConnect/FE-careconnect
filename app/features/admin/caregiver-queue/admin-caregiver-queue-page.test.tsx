import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCaregiverDirectory, fetchCenters, verifyCaregiver } from '~/entities/provider/provider-api'
import { fetchProviderStatistics } from '~/entities/statistics/statistics-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminCaregiverQueuePage } from './admin-caregiver-queue-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiverDirectory: vi.fn(),
  fetchCenters: vi.fn(),
  fetchProviderMedia: vi.fn().mockResolvedValue([]),
  verifyCaregiver: vi.fn()
}))
vi.mock('~/entities/statistics/statistics-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/statistics/statistics-api')>()),
  fetchProviderStatistics: vi.fn()
}))

function renderPage(path = '/admin/caregivers') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AdminCaregiverQueuePage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const caregiver = {
  id: 'cg-1',
  centerId: 'ct-1',
  centerName: 'Trung tâm An Bình',
  fullName: 'Trần Mai',
  experienceYears: 3,
  verificationStatus: 'PENDING' as const,
  caregiverStatus: 'INACTIVE' as const,
  version: 4
}
const other = { ...caregiver, id: 'cg-2', centerId: 'ct-2', centerName: 'Trung tâm Bình An', fullName: 'Lê Hoa' }

function page(items: (typeof caregiver)[]) {
  return { items, page: 0, size: 10, totalElements: items.length, totalPages: items.length ? 1 : 0 }
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchCenters).mockResolvedValue({ items: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
  vi.mocked(fetchProviderStatistics).mockResolvedValue({ caregiversByVerification: { PENDING: 2, VERIFIED: 5 } })
})

describe('AdminCaregiverQueuePage (caregivers by center)', () => {
  it('lists caregivers under their center and filters on the server', async () => {
    vi.mocked(fetchCaregiverDirectory).mockResolvedValue(page([caregiver, other]))
    renderPage()

    const first = (await screen.findByRole('heading', { level: 2, name: 'Trung tâm An Bình' })).closest('section')!
    expect(within(first).getByText('Trần Mai')).toBeInTheDocument()
    expect(within(first).queryByText('Lê Hoa')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Trung tâm Bình An' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Hồ sơ chờ duyệt/ }))
    await waitFor(() =>
      expect(fetchCaregiverDirectory).toHaveBeenLastCalledWith(
        expect.objectContaining({ verification: 'PENDING', page: 0, size: 10 })
      )
    )
  })

  it('approves a pending caregiver with its version', async () => {
    vi.mocked(fetchCaregiverDirectory).mockResolvedValue(page([caregiver]))
    vi.mocked(verifyCaregiver).mockResolvedValue({ ...caregiver, verificationStatus: 'VERIFIED' } as never)
    renderPage()

    expect(await screen.findByText('Trần Mai')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Duyệt' }))
    await waitFor(() => expect(verifyCaregiver).toHaveBeenCalledWith('cg-1', { status: 'VERIFIED', version: 4 }))
  })

  it('requires a reason to reject', async () => {
    vi.mocked(fetchCaregiverDirectory).mockResolvedValue(page([caregiver]))
    vi.mocked(verifyCaregiver).mockResolvedValue({ ...caregiver, verificationStatus: 'REJECTED' } as never)
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }))
    const dialog = await screen.findByRole('dialog')
    const confirm = within(dialog).getByRole('button', { name: 'Từ chối' })
    expect(confirm).toBeDisabled()
    fireEvent.change(within(dialog).getByLabelText(/Lý do từ chối/), { target: { value: 'Chứng chỉ hết hạn' } })
    fireEvent.click(confirm)
    await waitFor(() =>
      expect(verifyCaregiver).toHaveBeenCalledWith('cg-1', {
        status: 'REJECTED',
        reason: 'Chứng chỉ hết hạn',
        version: 4
      })
    )
  })

  it('shows an empty verification queue', async () => {
    vi.mocked(fetchCaregiverDirectory).mockResolvedValue(page([]))
    renderPage('/admin/caregivers?verification=PENDING')
    expect(await screen.findByText('Không có hồ sơ nào chờ xác minh.')).toBeInTheDocument()
  })
})
