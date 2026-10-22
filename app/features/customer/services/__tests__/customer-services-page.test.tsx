import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCatalogItems, fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { fetchCaregiverCatalog } from '~/entities/provider/provider-api'
import type {
  CatalogItemRecord,
  CenterOfferingRecord,
  PricePlanRecord,
  ProviderCaregiverRecord
} from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerServicesPage } from '../customer-services-page'

vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCatalogItems: vi.fn(),
  fetchCenterOfferings: vi.fn(),
  fetchPricePlans: vi.fn()
}))

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiverCatalog: vi.fn()
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

function caregiver(id: string, centerId: string, centerName: string): ProviderCaregiverRecord {
  return {
    id,
    centerId,
    centerName,
    fullName: id,
    verificationStatus: 'VERIFIED',
    caregiverStatus: 'ACTIVE',
    version: 0
  }
}

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

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}

function renderPage(path = '/customer/services') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<CustomerServicesPage />} path='/customer/services' />
        </Routes>
        <Location />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Customer care services', () => {
  beforeEach(async () => {
    vi.mocked(fetchCatalogItems).mockReset().mockResolvedValue([elderly, wound, newService, retired])
    vi.mocked(fetchCaregiverCatalog)
      .mockReset()
      .mockResolvedValue({
        items: [
          caregiver('cg-1', 'center-b', 'Trung tâm Bình An'),
          caregiver('cg-2', 'center-a', 'Phòng khám An Khang'),
          caregiver('cg-3', 'center-b', 'Trung tâm Bình An')
        ],
        page: 0,
        size: 100,
        totalElements: 3,
        totalPages: 1
      })
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

  it('groups active services by medical center with their cheapest active price', async () => {
    renderPage()

    expect(screen.getByText('Đang tải danh sách dịch vụ...')).toHaveAttribute('role', 'status')
    const anKhang = await screen.findByRole('region', { name: 'Phòng khám An Khang' })
    expect(within(anKhang).getByRole('heading', { name: 'Chăm sóc tại nhà' })).toBeInTheDocument()
    expect(within(anKhang).getByText(/350\.000/, { selector: 'strong.text-lg' })).toBeInTheDocument()
    expect(within(anKhang).queryByText('Gói a1-old')).not.toBeInTheDocument()
    expect(within(anKhang).queryByText('Thay băng vết mổ')).not.toBeInTheDocument()

    const regions = screen.getAllByRole('region').map((region) => region.getAttribute('aria-label'))
    expect(regions).toEqual(['Phòng khám An Khang', 'Trung tâm Bình An', 'Sắp có tại các cơ sở'])
    const upcoming = screen.getByRole('region', { name: 'Sắp có tại các cơ sở' })
    expect(within(upcoming).getByText('Tư vấn dinh dưỡng')).toBeInTheDocument()
    expect(within(upcoming).getByText('Chưa có cơ sở y tế cung cấp')).toBeInTheDocument()
    expect(screen.queryByText('Dịch vụ đã ngừng')).not.toBeInTheDocument()
    expect(fetchCaregiverCatalog).toHaveBeenCalledWith({ page: 0, size: 100 })
    expect(fetchCenterOfferings).toHaveBeenCalledTimes(2)
  })

  it('filters by medical center and sorts by price in the URL', async () => {
    renderPage()
    await screen.findByRole('region', { name: 'Phòng khám An Khang' })

    fireEvent.change(screen.getByLabelText('Cơ sở y tế'), { target: { value: 'center-b' } })
    expect(screen.getByTestId('location')).toHaveTextContent('/customer/services?center=center-b')
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Thay băng vết mổ'
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại' }))
    fireEvent.change(screen.getByLabelText('Sắp xếp'), { target: { value: 'priceAsc' } })
    expect(screen.getByTestId('location')).toHaveTextContent('/customer/services?sort=priceAsc')
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Thay băng vết mổ',
      'Chăm sóc tại nhà',
      'Tư vấn dinh dưỡng'
    ])
  })

  it('shows the empty message instead of an error when no service exists yet', async () => {
    vi.mocked(fetchCatalogItems).mockResolvedValue([])
    vi.mocked(fetchCaregiverCatalog).mockRejectedValue(new Error('no centers'))
    renderPage()

    expect(await screen.findByText('Chưa có dịch vụ nào được cập nhật.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('Một số cơ sở y tế chưa tải được dịch vụ.')).not.toBeInTheDocument()
  })

  it('treats a center without registered services as empty', async () => {
    vi.mocked(fetchCatalogItems).mockResolvedValue([])
    vi.mocked(fetchCenterOfferings).mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }))
    renderPage()

    expect(await screen.findByText('Chưa có dịch vụ nào được cập nhật.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps loaded services visible and offers a retry when one source fails', async () => {
    vi.mocked(fetchCatalogItems).mockRejectedValueOnce(new Error('unavailable'))
    renderPage()

    expect(await screen.findByRole('region', { name: 'Phòng khám An Khang' })).toBeInTheDocument()
    expect(screen.getByText('Một số cơ sở y tế chưa tải được dịch vụ.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('region', { name: 'Sắp có tại các cơ sở' })).toBeInTheDocument()
    expect(screen.queryByText('Một số cơ sở y tế chưa tải được dịch vụ.')).not.toBeInTheDocument()
  })

  it('shows a retryable error only when nothing can be loaded', async () => {
    vi.mocked(fetchCatalogItems).mockRejectedValueOnce(new Error('unavailable'))
    vi.mocked(fetchCaregiverCatalog).mockRejectedValueOnce(new Error('unavailable'))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tải danh sách dịch vụ.')
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('region', { name: 'Phòng khám An Khang' })).toBeInTheDocument()
  })

  it('translates the page', async () => {
    renderPage()
    await screen.findByRole('region', { name: 'Phòng khám An Khang' })
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Care services at medical centers')
    expect(screen.getByRole('region', { name: 'Coming soon to centers' })).toBeInTheDocument()
  })
})
