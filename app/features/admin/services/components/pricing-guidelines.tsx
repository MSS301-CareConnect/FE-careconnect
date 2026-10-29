import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const key = 'admin.servicesPage' as const
const card = 'rounded-xl bg-white p-5 shadow-sm'
const surcharges = [
  ['night', '+30%', 'nightlight'],
  ['holiday', '+100%', 'celebration'],
  ['senior', '+20%', 'verified_user']
] as const

/** Illustrative surcharge cards; CareCatalogService has no surcharge contract yet. */
export function SurchargePreview() {
  const { t } = useTranslation()
  return (
    <section className='grid gap-4 lg:grid-cols-3'>
      {surcharges.map(([name, value, icon]) => (
        <div className={card} key={name}>
          <Icon className='text-2xl text-primary' name={icon} />
          <h2 className='mt-3 font-bold'>{t(`${key}.surchargeItems.${name}`)}</h2>
          <p className='mt-3 text-2xl font-bold text-primary'>{value}</p>
        </div>
      ))}
    </section>
  )
}

/** Illustrative distribution, surcharge and policy notes kept from the design snapshot. */
export function PricingGuidelines() {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  return (
    <>
      <section className='grid gap-4 lg:grid-cols-3'>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.allocation`)}</h2>
          <div
            className='mx-auto my-5 flex h-32 w-32 items-center justify-center rounded-full'
            style={{
              background:
                'conic-gradient(var(--color-primary) 0 45%, var(--color-tertiary-fixed-dim) 45% 75%, var(--color-surface-container-highest) 75% 100%)'
            }}
          >
            <span className='flex h-20 w-20 items-center justify-center rounded-full bg-white text-lg font-bold tabular-nums'>
              {number.format(6300)}
            </span>
          </div>
          <p className='text-xs text-outline'>{t(`${key}.allocationHint`)}</p>
        </div>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.surcharge`)}</h2>
          <ul className='mt-4 space-y-3 text-sm'>
            {surcharges.map(([name, value]) => (
              <li className='flex justify-between gap-2 border-b border-outline-variant/25 pb-2' key={name}>
                <span>{t(`${key}.surchargeItems.${name}`)}</span>
                <strong className='tabular-nums text-primary'>{value}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.medical`)}</h2>
          <Icon className='my-5 text-5xl text-primary' name='health_and_safety' />
          <p className='text-sm leading-6 text-on-surface-variant'>{t(`${key}.medicalHint`)}</p>
        </div>
      </section>
      <aside className='rounded-xl bg-secondary-container/25 p-5'>
        <h2 className='font-bold text-primary'>{t(`${key}.policy`)}</h2>
        <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.policyHint`)}</p>
      </aside>
    </>
  )
}
