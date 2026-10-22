import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { careCatalogKeys, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'

const key = 'admin.servicesPage.centerPricing' as const

/** Read-only price plans of one center offering; center managers own their creation and edits. */
export function OfferingPricePlans({ centerOfferingId }: { centerOfferingId: string }) {
  const { t, i18n } = useTranslation()
  const plans = useQuery({
    queryKey: careCatalogKeys.pricePlans(centerOfferingId),
    queryFn: () => fetchPricePlans(centerOfferingId),
    retry: false
  })
  const money = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  })

  if (plans.isPending)
    return (
      <p className='text-xs text-outline' role='status'>
        {t(`${key}.plansLoading`)}
      </p>
    )
  if (plans.isError)
    return (
      <p className='text-xs text-error' role='alert'>
        {t(`${key}.plansError`)}{' '}
        <button className='text-primary underline' onClick={() => void plans.refetch()} type='button'>
          {t('admin.servicesPage.retry')}
        </button>
      </p>
    )
  if (!plans.data.length) return <p className='text-xs text-outline'>{t(`${key}.plansEmpty`)}</p>
  return (
    <ul className='space-y-1.5'>
      {plans.data.map((plan) => (
        <li className={`text-xs ${plan.isActive === false ? 'text-outline' : ''}`} key={plan.id}>
          <span className='font-semibold'>{plan.planName}</span>
          <span className='text-outline'>
            {' · '}
            {t(`${key}.pricingUnits.${plan.pricingUnit}`)}
            {' · '}
            {t(`${key}.duration`, { count: plan.durationMinutes })}
            {': '}
          </span>
          <strong className='text-primary'>{money.format(plan.basePrice)}</strong>
          {plan.isActive === false ? (
            <span className='ml-2 rounded-full bg-surface-container px-2 py-0.5'>{t(`${key}.planInactive`)}</span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
