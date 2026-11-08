import { useTranslation } from 'react-i18next'

import type { ServiceCenterOption } from '~/entities/care-center/care-center-api'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.centers' as const

/** Address, hours, phone, starting price and service count: what a family compares between centers. */
export function CenterFacts({ center, className = '' }: { center: ServiceCenterOption; className?: string }) {
  const { t } = useTranslation()
  const format = useFormat()
  const facts = [
    center.address ? { icon: 'location_on', text: center.address, label: undefined } : null,
    center.operatingHours ? { icon: 'schedule', text: center.operatingHours, label: t(`${key}.facts.hours`) } : null,
    center.phoneNumber ? { icon: 'call', text: center.phoneNumber, label: t(`${key}.facts.phone`) } : null,
    center.minPrice !== undefined
      ? {
          icon: 'payments',
          text: t(`${key}.facts.fromPrice`, { price: format.money(center.minPrice) }),
          label: undefined
        }
      : null,
    center.serviceCount
      ? { icon: 'medical_services', text: t(`${key}.facts.services`, { count: center.serviceCount }), label: undefined }
      : null
  ].filter((fact) => fact !== null)
  if (facts.length === 0) return null

  return (
    <ul className={`flex flex-col gap-1.5 text-sm text-on-surface-variant ${className}`}>
      {facts.map((fact) => (
        <li className='flex items-start gap-2' key={fact.icon}>
          <Icon aria-hidden='true' className='mt-0.5 shrink-0 text-lg text-primary' name={fact.icon} />
          {fact.label ? <span className='sr-only'>{fact.label}</span> : null}
          <span className='min-w-0 tabular-nums'>{fact.text}</span>
        </li>
      ))}
    </ul>
  )
}
