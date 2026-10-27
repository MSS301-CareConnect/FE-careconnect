import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCenterOffering, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { fetchPublicCenter, searchCaregiversByService } from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerServiceDetailPage } from '../service-detail-page'

vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCenterOffering: vi.fn(),
  fetchPricePlans: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCenter: vi.fn(),
  searchCaregiversByService: vi.fn()
}))

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/customer/services/offer-1']}>
        <Routes>
          <Route element={<CustomerServiceDetailPage />} path='/customer/services/:offeringId' />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const offering = {
  id: 'offer-1',
  centerId: 'center-1',
  status: 'ACTIVE' as const,
  description: 'Certified nurses, hourly or live-in.',
  catalogItem: {
    id: 'svc-1',
    name: 'Elderly care at home',
    description: 'Meals, hygiene and medication reminders.',
    category: 'ELDERLY_CARE',
    status: 'ACTIVE' as const
  }
}

beforeEach(async () => {
  vi.mocked(fetchCenterOffering).mockReset().mockResolvedValue(offering)
  vi.mocked(fetchPricePlans)
    .mockReset()
    .mockResolvedValue([
      {
        id: 'plan-2',
        centerOfferingId: 'offer-1',
        planName: '8-hour shift',
        pricingUnit: 'SHIFT',
        durationMinutes: 480,
        basePrice: 600000
      },
      {
        id: 'plan-1',
        centerOfferingId: 'offer-1',
        planName: 'Hourly',
        pricingUnit: 'HOUR',
        durationMinutes: 60,
        basePrice: 90000
      },
      {
        id: 'plan-3',
        centerOfferingId: 'offer-1',
        planName: 'Retired plan',
        pricingUnit: 'DAY',
        durationMinutes: 1440,
        basePrice: 1,
        isActive: false
      }
    ])
  vi.mocked(fetchPublicCenter)
    .mockReset()
    .mockResolvedValue({ centerId: 'center-1', centerName: 'Care One', address: '1 Main St', phoneNumber: '0900' })
  vi.mocked(searchCaregiversByService)
    .mockReset()
    .mockResolvedValue({
      items: [{ caregiverId: 'cg-1', fullName: 'Lan Nguyen', experienceYears: 12, verifiedCertificateCount: 2 }],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1
    })
  await setAppLanguage('en', false)
})

describe('Customer service detail', () => {
  it('shows the offering, its active plans, the center and its caregivers', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Elderly care at home' })).toBeInTheDocument()
    expect(fetchCenterOffering).toHaveBeenCalledWith('offer-1')
    expect(screen.getByText('Meals, hygiene and medication reminders.')).toBeInTheDocument()
    expect(screen.getByText('Certified nurses, hourly or live-in.')).toBeInTheDocument()

    const plans = await screen.findByRole('list', { name: 'Price plans' })
    const names = within(plans)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(names).toHaveLength(2)
    expect(names[0]).toContain('Hourly')
    expect(names[1]).toContain('8-hour shift')

    expect(await screen.findByRole('heading', { name: 'Lan Nguyen' })).toBeInTheDocument()
    expect(searchCaregiversByService).toHaveBeenCalledWith({
      centerId: 'center-1',
      careServiceIds: ['svc-1'],
      page: 0,
      size: 6
    })
    expect(screen.getByRole('link', { name: 'View profile' })).toHaveAttribute('href', '/customer/caregivers/cg-1')

    const aside = screen.getByRole('complementary')
    expect(await within(aside).findByText('Care One')).toBeInTheDocument()
    expect(within(aside).getByText('1 Main St')).toBeInTheDocument()
    expect(within(aside).getByRole('link', { name: 'Book this service' })).toHaveAttribute(
      'href',
      '/customer/booking?center=center-1&service=svc-1'
    )
  })

  it('treats missing plans and caregivers as empty, not as failures', async () => {
    vi.mocked(fetchPricePlans).mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 }))
    vi.mocked(searchCaregiversByService).mockResolvedValue({
      items: [],
      page: 0,
      size: 6,
      totalElements: 0,
      totalPages: 0
    })
    renderPage()

    expect(
      await screen.findByText('The center has not published price plans for this service yet.')
    ).toBeInTheDocument()
    expect(await screen.findByText(/No caregiver has registered for this service yet/)).toBeInTheDocument()
    expect(screen.getByText('Contact us for a quote')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('reports an offering that is no longer available', async () => {
    vi.mocked(fetchCenterOffering).mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 }))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Service details could not be loaded.')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(searchCaregiversByService).not.toHaveBeenCalled()
  })
})
