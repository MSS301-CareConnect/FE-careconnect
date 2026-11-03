import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { Icon } from '~/shared/ui/icon'

import { CustomerDashboard } from './components/customer-dashboard'

const steps = ['find', 'compare', 'book'] as const
const trust = [
  { id: 'verified', icon: 'verified_user' },
  { id: 'prices', icon: 'receipt_long' },
  { id: 'support', icon: 'support_agent' }
] as const

const container = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6'
const primaryAction =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-on-primary shadow-[var(--shadow-card)] transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const secondaryAction =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 text-base font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * Home (2026-11 redesign): the app's only hero, kept short, then — for a signed-in customer — the next visit,
 * shortcuts and what their center offers, followed by how it works and why families trust the service.
 */
export function HomePage({ audience = 'public' }: { audience?: 'public' | 'customer' }) {
  const { t } = useTranslation()
  const user = useAuthUser()
  const isCustomer = audience === 'customer'
  const firstName = user?.fullName?.trim().split(/\s+/).at(-1)

  return (
    <div className='text-on-surface'>
      <section aria-labelledby='home-title' className='border-b border-outline-variant bg-surface-container-lowest'>
        <div
          className={`${container} grid items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-12 lg:py-14`}
        >
          <div className='cc-fade-up max-w-xl'>
            <p className='text-sm font-semibold text-primary'>
              {isCustomer && firstName ? t('customer.home.greeting', { name: firstName }) : t('home.eyebrow')}
            </p>
            <h1
              className='mt-3 text-[clamp(2rem,4vw,2.75rem)] leading-tight font-bold text-balance text-on-surface'
              id='home-title'
            >
              {t('home.title')}
            </h1>
            <p className='mt-4 text-base leading-7 text-on-surface-variant sm:text-lg'>{t('home.description')}</p>
            <div className='mt-7 flex flex-wrap gap-3'>
              {isCustomer ? (
                <>
                  <Link className={primaryAction} to='/customer/booking'>
                    <Icon className='text-xl' name='event_available' />
                    {t('customer.home.book')}
                  </Link>
                  <Link className={secondaryAction} to='/customer/caregivers'>
                    {t('home.primaryAction')}
                  </Link>
                </>
              ) : (
                <>
                  <Link className={primaryAction} to='/customer/caregivers'>
                    {t('home.primaryAction')}
                    <Icon className='text-xl' name='arrow_forward' />
                  </Link>
                  <Link className={secondaryAction} to='/register'>
                    {t('home.createAccount')}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className='cc-fade-up overflow-hidden rounded-2xl bg-surface-container-high [animation-delay:80ms]'>
            <img
              alt={t('home.heroAlt')}
              className='aspect-[16/10] w-full object-cover object-[66%_center]'
              decoding='async'
              fetchPriority='high'
              src='/images/care-at-home-hero.jpg'
            />
          </div>
        </div>
      </section>

      {isCustomer ? (
        <div className={`${container} py-10`}>
          <CustomerDashboard />
        </div>
      ) : null}

      <section aria-labelledby='home-process-title' className={`${container} py-12`} id='how-it-works'>
        <p className='text-sm font-semibold text-primary'>{t('home.processEyebrow')}</p>
        <h2 className='mt-2 text-2xl font-bold text-on-surface' id='home-process-title'>
          {t('home.processTitle')}
        </h2>
        <ol className='mt-8 grid gap-4 md:grid-cols-3'>
          {steps.map((step, index) => (
            <li className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5' key={step}>
              <span
                aria-hidden='true'
                className='grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-on-primary'
              >
                {index + 1}
              </span>
              <h3 className='mt-4 text-lg font-semibold text-on-surface'>{t(`home.steps.${step}.title`)}</h3>
              <p className='mt-1.5 text-sm leading-6 text-on-surface-variant'>{t(`home.steps.${step}.description`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby='home-trust-title' className='border-t border-outline-variant bg-brand-50/60'>
        <div className={`${container} py-12`}>
          <h2 className='text-2xl font-bold text-on-surface' id='home-trust-title'>
            {t('customer.home.trust.title')}
          </h2>
          <ul className='mt-8 grid gap-6 md:grid-cols-3'>
            {trust.map((item) => (
              <li className='flex gap-4' key={item.id}>
                <span
                  aria-hidden='true'
                  className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-container-lowest text-primary shadow-[var(--shadow-card)]'
                >
                  <Icon name={item.icon} />
                </span>
                <span>
                  <span className='block font-semibold text-on-surface'>
                    {t(`customer.home.trust.${item.id}.title`)}
                  </span>
                  <span className='mt-1 block text-sm leading-6 text-on-surface-variant'>
                    {t(`customer.home.trust.${item.id}.description`)}
                  </span>
                  {item.id === 'support' ? (
                    <a
                      className='mt-2 inline-flex items-center gap-1.5 font-semibold text-primary tabular-nums hover:underline'
                      href={`tel:${t('customer.nav.hotlineNumber').replace(/\s/g, '')}`}
                    >
                      <Icon className='text-lg' name='call' />
                      {t('customer.nav.hotlineNumber')}
                    </a>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
