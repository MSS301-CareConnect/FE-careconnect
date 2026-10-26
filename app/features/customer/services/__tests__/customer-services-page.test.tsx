import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCatalogItems, fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { closeCenterPicker, selectCenter, useSelectedCenter } from '~/entities/care-center/selected-center'
import type { CatalogItemRecord, CenterOfferingRecord, PricePlanRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerServicesPage } from '../customer-services-page'

// The scope bar reads the chosen center's current name from the customer center endpoint.
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCenter: vi.fn(async (id: string) => ({
    centerId: id,
    centerName: id === 'center-a' ? 'Phòng khám An Khang' : 'Trung tâm Bình An'
  }))
}))

vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCatalogItems: vi.fn(),
  fetchCenterOfferings: vi.fn(),
  fetchPricePlans: vi.fn()
}))

const elderly: CatalogItemRecord = {
  id: 'item-1',
  name: 'Chăm sóc tại nhà',
  category: 'Người cao tuổi',
  status: 'ACTIVE'
}
const wound: CatalogItemRecord = { id: 'item-2', name: 'Thay băng vết mổ', category: 'Hậu phẫu', status: 'ACTIVE' }
const newService: CatalogItemRecord = {
  id: 'item-3',
  name: 'Tư vấn dinh dưỡng',
  category: 'Dinh dưỡng',
  status: 'ACTIVE'
}
const retired: CatalogItemRecord = { id: 'item-4', name: 'Dịch vụ đã ngừng', category: 'Khác', status: 'INACTIVE' }
const anKhang = { id: 'center-a', name: 'Phòng khám An Khang' }

function offering(
  id: string,
  centerId: string,
  catalogItem: CatalogItemRecord,
  status: CenterOfferingRecord['status'] = 'ACTIVE'
) {
  return { id, centerId, catalogItem, status } satisfies CenterOfferingRecord
}

function plan(id: string, centerOfferingId: string, basePrice: number, isActive = true): PricePlanRecord {
  return {
    id,
    centerOfferingId,
    planName: `Gói ${id}`,
    pricingUnit: 'SHIFT',
    durationMinutes: 240,
    basePrice,
    isActive
  }
}

function Probe() {
  const location = useLocation()
  const { pickerOpen } = useSelectedCenter()
  return (
    <>
      <output data-testid='location'>{location.pathname + location.search}</output>
      <output data-testid='picker'>{pickerOpen ? 'open' : 'closed'}</output>
    </>
  )
}

function renderPage(path = '/customer/services') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<CustomerServicesPage />} path='/customer/services' />
        </Routes>
        <Probe />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function serviceNames() {
  return screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
}

describe('Customer care services', () => {
  beforeEach(async () => {
    selectCenter(null)
    closeCenterPicker()
    vi.mocked(fetchCatalogItems).mockReset().mockResolvedValue([elderly, wound, newService, retired])
    vi.mocked(fetchCenterOfferings)
      .mockReset()
      .mockImplementation(async (centerId) =>
        centerId === 'center-a'
          ? [offering('off-a1', 'center-a', elderly), offering('off-a2', 'center-a', wound, 'INACTIVE')]
          : [offering('off-b1', 'center-b', wound), offering('off-b2', 'center-b', retired)]
      )
    vi.mocked(fetchPricePlans)
      .mockReset()
      .mockImplementation(async (offeringId) =>
        offeringId === 'off-a1'
          ? [
              plan('a1-day', offeringId, 900000),
              plan('a1-shift', offeringId, 350000),
              plan('a1-old', offeringId, 1, false)
            ]
          : [plan('b1', offeringId, 180000)]
      )
    await setAppLanguage('vi', false)
  })

  it('shows the platform-wide catalog without prices until a center is chosen', async () => {
    renderPage()

    expect(screen.getByText('Đang tải danh sách dịch vụ...')).toHaveAttribute('role', 'status')
    expect(await screen.findByRole('heading', { name: 'Chăm sóc tại nhà' })).toBeInTheDocument()
    expect(serviceNames()).toEqual(['Chăm sóc tại nhà', 'Thay băng vết mổ', 'Tư vấn dinh dưỡng'])
    expect(screen.getByText(/Bạn đang xem dịch vụ của tất cả trung tâm/)).toBeInTheDocument()
    expect(screen.getAllByText('Giá theo từng trung tâm')).toHaveLength(3)
    expect(screen.queryByRole('link', { name: /Đặt lịch dịch vụ này/ })).not.toBeInTheDocument()
    expect(fetchCenterOfferings).not.toHaveBeenCalled()

    fireEvent.click(screen.getAllByRole('button', { name: 'Chọn trung tâm để xem giá' })[0])
    expect(screen.getByTestId('picker')).toHaveTextContent('open')
  })

  it('shows only the chosen center services with their cheapest active price', async () => {
    selectCenter(anKhang)
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Chăm sóc tại nhà' })).toBeInTheDocument()
    expect(serviceNames()).toEqual(['Chăm sóc tại nhà'])
    expect(screen.getByText(/350\.000/, { selector: 'strong.text-lg' })).toBeInTheDocument()
    expect(screen.queryByText('Gói a1-old')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Đặt lịch dịch vụ này/ })).toHaveAttribute(
      'href',
      '/customer/booking?center=center-a&service=item-1'
    )
    expect(screen.getByText('Phòng khám An Khang', { selector: 'strong' })).toBeInTheDocument()
    expect(fetchCenterOfferings).toHaveBeenCalledExactlyOnceWith('center-a')
    expect(fetchCatalogItems).not.toHaveBeenCalled()
  })

  it('follows a center change and sorts by price in the URL', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Tư vấn dinh dưỡng' })

    act(() => selectCenter({ id: 'center-b', name: 'Trung tâm Bình An' }))
    expect(await screen.findByRole('heading', { name: 'Thay băng vết mổ' })).toBeInTheDocument()
    expect(serviceNames()).toEqual(['Thay băng vết mổ'])

    fireEvent.change(screen.getByLabelText('Sắp xếp'), { target: { value: 'priceAsc' } })
    expect(screen.getByTestId('location')).toHaveTextContent('/customer/services?sort=priceAsc')
  })

  it('asks for a center instead of reporting an error when the platform-wide list fails', async () => {
    vi.mocked(fetchCatalogItems).mockRejectedValue(Object.assign(new Error('unauthorized'), { status: 401 }))
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Chọn trung tâm để xem dịch vụ' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('Không thể tải danh sách dịch vụ.')).not.toBeInTheDocument()

    const [, reminderAction] = screen.getAllByRole('button', { name: 'Chọn trung tâm' })
    fireEvent.click(reminderAction)
    expect(screen.getByTestId('picker')).toHaveTextContent('open')
  })

  it('treats a center without registered services as empty', async () => {
    selectCenter(anKhang)
    vi.mocked(fetchCenterOfferings).mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }))
    renderPage()

    expect(await screen.findByText('Trung tâm này chưa cập nhật dịch vụ nào.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a retryable error when the chosen center cannot be loaded', async () => {
    selectCenter(anKhang)
    vi.mocked(fetchCenterOfferings).mockRejectedValueOnce(new Error('unavailable'))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tải danh sách dịch vụ.')
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('heading', { name: 'Chăm sóc tại nhà' })).toBeInTheDocument()
  })

  it('translates the page', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Chăm sóc tại nhà' })
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Care services at medical centers')
    expect(screen.getAllByText('Prices vary by center')).toHaveLength(3)
  })
})
