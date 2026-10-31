import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { changeAccountStatus, fetchAccount, fetchAccounts, provisionAccount } from '~/entities/identity/account-api'
import { confirmPasswordReset, sendPasswordResetCode } from '~/entities/identity/password-reset-api'
import {
  changeCenterStatus,
  fetchCaregivers,
  fetchCenter,
  fetchProviderMedia,
  saveCenter
} from '~/entities/provider/provider-api'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CenterDetailPage } from '../center-detail-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenter: vi.fn(),
  fetchProviderMedia: vi.fn(),
  fetchCaregivers: vi.fn(),
  saveCenter: vi.fn(),
  changeCenterStatus: vi.fn()
}))
vi.mock('~/entities/identity/account-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/identity/account-api')>()),
  fetchAccount: vi.fn(),
  fetchAccounts: vi.fn(),
  provisionAccount: vi.fn(),
  changeAccountStatus: vi.fn()
}))
vi.mock('~/entities/identity/password-reset-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/identity/password-reset-api')>()),
  sendPasswordResetCode: vi.fn(),
  confirmPasswordReset: vi.fn()
}))

const pending: ProviderCenterRecord = {
  id: 'center-1',
  centerName: 'Care One',
  email: 'care@example.com',
  phoneNumber: '0901234567',
  address: '1 Lê Lợi',
  operatingHours: '22:00 - 06:00',
  centerStatus: 'PENDING',
  version: 3
}

function emptyPage<T>() {
  return { content: [] as T[], items: [] as T[], page: 0, size: 20, totalElements: 0, totalPages: 0 }
}

function renderPage(path = '/admin/centers/center-1') {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[path]}>
        <CenterDetailPage id='center-1' />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchCenter).mockResolvedValue(pending)
  vi.mocked(fetchProviderMedia).mockResolvedValue([])
  vi.mocked(fetchAccounts).mockResolvedValue(emptyPage())
  vi.mocked(fetchCaregivers).mockResolvedValue(emptyPage())
  vi.mocked(sendPasswordResetCode).mockResolvedValue()
  await setAppLanguage('vi', false)
})

