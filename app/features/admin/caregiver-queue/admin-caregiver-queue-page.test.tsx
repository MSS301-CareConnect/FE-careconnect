import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchPendingCaregivers, verifyCaregiver } from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminCaregiverQueuePage } from './admin-caregiver-queue-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPendingCaregivers: vi.fn(),
  verifyCaregiver: vi.fn()
}))

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
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

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
})

describe('AdminCaregiverQueuePage (M-13)', () => {
  it('approves a pending caregiver with its version', async () => {
    vi.mocked(fetchPendingCaregivers).mockResolvedValue({
      items: [caregiver],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(verifyCaregiver).mockResolvedValue({ ...caregiver, verificationStatus: 'VERIFIED' } as never)
    renderPage()

    expect(await screen.findByText('Trần Mai')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Duyệt' }))
    await waitFor(() => expect(verifyCaregiver).toHaveBeenCalledWith('cg-1', { status: 'VERIFIED', version: 4 }))
  })

  it('requires a reason to reject', async () => {
    vi.mocked(fetchPendingCaregivers).mockResolvedValue({
      items: [caregiver],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(verifyCaregiver).mockResolvedValue({ ...caregiver, verificationStatus: 'REJECTED' } as never)
    renderPage()

    const reject = await screen.findByRole('button', { name: 'Từ chối' })
    expect(reject).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Lý do từ chối'), { target: { value: 'Chứng chỉ hết hạn' } })
    fireEvent.click(reject)
    await waitFor(() =>
      expect(verifyCaregiver).toHaveBeenCalledWith('cg-1', {
        status: 'REJECTED',
        reason: 'Chứng chỉ hết hạn',
        version: 4
      })
    )
  })

  it('shows an empty queue', async () => {
    vi.mocked(fetchPendingCaregivers).mockResolvedValue({
      items: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0
    })
    renderPage()
    expect(await screen.findByText('Không có hồ sơ nào chờ xác minh.')).toBeInTheDocument()
  })
})
