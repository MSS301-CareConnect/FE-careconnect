import { describe, expect, it } from 'vitest'

import type { UserResponse } from '~/shared/api/generated/contracts'

import { homeForUser, safeReturnPath } from './role-path'

const customer: UserResponse = { id: 'customer-1', status: 'ACTIVE', roles: ['CUSTOMER'] }

describe('customer portal path', () => {
  it('uses the customer home after sign-in and accepts its safe return path', () => {
    expect(homeForUser(customer)).toBe('/customer')
    expect(safeReturnPath('/customer', customer)).toBe('/customer')
    expect(safeReturnPath('/customer/bookings', customer)).toBe('/customer/bookings')
    expect(safeReturnPath('/', customer)).toBeNull()
  })
})
