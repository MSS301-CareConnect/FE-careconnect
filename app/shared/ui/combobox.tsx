import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from 'react'
import { useTranslation } from 'react-i18next'

import { foldText } from '~/shared/lib/fold-text'

import { baseControlClass } from './form-field'
import { Icon } from './icon'
import { popoverAttribute, popoverPanelClass, stopLabelForwarding, useAnchoredPopover } from './use-anchored-popover'
import { useExitPresence } from '~/shared/lib/use-exit-presence'

export interface ComboboxOption {
  value: string
  /** Accessible name, also shown in the field once chosen. */
  name: string
  /** Main text in the list; defaults to `name`. */
  label?: string
  /** Small tag after the label, e.g. the unit type "Phường". */
  tag?: string
}

export interface ComboboxProps {
  id?: string
  value: string
  options: readonly ComboboxOption[]
  onChange: (value: string) => void
  placeholder: string
  searchPlaceholder?: string
  /** Material Symbols icon at the start of the field. */
  icon?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-describedby'?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

const ROW = 44

/**
 * Searchable single choice for long lists (provinces, wards). The field is a select-only combobox like `TimeSelect`;
 * its top-layer panel starts with a search box (case and Vietnamese diacritics ignored, every word must match) above
 * the options. Keyboard in the search box: ↑/↓ move, PageUp/PageDown jump, Enter picks, Esc closes, Tab leaves. A
 * value that is not among the options (older data) is still shown in the field as it is.
 */
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(function Combobox(
  {
    id,
    value,
    options,
    onChange,
    placeholder,
    searchPlaceholder,
    icon,
    disabled = false,
    loading = false,
    className = '',
    ...aria
  },
  ref
) {
  const { t } = useTranslation()
  const generatedId = useId()
  const triggerId = id ?? generatedId
  const listId = `${triggerId}-options`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [width, setWidth] = useState<number>()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement)

  const dismiss = useCallback(() => setOpen(false), [])
  const { present, state: panelState } = useExitPresence(open)
  const side = useAnchoredPopover({ open: present, anchorRef: triggerRef, panelRef, rootRef, onDismiss: dismiss })

  const selected = options.find((option) => option.value === value)
  const searchable = useMemo(
    () => options.map((option) => foldText(`${option.tag ?? ''} ${option.label ?? option.name} ${option.name}`)),
    [options]
  )
  const visible = useMemo(() => {
    const words = foldText(query).split(/\s+/).filter(Boolean)
    if (words.length === 0) return options
    return options.filter((_, index) => words.every((word) => searchable[index].includes(word)))
  }, [options, searchable, query])

  useEffect(() => {
    if (open) searchRef.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    const list = listRef.current
    if (!open || !list) return
    const top = active * ROW
    if (top < list.scrollTop) list.scrollTop = top
    else if (top + ROW > list.scrollTop + list.clientHeight) list.scrollTop = top + ROW - list.clientHeight
  }, [open, active])

  function show() {
    if (disabled || loading) return
    setQuery('')
    setActive(Math.max(0, selected ? options.indexOf(selected) : 0))
    setWidth(triggerRef.current?.offsetWidth)
    setOpen(true)
    requestAnimationFrame(() => {
      const list = listRef.current
      if (list && selected) list.scrollTop = Math.max(0, options.indexOf(selected) * ROW - list.clientHeight / 2)
    })
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function pick(option: ComboboxOption | undefined) {
    if (!option) return
    onChange(option.value)
    close()
  }

  function onTriggerKey(event: KeyboardEvent) {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      show()
    }
  }

  function onSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    const last = visible.length - 1
    const moves: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowUp: active - 1,
      PageDown: active + 8,
      PageUp: active - 8
    }
    if (event.key in moves) {
      event.preventDefault()
      setActive(Math.min(Math.max(0, last), Math.max(0, moves[event.key])))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      pick(visible[active])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  const shown = selected?.name ?? value
  const optionId = (index: number) => `${listId}-${index}`

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        {...aria}
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
        aria-haspopup='listbox'
        className={`${baseControlClass} flex items-center gap-2 text-left ${open ? 'border-primary ring-2 ring-primary/25' : 'hover:border-brand-300'}`}
        disabled={disabled || loading}
        id={triggerId}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onTriggerKey}
        ref={triggerRef}
        role='combobox'
        type='button'
      >
        {icon ? <Icon className='text-lg text-on-surface-variant' name={icon} /> : null}
        <span className={`min-w-0 flex-1 truncate ${shown && !loading ? 'text-on-surface' : 'text-outline'}`}>
          {loading ? t('common.kit.combobox.loading') : shown || placeholder}
        </span>
        <Icon
          className={`text-xl transition-transform duration-200 ${open ? 'rotate-180 text-primary' : 'text-on-surface-variant'}`}
          name='expand_more'
        />
      </button>
      {present ? (
        <div
          className={`${popoverPanelClass} cc-dropdown flex max-w-[calc(100vw-1rem)] min-w-[16rem] flex-col overflow-hidden ${side === 'top' ? 'origin-bottom-left' : 'origin-top-left'}`}
          data-side={side}
          data-state={panelState}
          onClick={(event) => stopLabelForwarding(event)}
          popover={popoverAttribute}
          ref={panelRef}
          style={{ width }}
        >
          <div className='border-b border-outline-variant/60 p-2'>
            <div className='flex items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary/25'>
              <Icon className='text-lg text-on-surface-variant' name='search' />
              <input
                aria-activedescendant={visible.length > 0 ? optionId(active) : undefined}
                aria-autocomplete='list'
                aria-controls={listId}
                aria-label={searchPlaceholder ?? t('common.kit.combobox.search')}
                autoComplete='off'
                className='min-h-10 w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline'
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActive(0)
                  if (listRef.current) listRef.current.scrollTop = 0
                }}
                onKeyDown={onSearchKey}
                placeholder={searchPlaceholder ?? t('common.kit.combobox.search')}
                ref={searchRef}
                type='search'
                value={query}
              />
            </div>
          </div>
          <div
            aria-label={searchPlaceholder ?? placeholder}
            className='max-h-72 overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:thin]'
            id={listId}
            ref={listRef}
            role='listbox'
          >
            {visible.map((option, index) => {
              const isSelected = option.value === value
              const isActive = index === active
              return (
                <div
                  aria-selected={isSelected}
                  className={`flex h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm transition-colors select-none ${isActive ? 'bg-brand-50' : ''} ${isSelected ? 'font-semibold text-primary' : 'text-on-surface'}`}
                  id={optionId(index)}
                  key={option.value}
                  onClick={() => pick(option)}
                  onMouseMove={() => !isActive && setActive(index)}
                  role='option'
                >
                  <span aria-hidden='true' className='min-w-0 flex-1 truncate'>
                    {option.label ?? option.name}
                  </span>
                  <span className='sr-only'>{option.name}</span>
                  {option.tag ? (
                    <span
                      aria-hidden='true'
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ${isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}
                    >
                      {option.tag}
                    </span>
                  ) : null}
                  <Icon
                    className={`shrink-0 text-lg text-primary ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                    name='check'
                  />
                </div>
              )
            })}
            {visible.length === 0 ? (
              <p className='px-3 py-6 text-center text-sm text-on-surface-variant' role='status'>
                {t('common.kit.combobox.empty', { query: query.trim() })}
              </p>
            ) : null}
          </div>
          {query.trim() && visible.length > 0 ? (
            <p
              aria-live='polite'
              className='border-t border-outline-variant/60 px-3.5 py-2 text-xs text-on-surface-variant tabular-nums'
            >
              {t('common.kit.combobox.count', { count: visible.length })}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
})
