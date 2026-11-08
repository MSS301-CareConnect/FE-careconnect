import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { beginRegistration, resendOtp, verifyRegistration } from './registration-api'
import { RegistrationPage } from './registration-page'

vi.mock('./registration-api', () => ({
  beginRegistration: vi.fn(),
  resendOtp: vi.fn(),
  verifyRegistration: vi.fn(),
  registrationErrorKey: () => 'auth.registration.registerFailed'
}))

function renderPage() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path='/register' element={<RegistrationPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(beginRegistration).mockReset()
  vi.mocked(resendOtp).mockReset()
  vi.mocked(verifyRegistration).mockReset()
  await setAppLanguage('vi', false)
})

describe('registration page', () => {
  it('reveals each password independently without submitting the form', () => {
    renderPage()
    const password = screen.getByLabelText('Mật khẩu')
    const confirmation = screen.getByLabelText('Xác nhận mật khẩu')
    const showButtons = screen.getAllByRole('button', { name: 'Hiện mật khẩu' })

    fireEvent.click(showButtons[0])

    expect(password).toHaveAttribute('type', 'text')
    expect(confirmation).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toHaveAttribute('aria-pressed', 'true')
    expect(beginRegistration).not.toHaveBeenCalled()
  })

  it('registers, verifies the emailed code, and sends the user to sign in', async () => {
    vi.mocked(beginRegistration).mockResolvedValue({
      email: 'family@example.com',
      expiresInSeconds: 300,
      resendAfterSeconds: 0
    })
    vi.mocked(verifyRegistration).mockResolvedValue()
    renderPage()

    fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Family Member' } })
    fireEvent.change(screen.getByLabelText('Địa chỉ email'), { target: { value: 'family@example.com' } })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'Secret123!' } })
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: 'Secret123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(await screen.findByRole('heading', { name: 'Xác thực email' })).toBeInTheDocument()
    expect(beginRegistration).toHaveBeenCalledWith(
      {
        fullName: 'Family Member',
        email: 'family@example.com',
        password: 'Secret123!'
      },
      expect.anything()
    )

    fireEvent.change(screen.getByLabelText('Mã xác thực'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Xác thực và hoàn tất' }))

    expect(await screen.findByRole('heading', { name: 'Tài khoản đã sẵn sàng' })).toBeInTheDocument()
    expect(verifyRegistration).toHaveBeenCalledWith(
      { email: 'family@example.com', otpCode: '123456' },
      expect.anything()
    )
    expect(screen.getByRole('link', { name: 'Đến trang đăng nhập' })).toHaveAttribute('href', '/login')
  })

  it('blocks a weak password before calling the backend', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Family Member' } })
    fireEvent.change(screen.getByLabelText('Địa chỉ email'), { target: { value: 'family@example.com' } })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'weak' } })
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: 'weak' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Mật khẩu cần ít nhất 8 ký tự')
    expect(beginRegistration).not.toHaveBeenCalled()
  })

  it('lets someone with an existing code request a new OTP for their email', async () => {
    vi.mocked(resendOtp).mockResolvedValue({
      email: 'family@example.com',
      expiresInSeconds: 300,
      resendAfterSeconds: 60
    })
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Xác thực email' }))
    fireEvent.change(screen.getByLabelText('Địa chỉ email'), { target: { value: 'family@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã mới' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Mã mới đã được gửi')
    expect(resendOtp).toHaveBeenCalledWith({ email: 'family@example.com' }, expect.anything())
    expect(screen.getByRole('button', { name: /Gửi mã mới sau/ })).toBeDisabled()
  })
})
