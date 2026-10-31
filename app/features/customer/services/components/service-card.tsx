import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useServiceCategoryLabel } from '~/entities/care-catalog/use-service-category-label'
import { openCenterPicker } from '~/entities/care-center/selected-center'
import { Icon } from '~/shared/ui/icon'

import { lowestPrice, type CustomerService } from '../services-data'

const key = 'customer.services' as const
const VISIBLE_PLANS = 3

export function ServiceCard({ service }: { service: CustomerService }) {
  const { t, i18n } = useTranslation()
  const categoryLabel = useServiceCategoryLabel()
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
  const fromPrice = lowestPrice(service)

  return (
    <article className='group grid overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-outline hover:shadow-md lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]'>
      <div className='flex flex-col p-6 sm:p-7'>
        <div className='flex items-center gap-3'>
          <span
            aria-hidden='true'
            className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-fixed text-primary'
          >
            <Icon className='text-2xl' name='medical_services' />
          </span>
          <span className='text-xs font-bold uppercase tracking-[0.09em] text-primary'>
            {categoryLabel(service.category)}
          </span>
        </div>
        <h3 className='mt-5 text-xl font-bold leading-snug tracking-[-0.025em] text-on-surface sm:text-2xl'>
          {service.name}
        </h3>
        {service.description ? (
          <p className='mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant'>{service.description}</p>
        ) : null}
        <p className='mt-auto flex items-center gap-2 pt-6 text-sm text-on-surface-variant'>
          <Icon aria-hidden='true' className='text-lg text-primary' name={service.center ? 'home_health' : 'public'} />
          {service.center?.name ?? t(`${key}.card.noCenter`)}
        </p>
      </div>
      <div className='flex flex-col justify-between border-t border-outline-variant/50 bg-surface-container-low p-6 sm:p-7 lg:border-l lg:border-t-0'>
        {service.plans.length ? (
          <div>
            <p className='mb-3 text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant'>
              {t(`${key}.card.plans`)}
            </p>
            <ul aria-label={t(`${key}.card.plans`)} className='divide-y divide-outline-variant/40'>
              {service.plans.slice(0, VISIBLE_PLANS).map((plan) => (
                <li className='flex items-center justify-between gap-4 py-3 text-sm first:pt-0' key={plan.id}>
                  <span className='min-w-0'>
                    <span className='block truncate font-semibold text-on-surface'>{plan.planName}</span>
                    <span className='text-xs text-on-surface-variant tabular-nums'>
                      {t(`${key}.card.planMeta`, {
                        unit: t(`${key}.pricingUnits.${plan.pricingUnit}`),
                        minutes: plan.durationMinutes
                      })}
                    </span>
                  </span>
                  <strong className='shrink-0 text-primary tabular-nums'>{money.format(plan.basePrice)}</strong>
                </li>
              ))}
              {service.plans.length > VISIBLE_PLANS ? (
                <li className='pt-3 text-xs text-on-surface-variant'>
                  {t(`${key}.card.morePlans`, { count: service.plans.length - VISIBLE_PLANS })}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 ${service.plans.length ? 'mt-5 border-t border-outline-variant/40 pt-5' : ''}`}
        >
          <span className='text-sm text-on-surface-variant tabular-nums'>
            {fromPrice === undefined ? (
              t(service.center ? `${key}.card.contactPrice` : `${key}.card.pricePerCenter`)
            ) : (
              <>
                {t(`${key}.card.from`)}{' '}
                <strong className='text-lg font-bold text-primary'>{money.format(fromPrice)}</strong>
              </>
            )}
          </span>
          {service.center ? (
            <div className='flex flex-wrap items-center gap-2'>
              <Link
                className='inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                to={`/customer/services/${service.id}`}
              >
                {t(`${key}.card.details`)}
              </Link>
              <Link
                className='inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                to={`/customer/booking?center=${service.center.id}&service=${service.catalogItemId}`}
              >
                {t(`${key}.card.book`)}
                <Icon
                  aria-hidden='true'
                  className='text-lg transition-transform group-hover:translate-x-0.5'
                  name='arrow_forward'
                />
              </Link>
            </div>
          ) : (
            <button
              className='inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              onClick={openCenterPicker}
              type='button'
            >
              <Icon aria-hidden='true' className='text-lg' name='home_health' />
              {t(`${key}.card.chooseCenter`)}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
