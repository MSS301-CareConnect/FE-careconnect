import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from './icon'

export function SiteFooter({ audience }: { audience: 'public' | 'customer' }) {
  const { t } = useTranslation()
  const isCustomer = audience === 'customer'

  return (
    <footer className='bg-inverse-surface text-inverse-on-surface'>
      <div className='mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] sm:gap-8 sm:px-8 lg:px-12 lg:py-16'>
        <div>
          <Link
            className='inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.04em]'
            to={isCustomer ? '/customer' : '/'}
          >
            <span
              aria-hidden='true'
              className='grid h-9 w-9 place-items-center rounded-lg bg-inverse-accent text-inverse-surface'
            >
              <Icon className='text-[22px]' name='volunteer_activism' />
            </span>
            {t('common.brand')}
          </Link>
          <p className='mt-5 max-w-[32ch] text-sm leading-7 text-inverse-muted'>{t('home.footer')}</p>
        </div>
        <nav aria-label={t('home.footerExplore')}>
          <h2 className='text-xs font-extrabold uppercase tracking-[0.14em] text-inverse-accent'>
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
              href={isCustomer ? '/customer#how-it-works' : '/#how-it-works'}
            >
              {t('home.howItWorks')}
            </a>
          </div>
        </nav>
        <nav aria-label={t('home.footerAccount')}>
          <h2 className='text-xs font-extrabold uppercase tracking-[0.14em] text-inverse-accent'>
            {t('home.footerAccount')}
          </h2>
          <div className='mt-5 flex flex-col items-start gap-3 text-sm'>
            {isCustomer ? (
              <>
                <Link
                  className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
                  to='/customer/my-profile'
                >
                  {t('customer.nav.myProfile')}
                </Link>
                <Link
                  className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
                  to='/customer/patient-profiles'
                >
                  {t('customer.nav.familyProfiles')}
                </Link>
              </>
            ) : (
              <>
                <Link className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2' to='/login'>
                  {t('home.signIn')}
                </Link>
                <Link
                  className='hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
                  to='/register'
                >
                  {t('home.createAccount')}
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
      <div className='border-t border-white/15'>
        <div className='mx-auto max-w-[1440px] px-5 py-5 text-xs text-inverse-muted sm:px-8 lg:px-12'>
          {t('home.footerCopyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}
