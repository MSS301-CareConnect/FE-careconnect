import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'

import { Icon } from './icon'
import { NavRailLink, navRailSpring, type NavRailItem } from './nav-rail-link'

export interface NavRailCollapsibleGroupData {
  key: string
  label: string
  icon: string
  items: NavRailItem[]
}

const DESKTOP_QUERY = '(min-width: 1024px)'

function subscribeDesktop(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {}
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** True from 1024 px, where a collapsed rail is an icon rail; below that the rail is a drawer with labels. */
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => typeof window.matchMedia === 'function' && window.matchMedia(DESKTOP_QUERY).matches,
    () => false
  )
}

function readOpenGroups(storageKey: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

/**
 * Which collapsible groups are open, remembered per browser. A group never toggled is open. Navigating into a closed
 * group opens it, so the current page is never hidden; it can be closed again by hand.
 */
export function useOpenNavGroups(storageKey: string, activeGroupKey: string | undefined) {
  const [openGroups, setOpenGroups] = useState(() => readOpenGroups(storageKey))
  const [seenActive, setSeenActive] = useState(activeGroupKey)

  const setGroupOpen = (key: string, open: boolean) => {
    setOpenGroups((previous) => {
      const next = { ...previous, [key]: open }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // Storage blocked: only the memory of the choice is lost.
      }
      return next
    })
  }

  // Adjusting state while rendering (not in an effect): the newly active group opens in the same render.
  if (activeGroupKey !== seenActive) {
    setSeenActive(activeGroupKey)
    if (activeGroupKey && openGroups[activeGroupKey] === false) setGroupOpen(activeGroupKey, true)
  }

  return { isOpen: (key: string) => openGroups[key] !== false, setGroupOpen }
}

/**
 * A parent section of the rail (EXE admin pattern, 2026-11-09). Expanded: a bold heading with the section icon and a
 * chevron that opens and closes its items, which sit indented under a guide line. On a collapsed desktop rail the
 * section is one icon whose items open in a flyout beside the rail.
 */
