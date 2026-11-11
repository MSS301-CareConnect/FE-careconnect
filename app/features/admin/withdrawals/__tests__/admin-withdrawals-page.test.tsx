import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchAccount } from '~/entities/identity/account-api'
import { fetchCenter } from '~/entities/provider/provider-api'
import {
  fetchWallet,
  fetchWalletTransactions,
  fetchWithdrawals,
  fetchWithdrawalStatistics,
  rejectWithdrawal,
  transferWithdrawal
} from '~/entities/wallet/wallet-api'
import { ManagerWithdrawalsPage } from '~/features/center-manager/withdrawals/manager-withdrawals-page'
import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminWithdrawalsPage } from '../admin-withdrawals-page'

vi.mock('~/entities/wallet/wallet-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/wallet/wallet-api')>()),
  fetchWithdrawals: vi.fn(),
  fetchWithdrawalStatistics: vi.fn(),
  fetchWallet: vi.fn(),
  fetchWalletTransactions: vi.fn(),
  rejectWithdrawal: vi.fn(),
  transferWithdrawal: vi.fn()
}))
vi.mock('~/entities/identity/account-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/identity/account-api')>()),
  fetchAccount: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenter: vi.fn()
}))

// A customer withdrawal of money refunded by center c1: that center handles it (2026-11-10).
const customerRequest: WalletWithdrawalRecord = {
  id: 'd1',
  walletId: 'w1',
  requesterUserId: 'u1',
  ownerType: 'CUSTOMER',
  centerId: 'c1',
  amount: 90000,
  bankName: 'Vietcombank',
  bankAccountNumber: '0123456789',
  accountHolderName: 'TRAN THI B',
  status: 'PENDING',
  createdAt: '2026-11-09T03:00:00Z'
}
const centerRequest: WalletWithdrawalRecord = {
  ...customerRequest,
  id: 'd2',
  walletId: 'w2',
  requesterUserId: 'm1',
  ownerType: 'CENTER',
  amount: 500000
}
const page = (items: WalletWithdrawalRecord[]) => ({
  items,
  page: 0,
  size: 10,
  totalElements: items.length,
  totalPages: 1
})

function renderPage(element: React.ReactNode, path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchWithdrawals).mockResolvedValue(page([customerRequest]))
  vi.mocked(fetchWithdrawalStatistics).mockResolvedValue({
    scope: 'REVIEW',
    from: '2026-11-01T00:00:00Z',
    to: '2026-11-10T00:00:00Z',
    groupBy: 'DAY',
    pendingCount: 1,
    pendingAmount: 90000,
    requestedCount: 1,
    requestedAmount: 90000,
    completedCount: 0,
    completedAmount: 0,
    rejectedCount: 0,
    rejectedAmount: 0,
    byOwnerType: [],
    series: [],
    custodyCustomerBalance: 400000,
    custodyCaregiverBalance: 100000,
    custodyHeldBalance: 90000,
    custodyTotal: 590000
  })
  vi.mocked(fetchAccount).mockImplementation(
    async (id) =>
      ({ id, fullName: id === 'u1' ? 'Trần Thị B' : 'Quản Lý A' }) as Awaited<ReturnType<typeof fetchAccount>>
  )
  vi.mocked(fetchCenter).mockResolvedValue({ id: 'c1', centerName: 'An Tâm' } as Awaited<
    ReturnType<typeof fetchCenter>
  >)
  vi.mocked(fetchWallet).mockResolvedValue({
    id: 'w2',
    ownerType: 'CENTER',
    ownerId: 'c1',
    availableBalance: 0,
    heldBalance: 500000,
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

describe('Center withdrawal queue', () => {
  it('shows the money the center holds and transfers a customer request without a manual confirmation', async () => {
    vi.mocked(transferWithdrawal).mockResolvedValue({
      ...customerRequest,
      status: 'COMPLETED',
      transferReference: 'SIM2611101200D1'
    })
    renderPage(<ManagerWithdrawalsPage />, '/center-manager/withdrawals')

    expect(await screen.findByRole('heading', { name: 'Tiền trung tâm đang giữ hộ' })).toBeInTheDocument()
    expect(vi.mocked(fetchWithdrawalStatistics).mock.calls[0][0]).toBe('REVIEW')
    expect(vi.mocked(fetchWithdrawals).mock.calls[0][0]).toMatchObject({ scope: 'REVIEW' })
    const row = (await screen.findAllByText('Trần Thị B'))[0].closest('tr')!
    expect(within(row).getByText('•••• 6789', { exact: false })).toBeInTheDocument()
    expect(screen.queryByText('u1')).not.toBeInTheDocument()
    fireEvent.click(within(row).getByRole('button', { name: 'Xem' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('0123456789')).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: /Duyệt|Xác nhận đã chuyển/ })).not.toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Chuyển khoản' }))
    fireEvent.click(within(dialog).getByRole('button', { name: /Xác nhận chuyển 90\.000/ }))
    await waitFor(() => expect(transferWithdrawal).toHaveBeenCalledWith('d1'))
  })

  it('rejects with the typed reason', async () => {
    vi.mocked(rejectWithdrawal).mockResolvedValue({ ...customerRequest, status: 'REJECTED' })
    renderPage(<ManagerWithdrawalsPage />, '/center-manager/withdrawals?withdrawal=d1')

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    expect(await within(dialog).findByText('Nhập lý do từ chối.')).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Lý do từ chối'), { target: { value: 'Sai tên chủ tài khoản' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    await waitFor(() => expect(rejectWithdrawal).toHaveBeenCalledWith('d1', 'Sai tên chủ tài khoản'))
  })
})

describe('AdminWithdrawalsPage', () => {
  it('transfers a center wallet request and only watches customer requests handled by their center', async () => {
    vi.mocked(fetchWithdrawals).mockResolvedValue(page([centerRequest, customerRequest]))
    vi.mocked(transferWithdrawal).mockResolvedValue({ ...centerRequest, status: 'COMPLETED' })
    renderPage(<AdminWithdrawalsPage />, '/admin/withdrawals?withdrawal=d1')

    // Customer request: handled by center An Tâm, read-only for the admin.
    let dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText('Yêu cầu này do Trung tâm An Tâm xử lý — bạn chỉ xem.')).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Chuyển khoản' })).not.toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    // A center wallet row names the center; its manager is the requester under it.
    const row = (await screen.findAllByText('An Tâm'))[0].closest('tr')!
    expect(within(row).getByText(/Quản Lý A/)).toBeInTheDocument()
    fireEvent.click(within(row).getByRole('button', { name: 'Xem' }))
    dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Chuyển khoản' }))
    fireEvent.click(within(dialog).getByRole('button', { name: /Xác nhận chuyển 500\.000/ }))
    await waitFor(() => expect(transferWithdrawal).toHaveBeenCalledWith('d2'))
    expect(vi.mocked(fetchWithdrawalStatistics).mock.calls[0][0]).toBe('OWN')
  })
})
