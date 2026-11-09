import { useTranslation } from 'react-i18next'

import type { CertificateAuditStatistics, CertificateRiskLevel } from '~/shared/api/generated/contracts'

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
    <ul className='grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7'>
      {CARDS.map((card) => {
        const selected = active === card.key
        return (
          <li key={card.key}>
            <button
              aria-pressed={selected}
              className={`flex min-h-20 w-full flex-col justify-between rounded-2xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low'
              }`}
              onClick={() => onSelect(card.key)}
              type='button'
            >
              <span className='text-xs font-semibold text-on-surface-variant'>
                {t(`admin.certificatesPage.stats.${card.stat}`)}
              </span>
              <span className={`text-2xl font-extrabold tabular-nums ${card.accent}`}>
                {statistics ? statistics[card.stat] : '–'}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
