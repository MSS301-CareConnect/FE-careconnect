import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { closeCenterPicker, selectCenter } from '~/entities/care-center/selected-center'
import { fetchCaregiverCatalog } from '~/entities/provider/provider-api'
import type { ProviderCaregiverCardRecord } from '~/shared/api/generated/contracts'
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

const lan: ProviderCaregiverCardRecord = {
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

function page(items: ProviderCaregiverCardRecord[]) {
  return { items, page: 0, size: 20, totalElements: items.length, totalPages: 1 }
}

beforeEach(async () => {
  selectCenter(null)
  closeCenterPicker()
  vi.mocked(fetchCaregiverCatalog).mockReset()
  await setAppLanguage('en', false)
})

describe('Customer caregiver catalog', () => {
  it('shows a title block, a search box and caregiver cards with profile and booking actions', async () => {
    vi.mocked(fetchCaregiverCatalog).mockResolvedValue(page([lan]))
    renderCatalog()

    expect(screen.getByRole('heading', { level: 1, name: 'Caregivers' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Lan Nguyen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lan Nguyen' })).toHaveAttribute('href', '/customer/caregivers/caregiver-1')
    expect(screen.getByRole('link', { name: 'Book with Lan Nguyen' })).toHaveAttribute(
      'href',
      '/customer/booking?caregiver=caregiver-1'
    )
    expect(screen.getByRole('img', { name: 'Rated 4.8 out of 5 from 12 reviews' })).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('5 yrs experience')).toBeInTheDocument()
    // One result: no list/grid toggle and no filter chips, only the search box.
    expect(screen.queryByRole('button', { name: 'Grid view' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Gender/ })).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search caregivers by name…' }), {
      target: { value: 'Lan' }
    })
    await waitFor(() => expect(fetchCaregiverCatalog).toHaveBeenCalledWith({ page: 0, size: 20, keyword: 'Lan' }))
  })

  it('filters a longer list with gender and experience chips, each removable', async () => {
    const team = Array.from({ length: 7 }, (_, index) => ({
      ...lan,
      caregiverId: `caregiver-${index}`,
      fullName: `Caregiver ${index}`,
      gender: index === 0 ? ('MALE' as const) : ('FEMALE' as const),
      experienceYears: index
    }))
    vi.mocked(fetchCaregiverCatalog).mockResolvedValue(page(team))
    renderCatalog()
    await screen.findByRole('heading', { name: 'Caregiver 0' })

    fireEvent.click(screen.getByRole('button', { name: 'Gender' }))
    fireEvent.click(within(screen.getByRole('menu', { name: 'Gender' })).getByRole('menuitemradio', { name: 'Male' }))
    expect(screen.getAllByRole('heading', { level: 2 }).map((item) => item.textContent)).toEqual(['Caregiver 0'])
    expect(screen.getByRole('button', { name: /Gender: Male/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove filter Male' }))
    fireEvent.click(screen.getByRole('button', { name: 'Experience' }))
    fireEvent.click(screen.getByRole('menuitemradio', { name: '≥ 5 yrs' }))
    expect(screen.getAllByRole('heading', { level: 2 }).map((item) => item.textContent)).toEqual([
      'Caregiver 5',
      'Caregiver 6'
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(7)
  })

  it('opens the detail route from anywhere on the caregiver card and shows "New" without reviews', async () => {
    vi.mocked(fetchCaregiverCatalog).mockResolvedValue(
      page([{ caregiverId: 'caregiver-1', fullName: 'Lan Nguyen', verifiedCertificateCount: 0 }])
    )
    renderCatalog()

    const name = await screen.findByRole('link', { name: 'Lan Nguyen' })
    expect(name.closest('article')).toHaveTextContent('New')
    expect(name.closest('article')).not.toHaveTextContent('Verified')
    fireEvent.click(name)
    expect(screen.getByTestId('profile-route')).toBeInTheDocument()
  })

  it('shows a retryable error when the chosen center fails', async () => {
    selectCenter({ id: 'center-1', name: 'Care One' })
    vi.mocked(fetchCaregiverCatalog).mockRejectedValue(new Error('Unavailable'))
    renderCatalog()

    expect(screen.getByRole('heading', { level: 1, name: 'Caregivers' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load caregivers.')
    expect(fetchCaregiverCatalog).toHaveBeenCalledWith({ page: 0, size: 20, keyword: undefined, centerId: 'center-1' })
    expect(screen.getByRole('searchbox', { name: 'Search caregivers by name…' })).toBeInTheDocument()
  })

  it('asks for a center instead of an error while browsing every center', async () => {
    vi.mocked(fetchCaregiverCatalog).mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }))
    renderCatalog()

    expect(await screen.findByRole('heading', { name: 'Choose a center to see its care team' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('Unable to load caregivers.')).not.toBeInTheDocument()
  })
})
