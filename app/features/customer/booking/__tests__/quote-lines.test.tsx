import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { QuoteLines } from '../components/quote-lines'

beforeEach(async () => {
  await setAppLanguage('vi', false)
})

const base = { careServiceId: 's', serviceName: 'Chăm sóc', pricingUnit: 'HOUR' as const, unitPrice: 100000 }

describe('QuoteLines', () => {
  it('shows hours per visit when every visit lasts the same', () => {
    render(
      <QuoteLines
        lines={[
          {
            ...base,
            unitsPerOccurrence: 2,
            quantity: 6,
            occurrenceCount: 3,
            lineTotal: 600000,
            unitGroups: [{ unitsPerOccurrence: 2, occurrenceCount: 3, amount: 600000 }]
          }
        ]}
      />
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows.at(-1)).toHaveTextContent('2 giờ × 3 buổi')
    expect(rows.at(-1)).toHaveTextContent('600.000')
    expect(screen.queryByText(/^Cộng/)).not.toBeInTheDocument()
  })

  it('gives each visit length its own row and amount, then the service total', () => {
    render(
      <QuoteLines
        lines={[
          {
            ...base,
            quantity: 31,
            occurrenceCount: 15,
            lineTotal: 3100000,
            unitGroups: [
              { unitsPerOccurrence: 2, occurrenceCount: 14, amount: 2800000 },
              { unitsPerOccurrence: 3, occurrenceCount: 1, amount: 300000 }
            ]
          }
        ]}
      />
    )
    const table = screen.getByRole('table', { name: 'Chăm sóc theo thời lượng buổi' })
    const rows = within(table).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('2 giờ × 14 buổi')
    expect(rows[1]).toHaveTextContent('2.800.000')
    expect(rows[2]).toHaveTextContent('3 giờ × 1 buổi')
    expect(rows[2]).toHaveTextContent('300.000')
    expect(rows[3]).toHaveTextContent('Cộng 31 giờ · 15 buổi')
    expect(rows[3]).toHaveTextContent('3.100.000')
  })
  it('names the chosen price plan and its length under the service (2026-11-05)', () => {
    render(
      <QuoteLines
        lines={[
          {
            ...base,
            pricingUnit: 'DAY',
            unitPrice: 800000,
            planName: 'Chăm sóc 8 giờ/ngày',
            planDurationMinutes: 480,
            unitsPerOccurrence: 1,
            quantity: 2,
            occurrenceCount: 2,
            lineTotal: 1600000
          },
          { ...base, careServiceId: 't', serviceName: 'Tắm rửa', planName: 'Theo giờ', planDurationMinutes: 60 }
        ]}
      />
    )
    expect(screen.getByText('Gói: Chăm sóc 8 giờ/ngày · 8 giờ/ngày')).toBeInTheDocument()
    expect(screen.getByText('Gói: Theo giờ')).toBeInTheDocument()
  })
})
