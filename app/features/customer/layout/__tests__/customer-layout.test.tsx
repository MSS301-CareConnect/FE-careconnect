import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerLayout } from '../customer-layout'

describe('CustomerLayout', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders navigation header with brand and customer links', () => {
    const outletText = 'Customer Content'

    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route element={<CustomerLayout />}>
            <Route path='/customer' element={<div>{outletText}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText('CareConnect')[0]).toBeInTheDocument()
    expect(screen.getByText('Tìm người chăm sóc')).toBeInTheDocument()
    expect(screen.getByText('Lịch đặt của tôi')).toBeInTheDocument()
    expect(screen.getByText('Hồ sơ người thân')).toBeInTheDocument()
    expect(screen.getByText('Customer Content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lịch đặt của tôi' })).toHaveAttribute('href', '/customer/bookings')
    expect(screen.getByText('Chính sách bảo mật')).toBeInTheDocument()

    const avatarLink = screen.getByRole('link', { name: /Hồ sơ của tôi/i })
    expect(avatarLink).toHaveAttribute('href', '/customer/my-profile')
  })

  it('opens the customer menu with a bookings link on small screens', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route element={<CustomerLayout />}>
            <Route path='/customer' element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const menuButton = screen.getByRole('button', { name: 'Menu khách hàng' })
    fireEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Menu khách hàng' })).toContainElement(
      screen.getAllByRole('link', { name: 'Lịch đặt của tôi' })[1]
    )
  })
})
