import { useId } from 'react'

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

/** Two to four mutually exclusive choices with a sliding indicator; backed by real radio inputs. */
export function SegmentedControl<T extends string>({
  legend,
  options,
  value,
  onChange,
  className = ''
}: {
  legend: string
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  const name = useId()
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )

  return (
    <fieldset className={className}>
      <legend className='sr-only'>{legend}</legend>
      <div
        className='relative grid rounded-xl bg-surface-container-low p-1'
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        <span
          aria-hidden='true'
          className='absolute top-1 bottom-1 left-1 rounded-lg bg-surface-container-lowest shadow-[var(--shadow-card)] transition-transform duration-200 ease-[var(--ease-out-soft)]'
          style={{
            width: `calc((100% - 0.5rem) / ${options.length})`,
            transform: `translateX(${index * 100}%)`
          }}
        />
        {options.map((option) => {
          const active = option.value === value
          return (
            <label
              className={`relative z-10 flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              key={option.value}
            >
              <input
                checked={active}
                className='sr-only'
                name={name}
                onChange={() => onChange(option.value)}
                type='radio'
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
