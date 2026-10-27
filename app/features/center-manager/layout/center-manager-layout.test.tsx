import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { CenterManagerLayout } from './center-manager-layout'

function Location() {
  return <output data-testid='location'>{useLocation().pathname}</output>
}

function renderManager(path = '/center-manager/services') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<CenterManagerLayout />} path='/center-manager'>
          <Route element={<div />} path='caregivers' />
          <Route element={<div />} path='bookings' />
          <Route element={<div />} path='services' />
        </Route>
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Center Manager sidebar layout', () => {
  beforeEach(async () => {
    await setAppLanguage('en', false)
  })

  it('groups all manager destinations without a topbar breadcrumb', () => {
    renderManager()
    const navigation = screen.getByRole('navigation', { name: 'Center manager menu' })
    expect(within(navigation).getByRole('list', { name: 'Care delivery' })).toBeInTheDocument()
    expect(within(navigation).getByRole('list', { name: 'Coordination' })).toBeInTheDocument()
    expect(within(navigation).getByRole('link', { name: 'Center statistics' })).toHaveAttribute(
      'href',
      '/center-manager/statistics'
    )
    expect(within(navigation).getByRole('link', { name: 'Services & pricing' })).toHaveAttribute('aria-current', 'page')
    expect(within(navigation).getByRole('link', { name: 'Caregiver management' })).toHaveAttribute(
      'href',
      '/center-manager/caregivers'
    )
    expect(within(navigation).getByRole('button', { name: 'Reviews and feedback' })).toBeDisabled()
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(document.getElementById('manager-sidebar')).toHaveClass('lg:translate-x-0')
  })

  it('opens the drawer and closes it on Escape and navigation', () => {
    renderManager()
    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton).toHaveAttribute('aria-controls', 'manager-sidebar')
    fireEvent.click(menuButton)
    expect(screen.getByRole('button', { name: 'Close menu', expanded: true })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const navigation = screen.getByRole('navigation', { name: 'Center manager menu' })
    fireEvent.click(within(navigation).getByRole('link', { name: 'Bookings and assignments' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/center-manager/bookings')
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(within(navigation).getByRole('link', { name: 'Bookings and assignments' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })
})
