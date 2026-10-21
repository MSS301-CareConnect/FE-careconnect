import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { fetchWebSessions, revokeSession } from './security-api'
import { SecuritySessions } from './security-sessions'

vi.mock('./security-api', () => ({ fetchWebSessions: vi.fn(), revokeSession: vi.fn() }))

function renderSessions() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <SecuritySessions />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchWebSessions).mockReset()
  vi.mocked(revokeSession).mockReset()
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true)
  )
  await setAppLanguage('en', false)
})

describe('security sessions', () => {
  it('shows current and other sessions, then refreshes after revoking another session', async () => {
    vi.mocked(fetchWebSessions)
      .mockResolvedValueOnce([
        { sessionId: 'current', isCurrent: true, userAgent: 'Current browser' },
        { sessionId: 'other', isCurrent: false, userAgent: 'Other browser' }
      ])
      .mockResolvedValueOnce([{ sessionId: 'current', isCurrent: true, userAgent: 'Current browser' }])
    vi.mocked(revokeSession).mockResolvedValue()
    renderSessions()

    expect(await screen.findByText('Current browser')).toBeInTheDocument()
    expect(screen.getByText('Current session')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sign out this device' }))

    await waitFor(() => expect(revokeSession).toHaveBeenCalledWith('other'))
    await waitFor(() => expect(screen.queryByText('Other browser')).not.toBeInTheDocument())
    expect(fetchWebSessions).toHaveBeenCalledTimes(2)
  })

  it('shows an error and allows retry', async () => {
    vi.mocked(fetchWebSessions).mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce([])
    renderSessions()

    expect(await screen.findByText('Unable to load sign-in sessions.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('No sign-in sessions found.')).toBeInTheDocument()
  })
})
