import { useId, type ReactNode } from 'react'

import type { ChartSeries } from './chart-colors'

/** The white bento card every chart sits in: title, optional hint and action, then the figure. */
export function ChartCard({
  title,
  description,
  action,
  children,
  className = ''
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={`rounded-3xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`}
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='text-base font-bold text-forest-950' id={`${id}-title`}>
            {title}
          </h3>
          {description ? <p className='mt-0.5 text-sm text-on-surface-variant'>{description}</p> : null}
        </div>
        {action}
      </div>
      <div className='mt-5'>{children}</div>
    </section>
  )
}

/** Legend for two or more series; text stays in ink colours, the swatch carries the identity. */
export function ChartLegend<K extends string>({ series }: { series: readonly ChartSeries<K>[] }) {
  if (series.length < 2) return null
  return (
    <ul className='flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-on-surface-variant'>
      {series.map((item) => (
        <li className='flex items-center gap-1.5' key={item.key}>
          <span aria-hidden='true' className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export function ChartEmpty({ label }: { label: string }) {
  return <p className='rounded-2xl bg-mint-50 px-4 py-10 text-center text-sm text-on-surface-variant'>{label}</p>
}
