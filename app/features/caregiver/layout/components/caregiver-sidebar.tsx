import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { NavRail, NavRailBrand, NavRailToggle } from '~/shared/ui/nav-rail'

import { activeCaregiverNavigation, caregiverNavigation } from '../caregiver-navigation.constants'

export const CAREGIVER_SIDEBAR_ID = 'caregiver-sidebar'

/**
 * Desktop (≥1024 px) navigation: the floating forest rail of the operations portals, 240 px wide or a 76 px icon rail
 * with tooltips when collapsed. Phones use the bottom tab bar.
 */
export function CaregiverSidebar({
  collapsed,
  onToggle,
  toAccept,
  requests
}: {
  collapsed: boolean
  onToggle: () => void
  toAccept: number
  requests: number
}) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const active = activeCaregiverNavigation(pathname)
  const badge = toAccept + requests

  return (
    <NavRail
      brand={
        <NavRailBrand
          brand={t('common.brand')}
          collapsed={collapsed}
          role={t('caregiver.identity.role')}
          to='/caregiver/today'
        />
      }
      collapsed={collapsed}
      footer={
        <NavRailToggle
          collapseLabel={t('caregiver.nav.collapse')}
          collapsed={collapsed}
          controls={CAREGIVER_SIDEBAR_ID}
          expandLabel={t('caregiver.nav.expand')}
          onToggle={onToggle}
        />
      }
      groups={[
        {
          key: 'main',
          items: caregiverNavigation.map((item) => ({
            key: item.key,
            label: t(`caregiver.nav.${item.key}`),
            icon: item.icon,
            to: item.to,
            active: active?.key === item.key,
            badge: item.key === 'visits' ? badge : 0,
            badgeLabel: t('caregiver.nav.needsResponse', { count: badge })
          }))
        }
      ]}
      id={CAREGIVER_SIDEBAR_ID}
      label={t('caregiver.nav.label')}
      layoutKey='caregiver'
    />
  )
}
