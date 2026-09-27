import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { MyProfilePage } from '../my-profile-page'

describe('MyProfilePage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders customer profile information and stats in Vietnamese', () => {
    render(
      <MemoryRouter>
        <MyProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Hồ sơ cá nhân' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Nguyễn Mai Anh' })).toBeInTheDocument()
    expect(screen.getByText('Tài khoản đã xác minh')).toBeInTheDocument()
    expect(screen.getByText('CC-KH8842')).toBeInTheDocument()
    expect(screen.getByText('Người thân chăm sóc')).toBeInTheDocument()
    expect(screen.getByText('Ca hoàn thành')).toBeInTheDocument()
    expect(screen.getByText('Đổi mật khẩu tài khoản')).toBeInTheDocument()
  })

  it('switches content to English when language is switched', async () => {
    render(
      <MemoryRouter>
        <MyProfilePage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    expect(await screen.findByRole('heading', { level: 1, name: 'Personal Profile' })).toBeInTheDocument()
    expect(screen.getByText('Verified Account')).toBeInTheDocument()
    expect(screen.getByText('Change Account Password')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })

  it('updates form fields and triggers save flow', async () => {
    render(
      <MemoryRouter>
        <MyProfilePage />
      </MemoryRouter>
    )

    const nameInput = screen.getByLabelText(/Họ và tên/i)
    fireEvent.change(nameInput, { target: { value: 'Nguyễn Mai Anh Updated' } })
    expect(nameInput).toHaveValue('Nguyễn Mai Anh Updated')

    const saveButtons = screen.getAllByRole('button', { name: /Lưu thay đổi/i })
    fireEvent.click(saveButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Thay đổi hồ sơ vừa được lưu thành công!')).toBeInTheDocument()
    })
  })

  it('allows toggling password visibility in security section', () => {
    render(
      <MemoryRouter>
        <MyProfilePage />
      </MemoryRouter>
    )

    const currentPwdInput = screen.getByLabelText('Mật khẩu hiện tại')
    expect(currentPwdInput).toHaveAttribute('type', 'password')

    const toggleButtons = screen.getAllByRole('button')
    // Find the toggle button near password
    const visibilityBtn = toggleButtons.find(
      (btn) => btn.querySelector('.material-symbols-outlined')?.textContent === 'visibility'
    )
    if (visibilityBtn) {
      fireEvent.click(visibilityBtn)
      expect(currentPwdInput).toHaveAttribute('type', 'text')
    }
  })
})
