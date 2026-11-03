import type { ReactNode } from 'react'

/** A shimmering placeholder shaped like the content it stands for; give it the size of that content. */
export function Skeleton({ className = 'h-4 w-full rounded-md' }: { className?: string }) {
  return <span aria-hidden='true' className={`cc-skeleton block ${className}`} />
}

/** A labelled group of skeletons so screen readers hear one "loading" message. */
export function SkeletonGroup({
  label,
  children,
  className = ''
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div aria-busy='true' className={className} role='status'>
      <span className='sr-only'>{label}</span>
      {children}
    </div>
  )
}
