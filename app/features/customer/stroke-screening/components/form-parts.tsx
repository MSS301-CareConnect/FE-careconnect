import { useId, type ReactNode } from 'react'

import { bentoCard } from '~/features/customer/ui/bento-styles'
import { Icon } from '~/shared/ui/icon'

/** One titled card of the screening form, in the customer "Soft Bento" style (icon tile, title, one line). */
export function FormSection({
  icon,
  title,
  description,
  children
}: {
  icon: string
  title: string
  description: string
  children: ReactNode
}) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className={`${bentoCard} p-5 sm:p-7`}>
      <div className='flex items-start gap-3'>
        <span className='grid size-10 shrink-0 place-items-center rounded-2xl bg-mint-100 text-forest-800'>
          <Icon className='text-xl' name={icon} />
        </span>
        <div className='min-w-0'>
          <h2 className='text-lg font-bold tracking-tight text-forest-950' id={titleId}>
            {title}
          </h2>
          <p className='text-sm text-on-surface-variant'>{description}</p>
        </div>
      </div>
      <div className='mt-5'>{children}</div>
    </section>
  )
}

export interface PillOption<T extends string> {
  value: T
  label: string
}

/**
 * Two or three exclusive answers as pills backed by real radio inputs (arrow keys, Space, screen readers). Nothing is
 * chosen until the customer answers, unlike `SegmentedControl`, because a medical question must not have a default.
 */
export function AnswerPills<T extends string>({
  options,
  value,
  onChange,
  labelledBy,
  describedBy,
  invalid = false,
  className = ''
}: {
  options: PillOption<T>[]
  value: T | null
  onChange: (value: T) => void
  /** Id of the visible question: the accessible name of the radio group. */
  labelledBy: string
  describedBy?: string
  invalid?: boolean
  className?: string
}) {
  const name = useId()
  return (
    <div
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-labelledby={labelledBy}
      className={`grid gap-1 rounded-full bg-surface-container-low p-1 ring-1 ${invalid ? 'ring-error/60' : 'ring-forest-900/5'} ${className}`}
      role='radiogroup'
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <label
            className={`relative flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest-900 ${active ? 'bg-forest-900 text-white shadow-[0_8px_18px_-10px_rgb(12_43_37/0.8)]' : 'text-on-surface-variant hover:bg-white hover:text-forest-900'}`}
            key={option.value}
          >
            <input
              checked={active}
              className='sr-only'
              name={name}
              onChange={() => onChange(option.value)}
              type='radio'
              value={option.value}
            />
            {active ? <Icon className='cc-pop text-base' name='check' /> : null}
            {option.label}
          </label>
        )
      })}
    </div>
  )
}

/** A yes / no health question: the question and its hint on the left, the answer pills on the right (stacked on phones). */
export function YesNoQuestion({
  label,
  hint,
  value,
  onChange,
  yesLabel,
  noLabel,
  error
}: {
  label: string
  hint: string
  value: boolean | null
  onChange: (value: boolean) => void
  yesLabel: string
  noLabel: string
  error?: string
}) {
  const id = useId()
  const labelId = `${id}-label`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const answer = value === null ? null : value ? 'yes' : 'no'
  return (
    <div className='flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6'>
      <div className='min-w-0'>
        <p className='text-sm font-semibold text-on-surface' id={labelId}>
          {label}
        </p>
        <p className='text-xs leading-5 text-on-surface-variant' id={hintId}>
          {hint}
        </p>
        {error ? (
          <p className='mt-1 text-xs font-medium text-error' id={errorId} role='alert'>
            {error}
          </p>
        ) : null}
      </div>
      <AnswerPills
        className='w-full shrink-0 sm:w-56'
        describedBy={error ? `${hintId} ${errorId}` : hintId}
        invalid={Boolean(error)}
        labelledBy={labelId}
        onChange={(next) => onChange(next === 'yes')}
        options={[
          { value: 'yes', label: yesLabel },
          { value: 'no', label: noLabel }
        ]}
        value={answer}
      />
    </div>
  )
}
