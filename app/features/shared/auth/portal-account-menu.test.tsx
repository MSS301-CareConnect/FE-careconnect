import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { AdminLayout } from '~/features/admin/layout/admin-layout'
import { CaregiverLayout } from '~/features/caregiver/layout/caregiver-layout'
import { CenterManagerLayout } from '~/features/center-manager/layout/center-manager-layout'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AuthUserContext } from './auth-user-context'

beforeEach(async () => {
  await setAppLanguage('en', false)
})

describe('Portal account menus', () => {
  it.each([
    { role: 'ADMIN', path: '/admin/dashboard', layout: AdminLayout },
    { role: 'CENTER_MANAGER', path: '/center-manager/caregivers', layout: CenterManagerLayout },
    { role: 'CAREGIVER', path: '/caregiver/dashboard', layout: CaregiverLayout }
  ])('places account actions under the $role avatar', ({ role, path, layout: Layout }) => {
    render(
      <AuthUserContext value={{ id: 'user-1', fullName: 'Test User', roles: [role], status: 'ACTIVE' }}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<Layout />} path={path}>
              <Route index element={<div />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthUserContext>
    )
    const button = screen.getByRole('button', { name: 'Account menu' })
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
    fireEvent.click(button)
    const menu = screen.getByRole('navigation', { name: 'Account menu' })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(within(menu).getByRole('link', { name: 'Account security' })).toHaveAttribute('href', '/account/security')
    expect(within(menu).getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })
})
