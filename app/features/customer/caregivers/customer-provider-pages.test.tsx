import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { closeCenterPicker, selectCenter } from '~/entities/care-center/selected-center'
import { fetchCaregiverCatalog } from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CustomerProviderCatalogPage } from './customer-provider-pages'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiverCatalog: vi.fn(),
  fetchPublicCenter: vi.fn(async (id: string) => ({ centerId: id, centerName: 'Care One' }))
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
  selectCenter(null)
  closeCenterPicker()
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

    expect(screen.getByRole('heading', { name: 'Find the right caregiver' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Lan Nguyen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View profile' })).toHaveAttribute('href', '/customer/caregivers/user-1')
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search caregivers by name…' }), {
      target: { value: 'Lan' }
    })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(fetchCaregiverCatalog).toHaveBeenCalledWith({ page: 0, size: 20, keyword: 'Lan' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Gender' }), { target: { value: 'MALE' } })
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Lan Nguyen' })).not.toBeInTheDocument())
  })

  it('keeps the banner and filter layout when the chosen center fails', async () => {
    selectCenter({ id: 'center-1', name: 'Care One' })
    vi.mocked(fetchCaregiverCatalog).mockRejectedValue(new Error('Unavailable'))
    renderCatalog()

    expect(screen.getByRole('heading', { name: 'Find the right caregiver' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load caregivers.')
    expect(fetchCaregiverCatalog).toHaveBeenCalledWith({ page: 0, size: 20, keyword: undefined, centerId: 'center-1' })
    expect(screen.getByRole('combobox', { name: 'Gender' })).toBeInTheDocument()
  })

  it('asks for a center instead of an error while browsing every center', async () => {
    vi.mocked(fetchCaregiverCatalog).mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }))
    renderCatalog()

    expect(await screen.findByRole('heading', { name: 'Choose a center to see its care team' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('Unable to load caregivers.')).not.toBeInTheDocument()
    expect(screen.getByText(/You are viewing caregivers from every center/)).toBeInTheDocument()
  })
})
