import type { ReactNode } from 'react'

export const inputClassName =
  'w-full rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none'

export interface FormFieldProps {
  label: string
  hint?: string
  className?: string
  children: ReactNode
}

// The label wraps its control so every input gets an accessible name without manual ids.
export function FormField({ label, hint, className, children }: FormFieldProps) {
  return (
    <label className={`flex flex-col gap-1 text-left ${className ?? ''}`}>
      <span className='text-[11px] font-semibold text-on-surface-variant'>{label}</span>
      {children}
      {hint ? <span className='text-[11px] text-outline'>{hint}</span> : null}
    </label>
  )
}
