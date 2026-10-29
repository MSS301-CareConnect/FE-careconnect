import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingLabel?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary shadow-xs hover:bg-primary-container focus-visible:outline-primary',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-surface-container-high focus-visible:outline-primary',
  outline:
    'border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low focus-visible:outline-primary',
  danger: 'bg-error text-on-error shadow-xs hover:bg-error/90 focus-visible:outline-error',
  ghost:
    'bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-primary'
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 rounded-lg px-3 py-1.5 text-xs gap-1.5',
  md: 'min-h-11 rounded-xl px-4 py-2.5 text-sm gap-2',
  lg: 'min-h-12 rounded-xl px-5 py-3 text-base gap-2.5'
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading)

  return (
    <button
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      type={type}
      {...rest}
    >
      {loading ? (
        <svg aria-hidden='true' className='h-4 w-4 shrink-0 animate-spin text-current' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' />
          <path className='opacity-90' d='M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z' fill='currentColor' />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
      {!loading ? rightIcon : null}
    </button>
  )
}
