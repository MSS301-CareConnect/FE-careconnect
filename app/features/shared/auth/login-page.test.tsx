import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { LoginPage } from './login-page'
import { loadSession, signIn } from './session-api'

vi.mock('./session-api', () => ({
  sessionQueryKey: ['auth', 'current-user'],
  loadSession: vi.fn(),
  signIn: vi.fn(),
  isCredentialError: () => false
}))

beforeEach(async () => {
  vi.mocked(loadSession).mockReset()
  vi.mocked(signIn).mockReset()
  await setAppLanguage('vi', false)
})

describe('login page', () => {
  it('submits credentials and returns an admin to the authorized requested route', async () => {
    vi.mocked(loadSession).mockResolvedValue(null)
    vi.mocked(signIn).mockResolvedValue({ id: 'u-1', status: 'ACTIVE', roles: ['ADMIN'] })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const destination = 'Admin destination'

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/login?next=%2Fadmin%2Fdashboard']}>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/admin/dashboard' element={<div>{destination}</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/')
    fireEvent.change(screen.getByLabelText('Địa chỉ email'), { target: { value: 'admin@careconnect.test' } })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(await screen.findByText(destination)).toBeInTheDocument()
    expect(signIn).toHaveBeenCalledWith({ email: 'admin@careconnect.test', password: 'secret' }, expect.anything())
  })
})
