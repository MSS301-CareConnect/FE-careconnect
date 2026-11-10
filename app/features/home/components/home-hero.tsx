import { motion } from 'motion/react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { Icon } from '~/shared/ui/icon'
import { CountUp, easeSoft } from '~/shared/ui/motion'

import { homeContainer, peachAction, glassAction } from './home-styles'

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.7, delay, ease: easeSoft }
})

/** Gentle up-and-down drift for the floating chips over the photo. */
const drift = (delay: number) => ({
  animate: { y: [0, -6, 0] },
  transition: { duration: 6, delay, repeat: Infinity, ease: 'easeInOut' as const }
})

/**
 * Hero as two bento tiles (UI redesign 2026-11-09): a deep forest card with the headline (one serif italic word), the
 * two actions and three product facts that count up; a rounded photo with floating glass chips that preview the app.
 */
export function HomeHero({ isCustomer }: { isCustomer: boolean }) {
  const { t, i18n } = useTranslation()
  const user = useAuthUser()
  const firstName = user?.fullName?.trim().split(/\s+/).at(-1)
  const hours = new Intl.NumberFormat(i18n.language, { style: 'unit', unit: 'hour', unitDisplay: 'narrow' })
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent' })
  const facts = [
    { id: 'modes', value: 3, format: (n: number) => String(n) },
    { id: 'reports', value: 24, format: (n: number) => hours.format(n) },
    { id: 'refunds', value: 100, format: (n: number) => percent.format(n / 100) }
  ] as const

  return (
    <section aria-labelledby='home-title' className='scroll-mt-28 pt-5 pb-10 lg:pt-8 lg:pb-14' id='home-hero'>
      <div className={`${homeContainer} grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]`}>
        <motion.div
          {...enter(0)}
          className='relative isolate flex flex-col overflow-hidden rounded-[2rem] bg-forest-900 p-7 text-white shadow-[var(--shadow-float)] sm:p-10'
        >
          <span
            aria-hidden='true'
            className='absolute -top-24 -right-20 -z-10 h-72 w-72 rounded-full bg-mint-400/25 blur-3xl'
          />
          <span
            aria-hidden='true'
            className='absolute -bottom-28 -left-16 -z-10 h-64 w-64 rounded-full bg-peach-300/15 blur-3xl'
          />
          <p className='inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-mint-100'>
            <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-mint-300' />
            {isCustomer && firstName ? t('customer.home.greeting', { name: firstName }) : t('home.eyebrow')}
          </p>
          <h1
            className='mt-5 max-w-[16ch] text-[clamp(2.25rem,5vw,3.6rem)] leading-[1.08] font-bold tracking-tight text-balance'
            id='home-title'
          >
            <Trans
              components={{ accent: <em className='cc-accent-serif text-peach-200' /> }}
              i18nKey='home.titleRich'
            />
          </h1>
          <p className='mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg'>{t('home.description')}</p>
          <div className='mt-8 mb-10 flex flex-wrap gap-3'>
            {isCustomer ? (
              <>
                <Link className={peachAction} to='/customer/booking'>
                  <Icon className='text-xl' name='event_available' />
                  {t('customer.home.book')}
                </Link>
                <Link className={glassAction} to='/customer/caregivers'>
                  {t('home.primaryAction')}
                </Link>
              </>
            ) : (
              <>
                <Link className={peachAction} to='/customer/caregivers'>
                  {t('home.primaryAction')}
                  <Icon className='text-xl' name='arrow_forward' />
                </Link>
                <Link className={glassAction} to='/register'>
                  {t('home.createAccount')}
                </Link>
              </>
            )}
          </div>
          <dl
            aria-label={t('home.facts.label')}
            className='mt-auto grid grid-cols-3 gap-3 border-t border-white/10 pt-6'
          >
            {facts.map((fact) => (
              <div className='flex flex-col-reverse' key={fact.id}>
                <dt className='mt-1 text-xs leading-5 text-white/60 sm:text-sm'>{t(`home.facts.${fact.id}`)}</dt>
                <dd className='text-2xl font-bold text-white sm:text-3xl'>
                  <CountUp format={fact.format} value={fact.value} />
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          {...enter(0.12)}
          className='relative min-h-[22rem] overflow-hidden rounded-[2rem] bg-mint-100 shadow-[var(--shadow-soft)] sm:min-h-[28rem]'
        >
          <img
            alt={t('home.heroAlt')}
            className='absolute inset-0 h-full w-full object-cover object-[100%_center]'
            decoding='async'
            fetchPriority='high'
            src='/images/care-at-home-hero.jpg'
          />
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-gradient-to-t from-forest-950/45 via-transparent to-transparent'
          />
          <div aria-hidden='true'>
            <motion.div {...enter(0.45)} className='absolute top-4 left-4 sm:top-5 sm:left-5'>
              <motion.div
                {...drift(0)}
                className='cc-glass flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-sm font-semibold text-forest-900 shadow-[var(--shadow-soft)]'
              >
                <span className='grid h-7 w-7 place-items-center rounded-full bg-mint-400 text-white'>
                  <Icon className='text-base' filled name='verified' />
                </span>
                {t('home.heroChips.verified')}
              </motion.div>
            </motion.div>
            <motion.div {...enter(0.6)} className='absolute right-5 bottom-5 hidden sm:block'>
              <motion.div
                {...drift(1.2)}
                className='cc-glass w-52 rounded-2xl p-4 text-forest-900 shadow-[var(--shadow-soft)]'
              >
                <p className='text-xs font-medium text-forest-700'>{t('home.heroChips.progress')}</p>
                <p className='mt-1 text-sm font-semibold'>{t('home.heroChips.progressValue', { done: 4, total: 6 })}</p>
                <div className='mt-3 flex gap-1'>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <motion.span
                      animate={{ scaleY: 1, opacity: 1 }}
                      className={`h-2 flex-1 origin-bottom rounded-full ${index < 4 ? 'bg-mint-400' : 'bg-forest-900/10'}`}
                      initial={{ scaleY: 0.2, opacity: 0 }}
                      key={index}
                      transition={{ delay: 0.9 + index * 0.08, duration: 0.4, ease: easeSoft }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              {...enter(0.75)}
              className='absolute right-4 bottom-4 left-4 sm:right-auto sm:bottom-5 sm:left-5 sm:max-w-[calc(100%-16rem)]'
            >
              <motion.div
                {...drift(2.4)}
                className='flex items-center gap-3 rounded-2xl bg-forest-900/90 p-2 pr-5 text-white shadow-[var(--shadow-float)] backdrop-blur-md'
              >
                <span className='grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-mint-200'>
                  <Icon className='text-xl' name='schedule' />
                </span>
                <span>
                  <span className='block text-xs text-white/60'>{t('home.heroChips.nextVisit')}</span>
                  <span className='block text-sm font-semibold'>{t('home.heroChips.nextVisitTime')}</span>
                </span>
                <span className='ml-2 grid h-7 w-7 place-items-center rounded-full border border-white/25'>
                  <Icon className='text-base' name='arrow_outward' />
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
