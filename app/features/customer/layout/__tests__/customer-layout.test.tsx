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

    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/customer')
    expect(screen.getByRole('link', { name: 'CareConnect' })).toHaveAttribute('href', '/customer')
    expect(screen.queryByRole('button', { name: 'Đăng xuất' })).not.toBeInTheDocument()
  })

  it('opens the avatar menu with profile and sign-out actions, then closes on Escape', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route element={<CustomerLayout />}>
            <Route path='/customer' element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const accountButton = screen.getByRole('button', { name: 'Menu tài khoản' })
    fireEvent.click(accountButton)
    const accountMenu = screen.getByRole('navigation', { name: 'Menu tài khoản' })
    expect(accountButton).toHaveAttribute('aria-expanded', 'true')
    expect(accountMenu).toContainElement(screen.getByRole('link', { name: 'Hồ sơ của tôi' }))
    expect(screen.getByRole('link', { name: 'Hồ sơ của tôi' })).toHaveAttribute('href', '/customer/my-profile')
    expect(accountMenu).toContainElement(screen.getByRole('button', { name: 'Đăng xuất' }))

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(accountButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: 'Menu tài khoản' })).not.toBeInTheDocument()
    expect(accountButton).toHaveFocus()
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
    expect(screen.getAllByRole('link', { name: 'Trang chủ' })[1]).toHaveAttribute('href', '/customer')
  })
})
