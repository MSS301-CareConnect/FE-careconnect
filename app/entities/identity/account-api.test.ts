import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listManagedUsers } from '~/shared/api/generated/api/account/account'
import type { UserListResponse } from '~/shared/api/generated/contracts'
import { fetchUsers } from '../identity-api'

vi.mock('~/shared/api/generated/api/account/account', () => ({ listManagedUsers: vi.fn() }))

beforeEach(() => vi.mocked(listManagedUsers).mockReset())

describe('fetchUsers', () => {
  it('reads accounts from the paginated IdentityService response', async () => {
    vi.mocked(listManagedUsers).mockResolvedValue({
      data: {
        code: 200,
        message: 'success',
        result: { content: [{ id: 'one', fullName: 'Mai Anh' }], page: 1, size: 20, totalElements: 21, totalPages: 2 }
      },
      status: 200,
      headers: new Headers()
    })

    await expect(fetchUsers(1, 20)).resolves.toEqual({
      content: [{ id: 'one', fullName: 'Mai Anh' }],
      page: 1,
      size: 20,
      totalElements: 21,
      totalPages: 2
    })
    expect(listManagedUsers).toHaveBeenCalledWith({ page: 1, size: 20 }, { credentials: 'include' })
  })

  it('rejects an invalid page so the account screen can show its retry state', async () => {
    vi.mocked(listManagedUsers).mockResolvedValue({
      data: { code: 200, message: 'success', result: {} } as UserListResponse,
      status: 200,
      headers: new Headers()
    })

    await expect(fetchUsers(0, 20)).rejects.toThrow('Invalid IdentityService user page')
  })
})
