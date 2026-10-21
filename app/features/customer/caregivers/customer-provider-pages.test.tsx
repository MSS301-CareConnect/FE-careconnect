import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCaregiverCatalog } from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CustomerProviderCatalogPage } from './customer-provider-pages'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiverCatalog: vi.fn()
}))

function renderCatalog() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/customer/caregivers']}>
        <CustomerProviderCatalogPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchCaregiverCatalog).mockReset()
  await setAppLanguage('en', false)
})

describe('Customer caregiver catalog', () => {
  it('keeps the search layout and shows a real caregiver profile', async () => {
    vi.mocked(fetchCaregiverCatalog).mockResolvedValue({
      items: [
        {
          id: 'caregiver-1',
          userId: 'user-1',
          centerId: 'center-1',
          centerName: 'Care One',
          fullName: 'Lan Nguyen',
          experienceYears: 5,
          gender: 'FEMALE',
          ratingAverage: 4.8,
          ratingCount: 12,
          verificationStatus: 'VERIFIED',
          caregiverStatus: 'ACTIVE',
          version: 1
        }
      ],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    renderCatalog()

    expect(screen.getByRole('heading', { name: 'Search & Book Trusted Caregivers' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Lan Nguyen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View profile' })).toHaveAttribute('href', '/customer/caregivers/user-1')
    fireEvent.change(screen.getByRole('combobox', { name: 'Gender' }), { target: { value: 'MALE' } })
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Lan Nguyen' })).not.toBeInTheDocument())
  })

  it('keeps the banner and filter layout when the gateway fails', async () => {
    vi.mocked(fetchCaregiverCatalog).mockRejectedValue(new Error('Unavailable'))
    renderCatalog()

    expect(screen.getByRole('heading', { name: 'Search & Book Trusted Caregivers' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load caregivers.')
    expect(screen.getByRole('combobox', { name: 'Gender' })).toBeInTheDocument()
  })
})
