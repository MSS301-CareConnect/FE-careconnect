import { type ReactNode } from 'react'
import { Link } from 'react-router'

import { Icon } from './icon'
import { NavRailCollapsibleGroup, useIsDesktop, useOpenNavGroups } from './nav-rail-group'
import { NavRailLink, type NavRailItem } from './nav-rail-link'

export type { NavRailItem } from './nav-rail-link'

export interface NavRailGroup {
  key: string
  /** Group heading; shown above the items when expanded, a thin divider when collapsed. */
  label?: string
  /**
   * A labelled group with an icon and `collapsible` becomes a parent section: a bold heading that opens and closes its
   * items (remembered per browser), and one icon with a flyout on a collapsed desktop rail.
   */
  icon?: string
  collapsible?: boolean
  items: NavRailItem[]
}

/**
 * "Soft Bento" operations sidebar (2026-11-09, docs/2026-11-09-UI_REDESIGN_PLAN.md phase 4): a floating deep-forest
 * pill inset from the page edge. Every item is a round icon; the current one sits on a mint circle and a soft pill that
 * slides between items (`layoutId`). Collapsed, it is a 76 px icon rail whose items show a tooltip on hover and focus
 * (portalled to <body>, since the scrolling rail clips its content).
 *
 * `mobile='drawer'` turns it into an off-canvas drawer below 1024 px (`mobileOpen`); `mobile='hidden'` hides it there
 * (the portal has its own bottom navigation).
 */
