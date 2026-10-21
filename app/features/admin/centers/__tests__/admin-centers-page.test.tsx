import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { changeCenterStatus, fetchCenter, fetchCenters } from '~/entities/provider/provider-api'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminCentersPage } from '../admin-centers-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenters: vi.fn(),
  fetchCenter: vi.fn(),
  changeCenterStatus: vi.fn()
}))

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
  await setAppLanguage('en', false)
})

describe('Admin provider centers', () => {
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
})
