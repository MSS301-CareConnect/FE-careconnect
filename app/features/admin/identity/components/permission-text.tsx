import { useTranslation } from 'react-i18next'

import type { PermissionRecord } from '~/shared/api/generated/contracts'

const key = 'admin.identity.rolesPage' as const

/** Permission codes contain ":", which i18next reads as a namespace separator, so they map to plain keys. */
const PERMISSION_KEYS = {
  'user:read': 'userRead',
  'user:manage': 'userManage',
  'manager:create': 'managerCreate',
  'caregiver:create': 'caregiverCreate',
  'role:manage': 'roleManage'
} as const

function permissionKey(code: string | undefined) {
  return code && code in PERMISSION_KEYS ? PERMISSION_KEYS[code as keyof typeof PERMISSION_KEYS] : 'other'
}

/** A permission as words (name and what it allows); codes are never shown. */
export function PermissionText({ permission }: { permission: PermissionRecord }) {
  const { t } = useTranslation()
  const known = permissionKey(permission.permissionCode)
  return (
    <span>
      <strong className='block text-sm text-on-surface'>
        {known === 'other'
          ? (permission.permissionName ?? t(`${key}.permissions.other.name`))
          : t(`${key}.permissions.${known}.name`)}
      </strong>
      <span className='block text-xs leading-5 text-on-surface-variant'>
        {known === 'other'
          ? (permission.description ?? t(`${key}.permissions.other.description`))
          : t(`${key}.permissions.${known}.description`)}
      </span>
    </span>
  )
}
