import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBookings } from '~/entities/booking/booking-api'
import { fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { selectCenter } from '~/entities/care-center/selected-center'
import { fetchCaregiverCatalog } from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { HomePage } from './home-page'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchBookings: vi.fn()
}))
vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCenterOfferings: vi.fn(),
  fetchPricePlans: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiverCatalog: vi.fn(),
  fetchPublicCenter: vi.fn(async (id: string) => ({ centerId: id, centerName: 'TT An Tâm' }))
}))

function renderHome(audience: 'public' | 'customer' = 'public') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AuthUserContext
        value={
          audience === 'customer'
            ? { id: 'u-1', fullName: 'Trần Minh Thuận', roles: ['CUSTOMER'], status: 'ACTIVE' }
            : null
        }
      >
        <MemoryRouter>
          <HomePage audience={audience} />
        </MemoryRouter>
      </AuthUserContext>
    </QueryClientProvider>
  )
}

const FUTURE = '2030-01-04T01:00:00Z'

describe('HomePage', () => {
  beforeEach(async () => {
    localStorage.clear()
    selectCenter(null)
    vi.mocked(fetchBookings).mockReset()
    vi.mocked(fetchCenterOfferings).mockReset()
    vi.mocked(fetchPricePlans).mockReset()
    vi.mocked(fetchCaregiverCatalog).mockReset().mockResolvedValue({
      items: [],
      page: 0,
      size: 12,
      totalElements: 0,
      totalPages: 0
    })
    await setAppLanguage('vi', false)
  })

  it('shows one short hero, how it works and why families trust the service', () => {
    renderHome()

    const hero = screen.getByRole('region', { name: 'An tâm chăm sóc tại nhà.' })
    expect(within(hero).getByRole('link', { name: /Tìm người chăm sóc/i })).toHaveAttribute(
      'href',
      '/customer/caregivers'
    )
    expect(within(hero).getByRole('link', { name: 'Tạo tài khoản' })).toHaveAttribute('href', '/register')
    expect(screen.getAllByRole('img', { name: /Người chăm sóc hỗ trợ/i })).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Từ lúc tìm kiếm đến khi chọn được người phù hợp' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Vì sao các gia đình chọn CareConnect' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /1900 6868/ })).toHaveAttribute('href', 'tel:19006868')
    // Guests see no customer data and trigger no customer requests.
    expect(screen.queryByRole('heading', { name: 'Lịch sắp tới' })).not.toBeInTheDocument()
    expect(fetchBookings).not.toHaveBeenCalled()
  })

  it('switches the landing content to English', async () => {
    renderHome()

    await act(() => setAppLanguage('en', false))

    expect(await screen.findByRole('heading', { name: 'Feel confident about care at home.' })).toBeInTheDocument()
  })

  it('greets a customer and shows the next visit, shortcuts and the center’s services', async () => {
    selectCenter({ id: 'center-1', name: 'TT An Tâm' })
    vi.mocked(fetchBookings).mockImplementation(async (params = {}) =>
      params.status === 'AWAITING_INITIAL_PAYMENT'
        ? { items: [], page: 0, size: 1, totalElements: 2, totalPages: 2 }
        : {
            items: [
              {
                id: 'bk-old',
                bookingCode: 'BK-OLD',
                status: 'COMPLETED',
                bookingType: 'CUSTOM',
                startDate: '2025-01-01',
                recipientName: 'Bà Lan'
              },
              {
                id: 'bk-1',
                bookingCode: 'BK-0001',
                status: 'CONFIRMED',
                bookingType: 'RECURRING',
                startDate: '2030-01-04',
                recipientName: 'Bà Lan',
                nextOccurrenceAt: FUTURE,
                completedCount: 1,
                totalCount: 6
              }
            ],
            page: 0,
            size: 20,
            totalElements: 2,
            totalPages: 1
          }
    )
    vi.mocked(fetchCenterOfferings).mockResolvedValue([
      {
        id: 'offer-1',
        centerId: 'center-1',
        status: 'ACTIVE',
        catalogItem: { id: 'svc-1', name: 'Chăm sóc người già', category: 'ELDERLY_CARE', status: 'ACTIVE' }
      }
    ])
    vi.mocked(fetchPricePlans).mockResolvedValue([
      {
        id: 'plan-1',
        centerOfferingId: 'offer-1',
        planName: 'Theo giờ',
        pricingUnit: 'HOUR',
        durationMinutes: 60,
        basePrice: 100000,
        isActive: true
      }
    ])
    renderHome('customer')

    const hero = screen.getByRole('region', { name: 'An tâm chăm sóc tại nhà.' })
    expect(within(hero).getByText('Xin chào, Thuận')).toBeInTheDocument()
    expect(within(hero).getByRole('link', { name: 'Đặt lịch chăm sóc' })).toHaveAttribute('href', '/customer/booking')
    expect(screen.queryByRole('link', { name: 'Tạo tài khoản' })).not.toBeInTheDocument()

    const upcoming = screen.getByRole('region', { name: 'Lịch sắp tới' })
    expect(await within(upcoming).findByText('Mã BK-0001')).toBeInTheDocument()
    expect(within(upcoming).getByText('08:00 · T6, 04/01/2030')).toBeInTheDocument()
    expect(within(upcoming).getByText('Đã xong 1/6 buổi')).toBeInTheDocument()
    expect(within(upcoming).getByRole('link', { name: 'Xem chi tiết' })).toHaveAttribute(
      'href',
      '/customer/bookings/bk-1'
    )

    expect(await screen.findByText('2 lịch chờ thanh toán')).toBeInTheDocument()
    expect(await screen.findByText('Từ 100.000 ₫ / giờ')).toBeInTheDocument()
    expect(screen.getByText('Người cao tuổi')).toBeInTheDocument()
  })
})
