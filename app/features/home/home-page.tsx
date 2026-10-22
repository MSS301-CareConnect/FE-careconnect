import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import './home-page.css'

const steps = ['find', 'compare', 'book'] as const
const reasons = ['profiles', 'schedule', 'family'] as const

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className='home-page min-h-[100dvh] bg-[#f7f8f5] text-[#1b2922]'>
      <header className='border-b border-[#dfe6dc]'>
        <div className='mx-auto flex min-h-20 max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8 lg:px-12'>
          <Link
            className='inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.06em] text-[#075b31]'
            to='/'
          >
            <span aria-hidden='true' className='grid h-9 w-9 place-items-center rounded-lg bg-[#075b31] text-white'>
              <Icon className='text-[22px]' name='volunteer_activism' />
            </span>
            {t('common.brand')}
          </Link>
          <nav
            aria-label={t('home.navigation')}
            className='order-3 flex w-full items-center gap-5 text-sm font-semibold text-[#44594b] sm:order-2 sm:w-auto lg:gap-8'
          >
            <a
              className='hover:text-[#075b31] focus-visible:outline-2 focus-visible:outline-[#075b31]'
              href='#how-it-works'
            >
              {t('home.howItWorks')}
            </a>
            <Link
              className='hover:text-[#075b31] focus-visible:outline-2 focus-visible:outline-[#075b31]'
              to='/customer/services'
            >
              {t('home.services')}
            </Link>
          </nav>
          <div className='order-2 flex items-center gap-3 sm:order-3'>
            <div className='hidden sm:block'>
              <LanguageSwitch />
            </div>
            <Link
              className='inline-flex min-h-11 items-center rounded-lg border border-[#b9c9bb] px-4 text-sm font-bold text-[#075b31] hover:bg-[#eaf2e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31]'
              to='/login'
            >
              {t('home.signIn')}
            </Link>
          </div>
          <div className='order-4 w-full sm:hidden'>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      <main>
        <section
          aria-labelledby='home-title'
          className='mx-auto grid max-w-[1440px] gap-10 px-5 pb-14 pt-10 sm:px-8 lg:min-h-[610px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-14 lg:px-12 lg:pb-20 lg:pt-16'
        >
          <div className='home-enter max-w-[620px]'>
            <p className='mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#075b31]'>
              {t('home.eyebrow')}
            </p>
            <h1
              id='home-title'
              className='max-w-[12ch] text-[clamp(2.8rem,5.5vw,5.5rem)] font-extrabold leading-[1.04] tracking-[-0.065em] text-balance'
            >
              {t('home.title')}
            </h1>
            <p className='mt-6 max-w-[51ch] text-base leading-7 text-[#506356] sm:text-lg sm:leading-8'>
              {t('home.description')}
            </p>
            <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-4'>
              <Link
                className='group inline-flex min-h-13 items-center justify-center gap-4 rounded-lg bg-[#075b31] px-5 py-3 text-sm font-bold text-white transition-[transform,background-color] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:bg-[#064a29] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31]'
                to='/customer/caregivers'
              >
                {t('home.primaryAction')}
                <Icon
                  className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                  name='arrow_forward'
                />
              </Link>
              <Link
                className='inline-flex min-h-11 items-center border-b border-[#075b31] text-sm font-bold text-[#075b31] hover:text-[#043b20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31]'
                to='/register'
              >
                {t('home.createAccount')}
              </Link>
            </div>
          </div>
          <div className='home-enter home-enter-late overflow-hidden rounded-[18px] bg-[#e4eae2]'>
            <img
              alt={t('home.heroAlt')}
              className='aspect-[4/3] h-full w-full object-cover object-[66%_center] lg:aspect-auto lg:min-h-[510px]'
              decoding='async'
              fetchPriority='high'
              src='/images/care-at-home-hero.jpg'
            />
          </div>
        </section>

        <section aria-labelledby='home-process-title' className='border-y border-[#dfe6dc] bg-white' id='how-it-works'>
          <div className='mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
            <div className='max-w-[650px]'>
              <p className='text-xs font-extrabold uppercase tracking-[0.18em] text-[#075b31]'>
                {t('home.processEyebrow')}
              </p>
              <h2
                id='home-process-title'
                className='mt-4 text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl'
              >
                {t('home.processTitle')}
              </h2>
            </div>
            <ol className='mt-10 grid border-t border-[#dfe6dc] md:grid-cols-3'>
              {steps.map((step, index) => (
                <li
                  className='border-b border-[#dfe6dc] px-0 py-7 md:border-b-0 md:border-r md:px-7 md:last:border-r-0 md:first:pl-0'
                  key={step}
                >
                  <span className='font-mono text-xs font-bold tracking-[0.16em] text-[#075b31]'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className='mt-5 text-xl font-bold tracking-[-0.035em]'>{t(`home.steps.${step}.title`)}</h3>
                  <p className='mt-3 max-w-[36ch] text-sm leading-6 text-[#5d6e61]'>
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
            <div className='home-reasons-copy relative z-10 mx-auto w-full px-5 py-16 text-white sm:px-8 lg:px-12'>
              <p className='text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8efcc]'>
                {t('home.reasonsEyebrow')}
              </p>
              <h2
                id='home-reasons-title'
                className='mt-4 max-w-[15ch] text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl'
              >
                {t('home.reasonsTitle')}
              </h2>
              <p className='mt-5 max-w-[45ch] text-sm leading-7 text-[#eef5ec]'>{t('home.reasonsDescription')}</p>
            </div>
          </div>
          <div className='home-reasons-details'>
            <div className='mx-auto grid max-w-[1440px] px-5 py-8 sm:px-8 lg:grid-cols-3 lg:px-12 lg:py-12'>
              {reasons.map((reason) => (
                <article
                  className='border-b border-[#cbd8cc] py-6 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0'
                  key={reason}
                >
                  <h3 className='text-lg font-bold tracking-[-0.025em]'>{t(`home.reasons.${reason}.title`)}</h3>
                  <p className='mt-3 text-sm leading-6 text-[#5d6e61]'>{t(`home.reasons.${reason}.description`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className='bg-[#123a29] text-[#e9f0e9]'>
        <div className='mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] sm:gap-8 sm:px-8 lg:px-12 lg:py-16'>
          <div>
            <Link className='inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.06em]' to='/'>
              <span
                aria-hidden='true'
                className='grid h-9 w-9 place-items-center rounded-lg bg-[#d8efcc] text-[#123a29]'
              >
                <Icon className='text-[22px]' name='volunteer_activism' />
              </span>
              {t('common.brand')}
            </Link>
            <p className='mt-5 max-w-[32ch] text-sm leading-7 text-[#c6d7c9]'>{t('home.footer')}</p>
          </div>
          <nav aria-label={t('home.footerExplore')}>
            <h2 className='text-xs font-extrabold uppercase tracking-[0.16em] text-[#9dc9a8]'>
              {t('home.footerExplore')}
            </h2>
            <div className='mt-5 flex flex-col items-start gap-3 text-sm'>
              <Link
                className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
                to='/customer/caregivers'
              >
                {t('home.primaryAction')}
              </Link>
              <Link
                className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
                to='/customer/services'
              >
                {t('home.services')}
              </Link>
              <a
                className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
                href='#how-it-works'
              >
                {t('home.howItWorks')}
              </a>
            </div>
          </nav>
          <nav aria-label={t('home.footerAccount')}>
            <h2 className='text-xs font-extrabold uppercase tracking-[0.16em] text-[#9dc9a8]'>
              {t('home.footerAccount')}
            </h2>
            <div className='mt-5 flex flex-col items-start gap-3 text-sm'>
              <Link className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2' to='/login'>
                {t('home.signIn')}
              </Link>
              <Link className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2' to='/register'>
                {t('home.createAccount')}
              </Link>
            </div>
          </nav>
        </div>
        <div className='border-t border-white/15'>
          <div className='mx-auto max-w-[1440px] px-5 py-5 text-xs text-[#c6d7c9] sm:px-8 lg:px-12'>
            {t('home.footerCopyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  )
}
