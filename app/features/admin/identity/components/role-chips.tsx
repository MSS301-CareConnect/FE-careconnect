import { useTranslation } from 'react-i18next'

import { isBuiltInRole } from '../account-format'

/** Built-in roles read as words; a custom role keeps the code an administrator gave it. */
export function RoleChips({ roles }: { roles: readonly string[] | undefined }) {
  const { t } = useTranslation()
  if (!roles?.length) return <span className='text-on-surface-variant'>—</span>
  return (
    <span className='flex flex-wrap gap-1'>
      {roles.map((role) => (
        <span
          className='whitespace-nowrap rounded-md bg-surface-container-low px-2 py-1 text-xs font-semibold text-on-surface'
          key={role}
        >
          {isBuiltInRole(role) ? t(`admin.identity.roles.${role}`) : role}
        </span>
      ))}
    </span>
  )
}
