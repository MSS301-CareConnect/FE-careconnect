import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchRevenue } from '~/entities/payment/payment-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CenterRevenuePanel } from '../components/center-revenue-panel'

vi.mock('~/entities/payment/payment-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/payment/payment-api')>()),
  fetchRevenue: vi.fn()
}))

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <CenterRevenuePanel />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchRevenue).mockResolvedValue({
    successfulPaymentCount: 3,
    grossRevenue: 1500000,
    totalRefunded: 300000,
    totalRevenue: 1200000,
    averagePayment: 400000
  })
})

describe('CenterRevenuePanel (spec §9.3)', () => {
  it('shows the net revenue of the center for this month and switches the period', async () => {
    renderPanel()

    expect(await screen.findByText(/1\.200\.000/)).toBeInTheDocument()
    expect(screen.getByText('Doanh thu thuần')).toBeInTheDocument()
    expect(screen.getByText(/300\.000/)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    const [from, to] = vi.mocked(fetchRevenue).mock.calls[0]
    // This month: from the first day of the month (local midnight) until now; the token decides the center.
    expect(new Date(from).getDate()).toBe(1)
    expect(Date.parse(to)).toBeGreaterThan(Date.parse(from))

    fireEvent.change(screen.getByRole('combobox', { name: 'Khoảng thời gian' }), { target: { value: 'last30' } })
    await waitFor(() => expect(fetchRevenue).toHaveBeenCalledTimes(2))
    const [lastFrom, lastTo] = vi.mocked(fetchRevenue).mock.calls[1]
    expect(Math.round((Date.parse(lastTo) - Date.parse(lastFrom)) / 86_400_000)).toBe(30)
  })

  it('explains a manager account without a center', async () => {
    vi.mocked(fetchRevenue).mockRejectedValue(Object.assign(new Error('scope'), { status: 403, info: { code: 6027 } }))
    renderPanel()
    expect(await screen.findByRole('alert')).toHaveTextContent('Tài khoản quản lý chưa được gán trung tâm.')
  })
})
