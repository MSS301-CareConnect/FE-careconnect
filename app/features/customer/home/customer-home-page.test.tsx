import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerHomePage } from './customer-home-page'

beforeEach(async () => {
  await setAppLanguage('vi', false)
})

describe('customer home', () => {
  it('greets the signed-in customer and links to existing portal screens', () => {
    render(
      <AuthUserContext value={{ id: 'customer-1', fullName: 'Mai Anh', roles: ['CUSTOMER'] }}>
        <MemoryRouter>
          <CustomerHomePage />
        </MemoryRouter>
      </AuthUserContext>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Xin chào, Mai Anh' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Tìm người chăm sóc' })[0]).toHaveAttribute(
      'href',
      '/customer/caregivers'
    )
    expect(screen.getByRole('link', { name: 'Xem lịch đặt của tôi' })).toHaveAttribute('href', '/customer/bookings')
    expect(screen.getByRole('link', { name: /Hồ sơ người thân/i })).toHaveAttribute(
      'href',
      '/customer/patient-profiles'
    )
  })
})
