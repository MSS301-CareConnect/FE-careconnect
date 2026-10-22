import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { archiveCareRecipient, fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { CareRecipientSummaryPage, UserResponse } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { PatientProfilesPage } from '../patient-profiles-page'

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
  it('renders care recipient profiles from the backend', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Hồ sơ người cần chăm sóc' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải hồ sơ người cần chăm sóc...')
    expect(await screen.findByRole('heading', { level: 3, name: 'Nguyễn Văn An' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Trần Thị Lan' })).toBeInTheDocument()
    expect(screen.getByText('Bình Thạnh, TP.HCM')).toBeInTheDocument()
    expect(screen.queryByText('Quản lý chính')).not.toBeInTheDocument()
    expect(screen.queryByText('Chủ sở hữu')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Family Member' })).toBeInTheDocument()
    expect(fetchCareRecipients).toHaveBeenCalledWith({ page: 0, size: 10 })
  })

  it('only offers edit and delete to profile owners', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    renderPage()

    const owner = (await screen.findByRole('heading', { level: 3, name: 'Nguyễn Văn An' })).closest('article')!
    const viewer = screen.getByRole('heading', { level: 3, name: 'Trần Thị Lan' }).closest('article')!
    expect(within(owner).getByRole('link', { name: 'Chỉnh sửa' })).toHaveAttribute(
      'href',
      '/customer/patient-profiles/rec-1?mode=edit'
    )
    expect(within(owner).getByRole('button', { name: 'Xóa' })).toBeInTheDocument()
    expect(within(viewer).queryByRole('link', { name: 'Chỉnh sửa' })).not.toBeInTheDocument()
    expect(within(viewer).queryByRole('button', { name: 'Xóa' })).not.toBeInTheDocument()
  })

  it('sends the search keyword and status filter to the backend', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    renderPage()
    await screen.findByRole('heading', { level: 3, name: 'Nguyễn Văn An' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm hồ sơ' }), { target: { value: ' Lan ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() =>
      expect(fetchCareRecipients).toHaveBeenCalledWith({ keyword: 'Lan', status: undefined, page: 0, size: 10 })
    )

    fireEvent.change(screen.getByRole('combobox', { name: 'Trạng thái hồ sơ' }), { target: { value: 'ARCHIVED' } })
    await waitFor(() =>
      expect(fetchCareRecipients).toHaveBeenCalledWith({ keyword: 'Lan', status: 'ARCHIVED', page: 0, size: 10 })
    )
  })

  it('archives a profile only after confirmation', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    vi.mocked(archiveCareRecipient).mockResolvedValue()
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Xóa' }))
    expect(archiveCareRecipient).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa' }))

    await waitFor(() => expect(archiveCareRecipient).toHaveBeenCalled())
    expect(vi.mocked(archiveCareRecipient).mock.calls[0][0]).toBe('rec-1')
    await waitFor(() => expect(vi.mocked(fetchCareRecipients).mock.calls.length).toBeGreaterThan(1))
  })

  it('shows the empty state when the customer has no profiles', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue({ ...page, items: [], totalElements: 0, totalPages: 0 })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Chưa có hồ sơ người thân' })).toBeInTheDocument()
  })

  it('shows a retryable error when the gateway fails', async () => {
    vi.mocked(fetchCareRecipients).mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue(page)
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tải danh sách hồ sơ.')
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('heading', { level: 3, name: 'Nguyễn Văn An' })).toBeInTheDocument()
  })

  it('switches text to English when language is changed', async () => {
    vi.mocked(fetchCareRecipients).mockResolvedValue(page)
    renderPage()
    await screen.findByRole('heading', { level: 3, name: 'Nguyễn Văn An' })

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Profiles of Care Recipients' })).toBeInTheDocument()
    })
    expect(screen.getAllByRole('link', { name: 'View details' })[0]).toBeInTheDocument()
    expect(screen.queryByText('Primary manager')).not.toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
