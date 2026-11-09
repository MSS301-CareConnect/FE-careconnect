import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMyOccurrences } from '~/entities/booking/booking-api'
import { fetchMyCaregiverProfile, fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverLayout } from './caregiver-layout'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchMyCaregiverProfile: vi.fn(),
  fetchProviderMedia: vi.fn()
}))
vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchMyOccurrences: vi.fn()
}))
vi.mock('./components/caregiver-notification-bell', () => ({ CaregiverNotificationBell: () => null }))

function CurrentLocation() {
  const location = useLocation()
  return <output data-testid='location'>{`${location.pathname}${location.search}`}</output>
}

function renderCaregiver(path = '/caregiver/schedule') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const page = (
    <>
      <div />
      <CurrentLocation />
    </>
  )
  const router = createMemoryRouter(
    [
      {
        path: '/caregiver',
        element: <CaregiverLayout />,
        children: ['today', 'visits', 'schedule', 'work-shifts', 'profile'].map((child) => ({
          path: child,
          element: page
        }))
      }
    ],
    { initialEntries: [path] }
  )
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthUserContext
        value={{ id: 'caregiver-1', fullName: 'Test Caregiver', roles: ['CAREGIVER'], status: 'ACTIVE' }}
      >
        <RouterProvider router={router} />
      </AuthUserContext>
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

describe('Caregiver shell', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.mocked(fetchMyCaregiverProfile).mockResolvedValue({
      id: 'profile-1',
      centerId: 'center-1',
      fullName: 'Test Caregiver',
      caregiverStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      version: 1
    })
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    vi.mocked(fetchMyOccurrences).mockResolvedValue({ items: [], page: 0, size: 100, totalElements: 3, totalPages: 1 })
    await setAppLanguage('en', false)
  })

  it('marks the work schedule section for every schedule route and badges visits to accept', async () => {
    renderCaregiver('/caregiver/work-shifts')
    const sidebar = screen.getByRole('navigation', { name: 'Caregiver navigation' })
    expect(within(sidebar).getByRole('link', { name: 'Work schedule' })).toHaveAttribute('aria-current', 'page')
    const bottom = screen.getByRole('navigation', { name: 'Main sections' })
    expect(within(bottom).getByRole('link', { name: /Work schedule/ })).toHaveAttribute('aria-current', 'page')
    // Visits to confirm and booking requests share one "needs your answer" badge on Care visits.
    expect(await within(sidebar).findByLabelText(/need your answer/)).toBeInTheDocument()
    expect(fetchMyOccurrences).toHaveBeenCalledWith(expect.objectContaining({ status: 'SCHEDULED' }))
  })

  it('collapses the desktop sidebar to an icon rail', () => {
    renderCaregiver()
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    const sidebar = screen.getByRole('navigation', { name: 'Caregiver navigation' })
    expect(within(sidebar).getByRole('link', { name: 'Today' })).toHaveAttribute('aria-label', 'Today')
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the profile photo and opens profile and security from the account menu', async () => {
    const { queryClient } = renderCaregiver()
    await waitFor(() => expect(fetchProviderMedia).toHaveBeenCalledWith('CAREGIVER_PROFILE', 'profile-1'))
    vi.mocked(fetchProviderMedia).mockResolvedValueOnce([
      {
        mediaFileId: 'image-1',
        mediaFileType: 'IMAGE',
        contentType: 'image/png',
        downloadUrl: 'https://example.com/a.png'
      }
    ])
    await queryClient.invalidateQueries({ queryKey: providerKeys.media('CAREGIVER_PROFILE', 'profile-1') })
    const button = screen.getByRole('button', { name: 'Account menu' })
    await waitFor(() => expect(button.querySelector('img')).toHaveAttribute('src', 'https://example.com/a.png'))

    fireEvent.click(button)
    const menu = screen.getByRole('navigation', { name: 'Account menu' })
    expect(within(menu).getByRole('link', { name: 'Security' })).toHaveAttribute(
      'href',
      '/caregiver/profile?tab=security'
    )
    expect(within(menu).getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    fireEvent.click(within(menu).getByRole('link', { name: 'Profile' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/caregiver/profile')
    expect(screen.getByRole('button', { name: 'Account menu' })).toHaveAttribute('aria-expanded', 'false')
  })
})
