import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueryClient } from './query-client'
import { refreshSession } from './session-refresh'

vi.mock('./session-refresh', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./session-refresh')>()),
  refreshSession: vi.fn()
}))

const unauthorized = () => Object.assign(new Error('Unauthorized'), { status: 401 })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('session expiry handling (H-07)', () => {
  it('refreshes the session once and fetches the failed query again', async () => {
    vi.mocked(refreshSession).mockResolvedValue()
    const onSessionExpired = vi.fn()
    const client = createQueryClient({ onSessionExpired })
    client.setQueryData(['auth', 'current-user'], { id: 'customer-1' })
    const queryFn = vi.fn().mockRejectedValueOnce(unauthorized()).mockResolvedValue('fresh data')

    await client.fetchQuery({ queryKey: ['bookings'], queryFn }).catch(() => undefined)

    await waitFor(() => expect(client.getQueryData(['bookings'])).toBe('fresh data'))
    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(queryFn).toHaveBeenCalledTimes(2)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('ends the session when the refresh is rejected', async () => {
    vi.mocked(refreshSession).mockRejectedValue(unauthorized())
    const onSessionExpired = vi.fn()
    const client = createQueryClient({ onSessionExpired })
    client.setQueryData(['auth', 'current-user'], { id: 'customer-1' })

    await client
      .fetchQuery({ queryKey: ['bookings'], queryFn: () => Promise.reject(unauthorized()) })
      .catch(() => undefined)

    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1))
  })

  it('refreshes after a 401 mutation and ignores other failures', async () => {
    vi.mocked(refreshSession).mockResolvedValue()
    const client = createQueryClient({ onSessionExpired: vi.fn() })
    client.setQueryData(['auth', 'current-user'], { id: 'customer-1' })

    await client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(Object.assign(new Error('Conflict'), { status: 409 })) })
      .execute(undefined)
      .catch(() => undefined)
    expect(refreshSession).not.toHaveBeenCalled()

    await client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(unauthorized()) })
      .execute(undefined)
      .catch(() => undefined)
    await waitFor(() => expect(refreshSession).toHaveBeenCalledTimes(1))
  })

  it('leaves the session query to its own refresh flow', async () => {
    const client = createQueryClient({ onSessionExpired: vi.fn() })

    await client
      .fetchQuery({ queryKey: ['auth', 'current-user'], queryFn: () => Promise.reject(unauthorized()) })
      .catch(() => undefined)

    expect(refreshSession).not.toHaveBeenCalled()
  })

  it('keeps guests on public pages when a browse request returns 401', async () => {
    const onSessionExpired = vi.fn()
    const client = createQueryClient({ onSessionExpired })
    client.setQueryData(['auth', 'current-user'], null)

    await client
      .fetchQuery({ queryKey: ['provider', 'catalog'], queryFn: () => Promise.reject(unauthorized()) })
      .catch(() => undefined)
    await client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(unauthorized()) })
      .execute(undefined)
      .catch(() => undefined)

    expect(refreshSession).not.toHaveBeenCalled()
    expect(onSessionExpired).not.toHaveBeenCalled()
  })
})
