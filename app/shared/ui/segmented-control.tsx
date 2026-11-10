import { useId } from 'react'

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

/**
 * Two to four mutually exclusive choices with a sliding indicator; backed by real radio inputs. "Soft Bento" (2026-11-09):
 * a soft pill track whose chosen option is a dark forest pill, like the "Weekly · Monthly" switch of the reference.
 */
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
        className='relative grid rounded-full bg-surface-container-low p-1 ring-1 ring-forest-900/5'
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        <span
          aria-hidden='true'
          className='absolute top-1 bottom-1 left-1 rounded-full bg-forest-900 shadow-[0_8px_18px_-10px_rgb(12_43_37/0.8)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
          style={{
            width: `calc((100% - 0.5rem) / ${options.length})`,
            transform: `translateX(${index * 100}%)`
          }}
        />
        {options.map((option) => {
          const active = option.value === value
          return (
            <label
              className={`relative z-10 flex min-h-10 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest-900 ${active ? 'text-white' : 'text-on-surface-variant hover:text-forest-900'}`}
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
