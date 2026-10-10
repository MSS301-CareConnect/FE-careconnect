import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { PortalGuard } from './portal-guard'
import { useAuthUser } from './auth-user-context'
import { loadSession } from './session-api'

vi.mock('./session-api', () => ({
  sessionQueryKey: ['auth', 'current-user'],
  isForbiddenError: () => false,
  loadSession: vi.fn()
}))

function ProtectedContent() {
  const user = useAuthUser()
  const protectedContent = 'Protected dashboard'

  return (
    <div>
      {protectedContent}
      <span>{user?.fullName}</span>
    </div>
  )
}

function renderAdmin() {
  const loginContent = 'Login screen'
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path='/admin/dashboard'
            element={
              <PortalGuard role='ADMIN'>
                <ProtectedContent />
              </PortalGuard>
            }
          />
          <Route path='/login' element={<div>{loginContent}</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(loadSession).mockReset()
  await setAppLanguage('vi', false)
})

describe('portal guard', () => {
  it('redirects anonymous visitors before rendering a portal', async () => {
    vi.mocked(loadSession).mockResolvedValue(null)
    renderAdmin()
    expect(await screen.findByText('Login screen')).toBeInTheDocument()
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument()
  })

  it('denies a logged-in user with the wrong backend role', async () => {
    vi.mocked(loadSession).mockResolvedValue({ id: 'u-1', status: 'ACTIVE', roles: ['CUSTOMER'] })
    renderAdmin()
    expect(await screen.findByRole('heading', { name: 'Không có quyền truy cập' })).toBeInTheDocument()
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument()
  })

  it('renders the portal only for an active user with its role', async () => {
    vi.mocked(loadSession).mockResolvedValue({ id: 'u-1', fullName: 'An Nguyen', status: 'ACTIVE', roles: ['ADMIN'] })
    renderAdmin()
    expect(await screen.findByText('Protected dashboard')).toBeInTheDocument()
    expect(screen.getByText('An Nguyen')).toBeInTheDocument()
  })
})
