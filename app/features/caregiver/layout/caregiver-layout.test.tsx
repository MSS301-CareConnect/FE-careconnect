import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMyCaregiverProfile, fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverLayout } from './caregiver-layout'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchMyCaregiverProfile: vi.fn(),
  fetchProviderMedia: vi.fn()
}))

function CurrentLocation() {
  return <output data-testid='location'>{useLocation().pathname}</output>
}

function renderCaregiver(path = '/caregiver/schedule') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthUserContext
        value={{ id: 'caregiver-1', fullName: 'Test Caregiver', roles: ['CAREGIVER'], status: 'ACTIVE' }}
      >
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<CaregiverLayout />} path='/caregiver'>
              <Route element={<div />} path='visits' />
              <Route element={<div />} path='schedule' />
              <Route element={<div />} path='profile' />
            </Route>
          </Routes>
          <CurrentLocation />
        </MemoryRouter>
      </AuthUserContext>
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

describe('Caregiver sidebar layout', () => {
  beforeEach(async () => {
    vi.mocked(fetchMyCaregiverProfile).mockReset()
    vi.mocked(fetchProviderMedia).mockReset()
    vi.mocked(fetchMyCaregiverProfile).mockResolvedValue({
      id: 'profile-1',
      centerId: 'center-1',
      fullName: 'Test Caregiver',
      caregiverStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      version: 1
    })
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    await setAppLanguage('en', false)
  })

  it('shows the uploaded profile image in the account menu and refreshes it after media changes', async () => {
    const { queryClient } = renderCaregiver()
    const button = screen.getByRole('button', { name: 'Account menu' })
    await waitFor(() => expect(fetchProviderMedia).toHaveBeenCalledWith('CAREGIVER_PROFILE', 'profile-1'))
    expect(button.querySelector('img')).not.toBeInTheDocument()

    vi.mocked(fetchProviderMedia).mockResolvedValueOnce([
      {
        mediaFileId: 'image-1',
        mediaFileType: 'IMAGE',
        contentType: 'image/png',
        downloadUrl: 'https://example.com/avatar.png'
      }
    ])
    await queryClient.invalidateQueries({ queryKey: providerKeys.media('CAREGIVER_PROFILE', 'profile-1') })
    await waitFor(() => expect(button.querySelector('img')).toHaveAttribute('src', 'https://example.com/avatar.png'))
  })

  it('shows the active sidebar destination and opens the personal profile from the avatar', () => {
    renderCaregiver()
    const navigation = screen.getByRole('navigation', { name: 'Caregiver navigation' })
    expect(document.getElementById('caregiver-sidebar')).toHaveClass('lg:translate-x-0')
    expect(within(navigation).getByRole('link', { name: 'Availability' })).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    const accountMenu = screen.getByRole('navigation', { name: 'Account menu' })
    const profile = within(accountMenu).getByRole('link', { name: 'My profile' })
    expect(profile).toHaveAttribute('href', '/caregiver/profile')
    fireEvent.click(profile)
    expect(screen.getByTestId('location')).toHaveTextContent('/caregiver/profile')
    expect(screen.getByRole('button', { name: 'Account menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the mobile sidebar and closes it on Escape and navigation', () => {
    renderCaregiver()
    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton).toHaveAttribute('aria-controls', 'caregiver-sidebar')
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(menuButton)
    const navigation = screen.getByRole('navigation', { name: 'Caregiver navigation' })
    fireEvent.click(within(navigation).getByRole('link', { name: 'Assigned visits' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/caregiver/visits')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
