import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from './icon'

const heading = 'text-xs font-semibold tracking-[0.12em] text-mint-200/80 uppercase'
const link =
  'inline-flex rounded-full py-0.5 text-white/65 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-200'

/**
 * Footer as a full-width deep forest band with rounded top corners ("Soft Bento", 2026-11-09; the deep band since CR-5): the brand with a serif
 * accent line, the support card (the only place with the hotline), two link groups, then the copyright, a back-to-top
 * button and a faint oversized wordmark that closes the page.
 */
export function SiteFooter({ audience }: { audience: 'public' | 'customer' }) {
  const { t } = useTranslation()
  const isCustomer = audience === 'customer'
  const hotline = t('customer.nav.hotlineNumber')

  return (
    <footer>
      {/* Full width and flush with the bottom; only the top corners are rounded. Phones keep room for the bottom
          navigation inside the band. */}
      <div className='relative isolate overflow-clip rounded-t-[2rem] bg-forest-950 pb-24 text-sm text-white/65 sm:rounded-t-[2.5rem] lg:pb-0'>
        <span
          aria-hidden='true'
          className='absolute -top-40 -left-24 -z-10 h-96 w-96 rounded-full bg-mint-400/15 blur-3xl'
        />
        <span
          aria-hidden='true'
          className='absolute -right-24 -bottom-40 -z-10 h-96 w-96 rounded-full bg-peach-300/10 blur-3xl'
        />

        <div className='mx-auto grid w-full max-w-[1200px] gap-10 px-6 pt-14 pb-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.1fr]'>
          <div>
            <Link
              className='inline-flex items-center gap-2.5 rounded-full text-lg font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-200'
              to={isCustomer ? '/customer' : '/'}
            >
              <span
                aria-hidden='true'
                className='grid h-10 w-10 place-items-center rounded-full bg-mint-200 text-forest-950'
              >
                <Icon className='text-xl' name='volunteer_activism' />
              </span>
              {t('common.brand')}
            </Link>
            <p className='mt-6 max-w-[18ch] text-[1.7rem] leading-tight font-semibold tracking-tight text-white'>
              <Trans
                components={{ accent: <em className='cc-accent-serif text-peach-200' /> }}
                i18nKey='customer.footer.taglineAccent'
              />
            </p>
            <p className='mt-3 max-w-[34ch] leading-6'>{t('customer.footer.tagline')}</p>
          </div>

          <nav aria-label={t('customer.footer.explore')}>
            <h2 className={heading}>{t('customer.footer.explore')}</h2>
            <ul className='mt-5 flex flex-col gap-3'>
              <li>
                <Link className={link} to='/customer/caregivers'>
                  {t('customer.nav.caregivers')}
                </Link>
              </li>
              <li>
                <Link className={link} to='/customer/services'>
                  {t('customer.nav.services')}
                </Link>
              </li>
              <li>
                <Link className={link} to='/customer/centers'>
                  {t('customer.nav.centers')}
                </Link>
              </li>
              <li>
                <a className={link} href={isCustomer ? '/customer#how-it-works' : '/#how-it-works'}>
                  {t('home.howItWorks')}
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label={t('customer.footer.account')}>
            <h2 className={heading}>{t('customer.footer.account')}</h2>
            <ul className='mt-5 flex flex-col gap-3'>
              {isCustomer ? (
                <>
                  <li>
                    <Link className={link} to='/customer/bookings'>
                      {t('customer.nav.bookings')}
                    </Link>
                  </li>
                  <li>
                    <Link className={link} to='/customer/patient-profiles'>
                      {t('customer.nav.relatives')}
                    </Link>
                  </li>
                  <li>
                    <Link className={link} to='/customer/payments'>
                      {t('customer.nav.payments')}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link className={link} to='/login'>
                      {t('home.signIn')}
                    </Link>
                  </li>
                  <li>
                    <Link className={link} to='/register'>
                      {t('home.createAccount')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className='rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10'>
            <h2 className={heading}>{t('customer.footer.support')}</h2>
            <a
              className='mt-4 inline-flex items-center gap-2.5 rounded-full text-2xl font-bold text-white tabular-nums transition-colors hover:text-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-200'
              href={`tel:${hotline.replace(/\s/g, '')}`}
            >
              <span
                aria-hidden='true'
                className='grid h-10 w-10 place-items-center rounded-full bg-peach-300 text-forest-950'
              >
                <Icon className='text-xl' name='call' />
              </span>
              {hotline}
            </a>
            <p className='mt-2'>{t('customer.footer.hours')}</p>
            <p className='mt-4 inline-flex items-center gap-1.5 rounded-full bg-error-container px-3 py-1.5 text-xs font-semibold text-on-error-container'>
              <Icon className='text-base' name='emergency' />
              {t('customer.nav.emergency')}
            </p>
          </div>
        </div>

        <div className='mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 border-t border-white/10 px-6 py-5'>
          <p className='text-xs text-white/50'>{t('home.footerCopyright', { year: new Date().getFullYear() })}</p>
          <button
            className='inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 text-xs whitespace-nowrap font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-200'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            type='button'
          >
            {t('customer.footer.backToTop')}
            <Icon className='text-base' name='arrow_upward' />
          </button>
        </div>

        {/* The faint wordmark is SVG text stretched to the band's width, so it never overflows at any screen size. */}
        <svg
          aria-hidden='true'
          className='pointer-events-none -mb-[3%] block w-full px-4 select-none sm:px-6'
          viewBox='0 0 1200 190'
        >
          <text
            className='fill-white/[0.05] font-bold'
            fontSize='230'
            lengthAdjust='spacingAndGlyphs'
            textAnchor='middle'
            textLength='1180'
            x='600'
            y='185'
          >
            {t('common.brand')}
          </text>
        </svg>
      </div>
    </footer>
  )
}
