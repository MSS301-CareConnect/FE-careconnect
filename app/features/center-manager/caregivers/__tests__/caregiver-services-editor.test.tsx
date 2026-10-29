import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCenterOfferings } from '~/entities/care-catalog/care-catalog-api'
import { fetchCaregiverServices, saveCaregiverServices } from '~/entities/provider/provider-api'
import type { CenterOfferingRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverServicesEditor } from '../components/caregiver-services-editor'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiverServices: vi.fn(),
  saveCaregiverServices: vi.fn()
}))
vi.mock('~/entities/care-catalog/care-catalog-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-catalog/care-catalog-api')>()),
  fetchCenterOfferings: vi.fn()
}))

function offering(id: string, name: string, extra: Partial<CenterOfferingRecord> = {}): CenterOfferingRecord {
  return {
    id,
    centerId: 'center-1',
    status: 'ACTIVE',
    catalogItem: { id: `item-${id}`, name, category: 'CARE', status: 'ACTIVE' },
    ...extra
  } as CenterOfferingRecord
}

function renderEditor() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <CaregiverServicesEditor caregiverId='cg-1' centerId='center-1' />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchCenterOfferings).mockResolvedValue([
    offering('cs-1', 'Feeding support'),
    offering('cs-2', 'Medication reminders'),
    offering('cs-3', 'Paused service', { status: 'INACTIVE' })
  ])
  await setAppLanguage('en', false)
})

describe('Caregiver services (PRV-01)', () => {
  it('warns that a caregiver without services cannot be booked', async () => {
    vi.mocked(fetchCaregiverServices).mockResolvedValue([])
    renderEditor()
    expect(await screen.findByText(/customers cannot book this caregiver/)).toBeInTheDocument()
  })

  it('assigns only services the center still offers and replaces the whole list', async () => {
    vi.mocked(fetchCaregiverServices).mockResolvedValue([
      { centerServiceId: 'cs-1', careServiceId: 'item-cs-1', serviceName: 'Feeding support' }
    ])
    vi.mocked(saveCaregiverServices).mockResolvedValue([])
    renderEditor()

    fireEvent.click(await screen.findByRole('button', { name: 'Edit services' }))
    expect(await screen.findByRole('checkbox', { name: 'Feeding support' })).toBeChecked()
    expect(screen.queryByRole('checkbox', { name: 'Paused service' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Medication reminders' }))
    expect(screen.getByText('2 services selected')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save services' }))

    await waitFor(() => expect(saveCaregiverServices).toHaveBeenCalledWith('cg-1', ['cs-1', 'cs-2']))
  })

  it('explains a service that is no longer offered', async () => {
    vi.mocked(fetchCaregiverServices).mockResolvedValue([])
    vi.mocked(saveCaregiverServices).mockRejectedValue(Object.assign(new Error('conflict'), { info: { code: 4208 } }))
    renderEditor()

    fireEvent.click(await screen.findByRole('button', { name: 'Edit services' }))
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Feeding support' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save services' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('A service was just withdrawn.')
  })
})
