import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

export interface TabItem<T extends string> {
  value: T
  label: string
  /** A count shown as a pill after the label; hidden when zero or undefined. */
  badge?: number
  /** Draws the badge in the attention colour (things the customer has to act on). */
  badgeTone?: 'neutral' | 'attention'
}

/**
 * Underlined tabs with a sliding indicator. Arrow keys, Home and End move between tabs (roving tabindex); the row
 * scrolls sideways on phones. The panel is the caller's: give it `id={tabPanelId(idBase)}` and
 * `aria-labelledby={tabId(idBase, value)}`.
 */
export function Tabs<T extends string>({
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
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    function measure() {
      const active = list?.querySelector<HTMLElement>('[aria-selected="true"]')
      if (!active) return
      setIndicator({ left: active.offsetLeft, width: active.offsetWidth })
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(list)
    return () => observer?.disconnect()
  }, [value, items])

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
    <div className={`border-b border-outline-variant ${className}`}>
      <div
        aria-label={label}
        className='cc-no-scrollbar relative -mb-px flex gap-1 overflow-x-auto'
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
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-t-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-4 ${active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'} ${indicator ? '' : active ? 'shadow-[inset_0_-2px_0_var(--color-primary)]' : ''}`}
              id={tabId(idBase, item.value)}
              key={item.value}
              onClick={() => onChange(item.value)}
              role='tab'
              tabIndex={active ? 0 : -1}
              type='button'
            >
              {item.label}
              {item.badge ? (
                <span
                  className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs leading-4 font-semibold tabular-nums ${item.badgeTone === 'attention' ? 'bg-warning-container text-on-warning-container' : active ? 'bg-brand-100 text-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
        {indicator ? (
          <span
            aria-hidden='true'
            className='pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary transition-[transform,width] duration-200 ease-[var(--ease-out-soft)]'
            style={{ width: indicator.width, transform: `translateX(${indicator.left}px)`, left: 0 }}
          />
        ) : null}
      </div>
    </div>
  )
}

export function tabId(idBase: string, value: string) {
  return `${idBase}-tab-${value}`
}

export function tabPanelId(idBase: string) {
  return `${idBase}-panel`
}
