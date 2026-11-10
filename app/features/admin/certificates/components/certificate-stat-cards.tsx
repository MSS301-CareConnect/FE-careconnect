import { useTranslation } from 'react-i18next'

import type { CertificateAuditStatistics, CertificateRiskLevel } from '~/shared/api/generated/contracts'
import { CountUp } from '~/shared/ui/motion'

export type StatFilter = 'total' | CertificateRiskLevel | 'checking' | 'failed'

const CARDS: { key: StatFilter; stat: keyof CertificateAuditStatistics; accent: string }[] = [
  { key: 'total', stat: 'total', accent: 'text-on-surface' },
  { key: 'HIGH', stat: 'high', accent: 'text-error' },
  { key: 'UNDETERMINED', stat: 'undetermined', accent: 'text-warning' },
  { key: 'MEDIUM', stat: 'medium', accent: 'text-on-surface' },
  { key: 'LOW', stat: 'low', accent: 'text-success' },
  { key: 'checking', stat: 'checking', accent: 'text-primary' },
  { key: 'failed', stat: 'failed', accent: 'text-error' }
]

/** Counts of the admin certificate queue by AI result; a card filters the list to that group. */
export function CertificateStatCards({
  statistics,
  active,
  onSelect
}: {
  statistics: CertificateAuditStatistics | undefined
  active: StatFilter
  onSelect: (filter: StatFilter) => void
}) {
  const { t } = useTranslation()
  return (
    <ul className='ops-stagger grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7'>
      {CARDS.map((card) => {
        const selected = active === card.key
        return (
          <li key={card.key}>
            <button
              aria-pressed={selected}
              className={`flex min-h-24 w-full flex-col justify-between rounded-2xl border p-4 text-left shadow-[var(--shadow-card)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selected
                  ? 'border-transparent bg-forest-900 text-white [&_span]:text-white!'
                  : 'border-forest-900/[0.06] bg-surface-container-lowest hover:bg-mint-50'
              }`}
              onClick={() => onSelect(card.key)}
              type='button'
            >
              <span className='text-xs font-semibold text-on-surface-variant'>
                {t(`admin.certificatesPage.stats.${card.stat}`)}
              </span>
              <span className={`text-[28px] leading-none font-extrabold tracking-tight tabular-nums ${card.accent}`}>
                {statistics ? <CountUp value={statistics[card.stat]} /> : '–'}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
