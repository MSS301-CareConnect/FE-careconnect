import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createOffering,
  createOfferingPricePlan,
  fetchCatalogItems,
  fetchCenterOfferings,
  fetchPricePlans,
  removeOffering,
  removePricePlan,
  saveOffering,
  saveOfferingPricePlan,
  saveOfferingPricePlans
} from '~/entities/care-catalog/care-catalog-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { PricePlanRecord } from '~/shared/api/generated/contracts'
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
  saveOfferingPricePlan: vi.fn(),
  saveOfferingPricePlans: vi.fn(),
  removeOffering: vi.fn(),
  removePricePlan: vi.fn()
}))

const catalogItem = { id: 'item-1', name: 'Home care', category: 'Elder care', status: 'ACTIVE' as const }
const offering = { id: 'offering-1', centerId: 'center-1', catalogItem, status: 'ACTIVE' as const, version: 2 }
const hourly: PricePlanRecord = {
  id: 'plan-1',
  centerOfferingId: 'offering-1',
  planName: 'Hourly',
  pricingUnit: 'HOUR',
  durationMinutes: 60,
  basePrice: 100000,
  discountPercent: 0,
  finalPrice: 100000,
  isActive: true,
  version: 4
}
const shift: PricePlanRecord = {
  id: 'plan-2',
  centerOfferingId: 'offering-1',
  planName: 'Four-hour shift',
  pricingUnit: 'SHIFT',
  durationMinutes: 240,
  basePrice: 400000,
  discountPercent: 15,
  finalPrice: 340000,
  isActive: true,
  version: 1
}

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
  vi.mocked(createOfferingPricePlan).mockReset().mockResolvedValue(hourly)
  vi.mocked(saveOffering).mockReset().mockResolvedValue(offering)
  vi.mocked(saveOfferingPricePlan).mockReset().mockResolvedValue(hourly)
  vi.mocked(saveOfferingPricePlans).mockReset().mockResolvedValue([hourly, shift])
  vi.mocked(removeOffering).mockReset().mockResolvedValue(undefined)
  vi.mocked(removePricePlan).mockReset().mockResolvedValue(undefined)
  await setAppLanguage('en', false)
})

