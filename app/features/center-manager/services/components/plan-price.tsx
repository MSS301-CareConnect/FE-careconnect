import { useTranslation } from 'react-i18next'

import { discountedPrice } from '~/entities/care-catalog/price-plan-price'
import { useFormat } from '~/shared/lib/format'

const key = 'centerManager.services' as const

/** Customer price first; the list price is struck through only when a discount applies. */
export function PlanPrice({
  basePrice,
  discountPercent,
  align = 'end'
}: {
  basePrice: number
  discountPercent: number
  align?: 'start' | 'end'
}) {
  const { t } = useTranslation()
  const { money } = useFormat()
  const finalPrice = discountedPrice(basePrice, discountPercent)
  return (
    <span className={`inline-flex flex-col ${align === 'end' ? 'items-end' : 'items-start'}`}>
      <span className='flex items-center gap-1.5'>
        {discountPercent > 0 ? (
          <span className='rounded-full bg-error/10 px-1.5 py-0.5 text-[11px] font-bold text-error tabular-nums'>
            {t(`${key}.discountBadge`, { percent: discountPercent })}
          </span>
        ) : null}
        <strong className='whitespace-nowrap text-sm text-primary tabular-nums'>{money(finalPrice)}</strong>
      </span>
      {discountPercent > 0 ? (
        <s className='whitespace-nowrap text-xs text-on-surface-variant tabular-nums'>{money(basePrice)}</s>
      ) : null}
    </span>
  )
}
