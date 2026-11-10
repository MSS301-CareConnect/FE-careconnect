import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { NavRail, NavRailBrand, NavRailToggle } from '~/shared/ui/nav-rail'

import { adminNavigation, isActiveItem } from '../admin-navigation.constants'

export const ADMIN_SIDEBAR_ID = 'admin-sidebar'

type AdminSidebarProps = {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

/**
 * Admin navigation ("Soft Bento", 2026-11-09): the floating forest rail of the operations portals, grouped by area.
 * From 1024 px it is fixed and collapses to an icon rail with tooltips; below that it is a drawer from the topbar.
 */
export function AdminSidebar({ open, onClose, collapsed, onToggleCollapsed }: AdminSidebarProps) {
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
                aria-label={t('admin.closeMenu')}
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
            role={t('admin.role')}
            to='/admin/dashboard'
          />
        }
        collapsed={collapsed}
        dense
        footer={
          <NavRailToggle
            collapseLabel={t('admin.collapseMenu')}
            collapsed={collapsed}
            controls={ADMIN_SIDEBAR_ID}
            expandLabel={t('admin.expandMenu')}
            onToggle={onToggleCollapsed}
          />
        }
        groups={adminNavigation.map((group) => ({
          key: group.key,
          // A one-item group needs no heading.
          label: group.labelled ? t(`admin.groups.${group.key}`) : undefined,
          // Labelled groups are parent sections that open and close (EXE admin pattern).
          icon: 'icon' in group ? group.icon : undefined,
          collapsible: group.labelled,
          items: group.items.map((item) => ({
            key: item.key,
            label: t(`admin.${item.key}`),
            icon: item.icon,
            to: item.to,
            active: isActiveItem(item, pathname)
          }))
        }))}
        id={ADMIN_SIDEBAR_ID}
        label={t('admin.menu')}
        layoutKey='admin'
        mobile='drawer'
        mobileOpen={open}
        onNavigate={onClose}
        wide
      />
    </>
  )
}
