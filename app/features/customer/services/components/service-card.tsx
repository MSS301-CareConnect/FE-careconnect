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
    <article className='group grid overflow-hidden rounded-2xl border border-[#dce6dc] bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#adc8b0] hover:shadow-[0_14px_32px_-28px_rgba(9,63,31,0.45)] lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]'>
      <div className='flex flex-col p-6 sm:p-7'>
        <div className='flex items-center gap-3'>
          <span
            aria-hidden='true'
            className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f2e8] text-[#075b31]'
          >
            <Icon className='text-2xl' name='medical_services' />
          </span>
          <span className='text-xs font-bold uppercase tracking-[0.09em] text-[#075b31]'>{service.category}</span>
        </div>
        <h3 className='mt-5 text-xl font-bold leading-snug tracking-[-0.025em] text-[#1b2922] sm:text-2xl'>
          {service.name}
        </h3>
        {service.description ? (
          <p className='mt-3 max-w-2xl text-sm leading-6 text-[#5e7063]'>{service.description}</p>
        ) : null}
        <p className='mt-auto flex items-center gap-2 pt-6 text-sm text-[#526a57]'>
          <Icon
            aria-hidden='true'
            className='text-lg text-[#075b31]'
            name={service.center ? 'home_health' : 'schedule'}
          />
          {service.center?.name ?? t(`${key}.card.noCenter`)}
        </p>
      </div>
      <div className='flex flex-col justify-between border-t border-[#e2e9e1] bg-[#f5f9f4] p-6 sm:p-7 lg:border-l lg:border-t-0'>
        {service.plans.length ? (
          <div>
            <p className='mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#647b69]'>
              {t(`${key}.card.plans`)}
            </p>
            <ul aria-label={t(`${key}.card.plans`)} className='divide-y divide-[#dce8db]'>
              {service.plans.slice(0, VISIBLE_PLANS).map((plan) => (
                <li className='flex items-center justify-between gap-4 py-3 text-sm first:pt-0' key={plan.id}>
                  <span className='min-w-0'>
                    <span className='block truncate font-semibold text-[#263b2d]'>{plan.planName}</span>
                    <span className='text-xs text-[#6b806e]'>
                      {t(`${key}.card.planMeta`, {
                        unit: t(`${key}.pricingUnits.${plan.pricingUnit}`),
                        minutes: plan.durationMinutes
                      })}
                    </span>
                  </span>
                  <strong className='shrink-0 text-[#075b31]'>{money.format(plan.basePrice)}</strong>
                </li>
              ))}
              {service.plans.length > VISIBLE_PLANS ? (
                <li className='pt-3 text-xs text-[#6b806e]'>
                  {t(`${key}.card.morePlans`, { count: service.plans.length - VISIBLE_PLANS })}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 ${service.plans.length ? 'mt-5 border-t border-[#dce8db] pt-5' : ''}`}
        >
          <span className='text-sm text-[#526a57]'>
            {fromPrice === undefined ? (
              t(service.center ? `${key}.card.contactPrice` : `${key}.card.comingSoon`)
            ) : (
              <>
                {t(`${key}.card.from`)}{' '}
                <strong className='text-lg font-bold text-[#075b31]'>{money.format(fromPrice)}</strong>
              </>
            )}
          </span>
          {service.center ? (
            <Link
              className='inline-flex items-center gap-2 rounded-lg bg-[#075b31] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#064925] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31]'
              to={`/customer/booking?center=${service.center.id}&service=${service.catalogItemId}`}
            >
              {t(`${key}.card.book`)}
              <Icon
                aria-hidden='true'
                className='text-lg transition-transform group-hover:translate-x-0.5'
                name='arrow_forward'
              />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
