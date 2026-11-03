import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { changePassword } from '~/features/shared/auth/security-api'
import { sessionQueryKey } from '~/features/shared/auth/session-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { toastSuccess } from '~/shared/ui/app-toast'

import { MyProfilePage } from '../my-profile-page'
import { passwordStrength } from '../password-change-panel'
import { saveMyProfile } from '../profile-api'

vi.mock('../profile-api', () => ({ saveMyProfile: vi.fn() }))
vi.mock('~/features/shared/auth/security-api', () => ({ changePassword: vi.fn() }))
vi.mock('~/shared/ui/app-toast', () => ({ toastSuccess: vi.fn(), toastSystemError: vi.fn() }))

const user: UserResponse = {
  id: '42',
  email: 'family@example.com',
  fullName: 'Family Member',
  phoneNumber: '0912345678',
  roles: ['CUSTOMER']
}

function renderPage(initialPath = '/customer/my-profile') {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  client.setQueryData(sessionQueryKey, user)
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext value={user}>
        <MemoryRouter initialEntries={[initialPath]}>
          <MyProfilePage />
        </MemoryRouter>
      </AuthUserContext>
    </QueryClientProvider>
  )
  return client
}

beforeEach(async () => {
  vi.mocked(saveMyProfile).mockReset()
  vi.mocked(changePassword).mockReset()
  vi.mocked(toastSuccess).mockReset()
  await setAppLanguage('en', false)
})

describe('MyProfilePage', () => {
  it('shows the account as read-only details until the customer chooses Edit', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Personal info' })).toBeInTheDocument()
    expect(screen.getByText('0912345678')).toBeInTheDocument()
    expect(screen.getByText('family@example.com')).toBeInTheDocument()
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Full name')).toHaveValue('Family Member')
    expect(screen.getByLabelText('Sign-in email')).toHaveAttribute('readonly')
    expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('saves supported fields, updates the session cache and returns to the details', async () => {
    vi.mocked(saveMyProfile).mockResolvedValue({ ...user, fullName: 'Updated Member' })
    const client = renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Updated Member' } })
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(saveMyProfile).toHaveBeenCalledWith(
        { fullName: 'Updated Member', phoneNumber: '0912345678' },
        expect.anything()
      )
    )
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Your information was saved'))
    expect(client.getQueryData(sessionQueryKey)).toEqual({ ...user, fullName: 'Updated Member' })
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument()
  })

  it('rejects an invalid phone under the field before calling the API', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a phone number with 10 or 11 digits.')
    expect(screen.getByLabelText('Phone number')).toHaveAttribute('aria-invalid', 'true')
    expect(saveMyProfile).not.toHaveBeenCalled()
  })

  it('checks password rules live and submits a valid change from the security section', async () => {
    vi.mocked(changePassword).mockRejectedValue(new Error('Unable to change password'))
    renderPage('/customer/my-profile?section=security')
    expect(screen.getByRole('heading', { level: 1, name: 'Security' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'abc' } })
    expect(screen.getByText('Strength: weak')).toBeInTheDocument()
    expect(screen.getByText('A lowercase letter').closest('li')).toHaveTextContent('(met)')
    expect(screen.getByText('An uppercase letter').closest('li')).toHaveTextContent('(not met yet)')

    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldSecret123!' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'NewSecret123!' } })
    expect(screen.getByText('Strength: strong')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'NewSecret123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }))

    await waitFor(() =>
      expect(changePassword).toHaveBeenCalledWith({ currentPassword: 'OldSecret123!', newPassword: 'NewSecret123!' })
    )
  })

  it('rates password strength from the rules and the length', () => {
    expect(passwordStrength('')).toBe(0)
    expect(passwordStrength('abcDEF12')).toBe(1)
    expect(passwordStrength('abcDEF1!')).toBe(2)
    expect(passwordStrength('abcDEF1!xyz9')).toBe(3)
  })
})
