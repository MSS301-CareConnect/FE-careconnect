import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerLayout } from '../customer-layout'

const customer = { id: 'customer-1', fullName: 'An', status: 'ACTIVE' as const, roles: ['CUSTOMER'] }

describe('CustomerLayout', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('lets guests browse caregivers and services without showing private customer links', () => {
    const outletText = 'Public services'
    render(
      <MemoryRouter initialEntries={['/customer/services']}>
        <Routes>
          <Route element={<CustomerLayout audience='public' />}>
            <Route path='/customer/services' element={<div>{outletText}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const header = within(screen.getByRole('banner'))
    expect(screen.getByText(outletText)).toBeInTheDocument()
    expect(header.getByRole('link', { name: 'Tìm người chăm sóc' })).toHaveAttribute('href', '/customer/caregivers')
    expect(header.getByRole('link', { name: 'Dịch vụ' })).toHaveAttribute('href', '/customer/services')
    expect(header.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/')
    expect(header.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login')
    expect(header.queryByRole('link', { name: 'Lịch đặt của tôi' })).not.toBeInTheDocument()
    expect(header.queryByRole('button', { name: 'Menu tài khoản' })).not.toBeInTheDocument()

    fireEvent.click(header.getByRole('button', { name: 'Menu khách hàng' }))
    expect(
      within(screen.getByRole('navigation', { name: 'Menu khách hàng' })).queryByRole('link', {
        name: 'Lịch đặt của tôi'
      })
    ).not.toBeInTheDocument()
  })

  it('renders navigation header with brand and customer links', () => {
    const outletText = 'Customer Content'

    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route
            element={
              <AuthUserContext value={customer}>
                <CustomerLayout />
              </AuthUserContext>
            }
          >
            <Route path='/customer' element={<div>{outletText}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText('CareConnect')[0]).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByText('Tìm người chăm sóc')).toBeInTheDocument()
    expect(screen.getByText('Lịch đặt của tôi')).toBeInTheDocument()
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Hồ sơ người thân' })).toBeInTheDocument()
    expect(screen.getByText('Customer Content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lịch đặt của tôi' })).toHaveAttribute('href', '/customer/bookings')
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Dịch vụ' })).toHaveAttribute(
      'href',
      '/customer/services'
    )
    expect(within(screen.getByRole('banner')).queryByRole('link', { name: 'Cách hoạt động' })).not.toBeInTheDocument()
    expect(screen.getByText(`© ${new Date().getFullYear()} CareConnect. Bảo lưu mọi quyền.`)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/customer')
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'CareConnect' })).toHaveAttribute(
      'href',
      '/customer'
    )
    expect(screen.queryByRole('button', { name: 'Đăng xuất' })).not.toBeInTheDocument()
  })

  it('opens the avatar menu with profile, family profiles and sign-out actions, then closes on Escape', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route
            element={
              <AuthUserContext value={customer}>
                <CustomerLayout />
              </AuthUserContext>
            }
          >
            <Route path='/customer' element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const accountButton = screen.getByRole('button', { name: 'Menu tài khoản' })
    fireEvent.click(accountButton)
    const accountMenu = screen.getByRole('navigation', { name: 'Menu tài khoản' })
    expect(accountButton).toHaveAttribute('aria-expanded', 'true')
    expect(within(accountMenu).getByRole('link', { name: 'Hồ sơ của tôi' })).toHaveAttribute(
      'href',
      '/customer/my-profile'
    )
    const familyProfiles = within(accountMenu).getByRole('link', { name: 'Hồ sơ người thân' })
    expect(familyProfiles).toHaveAttribute('href', '/customer/patient-profiles')
    expect(accountMenu).toContainElement(screen.getByRole('button', { name: 'Đăng xuất' }))

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(accountButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: 'Menu tài khoản' })).not.toBeInTheDocument()
    expect(accountButton).toHaveFocus()
  })

  it('navigates to family profiles from the avatar menu and closes it', () => {
    const familyProfilesPage = 'Family profiles page'

    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route
            element={
              <AuthUserContext value={customer}>
                <CustomerLayout />
              </AuthUserContext>
            }
          >
            <Route path='/customer' element={<div />} />
            <Route path='/customer/patient-profiles' element={<div>{familyProfilesPage}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Menu tài khoản' }))
    fireEvent.click(
      within(screen.getByRole('navigation', { name: 'Menu tài khoản' })).getByRole('link', { name: 'Hồ sơ người thân' })
    )

    expect(screen.getByText(familyProfilesPage)).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Menu tài khoản' })).not.toBeInTheDocument()
  })

  it('opens the customer menu with a bookings link on small screens', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route
            element={
              <AuthUserContext value={customer}>
                <CustomerLayout />
              </AuthUserContext>
            }
          >
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
    expect(screen.queryByRole('navigation', { name: 'Menu tài khoản' })).not.toBeInTheDocument()
  })
})
