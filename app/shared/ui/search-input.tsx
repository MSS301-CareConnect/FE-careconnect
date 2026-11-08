import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { baseControlClass } from './form-field'
import { Icon } from './icon'

export interface SearchInputProps {
  value: string
  /** Called after typing pauses for `delay` ms, and at once when cleared. */
  onChange: (value: string) => void
  label: string
  placeholder?: string
  delay?: number
  className?: string
}

/** Search box with an icon and a clear button; it reports the text only after typing pauses (debounce). */
export function SearchInput({ value, onChange, label, placeholder, delay = 300, className = '' }: SearchInputProps) {
  const { t } = useTranslation()
  const [text, setText] = useState(value)
  const [shown, setShown] = useState(value)
  const latest = useRef(onChange)
  useEffect(() => {
    latest.current = onChange
  })

  // A new value from outside (back button, "clear all") replaces what was typed.
  if (value !== shown) {
    setShown(value)
    setText(value)
  }

  useEffect(() => {
    if (text === value) return
    const timer = window.setTimeout(() => latest.current(text), delay)
    return () => window.clearTimeout(timer)
  }, [text, value, delay])

  return (
    <div className={`relative ${className}`}>
      <Icon
        className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xl text-on-surface-variant'
        name='search'
      />
      <input
        aria-label={label}
        className={`${baseControlClass} pr-11 pl-10 [&::-webkit-search-cancel-button]:hidden`}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onChange(text)
        }}
        placeholder={placeholder}
        type='search'
        value={text}
      />
      {text ? (
        <button
          aria-label={t('common.kit.clearSearch')}
          className='absolute top-1/2 right-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
          onClick={() => {
            setText('')
            onChange('')
          }}
          type='button'
        >
          <Icon className='text-lg' name='close' />
        </button>
      ) : null}
    </div>
  )
}
