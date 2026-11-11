import { useState, type InputHTMLAttributes } from 'react'

export interface OtpInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'maxLength' | 'type'
> {
  value: string
  onChange: (value: string) => void
  /** Number of digits, 6 by default. */
  length?: number
}

/**
 * One-time code as a row of digit boxes. A single real input lies over the boxes (transparent text), so typing, paste,
 * SMS autofill (`one-time-code`), Backspace and screen readers all work on one field; the boxes only draw its value and
 * where the next digit goes. Takes the `FormField` control props (`id`, `aria-invalid`, `aria-describedby`).
 */
export function OtpInput({ value, onChange, length = 6, className = '', onFocus, onBlur, ...props }: OtpInputProps) {
  const [focused, setFocused] = useState(false)
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  const active = Math.min(value.length, length - 1)

  return (
    <div className={`relative inline-flex gap-2 sm:gap-2.5 ${className}`}>
      {Array.from({ length }, (_, index) => {
        const digit = value[index]
        // The box the next digit goes to (the last one once full) shows the focus.
        const current = focused && index === active
        return (
          <span
            aria-hidden='true'
            className={`grid h-14 w-11 place-items-center rounded-2xl border-2 bg-surface-container-lowest text-2xl font-bold text-forest-950 tabular-nums transition-[border-color,box-shadow] duration-150 sm:h-16 sm:w-12 ${
              invalid
                ? current
                  ? 'border-error shadow-[0_0_0_4px_rgb(186_26_26/0.14)]'
                  : 'border-error/60'
                : current
                  ? 'border-forest-900 shadow-[0_0_0_4px_rgb(4_88_54/0.12)]'
                  : digit
                    ? 'border-forest-700/40'
                    : 'border-outline-variant'
            }`}
            key={index}
          >
            {digit ?? (current ? <span className='h-7 w-0.5 animate-pulse rounded-full bg-forest-900' /> : null)}
          </span>
        )
      })}
      <input
        {...props}
        autoComplete='one-time-code'
        className='absolute inset-0 h-full w-full cursor-text rounded-2xl bg-transparent text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent'
        inputMode='numeric'
        maxLength={length}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, length))}
        onFocus={(event) => {
          setFocused(true)
          // Keep the caret at the end so a new digit always fills the next box.
          event.target.setSelectionRange(event.target.value.length, event.target.value.length)
          onFocus?.(event)
        }}
        pattern='[0-9]*'
        type='text'
        value={value}
      />
    </div>
  )
}
