import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { CountUp } from '~/shared/ui/motion'

export interface AdminStat {
  id: string
  label: string
  /** `undefined` while the count is loading or could not be read: the card shows a dash. */
  value: number | undefined
  icon: string
  /** With `onSelect` the card is a filter button; `selected` marks the filter in use. */
  selected?: boolean
  onSelect?: () => void
}

const card =
  'flex min-h-[7.5rem] flex-col rounded-2xl border border-forest-900/[0.06] bg-white p-5 text-left shadow-[var(--shadow-card)]'

/**
 * The row of count cards above an admin list (centers, accounts, caregivers, absences): the first card is the dark
 * one, a card with `onSelect` filters the list below and shows which filter is on.
 */
export function AdminStatCards({ label, items }: { label: string; items: AdminStat[] }) {
  const { i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  return (
    <section aria-label={label} className='ops-stagger grid grid-cols-2 gap-3 xl:grid-cols-4'>
      {items.map((item, index) => {
        const body = (
          <>
            <span className='flex items-center justify-between gap-2 text-sm font-medium text-on-surface-variant'>
              {item.label}
              <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
                <Icon className='text-xl text-primary' name={item.icon} />
              </span>
            </span>
            <strong className='ops-stat-value mt-auto block pt-3 text-[32px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
              {item.value === undefined ? (
                '—'
              ) : (
                <CountUp format={(value) => number.format(Math.round(value))} value={item.value} />
              )}
            </strong>
          </>
        )
        const tone = index === 0 ? 'ops-stat-dark' : ''
        return item.onSelect ? (
          <button
            aria-pressed={Boolean(item.selected)}
            className={`${card} ${tone} cursor-pointer transition-shadow hover:shadow-[var(--shadow-float)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 ${item.selected ? 'ring-2 ring-mint-400' : ''}`}
            key={item.id}
            onClick={item.onSelect}
            type='button'
          >
            {body}
          </button>
        ) : (
          <div className={`${card} ${tone}`} key={item.id}>
            {body}
          </div>
        )
      })}
    </section>
  )
}
