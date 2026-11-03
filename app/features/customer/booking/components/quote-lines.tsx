import { useTranslation } from 'react-i18next'

import type { BookingQuoteLineRecord } from '~/shared/api/generated/contracts'
import { dateLocale, useFormat } from '~/shared/lib/format'

/**
 * The quote, one service per row: unit price ("100.000 ₫ / giờ"), quantity ("2 giờ × 3 buổi") and line amount, all
 * from BookingService's quote — nothing is recomputed in the browser. `compact` fits the 360 px summary column.
 */
export function QuoteLines({ lines, compact = false }: { lines: BookingQuoteLineRecord[]; compact?: boolean }) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const number = new Intl.NumberFormat(dateLocale(i18n.language), { maximumFractionDigits: 2 })

  return (
    <ul aria-label={t('customer.booking.quote.caption')} className='flex flex-col divide-y divide-outline-variant'>
      {lines.map((line) => {
        const unit = line.pricingUnit ? t(`customer.booking.priceUnit.${line.pricingUnit}`) : ''
        const unitPrice = t('customer.booking.quote.unitPriceValue', { price: format.money(line.unitPrice), unit })
        const quantity = t('customer.booking.quote.quantityValue', {
          units: number.format(line.unitsPerOccurrence ?? 0),
          unit,
          count: line.occurrenceCount ?? 0
        })
        return (
          <li className='py-3 first:pt-0 last:pb-0' key={line.careServiceId}>
            <p className='text-sm font-medium text-on-surface'>{line.serviceName}</p>
            {compact ? (
              <dl className='mt-1.5 flex flex-col gap-1 text-sm'>
                <div className='flex justify-between gap-3'>
                  <dt className='text-on-surface-variant'>{t('customer.booking.quote.unitPrice')}</dt>
                  <dd className='text-right tabular-nums text-on-surface'>{unitPrice}</dd>
                </div>
                <div className='flex justify-between gap-3'>
                  <dt className='text-on-surface-variant'>{t('customer.booking.quote.quantity')}</dt>
                  <dd className='text-right tabular-nums text-on-surface'>{quantity}</dd>
                </div>
                <div className='flex justify-between gap-3'>
                  <dt className='text-on-surface-variant'>{t('customer.booking.quote.amount')}</dt>
                  <dd className='text-right font-semibold tabular-nums text-on-surface'>
                    {format.money(line.lineTotal)}
                  </dd>
                </div>
              </dl>
            ) : (
              <dl className='mt-2 grid grid-cols-3 gap-3 text-sm'>
                <div>
                  <dt className='text-xs text-on-surface-variant'>{t('customer.booking.quote.unitPrice')}</dt>
                  <dd className='mt-0.5 tabular-nums text-on-surface'>{unitPrice}</dd>
                </div>
                <div>
                  <dt className='text-xs text-on-surface-variant'>{t('customer.booking.quote.quantity')}</dt>
                  <dd className='mt-0.5 tabular-nums text-on-surface'>{quantity}</dd>
                </div>
                <div className='text-right'>
                  <dt className='text-xs text-on-surface-variant'>{t('customer.booking.quote.amount')}</dt>
                  <dd className='mt-0.5 font-semibold tabular-nums text-on-surface'>{format.money(line.lineTotal)}</dd>
                </div>
              </dl>
            )}
          </li>
        )
      })}
    </ul>
  )
}
