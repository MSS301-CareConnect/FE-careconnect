import { Icon } from './icon'

export interface ChipOption {
  value: string
  label: string
  icon?: string
  /** Number shown in a small pill after the label (e.g. how many shifts have this status). */
  count?: number
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
            {option.count !== undefined ? (
              <span
                className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums ${active ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
