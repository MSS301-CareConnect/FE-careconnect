import { motion } from 'motion/react'
import { useId, useRef, type KeyboardEvent } from 'react'

import { tabId, tabPanelId, type TabItem } from './tabs'

const spring = { type: 'spring' as const, stiffness: 420, damping: 36 }

/**
 * "Soft Bento" tabs (docs/2026-11-09-UI_REDESIGN_PLAN.md §5): a white pill track whose current tab is a dark forest pill
 * that slides between tabs (`layoutId`), like "Overview · Shared · Comments" of the reference. Same contract as `Tabs`
 * (roving tabindex, arrow keys / Home / End, `tabId` / `tabPanelId` for the caller's panel); the row scrolls sideways
 * on phones.
 */
export function PillTabs<T extends string>({
  label,
  items,
  value,
  onChange,
  idBase,
  className = ''
}: {
  label: string
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  idBase: string
  className?: string
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const layoutId = useId()

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((item) => item.value === value)
    const last = items.length - 1
    const next =
      event.key === 'ArrowRight'
        ? index >= last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index <= 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1
    if (next < 0) return
    event.preventDefault()
    onChange(items[next].value)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div className={`cc-no-scrollbar -mx-1 overflow-x-auto px-1 py-1 ${className}`}>
      <div
        aria-label={label}
        className='inline-flex min-w-max gap-1 rounded-full bg-white/85 p-1 shadow-[var(--shadow-card)] ring-1 ring-forest-900/5'
        onKeyDown={onKeyDown}
        ref={listRef}
        role='tablist'
      >
        {items.map((item) => {
          const active = item.value === value
          return (
            <button
              aria-controls={tabPanelId(idBase)}
              aria-selected={active}
              className={`relative inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest-900 ${active ? 'text-white' : 'text-on-surface-variant hover:bg-mint-50 hover:text-forest-900'}`}
              id={tabId(idBase, item.value)}
              key={item.value}
              onClick={() => onChange(item.value)}
              role='tab'
              tabIndex={active ? 0 : -1}
              type='button'
            >
              {active ? (
                <motion.span
                  aria-hidden='true'
                  className='absolute inset-0 rounded-full bg-forest-900 shadow-[0_8px_18px_-10px_rgb(12_43_37/0.8)]'
                  layoutId={layoutId}
                  transition={spring}
                />
              ) : null}
              <span className='relative'>{item.label}</span>
              {item.badge ? (
                <span
                  className={`relative min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs leading-4 font-bold tabular-nums ${item.badgeTone === 'attention' ? 'bg-peach-300 text-forest-950' : active ? 'bg-mint-300 text-forest-950' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
