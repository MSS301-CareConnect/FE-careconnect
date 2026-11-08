import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminIncidentsPage } from './admin-incidents-page'
import { fetchIncidents, requeueIncident, skipIncident } from './incidents-api'
import { fetchCenter } from '~/entities/provider/provider-api'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenter: vi.fn()
}))

vi.mock('./incidents-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./incidents-api')>()),
  fetchIncidents: vi.fn(),
  requeueIncident: vi.fn(),
  skipIncident: vi.fn()
}))

function renderPage(path = '/admin/incidents') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AdminIncidentsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const failed = {
  id: 'ob-1',
  eventType: 'REFUND',
  subjectId: 'bk-1',
  status: 'FAILED' as const,
  attempts: 10,
  lastError: 'FeignException: 503'
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
})

describe('AdminIncidentsPage (H-08)', () => {
  it('lists failed BookingService deliveries and requeues one', async () => {
    vi.mocked(fetchIncidents).mockResolvedValue([failed])
    vi.mocked(requeueIncident).mockResolvedValue({} as never)
    renderPage()

    expect(await screen.findByText('Hoàn tiền cho khách')).toBeInTheDocument()
    // The raw error stays behind a disclosure and no UUID is printed.
    expect(screen.getByText('Chi tiết kỹ thuật')).toBeInTheDocument()
    expect(screen.queryByText('bk-1')).not.toBeInTheDocument()
    expect(fetchIncidents).toHaveBeenCalledWith('booking', 'FAILED')
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lại' }))
    await waitFor(() => expect(requeueIncident).toHaveBeenCalledWith('booking', 'ob-1'))
  })

  it('skips a ProviderService event only with a note', async () => {
    vi.mocked(fetchIncidents).mockResolvedValue([{ ...failed, eventType: 'SUSPEND', subjectId: 'ct-1' }])
    vi.mocked(skipIncident).mockResolvedValue({} as never)
    vi.mocked(fetchCenter).mockResolvedValue({ centerName: 'Trung tâm An Bình' } as never)
    renderPage('/admin/incidents?source=provider&status=FAILED')
    expect(await screen.findByText('Trung tâm An Bình')).toBeInTheDocument()

    const skipButton = await screen.findByRole('button', { name: 'Đã xử lý tay' })
    expect(fetchIncidents).toHaveBeenCalledWith('provider', 'FAILED')
    expect(skipButton).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Ghi chú xử lý tay'), { target: { value: 'Đã khóa tài khoản' } })
    fireEvent.click(skipButton)
    await waitFor(() => expect(skipIncident).toHaveBeenCalledWith('provider', 'ob-1', 'Đã khóa tài khoản'))
  })

  it('shows an empty state when nothing failed', async () => {
    vi.mocked(fetchIncidents).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('Không có sự cố nào ở trạng thái này.')).toBeInTheDocument()
  })
})
