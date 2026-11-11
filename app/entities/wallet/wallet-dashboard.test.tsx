import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WalletRecord, WalletStatisticsRecord } from '~/shared/api/generated/contracts'
import { pickOption } from '~/shared/test/pickers'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { fetchCenter } from '~/entities/provider/provider-api'

import {
  fetchMyCenterBalances,
  fetchMyWallet,
  fetchMyWalletStatistics,
  fetchMyWalletTransactions,
  fetchWithdrawals,
  requestWithdrawal
} from './wallet-api'
import { WalletDashboard } from './wallet-dashboard'

vi.mock('./wallet-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./wallet-api')>()),
  fetchMyCenterBalances: vi.fn(),
  fetchMyWallet: vi.fn(),
  fetchMyWalletStatistics: vi.fn(),
  fetchMyWalletTransactions: vi.fn(),
  fetchWithdrawals: vi.fn(),
  requestWithdrawal: vi.fn()
}))

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenter: vi.fn()
}))

const page = <T,>(items: T[]) => ({ items, page: 0, size: 10, totalElements: items.length, totalPages: 1 })

const customerWallet: WalletRecord = {
  id: 'w1',
  ownerType: 'CUSTOMER',
  ownerId: 'u1',
  availableBalance: 420000,
  heldBalance: 0,
  withdrawable: true
}

const statistics: WalletStatisticsRecord = {
  ownerType: 'CUSTOMER',
  from: '2026-11-01T00:00:00Z',
  to: '2026-11-09T00:00:00Z',
  groupBy: 'DAY',
  availableBalance: 420000,
  heldBalance: 0,
  totalIncome: 420000,
  totalWithdrawn: 0,
  bookingCount: 1,
  byType: [],
  series: [{ period: '2026-11-08', income: 420000, withdrawn: 0, spent: 600000 }],
  totalPaid: 600000,
  refundedToWallet: 420000,
  refundedToGateway: 0,
  netSpent: 180000
}

function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <WalletDashboard bookingHref={(id) => `/customer/bookings/${id}`} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchMyWallet).mockResolvedValue(customerWallet)
  vi.mocked(fetchMyWalletStatistics).mockResolvedValue(statistics)
  vi.mocked(fetchMyWalletTransactions).mockResolvedValue(
    page([
      {
        id: 't1',
        walletId: 'w1',
        type: 'REFUND_CREDIT',
        amount: 210000,
        availableBefore: 210000,
        availableAfter: 420000,
        heldBefore: 0,
        heldAfter: 0,
        bookingId: 'b1',
        createdAt: '2026-11-08T03:00:00Z'
      }
    ])
  )
  vi.mocked(fetchWithdrawals).mockResolvedValue(page([]))
  vi.mocked(fetchMyCenterBalances).mockResolvedValue([])
  vi.mocked(fetchCenter).mockImplementation(
    async (id) => ({ id, centerName: id === 'c1' ? 'An Tâm' : 'Bình An' }) as Awaited<ReturnType<typeof fetchCenter>>
  )
})

