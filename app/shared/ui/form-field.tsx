import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react'

export const baseControlClass =
  'w-full min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface transition-colors placeholder:text-outline focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:opacity-60 aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:ring-error/25'

export interface FormFieldProps {
  id?: string
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
  children: (controlProps: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode
}

export function FormField({ id: providedId, label, hint, error, className = '', children }: FormFieldProps) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className='block text-sm font-semibold text-on-surface' htmlFor={id}>
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy
      })}
      {hint ? (
        <p className='text-xs leading-5 text-on-surface-variant' id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className='text-xs font-medium leading-5 text-error' id={errorId} role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...props },
  ref
) {
  return <input className={`${baseControlClass} ${className}`} ref={ref} {...props} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className = '', children, ...props },
  ref
) {
  return (
    <select className={`${baseControlClass} ${className}`} ref={ref} {...props}>
      {children}
    </select>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className = '', ...props },
  ref
) {
  return <textarea className={`${baseControlClass} min-h-24 ${className}`} ref={ref} {...props} />
})
