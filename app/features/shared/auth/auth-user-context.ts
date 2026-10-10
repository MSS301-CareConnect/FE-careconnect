import { createContext, useContext } from 'react'

import type { UserResponse } from '~/shared/api/generated/contracts'

export const AuthUserContext = createContext<UserResponse | null>(null)

export function useAuthUser() {
  return useContext(AuthUserContext)
}
