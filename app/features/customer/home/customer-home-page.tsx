import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

const actions = [
  {
    to: '/customer/caregivers',
    icon: 'search',
    label: 'customer.nav.findCaregivers',
    description: 'customer.home.caregiversDescription'
  },
  {
    to: '/customer/bookings',
    icon: 'calendar_month',
    label: 'customer.nav.myBookings',
    description: 'customer.home.bookingsDescription'
  },
  {
    to: '/customer/patient-profiles',
    icon: 'family_restroom',
    label: 'customer.nav.familyProfiles',
    description: 'customer.home.familyDescription'
  }
] as const

export function CustomerHomePage() {
  const { t } = useTranslation()
  const user = useAuthUser()
  useDocumentTitle(t('customer.home.documentTitle'))

  return (
    <div className='bg-surface py-10 text-on-surface sm:py-16'>
      <div className='mx-auto max-w-7xl px-6'>
        <section className='rounded-3xl bg-primary px-6 py-12 text-white sm:px-10 sm:py-16'>
          <p className='text-sm font-semibold tracking-wide text-white/80'>{t('customer.home.eyebrow')}</p>
          <h1 className='mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl'>
            {t('customer.home.greeting', { name: user?.fullName || user?.email || t('customer.nav.customerRole') })}
          </h1>
          <p className='mt-5 max-w-2xl text-base leading-7 text-white/90'>{t('customer.home.intro')}</p>
          <div className='mt-8 flex flex-wrap gap-3'>
            <Link
              className='rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary hover:bg-white/90'
              to='/customer/caregivers'
            >
              {t('customer.home.findCare')}
            </Link>
            <Link
              className='rounded-xl border border-white/60 px-5 py-3 text-sm font-bold text-white hover:bg-white/10'
              to='/customer/bookings'
            >
              {t('customer.home.viewBookings')}
            </Link>
          </div>
        </section>

        <section aria-labelledby='customer-home-actions' className='mt-12'>
          <h2 className='text-2xl font-bold' id='customer-home-actions'>
            {t('customer.home.sectionTitle')}
          </h2>
          <div className='mt-6 grid gap-4 md:grid-cols-3'>
            {actions.map(({ to, icon, label, description }) => (
              <Link
                className='group rounded-2xl border border-outline-variant/40 bg-white p-6 transition-colors hover:border-primary/40 hover:bg-surface-container-low'
                key={to}
                to={to}
              >
                <Icon className='text-3xl text-primary' name={icon} />
                <h3 className='mt-5 text-lg font-bold group-hover:text-primary'>{t(label)}</h3>
                <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(description)}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
