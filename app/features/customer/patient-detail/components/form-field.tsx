import type { ReactNode } from 'react'

import { baseControlClass } from '~/shared/ui/form-field'

export const inputClassName = baseControlClass

export interface FormFieldProps {
  label: string
  hint?: string
  className?: string
  children: ReactNode
}

// The label wraps its control so every input gets an accessible name without manual ids.
export function FormField({ label, hint, className, children }: FormFieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 text-left ${className ?? ''}`}>
      <span className='text-sm font-medium text-on-surface'>{label}</span>
      {children}
      {hint ? <span className='text-xs text-on-surface-variant'>{hint}</span> : null}
    </label>
  )
}
