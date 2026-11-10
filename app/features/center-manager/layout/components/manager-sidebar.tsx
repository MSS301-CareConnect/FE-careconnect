import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { NavRail, NavRailBrand, NavRailToggle } from '~/shared/ui/nav-rail'

import { isActiveManagerItem, managerNavigation } from '../manager-navigation.constants'

export const MANAGER_SIDEBAR_ID = 'manager-sidebar'

/**
 * Center Manager navigation ("Soft Bento", 2026-11-09): the floating forest rail with two groups. From 1024 px it is
 * fixed and collapses to an icon rail with tooltips; below that it is a drawer opened from the topbar.
 */
export function ManagerSidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapsed
}: {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <>
      {open ? (
        <div
          aria-hidden='true'
          className='fixed inset-0 z-40 bg-forest-950/40 backdrop-blur-[2px] lg:hidden'
          onClick={onClose}
        />
      ) : null}
      <NavRail
        brand={
          <NavRailBrand
            action={
              <button
                aria-label={t('centerManager.closeMenu')}
                className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-mint-300 lg:hidden'
                onClick={onClose}
                type='button'
              >
                <Icon name='close' />
              </button>
            }
            brand={t('common.brand')}
            collapsed={collapsed}
            onNavigate={onClose}
            role={t('centerManager.role')}
            to='/center-manager/caregivers'
          />
        }
        collapsed={collapsed}
        footer={
          <NavRailToggle
            collapseLabel={t('centerManager.collapseMenu')}
            collapsed={collapsed}
            controls={MANAGER_SIDEBAR_ID}
            expandLabel={t('centerManager.expandMenu')}
            onToggle={onToggleCollapsed}
          />
        }
        groups={managerNavigation.map((group) => ({
          key: group.key,
          label: t(`centerManager.groups.${group.key}`),
          items: group.items.map((item) => ({
            key: item.key,
            label: t(item.label),
            icon: item.icon,
            to: item.to,
            active: isActiveManagerItem(item, pathname)
          }))
        }))}
        id={MANAGER_SIDEBAR_ID}
        label={t('centerManager.menu')}
        layoutKey='manager'
        mobile='drawer'
        mobileOpen={open}
        onNavigate={onClose}
        wide
      />
    </>
  )
}
