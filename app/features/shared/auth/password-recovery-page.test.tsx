import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { confirmPasswordReset, sendPasswordResetCode } from '~/entities/identity/password-reset-api'
import { PasswordRecoveryPage } from './password-recovery-page'

vi.mock('~/entities/identity/password-reset-api', () => ({
  sendPasswordResetCode: vi.fn(),
  confirmPasswordReset: vi.fn(),
  passwordRecoveryErrorKey: () => 'auth.recovery.requestFailed'
}))

function renderPage() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <MemoryRouter>
        <PasswordRecoveryPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(sendPasswordResetCode).mockReset()
  vi.mocked(confirmPasswordReset).mockReset()
  await setAppLanguage('en', false)
})

describe('password recovery', () => {
  it('requests a code and resets the password using the emailed OTP', async () => {
    vi.mocked(sendPasswordResetCode).mockResolvedValue()
    vi.mocked(confirmPasswordReset).mockResolvedValue()
    renderPage()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'family@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))
    expect(
      await screen.findByText('If an account exists for this email, a reset code has been sent.')
    ).toBeInTheDocument()
    expect(sendPasswordResetCode).toHaveBeenCalledWith({ email: 'family@example.com' }, expect.anything())

    fireEvent.change(screen.getByLabelText('Reset code'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'Secret123!' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'Secret123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Set new password' }))
    await waitFor(() =>
      expect(confirmPasswordReset).toHaveBeenCalledWith(
        { email: 'family@example.com', otpCode: '123456', newPassword: 'Secret123!' },
        expect.anything()
      )
    )
    expect(await screen.findByText('Your password has been updated. You can sign in now.')).toBeInTheDocument()
  })

  it('validates the password before calling reset', async () => {
    vi.mocked(sendPasswordResetCode).mockResolvedValue()
    renderPage()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'family@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))
    await screen.findByLabelText('Reset code')
    fireEvent.change(screen.getByLabelText('Reset code'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'weak' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'weak' } })
    fireEvent.click(screen.getByRole('button', { name: 'Set new password' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Use at least 8 characters')
    expect(confirmPasswordReset).not.toHaveBeenCalled()
  })
})
