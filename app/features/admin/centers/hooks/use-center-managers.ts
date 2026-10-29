import { useQuery } from '@tanstack/react-query'

import { listManagedUsers } from '~/shared/api/generated/api/account/account'

/** IdentityService caps a page at 100; five pages cover every account the picker can show. */
const PAGE_SIZE = 100
const MAX_PAGES = 5

export type CenterManagerOption = { id: string; fullName: string; email: string; centerId?: string }

/** Under the account list key, so creating or changing an account refreshes the picker too. */
export const centerManagersQueryKey = ['identity', 'users', 'active-center-managers'] as const

/** `/users` cannot filter by role, so ACTIVE CENTER_MANAGER accounts are picked from its pages. */
async function fetchActiveCenterManagers(): Promise<CenterManagerOption[]> {
  const managers: CenterManagerOption[] = []
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await listManagedUsers({ page, size: PAGE_SIZE }, { credentials: 'include' })
    if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
    const users = response.data.result
    if (!users || !Array.isArray(users.content)) throw new Error('Invalid IdentityService user page')
    for (const user of users.content)
      if (user.id && user.status === 'ACTIVE' && user.roles?.includes('CENTER_MANAGER'))
        managers.push({
          id: user.id,
          fullName: user.fullName || user.email || '',
          email: user.email ?? '',
          centerId: user.centerId ?? undefined
        })
    if (page + 1 >= users.totalPages) break
  }
  return managers.sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
}

export function useCenterManagers() {
  return useQuery({ queryKey: centerManagersQueryKey, queryFn: fetchActiveCenterManagers, retry: false })
}
