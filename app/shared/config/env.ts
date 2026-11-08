function normalizeBaseUrl(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error('VITE_API_BASE_URL must not be empty')
  }

  return trimmed.replace(/\/$/, '')
}

export const env = Object.freeze({
  API_BASE_URL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? '/api')
})
