import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'

import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { addRole, fetchPermissions, fetchRoles, saveRolePermissions } from '../identity-api'
import { RolesPage } from '../roles-page'

vi.mock('../identity-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../identity-api')>()),
  addRole: vi.fn(),
  fetchPermissions: vi.fn(),
  fetchRoles: vi.fn(),
  saveRolePermissions: vi.fn()
}))

function renderPage() {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}
    >
      <AuthUserContext value={{ id: 'admin', roles: ['ADMIN'], status: 'ACTIVE', permissions: ['role:manage'] }}>
        <MemoryRouter>
          <RolesPage />
        </MemoryRouter>
      </AuthUserContext>
    </QueryClientProvider>
  )
}

function apiError(status: number, code: number) {
  return Object.assign(new Error('IdentityService error'), { status, info: { code } })
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchRoles).mockResolvedValue([
    { id: 'r-admin', roleCode: 'ADMIN', roleName: 'Admin', permissions: ['user:read', 'user:manage'] },
    { id: 'r-customer', roleCode: 'CUSTOMER', roleName: 'Customer', permissions: [] },
    {
      id: 'custom',
      roleCode: 'AUDITOR',
      roleName: 'Auditor',
      description: 'Reads accounts',
      permissions: ['user:read']
    }
  ])
  vi.mocked(fetchPermissions).mockResolvedValue([
    { id: 'p1', permissionCode: 'user:read', permissionName: 'Read users' },
    { id: 'p2', permissionCode: 'user:manage', permissionName: 'Manage users' }
  ])
  await setAppLanguage('en', false)
})

describe('RolesPage (U-09)', () => {
  it('explains what each system role is for without showing codes', async () => {
    renderPage()
    expect(await screen.findByRole('rowheader', { name: 'Center manager' })).toBeInTheDocument()
    expect(screen.getByText('Their own center only')).toBeInTheDocument()
    expect(screen.getAllByText('View accounts').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/See the list and details of accounts/).length).toBeGreaterThan(0)
    expect(screen.queryByText('user:read')).not.toBeInTheDocument()
    expect(screen.queryByText(/\(ADMIN\)/)).not.toBeInTheDocument()
    expect(screen.getByText(/A custom role opens no portal/)).toBeInTheDocument()
  })

  it('replaces the permissions of a custom role after confirmation', async () => {
    vi.mocked(saveRolePermissions).mockResolvedValue({ id: 'custom', roleCode: 'AUDITOR', permissions: [] })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: /Auditor/ }))
    const manage = screen.getByRole('checkbox', { name: /Manage accounts/ })
    fireEvent.click(manage)
    fireEvent.click(screen.getByRole('button', { name: 'Save permissions' }))
    const confirm = screen.getByRole('dialog', { name: 'Save the permissions of Auditor?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Save permissions' }))
    await waitFor(() => expect(saveRolePermissions).toHaveBeenCalledWith('custom', { permissionIds: ['p1', 'p2'] }))
  })

  it('validates a new role and shows a taken code under its input', async () => {
    vi.mocked(addRole).mockRejectedValue(apiError(409, 1102))
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Create role' }))
    const dialog = screen.getByRole('dialog', { name: 'Create a custom role' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create role' }))
    expect(within(dialog).getByLabelText('Role code')).toHaveAccessibleDescription('Enter a role code.')
    expect(within(dialog).getByLabelText('Role name')).toHaveAccessibleDescription('Enter a role name.')
    expect(addRole).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText('Role code'), { target: { value: 'auditor' } })
    fireEvent.change(within(dialog).getByLabelText('Role name'), { target: { value: 'Auditor 2' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create role' }))
    await waitFor(() =>
      expect(within(dialog).getByLabelText('Role code')).toHaveAccessibleDescription(
        'This code already exists. Choose another.'
      )
    )
    expect(addRole).toHaveBeenCalledWith({ roleCode: 'AUDITOR', roleName: 'Auditor 2' })
  })
})
