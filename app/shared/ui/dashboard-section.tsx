import type { ReactNode } from 'react'

/** One titled band of a dashboard (money, operations, quality…): a heading, a one-line hint, then its cards. */
export function DashboardSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className='space-y-4'>
      <div>
        <h2 className='text-[22px] font-bold tracking-tight text-forest-950'>{title}</h2>
        <p className='text-sm text-on-surface-variant'>{hint}</p>
      </div>
      {children}
    </section>
  )
}
