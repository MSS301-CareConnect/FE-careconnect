import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { lowestPrice, type CustomerService } from '../services-data'

const key = 'customer.services' as const
const VISIBLE_PLANS = 3

export function ServiceCard({ service }: { service: CustomerService }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
  const fromPrice = lowestPrice(service)

  return (
    <article className='flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md md:p-6'>
      <div className='flex gap-4'>
        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-primary'>
          <Icon className='text-3xl' name='medical_services' />
        </div>
        <div className='min-w-0 flex-1 space-y-2'>
          <span className='inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-primary'>
            {service.category}
          </span>
          <h3 className='text-lg font-bold leading-6 text-on-surface'>{service.name}</h3>
          {service.center ? (
            <p className='flex items-center gap-1 text-sm text-on-surface-variant'>
              <Icon className='text-lg text-primary' name='home_health' />
              {service.center.name}
            </p>
          ) : (
            <p className='flex items-center gap-1 text-sm text-outline'>
              <Icon className='text-lg' name='schedule' />
              {t(`${key}.card.noCenter`)}
            </p>
          )}
        </div>
      </div>
      {service.description ? (
        <p className='line-clamp-3 text-sm leading-6 text-on-surface-variant'>{service.description}</p>
      ) : null}
      {service.plans.length ? (
        <ul aria-label={t(`${key}.card.plans`)} className='space-y-2'>
          {service.plans.slice(0, VISIBLE_PLANS).map((plan) => (
            <li
              className='flex items-center justify-between gap-3 rounded-lg bg-surface-container px-3 py-2 text-sm'
              key={plan.id}
            >
              <span className='min-w-0'>
                <span className='block truncate font-semibold text-on-surface'>{plan.planName}</span>
                <span className='text-xs text-on-surface-variant'>
                  {t(`${key}.card.planMeta`, {
                    unit: t(`${key}.pricingUnits.${plan.pricingUnit}`),
                    minutes: plan.durationMinutes
                  })}
                </span>
              </span>
              <strong className='shrink-0 text-primary'>{money.format(plan.basePrice)}</strong>
            </li>
          ))}
          {service.plans.length > VISIBLE_PLANS ? (
            <li className='text-xs text-outline'>
              {t(`${key}.card.morePlans`, { count: service.plans.length - VISIBLE_PLANS })}
            </li>
          ) : null}
        </ul>
      ) : null}
      <div className='mt-auto flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3 sm:p-4'>
        <span className='text-sm text-on-surface-variant'>
          {fromPrice === undefined ? (
            t(service.center ? `${key}.card.contactPrice` : `${key}.card.comingSoon`)
          ) : (
            <>
              {t(`${key}.card.from`)} <strong className='text-lg text-primary'>{money.format(fromPrice)}</strong>
            </>
          )}
        </span>
        {service.center ? (
          <Link
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary'
            to='/customer/caregivers'
          >
            {t(`${key}.card.findCaregivers`)}
            <Icon className='text-lg' name='arrow_forward' />
          </Link>
        ) : null}
      </div>
    </article>
  )
}
