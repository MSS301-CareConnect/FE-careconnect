import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { accountKeys, fetchAccount } from '~/entities/identity/account-api'
import { fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import { pickAvatar } from '~/entities/provider/provider-avatar'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { ActionMenu, type ActionMenuItem } from '~/shared/ui/action-menu'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'

import { useHoursLabel } from '../hooks/use-hours-label'

const key = 'admin.centersPage' as const

/** The center logo is its first image; the media cache is the one the detail page refreshes after an upload. */
function CenterLogo({ center }: { center: ProviderCenterRecord }) {
  const media = useQuery({
    queryKey: providerKeys.media('CARE_CENTER', center.id),
    queryFn: () => fetchProviderMedia('CARE_CENTER', center.id),
    enabled: center.centerStatus !== 'ARCHIVED',
    retry: false,
    staleTime: 60_000
  })
  return (
    <Avatar
      className='h-11 w-11 rounded-2xl'
      decorative
      icon='apartment'
      name={center.centerName}
      onExpired={() => void media.refetch()}
      src={pickAvatar(media.data)?.downloadUrl}
    />
  )
}

/**
 * The manager's name from the page of manager accounts; an account outside it (locked, re-roled or removed) is
 * read on its own, and one that cannot be read shows "Unknown" instead of loading forever.
 */
function ManagerName({ userId, known, listLoaded }: { userId: string; known?: string; listLoaded: boolean }) {
  const { t } = useTranslation()
  const account = useQuery({
    queryKey: accountKeys.detail(userId),
    queryFn: () => fetchAccount(userId),
    enabled: listLoaded && !known,
    retry: false
  })
  if (known) return known
  if (!listLoaded || account.isPending) return t('common.ui.loadingName')
  return account.data?.fullName || t('common.ui.unknownName')
}

export interface CentersTableProps {
  rows: ProviderCenterRecord[]
  /** Manager account ID → name, from the first page of manager accounts. */
  managerName: Map<string | undefined, string | undefined>
  managersLoaded: boolean
  onEdit: (center: ProviderCenterRecord) => void
  onArchive: (center: ProviderCenterRecord) => void
}

/**
 * The centers of one page: identity and address, contact and hours, manager, status, and per row the main link
 * (review a pending center, otherwise open it) plus a "⋯" menu with edit, the center's caregivers / bookings / policy
 * and archive. An archived center only opens (its page restores it, D31).
 */
export function CentersTable({ rows, managerName, managersLoaded, onEdit, onArchive }: CentersTableProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const hoursLabel = useHoursLabel()
  const date = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { dateStyle: 'medium' })

  function menu(center: ProviderCenterRecord): ActionMenuItem[] {
    const open = { id: 'open', icon: 'open_in_new', label: t(`${key}.open`), onSelect: () => go(center.id) }
    if (center.centerStatus === 'ARCHIVED')
      return [
        open,
        { id: 'restore', icon: 'restore', label: t(`${key}.menu.restore`), onSelect: () => go(center.id) }
      ]
    return [
      open,
      { id: 'edit', icon: 'edit', label: t(`${key}.detail.edit`), onSelect: () => onEdit(center) },
      {
        id: 'caregivers',
        icon: 'medical_services',
        label: t(`${key}.menu.caregivers`),
        onSelect: () => navigate(`/admin/caregivers?center=${center.id}`)
      },
      {
        id: 'bookings',
        icon: 'calendar_month',
        label: t(`${key}.menu.bookings`),
        onSelect: () => navigate(`/admin/bookings?center=${center.id}`)
      },
      ...(center.centerStatus === 'ACTIVE'
        ? [
            {
              id: 'policy',
              icon: 'rule',
              label: t(`${key}.menu.policy`),
              onSelect: () => navigate(`/admin/policies?center=${center.id}`)
            }
          ]
        : []),
      {
        id: 'archive',
        icon: 'inventory_2',
        label: t(`${key}.detail.archive`),
        tone: 'danger',
        onSelect: () => onArchive(center)
      }
    ]
  }
  function go(centerId: string) {
    navigate(`/admin/centers/${centerId}`)
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-230 text-left text-sm'>
        <thead className='bg-surface-container-low/70 text-xs font-semibold text-on-surface-variant'>
          <tr>
            {(['center', 'contact', 'manager', 'status', 'action'] as const).map((column) => (
              <th className={`px-5 py-3 ${column === 'action' ? 'text-right' : ''}`} key={column} scope='col'>
                {t(`${key}.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-outline-variant/25'>
          {rows.map((center) => {
            const archived = center.centerStatus === 'ARCHIVED'
            return (
              <tr
                className={`transition-colors hover:bg-mint-50/60 ${archived ? 'text-on-surface-variant' : ''}`}
                key={center.id}
              >
                <td className='px-5 py-3.5'>
                  <span className='flex items-center gap-3'>
                    <CenterLogo center={center} />
                    <span className='min-w-0'>
                      <Link
                        className='block font-semibold text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-primary'
                        to={`/admin/centers/${center.id}`}
                      >
                        {center.centerName}
                      </Link>
                      <span className='block max-w-80 truncate text-xs text-on-surface-variant'>
                        {center.address || '—'}
                      </span>
                    </span>
                  </span>
                </td>
                <td className='px-5 py-3.5'>
                  <span className='block'>{center.email || '—'}</span>
                  <span className='block text-xs tabular-nums text-on-surface-variant'>
                    {center.phoneNumber || '—'}
                    {center.operatingHours ? ` · ${hoursLabel(center.operatingHours)}` : ''}
                  </span>
                </td>
                <td className='px-5 py-3.5'>
                  {center.managerUserId ? (
                    <ManagerName
                      known={managerName.get(center.managerUserId)}
                      listLoaded={managersLoaded}
                      userId={center.managerUserId}
                    />
                  ) : (
                    <span className='text-on-surface-variant'>{t(`${key}.noManager`)}</span>
                  )}
                </td>
                <td className='px-5 py-3.5'>
                  <ProviderStatusBadge status={center.centerStatus}>
                    {t(`${key}.status.${center.centerStatus}`)}
                  </ProviderStatusBadge>
                  {archived && center.updatedAt ? (
                    <span className='mt-1 block text-xs'>
                      {t(`${key}.archivedOn`, { date: date.format(new Date(center.updatedAt)) })}
                    </span>
                  ) : null}
                </td>
                <td className='px-5 py-3.5'>
                  <span className='flex items-center justify-end gap-1'>
                    <Link
                      className={`inline-flex min-h-9 items-center gap-1 rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-forest-900 ${center.centerStatus === 'PENDING' ? 'bg-forest-900 text-white hover:bg-forest-800' : 'bg-mint-50 text-forest-800 hover:bg-mint-100'}`}
                      to={`/admin/centers/${center.id}`}
                    >
                      {center.centerStatus === 'PENDING' ? t(`${key}.reviewAction`) : t(`${key}.open`)}
                      <Icon className='text-base' name='chevron_right' />
                    </Link>
                    <ActionMenu items={menu(center)} label={t(`${key}.menu.label`, { name: center.centerName })} />
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