describe('Center Manager services and pricing', () => {
  it('creates a service together with several price plans in one request', async () => {
    renderPage()
    expect(
      await screen.findByText('Your center has no services yet. Add one from the master catalog to begin.')
    ).toBeInTheDocument()
    expect(fetchCenterOfferings).toHaveBeenCalledWith('center-1')
    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))
    const dialog = screen.getByRole('dialog', { name: 'Add a center service' })
    await within(dialog).findByRole('option', { name: 'Home care · Elder care' })
    fireEvent.change(within(dialog).getByLabelText('Master catalog service'), { target: { value: 'item-1' } })

    // The dialog starts with an hourly plan whose duration is fixed at one hour.
    expect(within(dialog).getByText('1 hour = 60 minutes (fixed)')).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Base price (VND)'), { target: { value: '120000' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add per shift plan' }))
    const prices = within(dialog).getAllByLabelText('Base price (VND)')
    fireEvent.change(prices[1], { target: { value: '400.000' } })
    fireEvent.change(within(dialog).getByLabelText('Shift length (hours)'), { target: { value: '4,5' } })
    expect(within(dialog).getByText('= 270 minutes')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: '8 hours' }))
    expect(within(dialog).getByText('= 480 minutes')).toBeInTheDocument()
    fireEvent.change(within(dialog).getAllByLabelText('Discount (%)')[1], { target: { value: '25' } })
    expect(within(dialog).getByText('Saves ₫100,000')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(createOffering).toHaveBeenCalledWith({
        catalogItemId: 'item-1',
        centerId: 'center-1',
        description: undefined,
        status: 'ACTIVE',
        pricePlans: [
          {
            planName: 'Hourly',
            pricingUnit: 'HOUR',
            durationMinutes: 60,
            basePrice: 120000,
            discountPercent: 0,
            isActive: true
          },
          {
            planName: '4-hour shift',
            pricingUnit: 'SHIFT',
            durationMinutes: 480,
            basePrice: 400000,
            discountPercent: 25,
            isActive: true
          }
        ]
      })
    )
  })

  it('blocks a new service whose plan has no price and can create a service without plans', async () => {
    renderPage()
    await screen.findByText('Your center has no services yet. Add one from the master catalog to begin.')
    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))
    const dialog = screen.getByRole('dialog', { name: 'Add a center service' })
    await within(dialog).findByRole('option', { name: 'Home care · Elder care' })
    fireEvent.change(within(dialog).getByLabelText('Master catalog service'), { target: { value: 'item-1' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }))

    expect(await within(dialog).findByText('Enter a non-negative base price.')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Base price (VND)')).toHaveAttribute('aria-invalid', 'true')
    expect(createOffering).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Remove plan 1' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(createOffering).toHaveBeenCalledWith({
        catalogItemId: 'item-1',
        centerId: 'center-1',
        description: undefined,
        status: 'ACTIVE',
        pricePlans: undefined
      })
    )
  })

  it('adds a discounted plan and previews what the customer pays', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    renderPage()
    await screen.findByText('No price plans for this service yet.')
    fireEvent.click(screen.getByRole('button', { name: 'Add price plan' }))
    const dialog = screen.getByRole('dialog', { name: 'Add price plan' })
    fireEvent.change(within(dialog).getByLabelText('Plan name'), { target: { value: 'Full day' } })
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Daily' }))
    expect(within(dialog).getByLabelText('Working hours in the day')).toHaveValue('8')
    fireEvent.change(within(dialog).getByLabelText('Working hours in the day'), { target: { value: '10' } })
    fireEvent.change(within(dialog).getByLabelText('Base price (VND)'), { target: { value: '1000000' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '10%' }))
    expect(within(dialog).getByText('₫900,000')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(createOfferingPricePlan).toHaveBeenCalledWith({
        centerOfferingId: 'offering-1',
        planName: 'Full day',
        pricingUnit: 'DAY',
        durationMinutes: 600,
        basePrice: 1000000,
        discountPercent: 10,
        isActive: true
      })
    )
  })

  it('explains a price plan error without exposing the backend code', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(createOfferingPricePlan).mockRejectedValue({ status: 400, info: { code: 4101 } })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Add price plan' }))
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Four hours' } })
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '400000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('The system did not accept this price plan.')
    expect(screen.getByRole('alert')).not.toHaveTextContent('4101')
  })

  it('names the field a backend validation code points at', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(createOfferingPricePlan).mockRejectedValue({ status: 400, info: { code: 3307 } })
    renderPage()
    await screen.findByText('No price plans for this service yet.')
    fireEvent.click(screen.getByRole('button', { name: 'Add price plan' }))
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Hourly' } })
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '100000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Discount must be a whole number from 0 to 90.')
  })

  it('rejects a day or shift longer than 24 hours before sending', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    renderPage()
    await screen.findByText('No price plans for this service yet.')
    fireEvent.click(screen.getByRole('button', { name: 'Add price plan' }))
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Long shift' } })
    fireEvent.click(screen.getByRole('radio', { name: 'Per shift' }))
    fireEvent.change(screen.getByLabelText('Shift length (hours)'), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '100000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Enter hours above 0 and at most 24.')).toBeInTheDocument()
    expect(createOfferingPricePlan).not.toHaveBeenCalled()
  })

  it('shows list and discounted prices, then edits several plans in one save', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([{ ...offering, pricePlans: [hourly, shift] }])
    vi.mocked(fetchPricePlans).mockResolvedValue([hourly, shift])
    renderPage()

    const table = await screen.findByRole('table')
    expect(within(table).getByText('−15%')).toBeInTheDocument()
    expect(within(table).getByText('₫340,000')).toBeInTheDocument()
    expect(screen.getByText('2 price plans · from ₫100,000')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit several plans' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all plans' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Discount for the selected plans (%)' }), {
      target: { value: '20' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply discount' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'List price · Hourly' }), { target: { value: '110000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save 2 changes' }))

    await waitFor(() =>
      expect(saveOfferingPricePlans).toHaveBeenCalledWith({
        items: [
          {
            id: 'plan-1',
            plan: {
              centerOfferingId: 'offering-1',
              planName: 'Hourly',
              pricingUnit: 'HOUR',
              durationMinutes: 60,
              basePrice: 110000,
              discountPercent: 20,
              isActive: true,
              version: 4
            }
          },
          {
            id: 'plan-2',
            plan: {
              centerOfferingId: 'offering-1',
              planName: 'Four-hour shift',
              pricingUnit: 'SHIFT',
              durationMinutes: 240,
              basePrice: 400000,
              discountPercent: 20,
              isActive: true,
              version: 1
            }
          }
        ]
      })
    )
  })

  it('shows the missing-center state without requesting another center’s data', () => {
    renderPage('')
    expect(screen.getByRole('alert')).toHaveTextContent('Your account has no assigned center.')
    expect(fetchCenterOfferings).not.toHaveBeenCalled()
  })

  it('updates the selected offering and one existing price plan with their versions', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(fetchPricePlans).mockResolvedValue([hourly])
    renderPage()

    expect(await screen.findByRole('table')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit service' }))
    fireEvent.change(screen.getByLabelText('Center-specific description'), { target: { value: 'Home visits' } })
    fireEvent.click(screen.getByRole('radio', { name: 'Paused' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() =>
      expect(saveOffering).toHaveBeenCalledWith('offering-1', {
        catalogItemId: 'item-1',
        centerId: 'center-1',
        description: 'Home visits',
        status: 'INACTIVE',
        version: 2
      })
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Edit plan Hourly' }))
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '120000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() =>
      expect(saveOfferingPricePlan).toHaveBeenCalledWith('plan-1', {
        centerOfferingId: 'offering-1',
        planName: 'Hourly',
        pricingUnit: 'HOUR',
        durationMinutes: 60,
        basePrice: 120000,
        discountPercent: 0,
        isActive: true,
        version: 4
      })
    )
  })

  it('deletes a plan after confirmation and warns when it is the last active one', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(fetchPricePlans).mockResolvedValue([hourly])
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Delete plan Hourly' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete plan Hourly?' })
    expect(within(dialog).getByText(/This is the last active plan/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete plan' }))
    await waitFor(() => expect(removePricePlan).toHaveBeenCalledWith('plan-1'))
  })

  it('explains why a service with an active plan cannot be deleted', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(fetchPricePlans).mockResolvedValue([hourly])
    renderPage()
    await screen.findByRole('table')
    fireEvent.click(screen.getByRole('button', { name: 'Delete service' }))
    const blocked = screen.getByRole('dialog', { name: 'Delete Home care?' })
    expect(within(blocked).getByRole('alert')).toHaveTextContent('still has 1 active price plan')
    expect(within(blocked).queryByRole('button', { name: 'Delete service' })).not.toBeInTheDocument()
  })

  it('deletes a service whose plans are all paused', async () => {
    vi.mocked(fetchCenterOfferings).mockResolvedValue([offering])
    vi.mocked(fetchPricePlans).mockResolvedValue([{ ...hourly, isActive: false }])
    renderPage()
    await screen.findByRole('table')
    fireEvent.click(screen.getByRole('button', { name: 'Delete service' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete Home care?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete service' }))
    await waitFor(() => expect(removeOffering).toHaveBeenCalledWith('offering-1'))
  })
})
