import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { SERVICE_CATEGORY_ICONS, serviceCategoryGroup } from '~/entities/care-catalog/service-category'
import { openCenterPicker } from '~/entities/care-center/selected-center'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import type { CustomerService } from '../services-data'
import { planPrice } from '~/entities/care-catalog/price-plan-price'

const key = 'customer.services' as const
const primaryLink =
  'relative z-10 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * A service card: category icon and label, name, two lines of description, one clear price ("100.000 ₫ / giờ" and
 * the minimum length, or "From …" when plans differ), then "Book" and "Details". The whole card opens the details.
 */
export function ServiceCard({ service, showCenter }: { service: CustomerService; showCenter: boolean }) {
  const { t } = useTranslation()
  const format = useFormat()
  const group = serviceCategoryGroup(service.category)
  const cheapest = service.plans[0]
  const samePrice = service.plans.every(
    (plan) => cheapest && planPrice(plan).finalPrice === planPrice(cheapest).finalPrice
  )
  const detailsTo = service.center ? `/customer/services/${service.id}` : undefined

  return (
    <article className='cc-lift group relative flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] hover:border-brand-200'>
      <div className='flex items-center gap-3'>
        <span
          aria-hidden='true'
          className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary'
        >
          <Icon className='text-[22px]' name={SERVICE_CATEGORY_ICONS[group]} />
        </span>
        <span className='text-sm font-medium text-on-surface-variant'>{t(`common.serviceCategories.${group}`)}</span>
      </div>
      <h2 className='mt-4 text-lg font-semibold text-on-surface'>
        {detailsTo ? (
          <Link
            className='rounded after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={detailsTo}
          >
            {service.name}
          </Link>
        ) : (
          service.name
        )}
      </h2>
      {service.description ? (
        <p className='mt-1.5 line-clamp-2 text-sm leading-6 text-on-surface-variant'>{service.description}</p>
      ) : null}

      <div className='mt-auto pt-5'>
        {cheapest ? (
          <p className='text-sm'>
            <span className='text-base font-semibold text-on-surface tabular-nums'>
              {samePrice
                ? t(`${key}.card.price`, {
                    price: format.money(planPrice(cheapest).finalPrice),
                    unit: t(`${key}.priceUnit.${cheapest.pricingUnit}`)
                  })
                : t(`${key}.card.fromPrice`, { price: format.money(planPrice(cheapest).finalPrice) })}
            </span>
            {samePrice && cheapest.durationMinutes ? (
              <span className='block text-on-surface-variant'>
                {t(`${key}.card.minimum`, { duration: format.duration(cheapest.durationMinutes) })}
              </span>
            ) : !samePrice ? (
              <span className='block text-on-surface-variant'>
                {t(`${key}.card.plansCount`, { count: service.plans.length })}
              </span>
            ) : null}
          </p>
        ) : (
          <p className='text-sm text-on-surface-variant'>
            {t(service.center ? `${key}.card.contactPrice` : `${key}.card.pricePerCenter`)}
          </p>
        )}
        {showCenter && service.center ? (
          <p className='mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant'>
            <Icon className='text-sm text-primary' name='home_health' />
            {service.center.name}
          </p>
        ) : null}

        <div className='mt-4 flex items-center justify-between gap-3 border-t border-outline-variant pt-4'>
          {service.center ? (
            <>
              <span aria-hidden='true' className='text-sm font-medium text-primary group-hover:underline'>
                {t(`${key}.card.detailsShort`)}
              </span>
              <Link
                aria-label={`${t(`${key}.card.bookShort`)} ${service.name}`}
                className={primaryLink}
                to={`/customer/booking?center=${service.center.id}&service=${service.catalogItemId}`}
              >
                <Icon className='text-lg' name='event_available' />
                {t(`${key}.card.bookShort`)}
              </Link>
            </>
          ) : (
            <div className='flex w-full flex-col gap-2'>
              <button className={`${primaryLink} justify-center`} onClick={openCenterPicker} type='button'>
                <Icon className='text-lg' name='home_health' />
                {t(`${key}.card.chooseCenter`)}
              </button>
              {/* All-centers mode has no prices: comparing the centers is the other way forward. */}
              <Link
                className='inline-flex min-h-10 items-center justify-center gap-1 rounded-lg text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary'
                to='/customer/centers'
              >
                {t('customer.centerPicker.compare')}
                <Icon aria-hidden='true' className='text-base' name='arrow_forward' />
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
