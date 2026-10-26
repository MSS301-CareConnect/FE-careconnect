import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { HomePage } from './home-page'

function renderHome(audience: 'public' | 'customer' = 'public') {
  return render(
    <MemoryRouter>
      <HomePage audience={audience} />
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('shows the CareConnect landing content and working entry points', () => {
    renderHome()

    const hero = screen.getByRole('region', { name: 'An tâm chăm sóc tại nhà.' })
    expect(within(hero).getByRole('link', { name: /Tìm người chăm sóc/i })).toHaveAttribute(
      'href',
      '/customer/caregivers'
    )
    expect(within(hero).getByRole('link', { name: 'Tạo tài khoản' })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('img', { name: /Người chăm sóc hỗ trợ/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Một người phụ nữ nắm tay người thân lớn tuổi tại nhà' })).toHaveAttribute(
      'src',
      '/images/care-for-families-background.png'
    )
    expect(screen.getByRole('heading', { name: 'Mỗi quyết định chăm sóc đều cần sự rõ ràng.' })).toBeInTheDocument()

    expect(screen.queryByRole('heading', { name: 'Bắt đầu tìm dịch vụ phù hợp cho gia đình.' })).not.toBeInTheDocument()
  })

  it('switches the landing content to English', async () => {
    renderHome()

    await act(() => setAppLanguage('en', false))

    expect(await screen.findByRole('heading', { name: 'Feel confident about care at home.' })).toBeInTheDocument()
  })

  it('shows the same landing content with customer actions inside the guarded portal', () => {
    renderHome('customer')

    const hero = screen.getByRole('region', { name: 'An tâm chăm sóc tại nhà.' })
    expect(within(hero).getByRole('img', { name: /Người chăm sóc hỗ trợ/i })).toBeInTheDocument()
    expect(within(hero).getByRole('link', { name: 'Tìm người chăm sóc' })).toHaveAttribute(
      'href',
      '/customer/caregivers'
    )
    expect(within(hero).getByRole('link', { name: 'Đặt lịch chăm sóc' })).toHaveAttribute('href', '/customer/booking')
    expect(screen.queryByRole('link', { name: 'Tạo tài khoản' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Đăng nhập' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mỗi quyết định chăm sóc đều cần sự rõ ràng.' })).toBeInTheDocument()
  })
})
