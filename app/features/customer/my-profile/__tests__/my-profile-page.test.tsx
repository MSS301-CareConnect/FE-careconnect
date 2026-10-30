import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { changePassword } from '~/features/shared/auth/security-api'
import { sessionQueryKey } from '~/features/shared/auth/session-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { MyProfilePage } from '../my-profile-page'
import { saveMyProfile } from '../profile-api'

vi.mock('../profile-api', () => ({ saveMyProfile: vi.fn() }))
vi.mock('~/features/shared/auth/security-api', () => ({ changePassword: vi.fn() }))

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
  await setAppLanguage('en', false)
})

describe('MyProfilePage', () => {
  it('shows account data and keeps email read-only', () => {
    renderPage()
    expect(screen.getByRole('region', { name: 'Account overview' })).toHaveTextContent('Family Member')
    expect(screen.getByRole('navigation', { name: 'Account Management' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toHaveValue('Family Member')
    expect(screen.getByLabelText('Mobile Phone Number')).toHaveValue('0912345678')
    expect(screen.getByLabelText('Account email')).toHaveValue('family@example.com')
    expect(screen.getByLabelText('Account email')).toHaveAttribute('readonly')
    expect(screen.queryByRole('link', { name: 'Booking History' })).not.toBeInTheDocument()
  })

  it('shows the password form beside the account menu without leaving the profile page', () => {
    renderPage()
    fireEvent.click(screen.getByRole('link', { name: 'Change Password & Security' }))

    expect(screen.getByRole('navigation', { name: 'Account Management' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Change Password & Security' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByLabelText('Current password')).toBeInTheDocument()
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Personal Info & Edit' }))
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
  })

  it('submits a valid password change from the inline panel', async () => {
    vi.mocked(changePassword).mockRejectedValue(new Error('Unable to change password'))
    renderPage('/customer/my-profile?section=security')
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'OldSecret123!' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'NewSecret123!' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'NewSecret123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }))

    await waitFor(() =>
      expect(changePassword).toHaveBeenCalledWith({ currentPassword: 'OldSecret123!', newPassword: 'NewSecret123!' })
    )
  })

  it('saves supported fields and updates session cache', async () => {
    vi.mocked(saveMyProfile).mockResolvedValue({ ...user, fullName: 'Updated Member' })
    const client = renderPage()
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Updated Member' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
    await waitFor(() =>
      expect(saveMyProfile).toHaveBeenCalledWith(
        { fullName: 'Updated Member', phoneNumber: '0912345678' },
        expect.anything()
      )
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Profile changes saved successfully!')
    expect(client.getQueryData(sessionQueryKey)).toEqual({ ...user, fullName: 'Updated Member' })
  })

  it('rejects an invalid phone before calling the API', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Mobile Phone Number'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a phone number with 10 or 11 digits.')
    expect(saveMyProfile).not.toHaveBeenCalled()
  })
})
