import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { popoverAttribute, popoverPanelClass, useAnchoredPopover } from '~/shared/ui/use-anchored-popover'

import { suggestMedications } from './medication-catalog'
import type { MedicationCatalogEntry } from './medication-catalog.constants'

export interface MedicationNameInputProps {
  value: string
  onChange: (value: string) => void
  /** Called after a suggestion fills the name, so forms can prefill related empty fields. */
  onSelect?: (entry: MedicationCatalogEntry) => void
  /** Required: a wrapping label would otherwise absorb the suggestion text into the name. */
  'aria-label': string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  id?: string
  placeholder?: string
  className?: string
  containerClassName?: string
}

/**
 * Free-text medication name with catalog suggestions after the first typed characters. The list opens in the top layer
 * so a scrolling dialog never clips it.
 */
export function MedicationNameInput({
  value,
  onChange,
  onSelect,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  id,
  placeholder,
  className,
  containerClassName = 'relative'
}: MedicationNameInputProps) {
  const { t } = useTranslation()
  const listId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const suggestions = useMemo(() => suggestMedications(value), [value])
  const alreadyChosen = suggestions.length === 1 && suggestions[0].medicationName === value
  const isExpanded = isOpen && suggestions.length > 0 && !alreadyChosen
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const dismiss = useCallback(() => setIsOpen(false), [])
  useAnchoredPopover({ open: isExpanded, anchorRef: inputRef, panelRef: listRef, rootRef, onDismiss: dismiss, gap: 4 })

  function choose(entry: MedicationCatalogEntry) {
    onChange(entry.medicationName)
    onSelect?.(entry)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!suggestions.length) return
      event.preventDefault()
      setIsOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => (index + step + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter' && isExpanded && activeIndex >= 0) {
      event.preventDefault()
      choose(suggestions[activeIndex])
    } else if (event.key === 'Escape' && isExpanded) {
      event.preventDefault()
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className={containerClassName} ref={rootRef}>
      <input
        id={id}
        ref={inputRef}
        type='text'
        role='combobox'
        autoComplete='off'
        maxLength={255}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-autocomplete='list'
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? listId : undefined}
        aria-activedescendant={isExpanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value)
          setIsOpen(true)
          setActiveIndex(-1)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setIsOpen(false)}
        className={className}
      />
      {isExpanded ? (
        <ul
          id={listId}
          role='listbox'
          aria-label={t('customer.careRecipient.medicationSuggestions')}
          className={`${popoverPanelClass} max-h-64 w-[min(24rem,calc(100vw-1rem))] overflow-y-auto rounded-lg py-1 text-left`}
          popover={popoverAttribute}
          ref={listRef}
        >
          {suggestions.map((entry, index) => (
            <li
              key={entry.medicationName}
              id={`${listId}-${index}`}
              role='option'
              aria-selected={index === activeIndex}
              // Keep focus in the input so blur does not close the list before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(entry)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-xs ${
                index === activeIndex ? 'bg-secondary-container/50' : 'hover:bg-surface-container-low'
              }`}
            >
              <span className='font-semibold text-on-surface'>{entry.medicationName}</span>
              <span className='shrink-0 text-[11px] text-on-surface-variant'>
                {t(`customer.careRecipient.route.${entry.route}`)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
