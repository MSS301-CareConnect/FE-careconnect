import { motion } from 'motion/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'

import { Icon } from './icon'

export interface NavRailItem {
  key: string
  label: string
  icon: string
  to: string
  active: boolean
  /** A count on the item; hidden when zero. */
  badge?: number
  badgeLabel?: string
}

export const navRailSpring = { type: 'spring' as const, stiffness: 420, damping: 36 }

/**
 * One item of the rail: a round icon and its label. `nested` is a child of a collapsible group — a smaller, lighter
 * row so the group heading above it reads as the parent.
 */
export function NavRailLink({
  item,
  collapsed,
  dense,
  layoutKey,
  showLabels,
  onNavigate,
  nested = false
}: {
  item: NavRailItem
  collapsed: boolean
  dense: boolean
  layoutKey: string
  showLabels: string
  onNavigate?: () => void
  nested?: boolean
}) {
  const badge = item.badge ?? 0
  // The tooltip of a collapsed rail is portalled to <body> at the item's position: the rail scrolls and clips its
  // content, so a tooltip inside it would be cut off at the rail's edge.
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null)
  const showTip = (event: { currentTarget: HTMLElement }) => {
    if (!collapsed) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTip({ top: rect.top + rect.height / 2, left: rect.right + 18 })
  }
  const hideTip = () => setTip(null)
  const height = nested ? 'h-10' : dense ? 'h-11' : 'h-12'
  const circle = nested ? 'h-8 w-8' : dense ? 'h-9 w-9' : 'h-10 w-10'
  const text = nested ? 'text-[13px] font-medium' : 'text-sm font-semibold'
  const idle = nested
    ? 'text-white/60 hover:bg-white/[0.06] hover:text-white'
    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'

  return (
    <Link
      aria-current={item.active ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={`group/rail relative flex items-center gap-3 rounded-full p-1 whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mint-300 ${height} ${text} ${item.active ? 'font-semibold text-white' : idle}`}
      onBlur={hideTip}
      onClick={() => {
        hideTip()
        onNavigate?.()
      }}
      onFocus={showTip}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      to={item.to}
    >
      {item.active ? (
        <motion.span
          aria-hidden='true'
          className='absolute inset-0 rounded-full bg-white/[0.09] ring-1 ring-white/10'
          layoutId={`${layoutKey}-rail-active`}
          transition={navRailSpring}
        />
      ) : null}
      <span
        className={`relative grid shrink-0 place-items-center rounded-full ${circle} transition-[background-color,color,transform] duration-200 group-active/rail:scale-95 ${item.active ? 'bg-mint-300 text-forest-950 shadow-[0_8px_18px_-8px_rgb(132_214_185/0.9)]' : 'bg-white/[0.04] group-hover/rail:bg-white/10'}`}
      >
        <Icon className={nested ? 'text-[19px]' : 'text-[21px]'} filled={item.active} name={item.icon} />
        {badge > 0 && collapsed ? (
          <span
            aria-label={item.badgeLabel}
            className='absolute -top-1 -right-1 grid min-w-[18px] place-items-center rounded-full bg-peach-300 px-1 text-[10px] leading-[18px] font-bold text-forest-950 tabular-nums ring-2 ring-forest-900'
          >
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </span>
      <span className={`relative line-clamp-2 min-w-0 flex-1 leading-tight whitespace-normal ${showLabels}`}>
        {item.label}
      </span>
      {badge > 0 && !collapsed ? (
        <span
          aria-label={item.badgeLabel}
          className='relative mr-2 grid min-w-6 place-items-center rounded-full bg-peach-300 px-1.5 text-[11px] leading-6 font-bold text-forest-950 tabular-nums'
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
      {collapsed && tip
        ? createPortal(
            <motion.span
              animate={{ opacity: 1, x: 0 }}
              aria-hidden='true'
              className='pointer-events-none fixed z-[60] hidden -translate-y-1/2 rounded-full bg-forest-950 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-[var(--shadow-soft)] lg:block'
              initial={{ opacity: 0, x: -4 }}
              style={{ top: tip.top, left: tip.left }}
              transition={{ duration: 0.15 }}
            >
              {item.label}
            </motion.span>,
            document.body
          )
        : null}
    </Link>
  )
}
