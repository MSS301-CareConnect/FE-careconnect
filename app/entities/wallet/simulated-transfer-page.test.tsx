import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { SimulatedTransferPage } from './simulated-transfer-page'
import { fetchWithdrawal, transferWithdrawal } from './wallet-api'

vi.mock('./wallet-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./wallet-api')>()),
  fetchWithdrawal: vi.fn(),
  transferWithdrawal: vi.fn()
}))

const request: WalletWithdrawalRecord = {
  id: 'd1a2b3c4-0000-0000-0000-000000000000',
  walletId: 'w1',
  requesterUserId: 'u1',
  requesterName: 'Trần Thị B',
  ownerType: 'CUSTOMER',
  centerId: 'c1',
  amount: 90000,
  bankName: 'Vietcombank',
  bankAccountNumber: '0123456789',
  accountHolderName: 'TRAN THI B',
  status: 'PENDING',
  createdAt: '2026-11-09T03:00:00Z'
}

const completed: WalletWithdrawalRecord = {
  ...request,
  status: 'COMPLETED',
  transferReference: 'SIM2611111200D1A2B3',
  completedAt: '2026-11-11T05:00:00Z'
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <SimulatedTransferPage queueHref='/center-manager/withdrawals' withdrawalId={request.id} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchWithdrawal).mockResolvedValue(request)
  vi.mocked(transferWithdrawal).mockResolvedValue(completed)
})

describe('SimulatedTransferPage', () => {
  it('shows the payee QR and pays out after the sandbox account and OTP', async () => {
    renderPage()

    expect(await screen.findByRole('img', { name: /VietQR.*Vietcombank 0123456789/ })).toBeInTheDocument()
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    expect(await screen.findByText('Chọn ngân hàng nguồn.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Điền tài khoản thử' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))

    const otp = await screen.findByLabelText('Mã OTP')
    fireEvent.change(otp, { target: { value: '111111' } })
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận chuyển 90\.000/ }))
    expect(await screen.findByText('Mã OTP không đúng.')).toBeInTheDocument()
    expect(transferWithdrawal).not.toHaveBeenCalled()

    fireEvent.change(otp, { target: { value: '123456' } })
    // The server answers later reads with the completed request.
    vi.mocked(fetchWithdrawal).mockResolvedValue(completed)
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận chuyển 90\.000/ }))
    await waitFor(() => expect(transferWithdrawal).toHaveBeenCalledWith(request.id))
    expect(await screen.findByText('Chuyển khoản thành công')).toBeInTheDocument()
    expect(screen.getByText('SIM2611111200D1A2B3')).toBeInTheDocument()
  })

  it('does not offer a transfer for a handled request', async () => {
    vi.mocked(fetchWithdrawal).mockResolvedValue({ ...request, status: 'REJECTED' })
    renderPage()

    expect(await screen.findByText('Yêu cầu này đã được xử lý, không chuyển khoản được nữa.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tiếp tục' })).not.toBeInTheDocument()
  })
})
