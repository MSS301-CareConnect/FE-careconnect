import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchAccounts } from '~/entities/identity/account-api'
import { createCenter, fetchCenters, fetchProviderMedia } from '~/entities/provider/provider-api'
import { fetchProviderStatistics } from '~/entities/statistics/statistics-api'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminCentersPage } from '../admin-centers-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenters: vi.fn(),
  fetchProviderMedia: vi.fn(),
  createCenter: vi.fn()
}))
vi.mock('~/entities/statistics/statistics-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/statistics/statistics-api')>()),
  fetchProviderStatistics: vi.fn()
}))
vi.mock('~/entities/identity/account-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/identity/account-api')>()),
  fetchAccounts: vi.fn()
}))

const center: ProviderCenterRecord = {
  id: 'center-1',
  centerName: 'Care One',
  email: 'care@example.com',
  phoneNumber: '0901234567',
  address: '1 Lê Lợi',
  centerStatus: 'PENDING',
  managerUserId: 'mgr-1',
  version: 3
}

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}

function renderPage(path = '/admin/centers') {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AdminCentersPage />} path='/admin/centers' />
          <Route element={<span data-testid='detail' />} path='/admin/centers/:id' />
        </Routes>
        <Location />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchCenters).mockResolvedValue({ items: [center], page: 0, size: 20, totalElements: 1, totalPages: 1 })
  vi.mocked(fetchProviderMedia).mockResolvedValue([])
  vi.mocked(fetchProviderStatistics).mockResolvedValue({
    centersByStatus: { PENDING: 2, ACTIVE: 5 },
    caregiversByStatus: {},
    caregiversByVerification: {}
  })
  vi.mocked(fetchAccounts).mockResolvedValue({
    content: [{ id: 'mgr-1', fullName: 'Lan Tran', status: 'ACTIVE', roles: ['CENTER_MANAGER'] }],
    page: 0,
    size: 100,
    totalElements: 1,
    totalPages: 1
  })
  await setAppLanguage('vi', false)
})

describe('AdminCentersPage', () => {
  it('lists centers with their manager by name, platform counts on the tabs and no license wording', async () => {
    renderPage()
    expect(await screen.findByRole('link', { name: 'Care One' })).toHaveAttribute('href', '/admin/centers/center-1')
    expect(await screen.findByText('Lan Tran')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Chờ duyệt\s*2/ })).toBeInTheDocument()
    expect(screen.getByText('Thẩm định')).toBeInTheDocument()
    expect(screen.queryByText(/GPKD|giấy phép/i)).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/GPKD/)).not.toBeInTheDocument()
    expect(screen.queryByText('center-1')).not.toBeInTheDocument()
  })

  it('filters by status tab and searches on the server', async () => {
    renderPage()
    await screen.findByRole('link', { name: 'Care One' })
    fireEvent.click(screen.getByRole('tab', { name: /Đang hoạt động/ }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'care' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }))
    await waitFor(() =>
      expect(fetchCenters).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'ACTIVE', keyword: 'care' }))
    )
  })

  it('lists archived centers read-only', async () => {
    vi.mocked(fetchCenters).mockResolvedValue({
      items: [{ ...center, centerStatus: 'ARCHIVED', updatedAt: '2026-10-01T00:00:00Z' }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    renderPage('/admin/centers?status=ARCHIVED')
    expect(await screen.findByText('Care One')).toBeInTheDocument()
    expect(fetchCenters).toHaveBeenCalledWith(expect.objectContaining({ status: 'ARCHIVED', includeDeleted: true }))
    expect(screen.queryByRole('link', { name: 'Care One' })).not.toBeInTheDocument()
  })

  it('opens an old ?center= link on the center page', async () => {
    renderPage('/admin/centers?center=center-1')
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/centers/center-1'))
  })

  it('creates a center with overnight hours and opens it', async () => {
    vi.mocked(createCenter).mockResolvedValue({ ...center, id: 'center-2' })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm trung tâm' }))
    const dialog = screen.getByRole('dialog', { name: 'Thêm trung tâm' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo trung tâm' }))
    expect(within(dialog).getByLabelText('Tên trung tâm')).toHaveAccessibleDescription('Nhập tên trung tâm.')
    expect(within(dialog).getByLabelText('Tên trung tâm')).toHaveFocus()
    expect(within(dialog).getByLabelText('Địa chỉ')).toHaveAccessibleDescription('Nhập địa chỉ trung tâm.')
    expect(createCenter).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText('Tên trung tâm'), { target: { value: 'Night Care' } })
    fireEvent.change(within(dialog).getByLabelText('Email'), { target: { value: 'night@example.com' } })
    fireEvent.change(within(dialog).getByLabelText('Địa chỉ'), { target: { value: '2 Lê Lợi' } })
    fireEvent.change(within(dialog).getByLabelText('Mở cửa'), { target: { value: '22:00' } })
    fireEvent.change(within(dialog).getByLabelText('Đóng cửa'), { target: { value: '06:00' } })
    // Overnight hours are a note, not an error (D-04).
    expect(within(dialog).getByText('Hoạt động qua đêm, đóng cửa lúc 06:00 hôm sau.')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo trung tâm' }))

    await waitFor(() =>
      expect(createCenter).toHaveBeenCalledWith({
        centerName: 'Night Care',
        email: 'night@example.com',
        address: '2 Lê Lợi',
        operatingHours: '22:00 - 06:00'
      })
    )
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/centers/center-2'))
  })

  it('asks for the missing time instead of blocking the time inputs', async () => {
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm trung tâm' }))
    const dialog = screen.getByRole('dialog', { name: 'Thêm trung tâm' })
    fireEvent.change(within(dialog).getByLabelText('Mở cửa'), { target: { value: '08:00' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo trung tâm' }))
    expect(within(dialog).getByText('Chọn cả giờ mở và giờ đóng cửa, hoặc để trống cả hai.')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Đóng cửa')).toBeEnabled()
    fireEvent.change(within(dialog).getByLabelText('Đóng cửa'), { target: { value: '07:00' } })
    expect(within(dialog).queryByText('Chọn cả giờ mở và giờ đóng cửa, hoặc để trống cả hai.')).not.toBeInTheDocument()
  })
})
