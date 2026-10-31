import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchAccounts, fetchAccountStatistics, provisionAccount } from '~/entities/identity/account-api'
import { sendPasswordResetCode } from '~/entities/identity/password-reset-api'
import { fetchCenter, fetchCenters } from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AccountsPage } from '../accounts-page'

vi.mock('~/entities/identity/account-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/identity/account-api')>()),
  fetchAccounts: vi.fn(),
  fetchAccountStatistics: vi.fn(),
  provisionAccount: vi.fn()
}))
vi.mock('~/entities/identity/password-reset-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/identity/password-reset-api')>()),
  sendPasswordResetCode: vi.fn(),
  confirmPasswordReset: vi.fn()
}))
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenters: vi.fn(),
  fetchCenter: vi.fn()
}))

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.search}</output>
}

function renderPage(permissions: string[], path = '/admin/accounts') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext value={{ id: 'admin', roles: ['ADMIN'], status: 'ACTIVE', permissions }}>
        <MemoryRouter initialEntries={[path]}>
          <AccountsPage />
          <Location />
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
  vi.mocked(fetchAccounts).mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
  vi.mocked(fetchAccountStatistics).mockResolvedValue({
    usersByRole: { CENTER_MANAGER: 4 },
    usersByStatus: { ACTIVE: 40, LOCKED: 2 },
    newCustomers: 0
  })
  vi.mocked(fetchCenters).mockResolvedValue({
    items: [{ id: 'ct-1', centerName: 'An Bình', centerStatus: 'PENDING', version: 0 }],
    page: 0,
    size: 100,
    totalElements: 1,
    totalPages: 1
  })
  vi.mocked(fetchCenter).mockResolvedValue({ id: 'ct-1', centerName: 'An Bình' } as never)
  vi.mocked(sendPasswordResetCode).mockResolvedValue()
  await setAppLanguage('en', false)
})

describe('AccountsPage', () => {
  it('searches and filters on the server and shows platform-wide counts', async () => {
    vi.mocked(fetchAccounts).mockResolvedValue({
      content: [
        { id: 'one', fullName: 'Mai Anh', email: 'mai@example.com', status: 'ACTIVE', roles: ['CUSTOMER'] },
        {
          id: 'two',
          fullName: 'Bao Ngoc',
          email: 'bao@example.com',
          status: 'LOCKED',
          roles: ['CENTER_MANAGER'],
          centerId: 'ct-1'
        }
      ],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1
    })
    renderPage(['user:read'])
    expect(await screen.findByRole('link', { name: 'Mai Anh' })).toBeInTheDocument()
    const overview = screen.getByRole('region', { name: 'Account overview' })
    expect(await within(overview).findByText('42')).toBeInTheDocument()
    // Rows read as people, roles and center names — never IDs or role codes.
    expect(screen.getAllByRole('row')[2]).toHaveTextContent('Center manager')
    expect(await within(screen.getAllByRole('row')[2]).findByText('An Bình')).toBeInTheDocument()
    expect(screen.queryByText('CENTER_MANAGER')).not.toBeInTheDocument()
    expect(screen.queryByText('ct-1')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'bao' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'CENTER_MANAGER' } })
    await waitFor(() =>
      expect(fetchAccounts).toHaveBeenLastCalledWith(
        expect.objectContaining({ keyword: 'bao', role: 'CENTER_MANAGER', page: 0 })
      )
    )
    expect(screen.getByTestId('location')).toHaveTextContent('q=bao&role=CENTER_MANAGER')
  })

  it('shows an explicit empty state and hides creation without permission', async () => {
    renderPage(['user:read'])
    expect(await screen.findByText('No matching accounts.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument()
  })

  it('checks every field before sending and puts backend field errors under their input', async () => {
    vi.mocked(provisionAccount).mockRejectedValueOnce(apiError(400, 1003))
    renderPage(['user:manage', 'manager:create'])
    fireEvent.click(await screen.findByRole('button', { name: 'Create account' }))
    const dialog = screen.getByRole('dialog', { name: 'Create account' })
    fireEvent.change(within(dialog).getByLabelText('Role'), { target: { value: 'CENTER_MANAGER' } })
    fireEvent.change(within(dialog).getByLabelText(/Phone/), { target: { value: '12' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create account' }))

    expect(within(dialog).getByLabelText('Email')).toHaveAccessibleDescription('Enter an email.')
    expect(within(dialog).getByLabelText('Email')).toHaveFocus()
    expect(within(dialog).getByLabelText('Full name')).toHaveAccessibleDescription('Enter a full name.')
    expect(within(dialog).getByLabelText(/Phone/)).toHaveAccessibleDescription('Phone numbers have 10 or 11 digits.')
    expect(within(dialog).getByLabelText('Center')).toHaveAccessibleDescription('Choose the center this manager runs.')
    expect(provisionAccount).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText('Email'), { target: { value: 'lan@center.vn' } })
    fireEvent.change(within(dialog).getByLabelText('Full name'), { target: { value: 'Lan' } })
    fireEvent.change(within(dialog).getByLabelText(/Phone/), { target: { value: '' } })
    await within(dialog).findByRole('option', { name: /An Bình/ })
    fireEvent.change(within(dialog).getByLabelText('Center'), { target: { value: 'ct-1' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create account' }))

    await waitFor(() =>
      expect(within(dialog).getByLabelText('Email')).toHaveAccessibleDescription(
        'This email already has an account. Use another email.'
      )
    )
  })

  it('creates a manager, emails a password code and links to the center', async () => {
    vi.mocked(provisionAccount).mockResolvedValue({
      id: 'u-1',
      email: 'lan@center.vn',
      fullName: 'Lan',
      roles: ['CENTER_MANAGER'],
      centerId: 'ct-1'
    })
    renderPage(['manager:create'])
    fireEvent.click(await screen.findByRole('button', { name: 'Create account' }))
    const dialog = screen.getByRole('dialog', { name: 'Create account' })
    fireEvent.change(within(dialog).getByLabelText('Email'), { target: { value: 'lan@center.vn' } })
    fireEvent.change(within(dialog).getByLabelText('Full name'), { target: { value: 'Lan' } })
    await within(dialog).findByRole('option', { name: /An Bình/ })
    fireEvent.change(within(dialog).getByLabelText('Center'), { target: { value: 'ct-1' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create account' }))

    const created = await screen.findByRole('dialog', { name: 'Account created' })
    expect(provisionAccount).toHaveBeenCalledWith({
      email: 'lan@center.vn',
      fullName: 'Lan',
      roleCode: 'CENTER_MANAGER',
      centerId: 'ct-1'
    })
    await waitFor(() => expect(sendPasswordResetCode).toHaveBeenCalledWith({ email: 'lan@center.vn' }))
    expect(await within(created).findByText(/A code was sent to lan@center.vn/)).toBeInTheDocument()
    expect(within(created).getByRole('link', { name: 'Open the center to make them its manager' })).toHaveAttribute(
      'href',
      '/admin/centers/ct-1'
    )
  })
})
