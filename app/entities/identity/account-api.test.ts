import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listManagedUsers } from '~/shared/api/generated/api/account/account'
import type { UserListResponse } from '~/shared/api/generated/contracts'
import { fetchAccounts } from './account-api'

vi.mock('~/shared/api/generated/api/account/account', () => ({ listManagedUsers: vi.fn() }))

beforeEach(() => vi.mocked(listManagedUsers).mockReset())

describe('fetchAccounts', () => {
  it('sends the server-side filters and reads the paginated response', async () => {
    vi.mocked(listManagedUsers).mockResolvedValue({
      data: {
        code: 200,
        message: 'success',
        result: { content: [{ id: 'one', fullName: 'Mai Anh' }], page: 1, size: 20, totalElements: 21, totalPages: 2 }
      },
      status: 200,
      headers: new Headers()
    })

    await expect(fetchAccounts({ page: 1, size: 20, role: 'CENTER_MANAGER', keyword: 'mai' })).resolves.toEqual({
      content: [{ id: 'one', fullName: 'Mai Anh' }],
      page: 1,
      size: 20,
      totalElements: 21,
      totalPages: 2
    })
    expect(listManagedUsers).toHaveBeenCalledWith(
      { page: 1, size: 20, role: 'CENTER_MANAGER', keyword: 'mai' },
      { credentials: 'include' }
    )
  })

  it('rejects an invalid page so the account screen can show its retry state', async () => {
    vi.mocked(listManagedUsers).mockResolvedValue({
      data: { code: 200, message: 'success', result: {} } as UserListResponse,
      status: 200,
      headers: new Headers()
    })

    await expect(fetchAccounts({ page: 0, size: 20 })).rejects.toThrow('Invalid IdentityService user page')
  })
})
