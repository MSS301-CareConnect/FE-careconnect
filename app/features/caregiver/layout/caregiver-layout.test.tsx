import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverLayout } from './caregiver-layout'

function CurrentLocation() {
  return <output data-testid='location'>{useLocation().pathname}</output>
}

function renderCaregiver(path = '/caregiver/schedule') {
  return render(
    <AuthUserContext value={{ id: 'caregiver-1', fullName: 'Test Caregiver', roles: ['CAREGIVER'], status: 'ACTIVE' }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<CaregiverLayout />} path='/caregiver'>
            <Route element={<div />} path='dashboard' />
            <Route element={<div />} path='schedule' />
            <Route element={<div />} path='profile' />
          </Route>
        </Routes>
        <CurrentLocation />
      </MemoryRouter>
    </AuthUserContext>
  )
}

describe('Caregiver sidebar layout', () => {
  beforeEach(async () => {
    await setAppLanguage('en', false)
  })

  it('shows the active sidebar destination and opens the personal profile from the avatar', () => {
    renderCaregiver()
    const navigation = screen.getByRole('navigation', { name: 'Caregiver navigation' })
    expect(document.getElementById('caregiver-sidebar')).toHaveClass('lg:translate-x-0')
    expect(within(navigation).getByRole('link', { name: 'Schedule' })).toHaveAttribute('aria-current', 'page')

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
    fireEvent.click(within(navigation).getByRole('link', { name: 'Home' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/caregiver/dashboard')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
