import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
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
        <Routes>
          <Route element={<CustomerProviderCatalogPage />} path='/customer/caregivers' />
          <Route element={<div data-testid='profile-route' />} path='/customer/caregivers/:caregiverId' />
        </Routes>
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
          caregiverId: 'caregiver-1',
          centerId: 'center-1',
          centerName: 'Care One',
          fullName: 'Lan Nguyen',
          experienceYears: 5,
          gender: 'FEMALE',
          ratingAverage: 4.8,
          ratingCount: 12,
          avatarUrl: 'https://example.com/lan.jpg',
          bio: 'Experienced in home care',
          verifiedCertificateCount: 2
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
    expect(screen.getByRole('link', { name: 'Open Lan Nguyen’s profile' })).toHaveAttribute(
      'href',
      '/customer/caregivers/caregiver-1'
    )
    expect(screen.queryByText('View profile')).not.toBeInTheDocument()
    expect(screen.queryByText('Caregiver')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Profile photo of Lan Nguyen' })).toHaveAttribute(
      'src',
      'https://example.com/lan.jpg'
    )
    expect(screen.queryByText('Experienced in home care')).not.toBeInTheDocument()
    expect(screen.queryByText('About')).not.toBeInTheDocument()
    expect(screen.getByText(/4.8.*12 reviews/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Grid view' }))
    expect(screen.getByRole('link', { name: 'Open Lan Nguyen’s profile' })).toContainElement(
      screen.getByRole('img', { name: 'Profile photo of Lan Nguyen' })
    )
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search caregivers by name…' }), {
      target: { value: 'Lan' }
    })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(fetchCaregiverCatalog).toHaveBeenCalledWith({ page: 0, size: 20, keyword: 'Lan' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Gender' }), { target: { value: 'MALE' } })
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Lan Nguyen' })).not.toBeInTheDocument())
  })

  it('opens the detail route from anywhere on the caregiver card', async () => {
    vi.mocked(fetchCaregiverCatalog).mockResolvedValue({
      items: [{ caregiverId: 'caregiver-1', fullName: 'Lan Nguyen', verifiedCertificateCount: 0 }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    renderCatalog()

    const card = await screen.findByRole('link', { name: 'Open Lan Nguyen’s profile' })
    expect(card).toHaveTextContent('No reviews yet')
    fireEvent.click(screen.getByRole('heading', { name: 'Lan Nguyen' }))
    expect(screen.getByTestId('profile-route')).toBeInTheDocument()
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
