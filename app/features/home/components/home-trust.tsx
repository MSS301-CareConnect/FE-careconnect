import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { Reveal, revealVariants, staggerVariants } from '~/shared/ui/motion'

import { glassAction, homeContainer, peachAction } from './home-styles'

const trust = [
  { id: 'verified', icon: 'verified_user' },
  { id: 'prices', icon: 'receipt_long' },
  { id: 'refunds', icon: 'currency_exchange' }
] as const

/**
 * Closing band (UI redesign 2026-11-09): a deep forest card with why families trust the service and the next step —
 * create an account for a visitor, book care for a signed-in customer.
 */
export function HomeTrust({ isCustomer }: { isCustomer: boolean }) {
  const { t } = useTranslation()

  return (
    <section
      aria-labelledby='home-trust-title'
      className={`${homeContainer} scroll-mt-24 pt-6 pb-16 lg:pb-20`}
      id='home-trust'
    >
      <Reveal className='relative isolate overflow-hidden rounded-[2rem] bg-forest-900 px-6 py-10 text-white sm:px-10 sm:py-14'>
        <span
          aria-hidden='true'
          className='absolute -top-32 left-1/3 -z-10 h-80 w-80 rounded-full bg-mint-400/20 blur-3xl'
        />
        <h2 className='max-w-xl text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-bold' id='home-trust-title'>
          {t('customer.home.trust.title')}
        </h2>
        <motion.ul
          className='mt-8 grid gap-4 md:grid-cols-3'
          initial='hidden'
          variants={staggerVariants(0.1)}
          viewport={{ once: true, amount: 0.3 }}
          whileInView='shown'
        >
          {trust.map((item) => (
            <motion.li
              className='rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 transition-colors hover:bg-white/10'
              key={item.id}
              variants={revealVariants}
            >
              <span
                aria-hidden='true'
                className='grid h-11 w-11 place-items-center rounded-2xl bg-mint-300 text-forest-950'
              >
                <Icon name={item.icon} />
              </span>
              <span className='mt-4 block font-semibold'>{t(`customer.home.trust.${item.id}.title`)}</span>
              <span className='mt-1 block text-sm leading-6 text-white/65'>
                {t(`customer.home.trust.${item.id}.description`)}
              </span>
            </motion.li>
          ))}
        </motion.ul>

        <div className='mt-10 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-xl font-semibold'>{t('home.cta.title')}</p>
            <p className='mt-1 max-w-xl text-white/65'>
              {isCustomer ? t('home.cta.customerDescription') : t('home.cta.description')}
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            {isCustomer ? (
              <Link className={peachAction} to='/customer/booking'>
                <Icon className='text-xl' name='event_available' />
                {t('customer.home.book')}
              </Link>
            ) : (
              <>
                <Link className={peachAction} to='/register'>
                  {t('home.createAccount')}
                  <Icon className='text-xl' name='arrow_forward' />
                </Link>
                <Link className={glassAction} to='/customer/centers'>
                  {t('customer.nav.centers')}
                </Link>
              </>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
