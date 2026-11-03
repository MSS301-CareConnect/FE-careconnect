import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from './icon'

const link = 'rounded hover:text-on-surface hover:underline focus-visible:outline-2 focus-visible:outline-primary'

/** Compact footer (~200 px): brand, two link groups and the support hotline. */
export function SiteFooter({ audience }: { audience: 'public' | 'customer' }) {
  const { t } = useTranslation()
  const isCustomer = audience === 'customer'

  return (
    <footer className='border-t border-outline-variant bg-surface-container-lowest'>
      <div className='mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 text-sm text-on-surface-variant sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]'>
        <div>
          <Link
            className='inline-flex items-center gap-2 text-base font-bold text-primary'
            to={isCustomer ? '/customer' : '/'}
          >
            <span aria-hidden='true' className='grid h-7 w-7 place-items-center rounded-lg bg-primary text-on-primary'>
              <Icon className='text-lg' name='volunteer_activism' />
            </span>
            {t('common.brand')}
          </Link>
          <p className='mt-3 max-w-[30ch] leading-6'>{t('customer.footer.tagline')}</p>
        </div>
        <nav aria-label={t('customer.footer.explore')}>
          <h2 className='font-semibold text-on-surface'>{t('customer.footer.explore')}</h2>
          <ul className='mt-3 flex flex-col gap-2'>
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
              <a className={link} href={isCustomer ? '/customer#how-it-works' : '/#how-it-works'}>
                {t('home.howItWorks')}
              </a>
            </li>
          </ul>
        </nav>
        <nav aria-label={t('customer.footer.account')}>
          <h2 className='font-semibold text-on-surface'>{t('customer.footer.account')}</h2>
          <ul className='mt-3 flex flex-col gap-2'>
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
          <h2 className='font-semibold text-on-surface'>{t('customer.footer.support')}</h2>
          <a
            className='mt-3 inline-flex items-center gap-2 text-lg font-semibold text-primary tabular-nums hover:underline'
            href={`tel:${t('customer.nav.hotlineNumber').replace(/\s/g, '')}`}
          >
            <Icon className='text-xl' name='call' />
            {t('customer.nav.hotlineNumber')}
          </a>
          <p className='mt-1'>{t('customer.footer.hours')}</p>
          <p className='mt-2 inline-flex items-center gap-1.5 text-error'>
            <Icon className='text-base' name='emergency' />
            {t('customer.nav.emergency')}
          </p>
        </div>
      </div>
      <div className='border-t border-outline-variant'>
        <p className='mx-auto w-full max-w-[1200px] px-4 py-4 text-xs text-on-surface-variant sm:px-6'>
          {t('home.footerCopyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
