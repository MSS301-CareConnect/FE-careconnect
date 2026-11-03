import { useTranslation } from 'react-i18next'

import type { BookingQuoteLineRecord, BookingQuoteUnitGroupRecord } from '~/shared/api/generated/contracts'
import { dateLocale, useFormat } from '~/shared/lib/format'

/** The visit groups of a line; an older quote without groups falls back to one group (or the total when mixed). */
function groupsOf(line: BookingQuoteLineRecord): BookingQuoteUnitGroupRecord[] {
  if (line.unitGroups?.length) return line.unitGroups
  if (line.unitsPerOccurrence === undefined || line.unitsPerOccurrence === null) return []
  return [
    { unitsPerOccurrence: line.unitsPerOccurrence, occurrenceCount: line.occurrenceCount, amount: line.lineTotal }
  ]
}

/**
 * The quote, one service per block: unit price ("100.000 ₫ / giờ"), then one row per visit length with its own amount
 * ("2 giờ × 14 buổi · 2.800.000 ₫", "3 giờ × 1 buổi · 300.000 ₫") and the service total when there are several lengths.
 * Every number comes from BookingService's quote — nothing is recomputed in the browser. `compact` fits the 360 px
 * summary column.
 */
export function QuoteLines({ lines, compact = false }: { lines: BookingQuoteLineRecord[]; compact?: boolean }) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const number = new Intl.NumberFormat(dateLocale(i18n.language), { maximumFractionDigits: 2 })

  return (
    <ul aria-label={t('customer.booking.quote.caption')} className='flex flex-col divide-y divide-outline-variant'>
      {lines.map((line) => {
        const unit = line.pricingUnit ? t(`customer.booking.priceUnit.${line.pricingUnit}`) : ''
        const groups = groupsOf(line)
        const mixed = groups.length > 1
        // The most common length is the usual one; the others are highlighted so a longer visit is easy to spot.
        const usualCount = Math.max(0, ...groups.map((group) => group.occurrenceCount ?? 0))
        return (
          <li className='py-3 first:pt-0 last:pb-0' key={line.careServiceId}>
            <div className={`flex gap-3 ${compact ? 'flex-col gap-0.5' : 'items-baseline justify-between'}`}>
              <p className='text-sm font-medium text-on-surface'>{line.serviceName}</p>
              <p className='text-xs text-on-surface-variant tabular-nums'>
                {t('customer.booking.quote.unitPrice')}:{' '}
                {t('customer.booking.quote.unitPriceValue', { price: format.money(line.unitPrice), unit })}
              </p>
            </div>
            <table className='mt-2 w-full text-sm'>
              <caption className='sr-only'>
                {t('customer.booking.quote.groupsCaption', { name: line.serviceName })}
              </caption>
              <thead className='sr-only'>
                <tr>
                  <th scope='col'>{t('customer.booking.quote.quantity')}</th>
                  <th scope='col'>{t('customer.booking.quote.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td className='py-1 text-on-surface-variant tabular-nums'>
                      {t('customer.booking.quote.quantityTotal', {
                        units: number.format(line.quantity ?? 0),
                        unit,
                        count: line.occurrenceCount ?? 0
                      })}
                    </td>
                    <td className='py-1 text-right font-semibold tabular-nums text-on-surface'>
                      {format.money(line.lineTotal)}
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => {
                    const unusual = mixed && (group.occurrenceCount ?? 0) < usualCount
                    return (
                      <tr
                        className={unusual ? 'bg-warning-container/40' : undefined}
                        key={group.unitsPerOccurrence ?? 0}
                      >
                        <td
                          className={`py-1 tabular-nums ${unusual ? 'pl-2 font-semibold text-on-warning-container' : 'text-on-surface'}`}
                        >
                          {t('customer.booking.quote.quantityValue', {
                            units: number.format(group.unitsPerOccurrence ?? 0),
                            unit,
                            count: group.occurrenceCount ?? 0
                          })}
                        </td>
                        <td
                          className={`py-1 text-right tabular-nums ${mixed ? 'text-on-surface' : 'font-semibold text-on-surface'} ${unusual ? 'pr-2' : ''}`}
                        >
                          {format.money(group.amount)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {mixed ? (
                <tfoot>
                  <tr className='border-t border-outline-variant'>
                    <th className='pt-1.5 text-left font-medium text-on-surface-variant' scope='row'>
                      {t('customer.booking.quote.lineTotal', {
                        units: number.format(line.quantity ?? 0),
                        unit,
                        count: line.occurrenceCount ?? 0
                      })}
                    </th>
                    <td className='pt-1.5 text-right font-semibold tabular-nums text-on-surface'>
                      {format.money(line.lineTotal)}
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </li>
        )
      })}
    </ul>
  )
}