describe('CenterDetailPage', () => {
  it('reviews a pending center in place and points to the missing manager instead of an edit form', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Thẩm định trung tâm' })).toBeInTheDocument()
    expect(screen.getByText('22:00 – 06:00 hôm sau')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Duyệt & kích hoạt' }))
    expect(screen.getByText('Ghép người quản lý ở khối Người quản lý trước khi duyệt.')).toHaveClass('text-error')
    expect(changeCenterStatus).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('creates a manager, links it to the center and emails a password code without leaving the page', async () => {
    vi.mocked(provisionAccount).mockResolvedValue({
      id: 'mgr-1',
      email: 'lan@care.vn',
      fullName: 'Lan Tran',
      roles: ['CENTER_MANAGER'],
      centerId: 'center-1'
    })
    vi.mocked(saveCenter).mockResolvedValue({ ...pending, managerUserId: 'mgr-1', version: 4 })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Tạo tài khoản quản lý' }))
    const dialog = screen.getByRole('dialog', { name: 'Tạo tài khoản quản lý' })
    expect(within(dialog).queryByLabelText('Trung tâm')).not.toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Email'), { target: { value: 'lan@care.vn' } })
    fireEvent.change(within(dialog).getByLabelText('Họ tên'), { target: { value: 'Lan Tran' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo tài khoản quản lý' }))

    await waitFor(() =>
      expect(provisionAccount).toHaveBeenCalledWith({
        email: 'lan@care.vn',
        fullName: 'Lan Tran',
        roleCode: 'CENTER_MANAGER',
        centerId: 'center-1'
      })
    )
    await waitFor(() =>
      expect(saveCenter).toHaveBeenCalledWith(
        'center-1',
        expect.objectContaining({ managerUserId: 'mgr-1', version: 3 })
      )
    )
    expect(await within(dialog).findByText('Đã ghép Lan Tran làm người quản lý.')).toBeInTheDocument()
    await waitFor(() => expect(sendPasswordResetCode).toHaveBeenCalledWith({ email: 'lan@care.vn' }))

    // The administrator sets the password with the code the new manager reads out from the email.
    const code = await within(dialog).findByLabelText('Mã trong email')
    fireEvent.change(within(dialog).getByLabelText('Mật khẩu mới'), { target: { value: 'weak' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đặt mật khẩu' }))
    expect(code).toHaveAccessibleDescription('Nhập đủ 6 chữ số trong email.')
    expect(within(dialog).getByLabelText('Mật khẩu mới')).toHaveAccessibleDescription(
      'Dùng ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'
    )
    expect(confirmPasswordReset).not.toHaveBeenCalled()

    vi.mocked(confirmPasswordReset).mockRejectedValueOnce(
      Object.assign(new Error('otp'), { status: 400, info: { code: 1063 } })
    )
    fireEvent.change(code, { target: { value: '123456' } })
    fireEvent.change(within(dialog).getByLabelText('Mật khẩu mới'), { target: { value: 'Manager#2026' } })
    fireEvent.change(within(dialog).getByLabelText('Nhập lại mật khẩu mới'), { target: { value: 'Manager#2026' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đặt mật khẩu' }))
    await waitFor(() => expect(code).toHaveAccessibleDescription('Mã không đúng hoặc đã hết hạn. Hãy gửi mã mới.'))

    vi.mocked(confirmPasswordReset).mockResolvedValueOnce()
    fireEvent.change(code, { target: { value: '654321' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đặt mật khẩu' }))
    await waitFor(() =>
      expect(confirmPasswordReset).toHaveBeenLastCalledWith({
        email: 'lan@care.vn',
        otpCode: '654321',
        newPassword: 'Manager#2026'
      })
    )
    expect(
      await within(dialog).findByText('Đã đặt mật khẩu. Lan Tran có thể đăng nhập bằng lan@care.vn.')
    ).toBeInTheDocument()
    // Once set, the form closes so nothing suggests the step is still open; the password is not kept.
    expect(within(dialog).queryByLabelText('Mật khẩu mới')).not.toBeInTheDocument()
    expect(sendPasswordResetCode).toHaveBeenCalledOnce()
  })

  it('keeps the new account and retries only the link when linking fails', async () => {
    vi.mocked(provisionAccount).mockResolvedValue({ id: 'mgr-1', email: 'lan@care.vn', fullName: 'Lan Tran' })
    vi.mocked(saveCenter)
      .mockRejectedValueOnce(Object.assign(new Error('busy'), { status: 409, info: { code: 4114 } }))
      .mockResolvedValueOnce({ ...pending, managerUserId: 'mgr-1', version: 4 })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Tạo tài khoản quản lý' }))
    const dialog = screen.getByRole('dialog', { name: 'Tạo tài khoản quản lý' })
    fireEvent.change(within(dialog).getByLabelText('Email'), { target: { value: 'lan@care.vn' } })
    fireEvent.change(within(dialog).getByLabelText('Họ tên'), { target: { value: 'Lan Tran' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo tài khoản quản lý' }))

    fireEvent.click(await within(dialog).findByRole('button', { name: 'Thử ghép lại' }))
    await waitFor(() => expect(saveCenter).toHaveBeenCalledTimes(2))
    expect(provisionAccount).toHaveBeenCalledOnce()
  })

  it('approves once the manager is active', async () => {
    vi.mocked(fetchCenter).mockResolvedValue({ ...pending, managerUserId: 'mgr-1' })
    vi.mocked(fetchAccount).mockResolvedValue({
      id: 'mgr-1',
      fullName: 'Lan Tran',
      email: 'lan@care.vn',
      status: 'ACTIVE',
      roles: ['CENTER_MANAGER']
    })
    vi.mocked(changeCenterStatus).mockResolvedValue({ ...pending, centerStatus: 'ACTIVE', version: 4 })
    renderPage()
    expect(await screen.findByText('Lan Tran')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Duyệt & kích hoạt' }))
    const confirm = screen.getByRole('dialog', { name: 'Duyệt & kích hoạt' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Duyệt & kích hoạt' }))
    await waitFor(() =>
      expect(changeCenterStatus).toHaveBeenCalledWith('center-1', { status: 'ACTIVE', reason: undefined, version: 3 })
    )
  })

  it('rejects with a quick reason and requires one', async () => {
    vi.mocked(changeCenterStatus).mockResolvedValue({ ...pending, centerStatus: 'REJECTED' })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }))
    const confirm = screen.getByRole('dialog', { name: 'Từ chối trung tâm Care One?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Từ chối' }))
    expect(within(confirm).getByLabelText('Lý do')).toHaveAccessibleDescription(
      'Nhập lý do để quản trị viên khác biết vì sao.'
    )
    fireEvent.click(within(confirm).getByRole('button', { name: 'Trùng với trung tâm đã có' }))
    fireEvent.click(within(confirm).getByRole('button', { name: 'Từ chối' }))
    await waitFor(() =>
      expect(changeCenterStatus).toHaveBeenCalledWith('center-1', {
        status: 'REJECTED',
        reason: 'Trùng với trung tâm đã có',
        version: 3
      })
    )
  })

  it('changes the manager and locks the previous account', async () => {
    vi.mocked(fetchCenter).mockResolvedValue({ ...pending, centerStatus: 'ACTIVE', managerUserId: 'mgr-1' })
    vi.mocked(fetchAccount).mockResolvedValue({
      id: 'mgr-1',
      fullName: 'Lan Tran',
      email: 'lan@care.vn',
      status: 'ACTIVE',
      roles: ['CENTER_MANAGER']
    })
    vi.mocked(fetchAccounts).mockResolvedValue({
      content: [{ id: 'mgr-2', fullName: 'Minh Vu', email: 'minh@care.vn', status: 'ACTIVE' }],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(saveCenter).mockResolvedValue({ ...pending, managerUserId: 'mgr-2' })
    vi.mocked(changeAccountStatus).mockResolvedValue({ id: 'mgr-1', status: 'LOCKED' })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Đổi người quản lý' }))
    const dialog = screen.getByRole('dialog', { name: 'Đổi người quản lý' })
    await within(dialog).findByRole('option', { name: /Minh Vu/ })
    fireEvent.change(within(dialog).getByLabelText('Tài khoản quản lý'), { target: { value: 'mgr-2' } })
    expect(within(dialog).getByRole('checkbox', { name: /Khóa tài khoản quản lý cũ/ })).toBeChecked()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ghép làm người quản lý' }))
    await waitFor(() =>
      expect(changeAccountStatus).toHaveBeenCalledWith('mgr-1', 'LOCKED', 'Không còn quản lý trung tâm Care One')
    )
  })

  it('shows staff work status from the account and the profile', async () => {
    vi.mocked(fetchCaregivers).mockResolvedValue({
      items: [
        {
          id: 'cg-1',
          userId: 'u-1',
          centerId: 'center-1',
          fullName: 'An',
          caregiverStatus: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          version: 0
        },
        {
          id: 'cg-2',
          userId: 'u-2',
          centerId: 'center-1',
          fullName: 'Bình',
          caregiverStatus: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          version: 0
        },
        {
          id: 'cg-3',
          centerId: 'center-1',
          fullName: 'Chi',
          caregiverStatus: 'INACTIVE',
          verificationStatus: 'PENDING',
          version: 0
        }
      ],
      page: 0,
      size: 20,
      totalElements: 3,
      totalPages: 1
    })
    vi.mocked(fetchAccounts).mockResolvedValue({
      content: [
        { id: 'u-1', status: 'ACTIVE' },
        { id: 'u-2', status: 'LOCKED' }
      ],
      page: 0,
      size: 100,
      totalElements: 2,
      totalPages: 1
    })
    renderPage('/admin/centers/center-1?tab=staff')
    const rows = await screen.findAllByRole('row')
    expect(rows[1]).toHaveTextContent('Đang làm việc')
    expect(rows[2]).toHaveTextContent('Tài khoản bị khóa')
    expect(rows[3]).toHaveTextContent('Tạm nghỉ')
    expect(screen.getByText(/không theo giờ check-in/)).toBeInTheDocument()
  })
})
