import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMyCaregiverProfile, fetchProviderMedia } from '~/entities/provider/provider-api'
import { AdminLayout } from '~/features/admin/layout/admin-layout'
import { CenterManagerLayout } from '~/features/center-manager/layout/center-manager-layout'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AuthUserContext } from './auth-user-context'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchMyCaregiverProfile: vi.fn(),
  fetchProviderMedia: vi.fn()
}))

beforeEach(async () => {
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

describe('Portal account menus', () => {
  it.each([
    // 2026-11-10: the admin has its own profile page (information + security) inside the admin shell.
    { role: 'ADMIN', path: '/admin/dashboard', layout: AdminLayout, security: '/admin/profile?tab=security' },
    {
      role: 'CENTER_MANAGER',
      path: '/center-manager/caregivers',
      layout: CenterManagerLayout,
      security: '/account/security'
    }
  ])('places account actions under the $role avatar', ({ role, path, layout: Layout, security }) => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AuthUserContext value={{ id: 'user-1', fullName: 'Test User', roles: [role], status: 'ACTIVE' }}>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route element={<Layout />} path={path}>
                <Route index element={<div />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthUserContext>
      </QueryClientProvider>
    )
    const button = screen.getByRole('button', { name: 'Account menu' })
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
    fireEvent.click(button)
    const menu = screen.getByRole('navigation', { name: 'Account menu' })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(within(menu).getByRole('link', { name: 'Account security' })).toHaveAttribute('href', security)
    if (role === 'ADMIN') {
      expect(within(menu).getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/admin/profile')
    }
    expect(within(menu).getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })
})
