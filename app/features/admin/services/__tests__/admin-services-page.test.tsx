import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCatalog,
  fetchCatalogItems,
  fetchCenterOfferings,
  fetchPricePlans,
  removeCatalog,
  saveCatalog
} from '~/entities/care-catalog/care-catalog-api'
import { fetchCenters } from '~/entities/provider/provider-api'
import type { CatalogItemRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminServicesPage } from '../admin-services-page'

vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCatalogItems: vi.fn(),
  createCatalog: vi.fn(),
  saveCatalog: vi.fn(),
  removeCatalog: vi.fn(),
  fetchCenterOfferings: vi.fn(),
  fetchPricePlans: vi.fn()
}))

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenters: vi.fn()
}))

const elderCare: CatalogItemRecord = {
  id: 'item-1',
  name: 'Chăm sóc người cao tuổi',
  category: 'Người cao tuổi',
  description: 'Hỗ trợ sinh hoạt hằng ngày',
  status: 'ACTIVE'
}

function catalog(count: number): CatalogItemRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index + 1}`,
    name: index === 0 ? elderCare.name : `Dịch vụ ${String(index + 1).padStart(2, '0')}`,
    category: index % 2 ? 'Phục hồi chức năng' : 'Người cao tuổi',
    status: index === 11 ? 'INACTIVE' : 'ACTIVE'
  }))
}

function apiError(status: number, code: number) {
  return Object.assign(new Error('CareCatalogService error'), { status, info: { code, message: 'error' } })
}

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}

function renderPage(path = '/admin/services') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AdminServicesPage />} path='/admin/services' />
        </Routes>
        <Location />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

async function openCreateDialog() {
  fireEvent.click(await screen.findByRole('button', { name: 'Thêm dịch vụ mới' }))
  return screen.getByRole('dialog', { name: 'Thêm dịch vụ chuẩn' })
}

describe('Admin service catalog', () => {
  beforeEach(async () => {
    vi.mocked(fetchCatalogItems).mockReset().mockResolvedValue([elderCare])
    vi.mocked(createCatalog).mockReset()
    vi.mocked(saveCatalog).mockReset()
    vi.mocked(removeCatalog).mockReset()
    vi.mocked(fetchCenterOfferings).mockReset()
    vi.mocked(fetchPricePlans).mockReset()
    vi.mocked(fetchCenters).mockReset()
    await setAppLanguage('vi', false)
  })

  it('lists the backend catalog with metrics, URL search and pagination', async () => {
    vi.mocked(fetchCatalogItems).mockResolvedValue(catalog(12))
    renderPage()

    expect(await screen.findByText('12 dịch vụ')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(11)
    expect(screen.getByText('Trang 1 / 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }))
    expect(screen.getByTestId('location')).toHaveTextContent('page=1')
    expect(screen.getByText('Dịch vụ 12')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cham soc' } })
    expect(screen.getByText('1 dịch vụ')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/services?q=cham+soc')
    expect(within(screen.getByRole('table')).getByText(elderCare.name)).toBeInTheDocument()
  })

  it('shows each missing required field under its input and focuses the first one', async () => {
    renderPage()
    const dialog = await openCreateDialog()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo dịch vụ' }))

    const name = within(dialog).getByLabelText(/Tên dịch vụ/)
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Vui lòng nhập tên dịch vụ.')
    expect(name).toHaveFocus()
    expect(within(dialog).getByLabelText(/Danh mục/)).toHaveAccessibleDescription('Vui lòng chọn danh mục.')
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()
    expect(createCatalog).not.toHaveBeenCalled()

    fireEvent.change(name, { target: { value: 'Vật lý trị liệu' } })
    expect(name).not.toHaveAttribute('aria-invalid', 'true')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo dịch vụ' }))
    expect(within(dialog).getByLabelText(/Danh mục/)).toHaveFocus()
  })

  it('places a field-specific backend validation error on that field', async () => {
    vi.mocked(createCatalog).mockRejectedValue(apiError(400, 3102))
    renderPage()
    const dialog = await openCreateDialog()
    fireEvent.change(within(dialog).getByLabelText(/Tên dịch vụ/), { target: { value: 'Vật lý trị liệu' } })
    fireEvent.change(within(dialog).getByLabelText(/Danh mục/), { target: { value: 'Sau phẫu thuật' } })

    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo dịch vụ' }))

    const category = within(dialog).getByLabelText(/Danh mục/)
    await waitFor(() => expect(category).toHaveAccessibleDescription('Vui lòng chọn danh mục.'))
    expect(category).toHaveFocus()
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps a form-level alert only for server failures', async () => {
    vi.mocked(createCatalog).mockRejectedValue(apiError(500, 9999))
    renderPage()
    const dialog = await openCreateDialog()
    fireEvent.change(within(dialog).getByLabelText(/Tên dịch vụ/), { target: { value: 'Vật lý trị liệu' } })
    fireEvent.change(within(dialog).getByLabelText(/Danh mục/), { target: { value: 'Sau phẫu thuật' } })

    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo dịch vụ' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Chưa thể lưu dịch vụ lúc này. Vui lòng thử lại sau.'
    )
    expect(within(dialog).getByLabelText(/Tên dịch vụ/)).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('offers only the six short categories and creates a service with the POST contract fields', async () => {
    vi.mocked(createCatalog).mockResolvedValue({ ...elderCare, id: 'item-2', name: 'Vật lý trị liệu' })
    renderPage()
    const dialog = await openCreateDialog()
    fireEvent.change(within(dialog).getByLabelText(/Tên dịch vụ/), { target: { value: ' Vật lý trị liệu ' } })
    const category = within(dialog).getByLabelText(/Danh mục/)
    // A placeholder plus the six categories; no free-text "add new" option.
    expect(within(category).getAllByRole('option')).toHaveLength(7)
    expect(within(category).queryByRole('option', { name: /Thêm danh mục/ })).not.toBeInTheDocument()
    fireEvent.change(category, { target: { value: 'Phục hồi chức năng' } })
    fireEvent.change(within(dialog).getByLabelText(/Trạng thái/), { target: { value: 'INACTIVE' } })

    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo dịch vụ' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(vi.mocked(createCatalog).mock.calls[0][0]).toEqual({
      name: 'Vật lý trị liệu',
      category: 'Phục hồi chức năng',
      status: 'INACTIVE'
    })
    expect(fetchCatalogItems).toHaveBeenCalledTimes(2)
  })

  it('stores the same Vietnamese category value when the page is in English', async () => {
    vi.mocked(createCatalog).mockResolvedValue(elderCare)
    await setAppLanguage('en', false)
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Add service' }))
    const dialog = screen.getByRole('dialog', { name: 'Add standard service' })
    fireEvent.change(within(dialog).getByLabelText(/Service name/), { target: { value: 'Wound care' } })
    const category = within(dialog).getByLabelText(/Category/)
    fireEvent.change(category, { target: { value: 'Sau phẫu thuật' } })
    expect(within(category).getByRole('option', { name: 'Post-surgery', selected: true })).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create service' }))

    await waitFor(() =>
      expect(createCatalog).toHaveBeenCalledWith({ name: 'Wound care', category: 'Sau phẫu thuật', status: 'ACTIVE' })
    )
  })

  it('opens a legacy long category as its short group and saves the short value', async () => {
    const legacy = { ...elderCare, category: 'Chăm sóc sau tai biến & đột quỵ' }
    vi.mocked(fetchCatalogItems).mockResolvedValue([legacy])
    vi.mocked(saveCatalog).mockResolvedValue(legacy)
    renderPage()

    expect(await within(await screen.findByRole('table')).findByText('Phục hồi chức năng')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: `Chỉnh sửa dịch vụ: ${legacy.name}` }))
    const dialog = screen.getByRole('dialog', { name: 'Chỉnh sửa dịch vụ chuẩn' })
    expect(within(dialog).getByLabelText(/Danh mục/)).toHaveValue('Phục hồi chức năng')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() =>
      expect(saveCatalog).toHaveBeenCalledWith('item-1', expect.objectContaining({ category: 'Phục hồi chức năng' }))
    )
  })

  it('asks for one of the six categories when a stored value is outside them', async () => {
    const custom = { ...elderCare, category: 'Dinh dưỡng' }
    vi.mocked(fetchCatalogItems).mockResolvedValue([custom])
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: `Chỉnh sửa dịch vụ: ${custom.name}` }))
    const dialog = screen.getByRole('dialog', { name: 'Chỉnh sửa dịch vụ chuẩn' })
    const category = within(dialog).getByLabelText(/Danh mục/)
    expect(category).toHaveValue('Dinh dưỡng')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }))
    expect(category).toHaveAccessibleDescription(/Danh mục cũ không còn dùng/)
    expect(saveCatalog).not.toHaveBeenCalled()
  })

  it('edits and deletes an existing service', async () => {
    vi.mocked(saveCatalog).mockResolvedValue(elderCare)
    vi.mocked(removeCatalog).mockResolvedValue()
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: `Chỉnh sửa dịch vụ: ${elderCare.name}` }))
    const dialog = screen.getByRole('dialog', { name: 'Chỉnh sửa dịch vụ chuẩn' })
    expect(within(dialog).getByLabelText(/Tên dịch vụ/)).toHaveValue(elderCare.name)
    fireEvent.change(within(dialog).getByLabelText(/Mô tả/), { target: { value: 'Tắm rửa, ăn uống' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }))
    await waitFor(() =>
      expect(saveCatalog).toHaveBeenCalledWith('item-1', {
        name: elderCare.name,
        category: elderCare.category,
        description: 'Tắm rửa, ăn uống',
        status: 'ACTIVE'
      })
    )

    fireEvent.click(screen.getByRole('button', { name: `Xóa dịch vụ: ${elderCare.name}` }))
    const confirm = screen.getByRole('alertdialog', { name: 'Xóa dịch vụ chuẩn?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Xóa dịch vụ' }))
    await waitFor(() => expect(removeCatalog).toHaveBeenCalledWith('item-1'))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })

  it('shows read-only center price plans for the selected center', async () => {
    vi.mocked(fetchCenters).mockResolvedValue({
      items: [{ id: 'center-1', centerName: 'Care One', centerStatus: 'ACTIVE', version: 0 }],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(fetchCenterOfferings).mockResolvedValue([
      { id: 'offering-1', centerId: 'center-1', catalogItem: elderCare, status: 'ACTIVE' }
    ])
    vi.mocked(fetchPricePlans).mockResolvedValue([
      {
        id: 'plan-1',
        centerOfferingId: 'offering-1',
        planName: 'Ca 4 giờ',
        pricingUnit: 'SHIFT',
        durationMinutes: 240,
        basePrice: 350000,
        isActive: true
      }
    ])
    renderPage()

    fireEvent.click(screen.getByRole('tab', { name: 'Bảng giá theo trung tâm' }))
    expect(screen.getByText('Chọn một trung tâm để xem dịch vụ và bảng giá đang áp dụng.')).toBeInTheDocument()
    await screen.findByRole('option', { name: 'Care One' })
    fireEvent.change(screen.getByLabelText('Trung tâm'), { target: { value: 'center-1' } })

    expect(await screen.findByText('Ca 4 giờ')).toBeInTheDocument()
    expect(screen.getByText(/350\.000/)).toBeInTheDocument()
    expect(fetchCenterOfferings).toHaveBeenCalledWith('center-1')
    expect(screen.getByTestId('location')).toHaveTextContent('tab=center&center=center-1')
    expect(screen.queryByRole('button', { name: /Chỉnh sửa dịch vụ/ })).not.toBeInTheDocument()
  })

  it('translates the page', async () => {
    renderPage()
    await screen.findByRole('table')
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Services')
    expect(screen.getByRole('tab', { name: 'Platform master catalog' })).toHaveAttribute('aria-selected', 'true')
  })
})