describe('WalletDashboard', () => {
  it('shows the balance, the customer spending numbers and the ledger with balance before and after', async () => {
    renderDashboard()

    expect(await screen.findByTestId('wallet-available')).toHaveTextContent('420.000')
    expect(await screen.findByText('Chi tiêu thực')).toBeInTheDocument()
    expect(screen.getByText('Hoàn tiền hủy lịch')).toBeInTheDocument()
    expect(screen.getByText(/210\.000 ₫ → 420\.000 ₫/)).toBeInTheDocument()
    expect(screen.getByText('Bạn chưa gửi yêu cầu rút tiền nào.')).toBeInTheDocument()
    const [, , groupBy] = vi.mocked(fetchMyWalletStatistics).mock.calls[0]
    expect(groupBy).toBe('DAY')

    fireEvent.click(screen.getByRole('radio', { name: 'Năm nay' }))
    await waitFor(() => expect(fetchMyWalletStatistics).toHaveBeenCalledTimes(2))
    expect(vi.mocked(fetchMyWalletStatistics).mock.calls[1][2]).toBe('MONTH')
  })

  it('opens a ledger movement and an own withdrawal in detail, with a page size picker', async () => {
    vi.mocked(fetchWithdrawals).mockResolvedValue(
      page([
        {
          id: 'd9',
          walletId: 'w1',
          requesterUserId: 'u1',
          ownerType: 'CUSTOMER',
          centerId: 'c1',
          amount: 100000,
          bankName: 'Vietcombank',
          bankAccountNumber: '0123456789',
          accountHolderName: 'TRAN THI B',
          status: 'REJECTED',
          rejectReason: 'Sai tên chủ tài khoản',
          reviewedAt: '2026-11-09T03:00:00Z',
          createdAt: '2026-11-08T03:00:00Z'
        }
      ])
    )
    renderDashboard()

    fireEvent.click(await screen.findByRole('button', { name: /Xem chi tiết giao dịch Hoàn tiền hủy lịch/ }))
    let dialog = await screen.findByRole('dialog', { name: 'Chi tiết giao dịch' })
    expect(within(dialog).getByRole('link', { name: 'Xem lịch đặt' })).toHaveAttribute('href', '/customer/bookings/b1')
    expect(within(dialog).getByText(/210\.000 ₫ → 420\.000 ₫/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Đóng' }).at(-1)!)

    fireEvent.click(await screen.findByRole('button', { name: /Xem chi tiết yêu cầu rút 100\.000/ }))
    dialog = await screen.findByRole('dialog', { name: 'Chi tiết yêu cầu rút tiền' })
    expect(within(dialog).getByText('Bị từ chối, tiền đã về lại ví')).toBeInTheDocument()
    expect(within(dialog).getByText('Lý do từ chối: Sai tên chủ tài khoản')).toBeInTheDocument()
    expect(within(dialog).getByText('0123456789')).toBeInTheDocument()

    expect(screen.getAllByLabelText('Số dòng mỗi trang')).toHaveLength(2)
  })

  it('checks every field before sending a withdrawal and refuses more than the available balance', async () => {
    vi.mocked(requestWithdrawal).mockResolvedValue({
      id: 'd1',
      walletId: 'w1',
      requesterUserId: 'u1',
      ownerType: 'CUSTOMER',
      amount: 400000,
      bankName: 'Vietcombank',
      bankAccountNumber: '0123456789',
      accountHolderName: 'NGUYEN VAN A',
      status: 'PENDING',
      createdAt: '2026-11-09T03:00:00Z'
    })
    renderDashboard()
    fireEvent.click(await screen.findByRole('button', { name: 'Rút tiền' }))
    const dialog = await screen.findByRole('dialog', { name: 'Rút tiền về tài khoản ngân hàng' })

    fireEvent.change(within(dialog).getByLabelText('Số tiền muốn rút (₫)'), { target: { value: '500000' } })
    fireEvent.change(within(dialog).getByLabelText('Số tài khoản'), { target: { value: '12ab' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Gửi yêu cầu' }))
    expect(await within(dialog).findByText('Số tiền vượt quá số dư khả dụng.')).toBeInTheDocument()
    expect(within(dialog).getByText('Nhập tên ngân hàng.')).toBeInTheDocument()
    expect(within(dialog).getByText('Số tài khoản gồm 6–20 chữ số.')).toBeInTheDocument()
    expect(within(dialog).getByText('Nhập tên chủ tài khoản.')).toBeInTheDocument()
    expect(requestWithdrawal).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText('Số tiền muốn rút (₫)'), { target: { value: '400.000' } })
    await pickOption(within(dialog).getByRole('combobox', { name: 'Tên ngân hàng' }), 'Vietcombank')
    fireEvent.change(within(dialog).getByLabelText('Số tài khoản'), { target: { value: '0123456789' } })
    fireEvent.change(within(dialog).getByLabelText('Tên chủ tài khoản'), { target: { value: 'NGUYEN VAN A' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Gửi yêu cầu' }))

    await waitFor(() =>
      expect(requestWithdrawal).toHaveBeenCalledWith({
        amount: 400000,
        bankName: 'Vietcombank',
        bankAccountNumber: '0123456789',
        accountHolderName: 'NGUYEN VAN A'
      })
    )
  })

  it('sends a customer withdrawal to the center holding the chosen money and caps it at that balance', async () => {
    vi.mocked(fetchMyCenterBalances).mockResolvedValue([
      { centerId: 'c1', availableBalance: 300000 },
      { centerId: 'c2', availableBalance: 120000 }
    ])
    vi.mocked(requestWithdrawal).mockResolvedValue({
      id: 'd1',
      walletId: 'w1',
      requesterUserId: 'u1',
      ownerType: 'CUSTOMER',
      centerId: 'c2',
      amount: 100000,
      bankName: 'Vietcombank',
      bankAccountNumber: '0123456789',
      accountHolderName: 'NGUYEN VAN A',
      status: 'PENDING',
      createdAt: '2026-11-10T03:00:00Z'
    })
    renderDashboard()

    fireEvent.click(await screen.findByRole('button', { name: 'Rút tiền' }))
    const dialog = await screen.findByRole('dialog')
    const center = await within(dialog).findByLabelText('Rút từ khoản tiền của trung tâm')
    await waitFor(() => expect(within(center).getByRole('option', { name: /Bình An/ })).toBeInTheDocument())
    fireEvent.change(center, { target: { value: 'c2' } })
    fireEvent.change(within(dialog).getByLabelText('Số tiền muốn rút (₫)'), { target: { value: '200.000' } })
    await pickOption(within(dialog).getByRole('combobox', { name: 'Tên ngân hàng' }), 'Vietcombank')
    fireEvent.change(within(dialog).getByLabelText('Số tài khoản'), { target: { value: '0123456789' } })
    fireEvent.change(within(dialog).getByLabelText('Tên chủ tài khoản'), { target: { value: 'NGUYEN VAN A' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Gửi yêu cầu' }))
    expect(await within(dialog).findByText('Số tiền vượt quá số dư của bạn tại trung tâm này.')).toBeInTheDocument()
    expect(requestWithdrawal).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText('Số tiền muốn rút (₫)'), { target: { value: '100.000' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Gửi yêu cầu' }))
    await waitFor(() =>
      expect(requestWithdrawal).toHaveBeenCalledWith({
        amount: 100000,
        bankName: 'Vietcombank',
        bankAccountNumber: '0123456789',
        accountHolderName: 'NGUYEN VAN A',
        centerId: 'c2'
      })
    )
  })

  // 2026-11-11: center and platform money reaches their own accounts — the page is revenue only, nothing to withdraw.
  it('shows the center revenue without a balance, a withdraw action or own withdrawal requests', async () => {
    vi.mocked(fetchMyWallet).mockResolvedValue({ ...customerWallet, ownerType: 'CENTER', withdrawable: false })
    vi.mocked(fetchMyWalletStatistics).mockResolvedValue({
      ...statistics,
      ownerType: 'CENTER',
      totalIncome: 1800000,
      serviceIncome: 1800000,
      commissionDeducted: 200000,
      forfeitIncome: 0,
      complaintDebits: 0,
      byType: [{ type: 'SERVICE_SETTLEMENT', count: 2, totalAmount: 1800000 }]
    })
    renderDashboard()

    expect(await screen.findByRole('heading', { name: 'Doanh thu theo kỳ' })).toBeInTheDocument()
    expect(await screen.findByText('Trung tâm thực nhận')).toBeInTheDocument()
    expect(screen.getByText('Hoa hồng nền tảng đã trừ')).toBeInTheDocument()
    expect(screen.queryByText('Đã rút trong kỳ')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rút tiền' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('wallet-available')).not.toBeInTheDocument()
    expect(fetchWithdrawals).not.toHaveBeenCalled()
  })

  it('shows the platform commission as revenue and lists what the platform holds for others', async () => {
    vi.mocked(fetchMyWallet).mockResolvedValue({ ...customerWallet, ownerType: 'PLATFORM', withdrawable: false })
    vi.mocked(fetchMyWalletStatistics).mockResolvedValue({
      ...statistics,
      ownerType: 'PLATFORM',
      commissionIncome: 100000,
      grossCollected: 1000000,
      totalRefunded: 0,
      liabilities: [{ ownerType: 'CAREGIVER', walletCount: 2, availableBalance: 90000, heldBalance: 0 }],
      pendingWithdrawalCount: 1,
      pendingWithdrawalAmount: 50000
    })
    renderDashboard()

    expect(await screen.findByText('Hoa hồng thu được')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rút tiền' })).not.toBeInTheDocument()
    expect(await screen.findByText('Tiền nền tảng đang giữ hộ')).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Người chăm sóc' })).toBeInTheDocument()
    expect(screen.getByText('1 yêu cầu · 50.000 ₫')).toBeInTheDocument()
    expect(fetchWithdrawals).not.toHaveBeenCalled()
  })
})
