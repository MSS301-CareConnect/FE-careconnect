import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import './home-page.css'

const steps = ['find', 'compare', 'book'] as const
const reasons = ['profiles', 'schedule', 'family'] as const

export function HomePage({ audience = 'public' }: { audience?: 'public' | 'customer' }) {
  const { t } = useTranslation()
  const isCustomer = audience === 'customer'

  return (
    <div className='home-page bg-surface text-on-surface'>
      <section
        aria-labelledby='home-title'
        className='mx-auto grid max-w-[1440px] gap-10 px-5 pb-14 pt-10 sm:px-8 lg:min-h-[610px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-14 lg:px-12 lg:pb-20 lg:pt-16'
      >
        <div className='home-enter max-w-[620px]'>
          <p className='mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary'>{t('home.eyebrow')}</p>
          <h1
            id='home-title'
            className='max-w-[12ch] text-[clamp(2.8rem,5.5vw,5.5rem)] font-extrabold leading-[1.04] tracking-[-0.065em] text-balance text-on-surface'
          >
            {t('home.title')}
          </h1>
          <p className='mt-6 max-w-[51ch] text-base leading-7 text-on-surface-variant sm:text-lg sm:leading-8'>
            {t('home.description')}
          </p>
          <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-4'>
            <Link
              className='group inline-flex min-h-13 items-center justify-center gap-4 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm transition-[transform,background-color] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:bg-primary-container active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              to='/customer/caregivers'
            >
              {t('home.primaryAction')}
              <Icon
                className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                name='arrow_forward'
              />
            </Link>
            <Link
              className='inline-flex min-h-11 items-center border-b-2 border-primary text-sm font-bold text-primary transition-colors hover:text-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              to={isCustomer ? '/customer/booking' : '/register'}
            >
              {isCustomer ? t('customer.home.book') : t('home.createAccount')}
            </Link>
          </div>
        </div>
        <div className='home-enter home-enter-late overflow-hidden rounded-2xl bg-surface-container-high shadow-md'>
          <img
            alt={t('home.heroAlt')}
            className='aspect-[4/3] h-full w-full object-cover object-[66%_center] lg:aspect-auto lg:min-h-[510px]'
            decoding='async'
            fetchPriority='high'
            src='/images/care-at-home-hero.jpg'
          />
        </div>
      </section>

      <section
        aria-labelledby='home-process-title'
        className='border-y border-outline-variant/60 bg-surface-container-lowest'
        id='how-it-works'
      >
        <div className='mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
          <div className='max-w-[650px]'>
            <p className='text-xs font-extrabold uppercase tracking-[0.18em] text-primary'>
              {t('home.processEyebrow')}
            </p>
            <h2
              id='home-process-title'
              className='mt-4 text-3xl font-extrabold leading-tight tracking-[-0.045em] text-on-surface sm:text-4xl'
            >
              {t('home.processTitle')}
            </h2>
          </div>
          <ol className='mt-10 grid border-t border-outline-variant/60 md:grid-cols-3'>
            {steps.map((step, index) => (
              <li
                className='border-b border-outline-variant/60 px-0 py-7 md:border-b-0 md:border-r md:px-7 md:last:border-r-0 md:first:pl-0'
                key={step}
              >
                <span className='font-mono text-xs font-bold tracking-[0.16em] text-primary tabular-nums'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className='mt-5 text-xl font-bold tracking-[-0.035em] text-on-surface'>
                  {t(`home.steps.${step}.title`)}
                </h3>
                <p className='mt-3 max-w-[36ch] text-sm leading-6 text-on-surface-variant'>
                  {t(`home.steps.${step}.description`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby='home-reasons-title' className='home-reasons'>
        <div className='home-reasons-visual mx-auto max-w-[1440px]'>
          <img
            alt={t('home.reasonsPhotoAlt')}
            className='home-reasons-photo'
            decoding='async'
            loading='lazy'
            src='/images/care-for-families-background.png'
          />
          <div className='home-reasons-copy relative z-10 mx-auto w-full px-5 py-16 text-inverse-on-surface sm:px-8 lg:px-12'>
            <p className='text-xs font-extrabold uppercase tracking-[0.18em] text-inverse-accent'>
              {t('home.reasonsEyebrow')}
            </p>
            <h2
              id='home-reasons-title'
              className='mt-4 max-w-[15ch] text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl'
            >
              {t('home.reasonsTitle')}
            </h2>
            <p className='mt-5 max-w-[45ch] text-sm leading-7 text-inverse-muted'>{t('home.reasonsDescription')}</p>
          </div>
        </div>
        <div className='home-reasons-details'>
          <div className='mx-auto grid max-w-[1440px] px-5 py-8 sm:px-8 lg:grid-cols-3 lg:px-12 lg:py-12'>
            {reasons.map((reason) => (
              <article
                className='border-b border-outline-variant/60 py-6 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0'
                key={reason}
              >
                <h3 className='text-lg font-bold tracking-[-0.025em] text-on-surface'>
                  {t(`home.reasons.${reason}.title`)}
                </h3>
                <p className='mt-3 text-sm leading-6 text-on-surface-variant'>
                  {t(`home.reasons.${reason}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
