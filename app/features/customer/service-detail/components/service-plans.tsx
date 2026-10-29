import { useTranslation } from 'react-i18next'

import type { PricePlanRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { useMoney } from '../service-detail-format'

const key = 'customer.serviceDetail' as const

type Props = { plans: PricePlanRecord[] | undefined; isPending: boolean; isError: boolean }

/** Every active plan of the offering, cheapest first. */
export function ServicePlans({ plans, isPending, isError }: Props) {
  const { t } = useTranslation()
  const money = useMoney()

  return (
    <section className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs sm:p-7'>
      <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-on-surface'>
        <Icon className='text-xl text-primary' name='payments' />
        {t(`${key}.plans.title`)}
      </h2>
      <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.plans.hint`)}</p>
      {isPending ? (
        <p className='mt-5 text-sm text-on-surface-variant' role='status'>
          {t(`${key}.plans.loading`)}
        </p>
      ) : null}
      {isError ? (
        <p className='mt-5 text-sm text-error' role='alert'>
          {t(`${key}.plans.error`)}
        </p>
      ) : null}
      {plans && plans.length === 0 ? (
        <p className='mt-5 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          {t(`${key}.plans.empty`)}
        </p>
      ) : null}
      {plans && plans.length > 0 ? (
        <ul aria-label={t(`${key}.plans.title`)} className='mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {plans.map((plan) => (
            <li
              className='flex flex-col rounded-xl border border-outline-variant/60 bg-surface-container-low p-5'
              key={plan.id}
            >
              <span className='text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant'>
                {t(`${key}.pricingUnits.${plan.pricingUnit}`)}
              </span>
              <span className='mt-2 font-bold text-on-surface'>{plan.planName}</span>
              <span className='mt-1 flex items-center gap-1 text-sm text-on-surface-variant tabular-nums'>
                <Icon className='text-base text-primary' name='schedule' />
                {t(`${key}.plans.duration`, { minutes: plan.durationMinutes })}
              </span>
              <strong className='mt-4 border-t border-outline-variant/40 pt-3 text-xl font-bold text-primary tabular-nums'>
                {money.format(plan.basePrice)}
              </strong>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
