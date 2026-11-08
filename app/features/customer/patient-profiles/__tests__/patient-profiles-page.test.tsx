import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { archiveCareRecipient, fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { CareRecipientSummaryPage, UserResponse } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { PatientProfilesPage } from '../patient-profiles-page'

vi.mock('~/entities/care-recipient/care-recipient-managers-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-managers-api')>()),
  fetchMyInvitations: vi.fn().mockResolvedValue([])
}))
vi.mock('~/entities/care-recipient/care-recipient-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-api')>()),
  fetchCareRecipients: vi.fn(),
  archiveCareRecipient: vi.fn()
}))

const user: UserResponse = { id: 'user-1', email: 'family@example.com', fullName: 'Family Member', roles: ['CUSTOMER'] }

const page: CareRecipientSummaryPage = {
  items: [
    {
      id: 'rec-1',
      fullName: 'Nguyễn Văn An',
      age: 78,
      gender: 'MALE',
      district: 'Bình Thạnh',
      province: 'TP.HCM',
      status: 'ACTIVE',
      myAccessLevel: 'OWNER',
      primaryManager: true
    },
    { id: 'rec-2', fullName: 'Trần Thị Lan', age: 75, gender: 'FEMALE', status: 'ACTIVE', myAccessLevel: 'VIEWER' }
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext value={user}>
        <MemoryRouter initialEntries={['/customer/patient-profiles']}>
          <PatientProfilesPage />
        </MemoryRouter>
      </AuthUserContext>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  localStorage.clear()
  vi.mocked(fetchCareRecipients).mockReset()
  vi.mocked(archiveCareRecipient).mockReset()
  await setAppLanguage('vi', false)
})

describe('PatientProfilesPage', () => {
  it('renders the profiles from the backend as cards with facts and access', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Hồ sơ người thân' })).toBeInTheDocument()
    const owner = (await screen.findByRole('heading', { level: 2, name: 'Nguyễn Văn An' })).closest('article')!
    expect(within(owner).getByText('78 tuổi · Nam · Bình Thạnh, TP.HCM')).toBeInTheDocument()
    expect(within(owner).getByText('Chủ sở hữu')).toBeInTheDocument()
    expect(within(owner).getByRole('link', { name: /Đặt lịch/ })).toHaveAttribute(
      'href',
      '/customer/booking?patientId=rec-1'
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Trần Thị Lan' })).toBeInTheDocument()
    expect(fetchCareRecipients).toHaveBeenCalledWith({ page: 0, size: 10 })
  })

  it('only offers edit and delete to profile owners, behind the more-actions menu', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Thao tác với hồ sơ Nguyễn Văn An' }))
    expect(screen.getByRole('menuitem', { name: 'Sửa thông tin' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Xóa hồ sơ' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Thao tác với hồ sơ Trần Thị Lan' })).not.toBeInTheDocument()
  })

  it('searches as the customer types and filters by status chip', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    renderPage()
    await screen.findByRole('heading', { level: 2, name: 'Nguyễn Văn An' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm hồ sơ theo tên' }), { target: { value: ' Lan ' } })
    await waitFor(() =>
      expect(fetchCareRecipients).toHaveBeenCalledWith({ keyword: 'Lan', status: undefined, page: 0, size: 10 })
    )

    fireEvent.click(screen.getByRole('button', { name: 'Đã lưu trữ' }))
    await waitFor(() =>
      expect(fetchCareRecipients).toHaveBeenCalledWith({ keyword: 'Lan', status: 'ARCHIVED', page: 0, size: 10 })
    )
  })

  it('archives a profile only after confirmation in a dialog', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    vi.mocked(archiveCareRecipient).mockResolvedValue()
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Thao tác với hồ sơ Nguyễn Văn An' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Xóa hồ sơ' }))
    expect(archiveCareRecipient).not.toHaveBeenCalled()
    const dialog = screen.getByRole('dialog', { name: 'Xóa hồ sơ Nguyễn Văn An?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xóa hồ sơ' }))

    await waitFor(() => expect(archiveCareRecipient).toHaveBeenCalled())
    expect(vi.mocked(archiveCareRecipient).mock.calls[0][0]).toBe('rec-1')
    await waitFor(() => expect(vi.mocked(fetchCareRecipients).mock.calls.length).toBeGreaterThan(1))
  })

  it('shows the empty state with an add action when the customer has no profiles', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue({ ...page, items: [], totalElements: 0, totalPages: 0 })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Chưa có hồ sơ người thân' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Thêm hồ sơ/ })).toHaveLength(2)
  })

  it('shows a retryable error when the gateway fails', async () => {
    vi.mocked(fetchCareRecipients).mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue(page)
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tải danh sách hồ sơ.')
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Nguyễn Văn An' })).toBeInTheDocument()
  })

  it('switches text to English when language is changed', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    renderPage()
    await screen.findByRole('heading', { level: 2, name: 'Nguyễn Văn An' })

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Family profiles' })).toBeInTheDocument()
    })
    expect(screen.getAllByRole('link', { name: 'View profile' })[0]).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
