import { Icon } from './icon'

export interface ChipOption {
  value: string
  label: string
  icon?: string
}

/**
 * A single-choice row of chips (quick filters). It scrolls sideways on phones without showing a scrollbar; each chip
 * is a toggle button so the current choice is announced as pressed.
 */
export function FilterChips({
  label,
  options,
  value,
  onChange,
  className = ''
}: {
  label: string
  options: ChipOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div
      aria-label={label}
      className={`cc-no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 ${className}`}
      role='group'
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            aria-pressed={active}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-brand-300 hover:bg-brand-50'}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type='button'
          >
            {option.icon ? <Icon className='text-lg' name={option.icon} /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
