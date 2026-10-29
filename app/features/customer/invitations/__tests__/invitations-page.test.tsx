import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  acceptInvitation,
  declineInvitation,
  fetchInvitations,
  fetchManagers,
  fetchMyInvitations,
  inviteManager,
  revokeInvitation
} from '~/entities/care-recipient/care-recipient-managers-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { ManagersCard } from '~/features/customer/patient-detail/components/managers-card'
import type { RecipientManagerRecord, UserResponse } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { InvitationsPage } from '../invitations-page'

vi.mock('~/entities/care-recipient/care-recipient-managers-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-managers-api')>()),
  fetchManagers: vi.fn(),
  fetchInvitations: vi.fn(),
  inviteManager: vi.fn(),
  revokeInvitation: vi.fn(),
  fetchMyInvitations: vi.fn(),
  acceptInvitation: vi.fn(),
  declineInvitation: vi.fn()
}))

const OWNER = { id: 'user-owner', email: 'owner@example.com' } as UserResponse
const managers: RecipientManagerRecord[] = [
  {
    id: 'm-1',
    userId: 'user-owner',
    accessLevel: 'OWNER',
    primary: true,
    profileAvailable: true,
    fullName: 'Chủ hồ sơ'
  },
  { id: 'm-2', userId: 'user-2', accessLevel: 'VIEWER', primary: false, profileAvailable: true, fullName: 'Con gái' }
]

function renderWith(user: UserResponse, ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={user}>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchManagers).mockResolvedValue(managers)
  vi.mocked(fetchInvitations).mockResolvedValue([
    {
      id: 'inv-1',
      recipientId: 'rec-1',
      email: 'em@example.com',
      accessLevel: 'VIEWER',
      status: 'PENDING',
      expiresAt: '2026-11-06T00:00:00Z'
    }
  ])
})

describe('Co-manager invitations (C-04)', () => {
  it('lets the primary owner invite by email, revoke and remove, without showing the invitee', async () => {
    vi.mocked(inviteManager).mockResolvedValue({
      id: 'inv-2',
      recipientId: 'rec-1',
      email: 'new@example.com',
      accessLevel: 'EDITOR',
      status: 'PENDING',
      expiresAt: '2026-11-06T00:00:00Z'
    })
    vi.mocked(revokeInvitation).mockResolvedValue(undefined)
    renderWith(OWNER, <ManagersCard recipientId='rec-1' />)

    expect(await screen.findByText('Con gái')).toBeInTheDocument()
    expect(await screen.findByText('em@example.com')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Email người được mời'), { target: { value: ' new@example.com ' } })
    fireEvent.change(screen.getByLabelText('Quyền'), { target: { value: 'EDITOR' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời' }))
    await waitFor(() =>
      expect(inviteManager).toHaveBeenCalledWith('rec-1', {
        email: 'new@example.com',
        relationshipType: 'CHILD',
        accessLevel: 'EDITOR'
      })
    )
    expect(await screen.findByText(/Nếu email có tài khoản khách hàng/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Thu hồi lời mời gửi em@example.com' }))
    await waitFor(() => expect(revokeInvitation).toHaveBeenCalledWith('rec-1', 'inv-1'))
    expect(screen.getByRole('button', { name: 'Gỡ Con gái khỏi hồ sơ' })).toBeInTheDocument()
  })

  it('hides invite and remove controls from a co-manager who is not primary', async () => {
    renderWith({ id: 'user-2' } as UserResponse, <ManagersCard recipientId='rec-1' />)

    expect(await screen.findByText('Con gái')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Gửi lời mời' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Gỡ/ })).not.toBeInTheDocument()
    expect(fetchInvitations).not.toHaveBeenCalled()
  })

  it('lets the invitee accept or decline their invitations', async () => {
    vi.mocked(fetchMyInvitations).mockResolvedValue([
      {
        id: 'inv-9',
        recipientId: 'rec-1',
        recipientFullName: 'Bà Lan',
        accessLevel: 'VIEWER',
        expiresAt: '2026-11-06T00:00:00Z'
      }
    ])
    vi.mocked(acceptInvitation).mockResolvedValue(managers[1])
    vi.mocked(declineInvitation).mockResolvedValue(undefined)
    renderWith({ id: 'user-2' } as UserResponse, <InvitationsPage />)

    expect(await screen.findByText('Hồ sơ: Bà Lan')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Chấp nhận' }))
    await waitFor(() => expect(acceptInvitation).toHaveBeenCalledWith('inv-9', expect.anything()))
    expect(await screen.findByText('Đã chấp nhận lời mời.')).toBeInTheDocument()
  })
})
