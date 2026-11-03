import type { ReactNode } from 'react'

import { Icon } from './icon'

export interface ChoiceCardProps {
  type: 'radio' | 'checkbox'
  name?: string
  value?: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
  children: ReactNode
  /** Shown under the content of a disabled card so the customer knows why it cannot be picked. */
  disabledReason?: ReactNode
  /** Content rendered inside the card but outside the label, e.g. a nested plan picker or a link. */
  footer?: ReactNode
  /** Hide the tick indicator, e.g. for compact time slots. */
  hideIndicator?: boolean
  className?: string
  describedBy?: string
}

/**
 * RadioCard / CheckboxCard: a large selectable card backed by a real input, so arrow keys, Space and screen readers
 * work. Selected = primary border + brand-50 fill + a tick that pops in.
 */
export function ChoiceCard({
  type,
  name,
  value,
  checked,
  disabled = false,
  onChange,
  children,
  disabledReason,
  footer,
  hideIndicator = false,
  className = '',
  describedBy
}: ChoiceCardProps) {
  const tone = disabled
    ? 'cursor-not-allowed border-outline-variant bg-surface-container-low/60 text-on-surface-variant'
    : checked
      ? 'cursor-pointer border-primary bg-brand-50 shadow-[0_0_0_1px_var(--color-primary)]'
      : 'cursor-pointer border-outline-variant bg-surface-container-lowest hover:border-brand-300 hover:bg-brand-50/40'

  return (
    <div
      className={`rounded-xl border transition-[border-color,background-color,box-shadow] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${tone} ${className}`}
    >
      <label className={`flex items-start gap-3 p-4 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          aria-describedby={describedBy}
          checked={checked}
          className='peer sr-only'
          disabled={disabled}
          name={name}
          onChange={onChange}
          type={type}
          value={value}
        />
        <span className='min-w-0 flex-1'>
          {children}
          {disabled && disabledReason ? (
            <span className='mt-2 flex items-start gap-1.5 text-xs leading-5 text-on-surface-variant'>
              <Icon className='mt-px text-sm' name='info' />
              <span>{disabledReason}</span>
            </span>
          ) : null}
        </span>
        {hideIndicator ? null : (
          <span
            aria-hidden='true'
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-2 transition-colors ${type === 'radio' ? 'rounded-full' : 'rounded-md'} ${checked ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest'}`}
          >
            {checked ? <Icon className='cc-pop text-[14px] font-bold' name='check' /> : null}
          </span>
        )}
      </label>
      {footer}
    </div>
  )
}
