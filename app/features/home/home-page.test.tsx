import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { HomePage } from './home-page'

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
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

    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: 'Dịch vụ chăm sóc' })).toHaveAttribute('href', '/customer/services')
    expect(within(footer).getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login')
    expect(
      within(footer).getByText(`© ${new Date().getFullYear()} CareConnect. Bảo lưu mọi quyền.`)
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Bắt đầu tìm dịch vụ phù hợp cho gia đình.' })).not.toBeInTheDocument()
  })

  it('switches the landing content to English', async () => {
    renderHome()

    fireEvent.click(screen.getAllByRole('button', { name: 'Chuyển sang Tiếng Anh' })[0])

    expect(await screen.findByRole('heading', { name: 'Feel confident about care at home.' })).toBeInTheDocument()
    expect(within(screen.getByRole('contentinfo')).getByText(/All rights reserved\./)).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
