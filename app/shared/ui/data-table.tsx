import type { ReactNode } from 'react'

export interface DataTableShellProps {
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function DataTableShell({ children, footer, className = '' }: DataTableShellProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-xs ${className}`}
    >
      <div className='overflow-x-auto'>{children}</div>
      {footer ? <div className='border-t border-outline-variant/50 px-4 py-3.5'>{footer}</div> : null}
    </div>
  )
}
