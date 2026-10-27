import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'
import { fetchCenterStatistics, fetchProviderStatistics, fetchSystemStatistics } from './statistics-api'
import { OperationalStatisticsPanel, ProviderStatusPanel } from './statistics-panels'

vi.mock('./statistics-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./statistics-api')>()),
  fetchCenterStatistics: vi.fn(),
  fetchSystemStatistics: vi.fn(),
  fetchProviderStatistics: vi.fn()
}))

function renderPanel(panel: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {panel}
    </QueryClientProvider>
  )
}

describe('Live statistics panels', () => {
  beforeEach(async () => {
    vi.mocked(fetchCenterStatistics).mockReset()
    vi.mocked(fetchSystemStatistics).mockReset()
    vi.mocked(fetchProviderStatistics).mockReset()
    await setAppLanguage('en', false)
  })

  it('loads center operations and displays counts from the response', async () => {
    vi.mocked(fetchCenterStatistics).mockResolvedValue({
      bookingsByStatus: { CONFIRMED: 3, COMPLETED: 2 },
      occurrences: { completed: 3, cancelled: 1, missed: 0, customerNoShow: 0 },
      avgRating: 4.5,
      complaints: { open: 2 }
    })
    renderPanel(<OperationalStatisticsPanel scope='center' />)
    expect(await screen.findByText('5')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(fetchCenterStatistics).toHaveBeenCalledOnce()
    expect(fetchSystemStatistics).not.toHaveBeenCalled()
  })

  it('loads system operations and provider status counts for admin', async () => {
    vi.mocked(fetchSystemStatistics).mockResolvedValue({ bookingsByStatus: { CONFIRMED: 8 }, occurrences: {} })
    vi.mocked(fetchProviderStatistics).mockResolvedValue({
      centersByStatus: { ACTIVE: 4, PENDING: 1 },
      caregiversByStatus: { ACTIVE: 12 },
      caregiversByVerification: { VERIFIED: 10, PENDING: 2 }
    })
    renderPanel(
      <>
        <OperationalStatisticsPanel scope='system' />
        <ProviderStatusPanel />
      </>
    )
    await waitFor(() => expect(screen.getByText('12')).toBeInTheDocument())
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(fetchSystemStatistics).toHaveBeenCalledOnce()
    expect(fetchProviderStatistics).toHaveBeenCalledOnce()
  })

  it('shows a retry action when the API fails', async () => {
    vi.mocked(fetchCenterStatistics).mockRejectedValue(new Error('Unavailable'))
    renderPanel(<OperationalStatisticsPanel scope='center' />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load statistics')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
