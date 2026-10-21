import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AccountsPage } from '../accounts-page'
import { addUser, fetchUsers } from '../identity-api'

vi.mock('../identity-api', () => ({ addUser: vi.fn(), fetchUsers: vi.fn() }))

function renderPage(permissions: string[]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext value={{ id: 'admin', roles: ['ADMIN'], status: 'ACTIVE', permissions }}>
        <MemoryRouter>
          <AccountsPage />
        </MemoryRouter>
      </AuthUserContext>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchUsers).mockReset()
  vi.mocked(addUser).mockReset()
  vi.mocked(fetchUsers).mockResolvedValue([])
  await setAppLanguage('en', false)
})

describe('AccountsPage', () => {
  it('shows API account data in the customer management layout and filters the loaded page', async () => {
    vi.mocked(fetchUsers).mockResolvedValue([
      { id: 'one', fullName: 'Mai Anh', email: 'mai@example.com', status: 'ACTIVE', roles: ['CUSTOMER'] },
      { id: 'two', fullName: 'Bao Ngoc', email: 'bao@example.com', status: 'LOCKED', roles: ['CENTER_MANAGER'] }
    ])
    renderPage(['user:read'])
    expect(await screen.findByRole('link', { name: 'Mai Anh' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Account overview' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    fireEvent.change(screen.getByRole('searchbox', { name: /Search by name/ }), { target: { value: 'Bao' } })
    expect(screen.queryByRole('link', { name: 'Mai Anh' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Bao Ngoc' })).toBeInTheDocument()
  })

  it('shows an explicit empty state and hides creation without permission', async () => {
    renderPage(['user:read'])
    expect(await screen.findByText('No data yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument()
  })

  it('validates manager center before provisioning', async () => {
    renderPage(['user:read', 'user:manage', 'manager:create'])
    await screen.findByText('No data yet.')
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'manager@example.com' } })
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Manager' } })
    fireEvent.change(within(screen.getByRole('dialog')).getByLabelText('Role'), {
      target: { value: 'CENTER_MANAGER' }
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Create account' })[1])
    expect(screen.getByRole('status')).toHaveTextContent('Center ID is required')
    expect(addUser).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Center ID'), { target: { value: 'center-123' } })
    vi.mocked(addUser).mockResolvedValue({})
    fireEvent.click(screen.getAllByRole('button', { name: 'Create account' })[1])
    await waitFor(() =>
      expect(addUser).toHaveBeenCalledWith(
        expect.objectContaining({ roleCode: 'CENTER_MANAGER', centerId: 'center-123' })
      )
    )
  })
})