export function NavRailCollapsibleGroup({
  railId,
  group,
  open,
  onToggle,
  iconOnly,
  dense,
  layoutKey,
  onNavigate
}: {
  railId: string
  group: NavRailCollapsibleGroupData
  open: boolean
  onToggle: () => void
  /** The desktop rail is collapsed to icons. */
  iconOnly: boolean
  dense: boolean
  layoutKey: string
  onNavigate?: () => void
}) {
  const labelId = `${railId}-${group.key}`
  const panelId = `${railId}-${group.key}-panel`
  const hasActive = group.items.some((item) => item.active)
  const badge = group.items.reduce((sum, item) => sum + (item.badge ?? 0), 0)

  if (iconOnly) {
    return (
      <NavRailGroupFlyout
        group={group}
        hasActive={hasActive}
        layoutKey={layoutKey}
        onNavigate={onNavigate}
        railId={railId}
      />
    )
  }

  return (
    <div>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className='group/head flex h-11 w-full items-center gap-3 rounded-2xl p-1 pr-2 text-left transition-colors duration-200 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mint-300'
        onClick={onToggle}
        type='button'
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${hasActive ? 'bg-mint-300/20 text-mint-200' : 'bg-white/[0.08] text-mint-200/90 group-hover/head:bg-white/[0.12]'}`}
        >
          <Icon className='text-[20px]' filled={hasActive} name={group.icon} />
        </span>
        <span
          className='min-w-0 flex-1 truncate text-[13px] font-bold tracking-[0.06em] text-white uppercase'
          id={labelId}
        >
          {group.label}
        </span>
        {!open && hasActive ? <span aria-hidden='true' className='h-2 w-2 shrink-0 rounded-full bg-mint-300' /> : null}
        {!open && badge > 0 ? (
          <span
            aria-hidden='true'
            className='grid min-w-6 shrink-0 place-items-center rounded-full bg-peach-300 px-1.5 text-[11px] leading-6 font-bold text-forest-950 tabular-nums'
          >
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
        <Icon
          className={`shrink-0 text-[20px] text-white/55 transition-transform duration-200 group-hover/head:text-white motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
          name='expand_more'
        />
      </button>
      {/* Grid-row trick: height animates to the content's own size; a closed panel is inert and invisible. */}
      <div
        className={`grid transition-[grid-template-rows,opacity,visibility] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${open ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0'}`}
        id={panelId}
        inert={!open}
      >
        <div className='min-h-0 overflow-hidden'>
          <ul aria-labelledby={labelId} className='mt-1 ml-[1.375rem] space-y-0.5 border-l border-white/10 pl-2'>
            {group.items.map((item) => (
              <li key={item.key}>
                <NavRailLink
                  collapsed={false}
                  dense={dense}
                  item={item}
                  layoutKey={layoutKey}
                  nested
                  onNavigate={onNavigate}
                  showLabels=''
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const FLYOUT_GAP = 10
const FLYOUT_EDGE = 8

/**
 * A section on the collapsed desktop rail: one icon; hover, click or ↓ opens its items beside the rail. The icon is the
 * section's own until one of its items is the current page, then that item's icon (on a round mint badge) stands in.
 */
function NavRailGroupFlyout({
  railId,
  group,
  hasActive,
  layoutKey,
  onNavigate
}: {
  railId: string
  group: NavRailCollapsibleGroupData
  hasActive: boolean
  layoutKey: string
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const focusOnOpen = useRef<'first' | 'last' | null>(null)
  const menuId = `${railId}-${group.key}-flyout`
  const activeItem = group.items.find((item) => item.active)
  const badge = group.items.reduce((sum, item) => sum + (item.badge ?? 0), 0)

  const links = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a') ?? [])
  const cancelClose = () => clearTimeout(closeTimer.current)
  const show = () => {
    cancelClose()
    setOpen(true)
  }
  const close = (delay = 0) => {
    cancelClose()
    if (delay > 0) closeTimer.current = setTimeout(() => setOpen(false), delay)
    else setOpen(false)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  // Placed once it has rendered hidden, so its height is known: level with the icon, pushed up near the bottom edge.
  // Written to the DOM directly — a position is not React state — then the first or last link takes focus.
  useLayoutEffect(() => {
    const menu = menuRef.current
    const trigger = triggerRef.current?.getBoundingClientRect()
    if (!open || !menu || !trigger) return
    const rail = triggerRef.current?.closest('aside')?.getBoundingClientRect()
    const top = Math.max(FLYOUT_EDGE, Math.min(trigger.top - 8, window.innerHeight - menu.offsetHeight - FLYOUT_EDGE))
    menu.style.top = `${top}px`
    menu.style.left = `${(rail?.right ?? trigger.right) + FLYOUT_GAP}px`
    menu.style.visibility = 'visible'
    if (focusOnOpen.current) {
      const list = links()
      ;(focusOnOpen.current === 'first' ? list[0] : list[list.length - 1])?.focus()
      focusOnOpen.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const hide = () => {
      clearTimeout(closeTimer.current)
      setOpen(false)
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const inside = menuRef.current?.contains(document.activeElement)
      hide()
      if (inside) triggerRef.current?.focus()
    }
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      hide()
    }
    const onResize = () => hide()
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const onTriggerKey = (event: KeyboardEvent) => {
    if (!['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) return
    event.preventDefault()
    const edge = event.key === 'ArrowUp' ? 'last' : 'first'
    if (open) {
      const list = links()
      ;(edge === 'last' ? list[list.length - 1] : list[0])?.focus()
    } else {
      focusOnOpen.current = edge
      show()
    }
  }

  const onMenuKey = (event: KeyboardEvent) => {
    const list = links()
    const index = list.indexOf(document.activeElement as HTMLElement)
    const move = (next: number) => {
      event.preventDefault()
      list[(next + list.length) % list.length]?.focus()
    }
    if (event.key === 'ArrowDown') move(index + 1)
    else if (event.key === 'ArrowUp') move(index - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(list.length - 1)
    else if (event.key === 'Tab') {
      // The flyout sits at the end of <body>: hand focus back to the icon and let Tab continue from there.
      close()
      triggerRef.current?.focus()
    }
  }

  return (
    <>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-label={activeItem ? `${activeItem.label} (${group.label})` : group.label}
        className={`group/rail relative flex h-11 w-full items-center justify-center rounded-full p-1 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mint-300 ${hasActive ? 'text-white' : open ? 'bg-white/[0.06] text-white' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'}`}
        onClick={() => (open ? close() : show())}
        onKeyDown={onTriggerKey}
        onMouseEnter={show}
        onMouseLeave={() => close(150)}
        ref={triggerRef}
        type='button'
      >
        {hasActive ? (
          <motion.span
            aria-hidden='true'
            className='absolute inset-0 rounded-full bg-white/[0.09] ring-1 ring-white/10'
            layoutId={`${layoutKey}-rail-active`}
            transition={navRailSpring}
          />
        ) : null}
        <span
          className={`relative grid h-9 w-9 shrink-0 place-items-center transition-[background-color,transform] duration-200 group-active/rail:scale-95 ${hasActive ? 'rounded-full bg-mint-300 text-forest-950 shadow-[0_8px_18px_-8px_rgb(132_214_185/0.9)]' : 'rounded-xl bg-white/[0.08] text-mint-200/90 group-hover/rail:bg-white/[0.12]'}`}
        >
          <Icon className='text-[20px]' filled={hasActive} name={activeItem?.icon ?? group.icon} />
          {badge > 0 ? (
            <span
              aria-hidden='true'
              className='absolute -top-1 -right-1 grid min-w-[18px] place-items-center rounded-full bg-peach-300 px-1 text-[10px] leading-[18px] font-bold text-forest-950 tabular-nums ring-2 ring-forest-900'
            >
              {badge > 99 ? '99+' : badge}
            </span>
          ) : null}
        </span>
      </button>
      {open
        ? createPortal(
            <div
              className='fixed z-[60] w-60 rounded-3xl bg-forest-900 p-2 text-white shadow-[var(--shadow-float)] ring-1 ring-white/10'
              id={menuId}
              onKeyDown={onMenuKey}
              onMouseEnter={cancelClose}
              onMouseLeave={() => close(150)}
              ref={menuRef}
              style={{ top: 0, left: 0, visibility: 'hidden' }}
            >
              <p
                className='px-3 pt-2 pb-1.5 text-[12px] font-bold tracking-[0.06em] text-white uppercase'
                id={`${menuId}-label`}
              >
                {group.label}
              </p>
              <ul aria-labelledby={`${menuId}-label`} className='space-y-0.5'>
                {group.items.map((item) => (
                  <li key={item.key}>
                    <Link
                      aria-current={item.active ? 'page' : undefined}
                      className={`flex h-10 items-center gap-3 rounded-full p-1 pr-3 text-[13px] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-mint-300 ${item.active ? 'bg-white/[0.09] font-semibold text-white ring-1 ring-white/10' : 'font-medium text-white/70 hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06]'}`}
                      onClick={() => {
                        close()
                        onNavigate?.()
                      }}
                      to={item.to}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.active ? 'bg-mint-300 text-forest-950' : 'bg-white/[0.04]'}`}
                      >
                        <Icon className='text-[19px]' filled={item.active} name={item.icon} />
                      </span>
                      <span className='min-w-0 flex-1 truncate'>{item.label}</span>
                      {(item.badge ?? 0) > 0 ? (
                        <span
                          aria-label={item.badgeLabel}
                          className='grid min-w-6 place-items-center rounded-full bg-peach-300 px-1.5 text-[11px] leading-6 font-bold text-forest-950 tabular-nums'
                        >
                          {(item.badge ?? 0) > 99 ? '99+' : item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
