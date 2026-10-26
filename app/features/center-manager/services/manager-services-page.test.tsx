import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createOffering,
  createOfferingPricePlan,
  fetchCatalogItems,
  fetchCenterOfferings,
  fetchPricePlans,
  saveOffering,
  saveOfferingPricePlan
} from '~/entities/care-catalog/care-catalog-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { ManagerServicesPage } from './manager-services-page'

vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCatalogItems: vi.fn(),
  fetchCenterOfferings: vi.fn(),
  fetchPricePlans: vi.fn(),
  createOffering: vi.fn(),
  createOfferingPricePlan: vi.fn(),
  saveOffering: vi.fn(),
  saveOfferingPricePlan: vi.fn()
}))

const catalogItem = { id: 'item-1', name: 'Home care', category: 'Elder care', status: 'ACTIVE' as const }
const offering = { id: 'offering-1', centerId: 'center-1', catalogItem, status: 'ACTIVE' as const }

function renderPage(centerId = 'center-1') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={{ centerId, roles: ['CENTER_MANAGER'] }}>
        <MemoryRouter>
          <ManagerServicesPage />
        </MemoryRouter>
      </AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchCatalogItems).mockReset().mockResolvedValue([catalogItem])
  vi.mocked(fetchCenterOfferings).mockReset().mockResolvedValue([])
  vi.mocked(fetchPricePlans).mockReset().mockResolvedValue([])
  vi.mocked(createOffering).mockReset().mockResolvedValue(offering)
  vi.mocked(createOfferingPricePlan).mockReset()
  vi.mocked(saveOffering).mockReset().mockResolvedValue(offering)
  vi.mocked(saveOfferingPricePlan).mockReset()
  await setAppLanguage('en', false)
})

describe('Center Manager services and pricing', () => {
  it('only reads the assigned center and adds a catalog service to it', async () => {
    renderPage()
    expect(
      await screen.findByText('Your center has no services yet. Add one from the master catalog to begin.')
    ).toBeInTheDocument()
    expect(fetchCenterOfferings).toHaveBeenCalledWith('center-1')
    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))
    await screen.findByRole('option', { name: 'Home care · Elder care' })
    fireEvent.change(screen.getByLabelText('Master catalog service'), { target: { value: 'item-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(createOffering).toHaveBeenCalledWith({
        catalogItemId: 'item-1',
        centerId: 'center-1',
        description: undefined,
        status: 'ACTIVE'
      })
    )
  })

  it('creates a price plan for the selected offering using numeric contract fields', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(createOfferingPricePlan).mockResolvedValue({
      id: 'plan-1',
      centerOfferingId: 'offering-1',
      planName: 'Four hours',
      pricingUnit: 'HOUR',
      durationMinutes: 240,
      basePrice: 400000,
      isActive: true
    })
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Price plans' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add price plan' }))
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Four hours' } })
    fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '240' } })
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '400000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(createOfferingPricePlan).toHaveBeenCalledWith({
        centerOfferingId: 'offering-1',
        planName: 'Four hours',
        pricingUnit: 'HOUR',
        durationMinutes: 240,
        basePrice: 400000,
        isActive: true
      })
    )
  })

  it('shows the backend error code when a price plan cannot be created', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(createOfferingPricePlan).mockRejectedValue({ status: 400, info: { code: 4101 } })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Add price plan' }))
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Four hours' } })
    fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '240' } })
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '400000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Enter a plan name')
    expect(screen.getByRole('alert')).toHaveTextContent('Error code: 4101')
  })

  it('shows the missing-center state without requesting another center’s data', () => {
    renderPage('')
    expect(screen.getByRole('alert')).toHaveTextContent('Your account has no assigned center.')
    expect(fetchCenterOfferings).not.toHaveBeenCalled()
  })

  it('updates the selected offering and its existing price plan', async () => {
    const plan = {
      id: 'plan-1',
      centerOfferingId: 'offering-1',
      planName: 'Four hours',
      pricingUnit: 'HOUR' as const,
      durationMinutes: 240,
      basePrice: 400000,
      isActive: true
    }
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(fetchPricePlans).mockResolvedValue([plan])
    vi.mocked(saveOfferingPricePlan).mockResolvedValue({ ...plan, basePrice: 450000 })
    renderPage()

    expect(await screen.findByText('Four hours')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit service' }))
    fireEvent.change(screen.getByLabelText('Center-specific description'), { target: { value: 'Home visits' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'INACTIVE' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() =>
      expect(saveOffering).toHaveBeenCalledWith('offering-1', {
        catalogItemId: 'item-1',
        centerId: 'center-1',
        description: 'Home visits',
        status: 'INACTIVE'
      })
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Edit price plan' }))
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '450000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() =>
      expect(saveOfferingPricePlan).toHaveBeenCalledWith('plan-1', {
        centerOfferingId: 'offering-1',
        planName: 'Four hours',
        pricingUnit: 'HOUR',
        durationMinutes: 240,
        basePrice: 450000,
        isActive: true
      })
    )
  })
})
