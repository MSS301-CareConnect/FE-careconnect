import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { RolesPage } from '../roles-page'
import { addRole, fetchPermissions, fetchRoles, saveRolePermissions } from '../identity-api'

vi.mock('../identity-api', () => ({
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

beforeEach(async () => {
  vi.mocked(fetchRoles).mockReset()
  vi.mocked(fetchPermissions).mockReset()
  vi.mocked(saveRolePermissions).mockReset()
  vi.mocked(addRole).mockReset()
  vi.mocked(fetchRoles).mockResolvedValue([
    { id: 'builtin', roleCode: 'ADMIN', roleName: 'Admin', permissions: ['user:read'] },
    { id: 'custom', roleCode: 'AUDITOR', roleName: 'Auditor', permissions: ['user:read'] }
  ])
  vi.mocked(fetchPermissions).mockResolvedValue([
    { id: 'p1', permissionCode: 'user:read', permissionName: 'Read users' },
    { id: 'p2', permissionCode: 'user:manage', permissionName: 'Manage users' }
  ])
  await setAppLanguage('en', false)
})

describe('RolesPage', () => {
  it('shows role metrics and filters custom roles', async () => {
    renderPage()
    expect(await screen.findByRole('button', { name: /Admin \(ADMIN\)/ })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Roles and permissions overview' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Custom' }))
    expect(screen.queryByRole('button', { name: /Admin \(ADMIN\)/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Auditor \(AUDITOR\)/ })).toBeInTheDocument()
  })

  it('keeps built-in roles read-only and replaces custom role permissions with selected IDs', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(saveRolePermissions).mockResolvedValue({})
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: /Admin \(ADMIN\)/ }))
    expect(screen.getByText('Built-in role permissions are preset and cannot be edited.')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Auditor \(AUDITOR\)/ }))
    expect(screen.getByRole('checkbox', { name: /Read users/ })).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: /Manage users/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(saveRolePermissions).toHaveBeenCalledWith('custom', { permissionIds: ['p1', 'p2'] }))
    vi.mocked(window.confirm).mockRestore()
  })
})
