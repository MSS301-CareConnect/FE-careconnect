import { useTranslation } from 'react-i18next'

import { planPrice } from '~/entities/care-catalog/price-plan-price'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import type { CenterOfferingRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'

const key = 'centerManager.services' as const

/** Plan count and the cheapest active customer price, from the plans the offering list already carries. */
function OfferingPriceLine({ offering }: { offering: CenterOfferingRecord }) {
  const { t } = useTranslation()
  const { money } = useFormat()
  const plans = offering.pricePlans
  if (!plans) return null
  if (plans.length === 0) return <span className='text-xs text-warning'>{t(`${key}.noPlans`)}</span>
  const activePrices = plans.filter((plan) => plan.isActive !== false).map((plan) => planPrice(plan).finalPrice)
  return (
    <span className='text-xs text-on-surface-variant'>
      {t(`${key}.planCount`, { count: plans.length })}
      {activePrices.length ? ` · ${t(`${key}.fromPrice`, { price: money(Math.min(...activePrices)) })}` : null}
    </span>
  )
}

export function OfferingList({
  offerings,
  selectedId,
  onSelect
}: {
  offerings: CenterOfferingRecord[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <ul className='flex flex-col gap-1 p-2'>
      {offerings.map((offering) => {
        const active = selectedId === offering.id
        return (
          <li key={offering.id}>
            <button
              aria-pressed={active}
              className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-900 ${active ? 'bg-mint-100 ring-1 ring-forest-900/10' : 'hover:bg-mint-50'}`}
              onClick={() => onSelect(offering.id)}
              type='button'
            >
              <span className='min-w-0 flex-1'>
                <span className='block text-sm font-bold'>{offering.catalogItem.name}</span>
                <span className='mt-0.5 block text-xs text-on-surface-variant'>{offering.catalogItem.category}</span>
                <span className='mt-1.5 block'>
                  <OfferingPriceLine offering={offering} />
                </span>
              </span>
              <ProviderStatusBadge label={t(`${key}.statuses.${offering.status}`)} status={offering.status} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
