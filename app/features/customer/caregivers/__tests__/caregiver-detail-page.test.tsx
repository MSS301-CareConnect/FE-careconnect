import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchPublicCaregiver } from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerCaregiverDetailPage } from '../caregiver-detail-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCaregiver: vi.fn()
}))

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/customer/caregivers/cg-1']}>
        <Routes>
          <Route element={<CustomerCaregiverDetailPage />} path='/customer/caregivers/:caregiverId' />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchPublicCaregiver).mockReset()
  await setAppLanguage('en', false)
})

describe('Customer caregiver profile', () => {
  it('shows the public profile with services, certificates and a booking link', async () => {
    vi.mocked(fetchPublicCaregiver).mockResolvedValue({
      caregiverId: 'cg-1',
      centerId: 'center-1',
      centerName: 'Care One',
      fullName: 'Lan Nguyen',
      gender: 'FEMALE',
      experienceYears: 12,
      bio: 'Twelve years of hospital nursing.',
      ratingAverage: 4.85,
      ratingCount: 46,
      services: [{ careServiceId: 'svc-1', serviceName: 'Elderly care at home' }],
      certificates: [{ certificateName: 'First aid', issuedBy: 'Red Cross', issuedDate: '2025-03-10' }]
    })
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Lan Nguyen' })).toBeInTheDocument()
    expect(fetchPublicCaregiver).toHaveBeenCalledWith('cg-1')
    expect(screen.getByText('Twelve years of hospital nursing.')).toBeInTheDocument()
    expect(screen.getByText('12 years of experience')).toBeInTheDocument()
    expect(screen.getByText('Elderly care at home')).toBeInTheDocument()
    expect(screen.getByText('First aid')).toBeInTheDocument()
    expect(screen.getByText('Issued by Red Cross')).toBeInTheDocument()
    const booking = screen.getByRole('complementary')
    expect(within(booking).getByRole('link', { name: 'Book this caregiver' })).toHaveAttribute(
      'href',
      '/customer/booking?caregiver=cg-1&center=center-1'
    )
  })

  it('keeps empty sections explicit', async () => {
    vi.mocked(fetchPublicCaregiver).mockResolvedValue({ caregiverId: 'cg-1', fullName: 'Lan Nguyen' })
    renderPage()

    expect(await screen.findByText('This caregiver has not added an introduction yet.')).toBeInTheDocument()
    expect(screen.getByText('This caregiver has not registered any services yet.')).toBeInTheDocument()
    expect(screen.getByText('No verified certificates yet.')).toBeInTheDocument()
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
  })

  it('reports a profile that cannot be loaded and retries', async () => {
    vi.mocked(fetchPublicCaregiver).mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 }))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load the caregiver profile.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(fetchPublicCaregiver).toHaveBeenCalledTimes(2)
  })
})
