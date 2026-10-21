import { getCsrfToken } from './generated/api/authentication/authentication'

export async function csrfHeaders(): Promise<HeadersInit> {
  const response = await getCsrfToken({ credentials: 'include' })
  if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
  return { [response.data.result.headerName]: response.data.result.token, 'X-Client-Type': 'web' }
}
