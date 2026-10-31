/** The last two words of a Vietnamese name read best as initials ("Nguyễn Văn An" → "VA"). */
export function initials(name: string | undefined) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return (
    parts
      .slice(-2)
      .map((part) => part[0]?.toLocaleUpperCase('vi'))
      .join('') || '—'
  )
}

export const BUILT_IN_ROLES = ['ADMIN', 'CENTER_MANAGER', 'CAREGIVER', 'CUSTOMER'] as const
export type BuiltInRole = (typeof BUILT_IN_ROLES)[number]

export function isBuiltInRole(code: string | undefined): code is BuiltInRole {
  return BUILT_IN_ROLES.some((role) => role === code)
}
