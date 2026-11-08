import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from './icon'

const heading = 'text-xs font-semibold tracking-[0.08em] text-inverse-accent uppercase'
const link =
  'rounded text-inverse-muted transition-colors hover:text-inverse-on-surface hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent'

/**
 * Footer as a deep brand band (2026-11-03, CR-5): it closes the page clearly instead of blending into the last
 * section. Brand, two link groups and the support hotline, then the copyright row above a visible divider.
 */
export function SiteFooter({ audience }: { audience: 'public' | 'customer' }) {
  const { t } = useTranslation()
  const isCustomer = audience === 'customer'

  return (
    <footer className='bg-brand-900 text-inverse-muted'>
      <div className='mx-auto grid w-full max-w-[1200px] gap-10 px-4 pt-12 pb-10 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]'>
        <div>
          <Link
            className='inline-flex items-center gap-2 rounded-lg text-base font-bold text-inverse-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent'
            to={isCustomer ? '/customer' : '/'}
          >
            <span
              aria-hidden='true'
              className='grid h-8 w-8 place-items-center rounded-lg bg-inverse-accent text-brand-900'
            >
              <Icon className='text-lg' name='volunteer_activism' />
            </span>
            {t('common.brand')}
          </Link>
          <p className='mt-4 max-w-[30ch] leading-6'>{t('customer.footer.tagline')}</p>
        </div>
        <nav aria-label={t('customer.footer.explore')}>
          <h2 className={heading}>{t('customer.footer.explore')}</h2>
          <ul className='mt-4 flex flex-col gap-2.5'>
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
          <ul className='mt-4 flex flex-col gap-2.5'>
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
        <div>
          <h2 className={heading}>{t('customer.footer.support')}</h2>
          <a
            className='mt-4 inline-flex items-center gap-2 rounded text-xl font-semibold text-inverse-on-surface tabular-nums hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent'
            href={`tel:${t('customer.nav.hotlineNumber').replace(/\s/g, '')}`}
          >
            <Icon className='text-xl text-inverse-accent' name='call' />
            {t('customer.nav.hotlineNumber')}
          </a>
          <p className='mt-1'>{t('customer.footer.hours')}</p>
          <p className='mt-3 inline-flex items-center gap-1.5 rounded-full bg-error-container px-3 py-1 text-xs font-semibold text-on-error-container'>
            <Icon className='text-base' name='emergency' />
            {t('customer.nav.emergency')}
          </p>
        </div>
      </div>
      <div className='border-t border-inverse-muted/20'>
        <p className='mx-auto w-full max-w-[1200px] px-4 py-5 text-xs text-inverse-muted sm:px-6'>
          {t('home.footerCopyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
