import { csrfHeaders } from './csrf'

/**
 * Request options and response checks shared by every gateway wrapper (`entities/*-api.ts`, feature API modules):
 * reads send the session cookies; writes also send a fresh Identity CSRF header and `X-Client-Type: web`.
 */
export const readOptions = { credentials: 'include' as const }

export async function writeOptions(headers: HeadersInit = {}) {
  return { credentials: 'include' as const, headers: { ...(await csrfHeaders()), ...headers } }
}

/**
 * `result` unwraps a backend APIResponse envelope and `success` only checks it; both throw when `code` is not 200,
 * naming the service so a failure in the console says where it came from.
 */
export function serviceResponse(service: string) {
  function check(code: number) {
    if (code !== 200) throw new Error(`${service} returned code ${code}`)
  }
  return {
    result<T>(response: { data: { code: number; result?: T } }): T {
      check(response.data.code)
      return response.data.result as T
    },
    success(response: { data: { code: number } }): void {
      check(response.data.code)
    }
  }
}