export function NavRail({
  id,
  layoutKey,
  label,
  groups,
  collapsed = false,
  brand,
  footer,
  mobile = 'hidden',
  mobileOpen = false,
  onNavigate,
  wide = false,
  dense = false
}: {
  id: string
  /** Unique per portal so two rails never share the sliding indicator. */
  layoutKey: string
  label: string
  groups: NavRailGroup[]
  collapsed?: boolean
  brand: ReactNode
  footer?: ReactNode
  mobile?: 'hidden' | 'drawer'
  mobileOpen?: boolean
  onNavigate?: () => void
  /** 280 px instead of 240 px when expanded, for longer item labels. */
  wide?: boolean
  /** 44 px items and tighter groups, for long menus. */
  dense?: boolean
}) {
  const mobileClass =
    mobile === 'drawer'
      ? `flex max-lg:w-[17rem] max-lg:transition-[translate,visibility] max-lg:duration-300 ${mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:invisible max-lg:-translate-x-[calc(100%+1rem)]'}`
      : 'hidden lg:flex'
  // Item labels: hidden on a collapsed desktop rail, always shown in the phone drawer.
  const showLabels = collapsed ? (mobile === 'drawer' ? 'lg:hidden' : 'hidden') : ''
  const groupLabelHidden = collapsed ? (mobile === 'drawer' ? 'lg:sr-only' : 'sr-only') : ''
  // Parent sections become one icon with a flyout only on a collapsed desktop rail; the phone drawer keeps headings.
  const isDesktop = useIsDesktop()
  const iconOnly = collapsed && (mobile === 'hidden' || isDesktop)
  const activeGroupKey = groups.find((group) => group.collapsible && group.items.some((item) => item.active))?.key
  const { isOpen, setGroupOpen } = useOpenNavGroups(`careconnect.${layoutKey}.navOpenGroups`, activeGroupKey)

  return (
    <aside
      className={`fixed top-3 bottom-3 left-3 z-50 flex-col overflow-hidden rounded-[1.75rem] bg-forest-900 text-white shadow-[var(--shadow-float)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:z-30 lg:translate-x-0 print:hidden ${collapsed ? 'lg:w-[4.75rem]' : wide ? 'lg:w-[17.5rem]' : 'lg:w-60'} ${mobileClass}`}
      id={id}
    >
      {/* Soft glow in the top corner, like the dark cards of the reference. */}
      <span
        aria-hidden='true'
        className='pointer-events-none absolute -top-16 -right-20 h-48 w-48 rounded-full bg-mint-400/20 blur-3xl'
      />
      <div className='relative shrink-0 px-3 pt-4 pb-2'>{brand}</div>
      <nav aria-label={label} className='cc-no-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto px-3 py-2'>
        {groups.map((group, groupIndex) => {
          if (group.collapsible && group.label && group.icon) {
            const previousIsSection = groupIndex > 0 && Boolean(groups[groupIndex - 1].collapsible)
            return (
              <div className={groupIndex === 0 ? '' : iconOnly && previousIsSection ? 'mt-1' : 'mt-2'} key={group.key}>
                {/* Section icons stand together on the icon rail; one divider sets them apart from the items above. */}
                {iconOnly && groupIndex > 0 && !previousIsSection ? (
                  <span aria-hidden='true' className='mx-auto mb-2 block h-px w-8 bg-white/12' />
                ) : null}
                <NavRailCollapsibleGroup
                  dense={dense}
                  group={{ key: group.key, label: group.label, icon: group.icon, items: group.items }}
                  iconOnly={iconOnly}
                  layoutKey={layoutKey}
                  onNavigate={onNavigate}
                  onToggle={() => setGroupOpen(group.key, !isOpen(group.key))}
                  open={isOpen(group.key)}
                  railId={id}
                />
              </div>
            )
          }
          return (
            <div className={groupIndex > 0 ? (dense ? 'mt-3' : 'mt-4') : ''} key={group.key}>
              {group.label ? (
                <>
                  <p
                    className={`px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-white/45 uppercase ${groupLabelHidden}`}
                    id={`${id}-${group.key}`}
                  >
                    {group.label}
                  </p>
                  {collapsed && groupIndex > 0 ? (
                    <span aria-hidden='true' className='mx-auto mb-3 hidden h-px w-8 bg-white/12 lg:block' />
                  ) : null}
                </>
              ) : null}
              <ul aria-labelledby={group.label ? `${id}-${group.key}` : undefined} className='space-y-1'>
                {group.items.map((item) => (
                  <li key={item.key}>
                    <NavRailLink
                      collapsed={collapsed}
                      dense={dense}
                      item={item}
                      layoutKey={layoutKey}
                      onNavigate={onNavigate}
                      showLabels={showLabels}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
      <span
        aria-hidden='true'
        className='pointer-events-none relative -mt-6 h-6 shrink-0 bg-gradient-to-t from-forest-900 to-transparent'
      />
      {footer ? <div className='relative hidden shrink-0 border-t border-white/10 p-3 lg:block'>{footer}</div> : null}
    </aside>
  )
}

/** Brand block of a rail: a mint mark, the product name and the portal's role. */
export function NavRailBrand({
  to,
  brand,
  role,
  collapsed,
  onNavigate,
  action
}: {
  to: string
  brand: string
  role: string
  collapsed: boolean
  onNavigate?: () => void
  action?: ReactNode
}) {
  return (
    <div className={`flex items-center gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
      <Link
        aria-label={brand}
        className='flex min-w-0 flex-1 items-center gap-3 rounded-full p-1 focus-visible:outline-2 focus-visible:outline-mint-300 lg:flex-none'
        onClick={onNavigate}
        to={to}
      >
        <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mint-200 to-mint-400 text-forest-950 shadow-[0_10px_22px_-10px_rgb(79_191_155/0.9)]'>
          <Icon className='text-[21px]' filled name='volunteer_activism' />
        </span>
        <span className={`min-w-0 leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
          <strong className='block truncate text-[15px] font-bold tracking-tight text-white'>{brand}</strong>
          <span className='block truncate text-[11px] font-semibold tracking-[0.08em] text-mint-200/80 uppercase'>
            {role}
          </span>
        </span>
      </Link>
      {action}
    </div>
  )
}

/** The rail's collapse / expand toggle (desktop only). */
export function NavRailToggle({
  collapsed,
  controls,
  expandLabel,
  collapseLabel,
  onToggle
}: {
  collapsed: boolean
  controls: string
  expandLabel: string
  collapseLabel: string
  onToggle: () => void
}) {
  return (
    <button
      aria-controls={controls}
      aria-expanded={!collapsed}
      aria-label={collapsed ? expandLabel : collapseLabel}
      className={`hidden h-12 w-full items-center gap-3 rounded-full p-1 text-sm font-medium whitespace-nowrap text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-mint-300 lg:flex ${collapsed ? 'justify-center' : ''}`}
      onClick={onToggle}
      title={collapsed ? expandLabel : undefined}
      type='button'
    >
      <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.04]'>
        <Icon className='text-[21px]' name={collapsed ? 'left_panel_open' : 'left_panel_close'} />
      </span>
      {collapsed ? null : collapseLabel}
    </button>
  )
}
