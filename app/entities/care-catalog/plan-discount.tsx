import { useTranslation } from 'react-i18next'

import type { PricePlanRecord } from '~/shared/api/generated/contracts'
import { formatCurrency } from '~/shared/lib/format'

import { planPrice } from './price-plan-price'

/** Discount badge and struck-through list price next to a plan's customer price; nothing when undiscounted. */
export function PlanDiscount({
  plan,
  className = ''
}: {
  plan: Pick<PricePlanRecord, 'basePrice' | 'discountPercent' | 'finalPrice'>
  className?: string
}) {
  const { t, i18n } = useTranslation()
  const { basePrice, discountPercent } = planPrice(plan)
  if (!discountPercent) return null
  const original = formatCurrency(basePrice, i18n.language)
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className='rounded-full bg-error/10 px-1.5 py-0.5 text-[11px] font-bold text-error tabular-nums'>
        {t('common.price.discount', { percent: discountPercent })}
      </span>
      <s
        aria-label={t('common.price.original', { price: original })}
        className='text-xs text-on-surface-variant tabular-nums'
      >
        {original}
      </s>
    </span>
  )
}
