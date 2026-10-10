import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { sessionQueryKey } from '~/features/shared/auth/session-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { MyProfilePage } from '../my-profile-page'
import { saveMyProfile } from '../profile-api'

vi.mock('../profile-api', () => ({ saveMyProfile: vi.fn() }))

const user: UserResponse = {
  id: '42',
  email: 'family@example.com',
  fullName: 'Family Member',
  phoneNumber: '0912345678',
  roles: ['CUSTOMER']
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  client.setQueryData(sessionQueryKey, user)
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext value={user}>
        <MemoryRouter>
          <MyProfilePage />
        </MemoryRouter>
      </AuthUserContext>
    </QueryClientProvider>
  )
  return client
}

beforeEach(async () => {
  vi.mocked(saveMyProfile).mockReset()
  await setAppLanguage('en', false)
})

describe('MyProfilePage', () => {
  it('shows account data and keeps email read-only', () => {
    renderPage()
    expect(screen.getByLabelText('Full Name')).toHaveValue('Family Member')
    expect(screen.getByLabelText('Mobile Phone Number')).toHaveValue('0912345678')
    expect(screen.getByLabelText('Account email')).toHaveValue('family@example.com')
    expect(screen.getByLabelText('Account email')).toHaveAttribute('readonly')
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
