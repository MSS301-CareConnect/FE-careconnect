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
    <section className='rounded-2xl border border-[#dbe4db] bg-white p-6 sm:p-7'>
      <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-[#1b2922]'>
        <Icon className='text-xl text-[#075b31]' name='payments' />
        {t(`${key}.plans.title`)}
      </h2>
      <p className='mt-1 text-sm text-[#617267]'>{t(`${key}.plans.hint`)}</p>
      {isPending ? (
        <p className='mt-5 text-sm text-[#526a57]' role='status'>
          {t(`${key}.plans.loading`)}
        </p>
      ) : null}
      {isError ? (
        <p className='mt-5 text-sm text-[#ba1a1a]' role='alert'>
          {t(`${key}.plans.error`)}
        </p>
      ) : null}
      {plans && plans.length === 0 ? (
        <p className='mt-5 rounded-xl bg-[#f5f9f4] p-4 text-sm text-[#526a57]'>{t(`${key}.plans.empty`)}</p>
      ) : null}
      {plans && plans.length > 0 ? (
        <ul aria-label={t(`${key}.plans.title`)} className='mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {plans.map((plan) => (
            <li className='flex flex-col rounded-xl border border-[#dce8db] bg-[#f5f9f4] p-5' key={plan.id}>
              <span className='text-xs font-bold uppercase tracking-[0.1em] text-[#647b69]'>
                {t(`${key}.pricingUnits.${plan.pricingUnit}`)}
              </span>
              <span className='mt-2 font-bold text-[#1b2922]'>{plan.planName}</span>
              <span className='mt-1 flex items-center gap-1 text-sm text-[#637469]'>
                <Icon className='text-base text-[#075b31]' name='schedule' />
                {t(`${key}.plans.duration`, { minutes: plan.durationMinutes })}
              </span>
              <strong className='mt-4 border-t border-[#dce8db] pt-3 text-xl font-bold text-[#075b31]'>
                {money.format(plan.basePrice)}
              </strong>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
