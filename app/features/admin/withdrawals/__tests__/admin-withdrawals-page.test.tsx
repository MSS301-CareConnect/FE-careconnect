import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchAccount } from '~/entities/identity/account-api'
import {
  approveWithdrawal,
  completeWithdrawal,
  fetchWallet,
  fetchWalletTransactions,
  fetchWithdrawals,
  rejectWithdrawal
} from '~/entities/wallet/wallet-api'
import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminWithdrawalsPage } from '../admin-withdrawals-page'

vi.mock('~/entities/wallet/wallet-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/wallet/wallet-api')>()),
  fetchWithdrawals: vi.fn(),
  fetchWallet: vi.fn(),
  fetchWalletTransactions: vi.fn(),
  approveWithdrawal: vi.fn(),
  rejectWithdrawal: vi.fn(),
  completeWithdrawal: vi.fn()
}))
vi.mock('~/entities/identity/account-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/identity/account-api')>()),
  fetchAccount: vi.fn()
}))

const pending: WalletWithdrawalRecord = {
  id: 'd1',
  walletId: 'w1',
  requesterUserId: 'u1',
  ownerType: 'CAREGIVER',
  amount: 90000,
  bankName: 'Vietcombank',
  bankAccountNumber: '0123456789',
  accountHolderName: 'TRAN THI B',
  status: 'PENDING',
  createdAt: '2026-11-09T03:00:00Z'
}
const page = (items: WalletWithdrawalRecord[]) => ({
  items,
  page: 0,
  size: 10,
  totalElements: items.length,
  totalPages: 1
})

function renderPage(path = '/admin/withdrawals') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AdminWithdrawalsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchWithdrawals).mockResolvedValue(page([pending]))
  vi.mocked(fetchAccount).mockResolvedValue({ id: 'u1', fullName: 'Trần Thị B' } as Awaited<
    ReturnType<typeof fetchAccount>
  >)
  vi.mocked(fetchWallet).mockResolvedValue({
    id: 'w1',
    ownerType: 'CAREGIVER',
    ownerId: 'u1',
    availableBalance: 0,
    heldBalance: 90000,
    withdrawable: false
  })
  vi.mocked(fetchWalletTransactions).mockResolvedValue({
    items: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })
})

describe('AdminWithdrawalsPage', () => {
  it('names the requester, never the id, and approves a pending request', async () => {
    vi.mocked(approveWithdrawal).mockResolvedValue({ ...pending, status: 'APPROVED' })
    renderPage()

    const row = (await screen.findAllByText('Trần Thị B'))[0].closest('tr')!
    expect(within(row).getByText('•••• 6789', { exact: false })).toBeInTheDocument()
    expect(screen.queryByText('u1')).not.toBeInTheDocument()
    fireEvent.click(within(row).getByRole('button', { name: 'Xem' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('0123456789')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Duyệt' }))
    await waitFor(() => expect(approveWithdrawal).toHaveBeenCalledWith('d1'))
  })

  it('requires a reason to reject and a bank reference to confirm the transfer', async () => {
    vi.mocked(fetchWithdrawals).mockResolvedValue(page([{ ...pending, status: 'APPROVED' }]))
    vi.mocked(completeWithdrawal).mockResolvedValue({ ...pending, status: 'COMPLETED' })
    vi.mocked(rejectWithdrawal).mockResolvedValue({ ...pending, status: 'REJECTED' })
    renderPage('/admin/withdrawals?withdrawal=d1')

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận đã chuyển khoản' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận đã chuyển khoản' }))
    expect(await within(dialog).findByText('Nhập mã giao dịch ngân hàng.')).toBeInTheDocument()
    expect(completeWithdrawal).not.toHaveBeenCalled()
    fireEvent.change(within(dialog).getByLabelText('Mã giao dịch ngân hàng'), { target: { value: 'FT123' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận đã chuyển khoản' }))
    await waitFor(() => expect(completeWithdrawal).toHaveBeenCalledWith('d1', 'FT123'))
  })

  it('rejects with the typed reason', async () => {
    vi.mocked(rejectWithdrawal).mockResolvedValue({ ...pending, status: 'REJECTED' })
    renderPage('/admin/withdrawals?withdrawal=d1')

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    expect(await within(dialog).findByText('Nhập lý do từ chối.')).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Lý do từ chối'), { target: { value: 'Sai tên chủ tài khoản' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    await waitFor(() => expect(rejectWithdrawal).toHaveBeenCalledWith('d1', 'Sai tên chủ tài khoản'))
  })
})
