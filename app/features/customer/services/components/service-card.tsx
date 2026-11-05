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
    <article className='cc-lift group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg'>
      {/* Visual Image Header with Category Badge */}
      <div className='relative aspect-[16/10] w-full overflow-hidden bg-surface-container-low'>
        {service.imageUrl ? (
          <img
            alt={service.name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
            src={service.imageUrl}
          />
        ) : (
          <div className='relative flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/60 to-primary-fixed/25'>
            <span
              aria-hidden='true'
              className='grid h-14 w-14 place-items-center rounded-2xl bg-white/90 text-primary shadow-xs backdrop-blur-sm transition-transform duration-300 group-hover:scale-110'
            >
              <Icon className='text-3xl' name={SERVICE_CATEGORY_ICONS[group]} />
            </span>
          </div>
        )}
        <div className='absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-on-surface shadow-xs backdrop-blur-md'>
          <Icon aria-hidden='true' className='text-sm text-primary' name={SERVICE_CATEGORY_ICONS[group]} />
          <span>{t(`common.serviceCategories.${group}`)}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className='flex flex-1 flex-col p-5'>
        <h2 className='text-lg font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary'>
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
          <p className='mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-6 text-on-surface-variant'>
            {service.description}
          </p>
        ) : (
          <div className='mt-2 min-h-[2.75rem]' />
        )}

        {showCenter && service.center ? (
          <p className='mt-2 flex items-center gap-1.5 text-xs font-medium text-on-surface-variant'>
            <Icon className='text-sm text-primary' name='home_health' />
            <span>{service.center.name}</span>
          </p>
        ) : null}

        <div className='mt-auto pt-4'>
          <div className='border-t border-outline-variant/60 pt-3'>
            {cheapest ? (
              <div>
                <div className='flex items-baseline justify-between gap-2'>
                  <span className='text-base font-bold text-on-surface tabular-nums'>
                    {samePrice
                      ? t(`${key}.card.price`, {
                          price: format.money(planPrice(cheapest).finalPrice),
                          unit: t(`${key}.priceUnit.${cheapest.pricingUnit}`)
                        })
                      : t(`${key}.card.fromPrice`, { price: format.money(planPrice(cheapest).finalPrice) })}
                  </span>
                  {!samePrice ? (
                    <span className='rounded-full bg-secondary-container px-2 py-0.5 text-xs font-semibold text-primary'>
                      {t(`${key}.card.plansCount`, { count: service.plans.length })}
                    </span>
                  ) : null}
                </div>
                {samePrice && cheapest.durationMinutes ? (
                  <span className='mt-0.5 block text-xs text-on-surface-variant'>
                    {t(`${key}.card.minimum`, { duration: format.duration(cheapest.durationMinutes) })}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className='text-sm text-on-surface-variant'>
                {t(service.center ? `${key}.card.contactPrice` : `${key}.card.pricePerCenter`)}
              </p>
            )}
          </div>

          <div className='mt-4 flex items-center justify-between gap-3 border-t border-outline-variant/40 pt-3'>
            {service.center ? (
              <>
                <span aria-hidden='true' className='text-sm font-semibold text-primary group-hover:underline'>
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
                <Link
                  className='inline-flex min-h-9 items-center justify-center gap-1 rounded-lg text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary'
                  to='/customer/centers'
                >
                  {t('customer.centerPicker.compare')}
                  <Icon aria-hidden='true' className='text-base' name='arrow_forward' />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
