import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { BookingPatientSection } from './components/booking-patient-section'
import { BookingProviderSection } from './components/booking-provider-section'
import { BookingScheduleSection } from './components/booking-schedule-section'
import { BookingServicesSection } from './components/booking-services-section'
import { BookingStepper } from './components/booking-stepper'
import { BookingSummarySidebar } from './components/booking-summary-sidebar'
import { useBookingForm } from './hooks/use-booking-form'

export function CustomerBookingPage() {
  const { t } = useTranslation()
  const form = useBookingForm()
  useDocumentTitle(t('customer.booking.documentTitle'))

  const selectedCount = Object.keys(form.services).length
  const noProvider = !form.caregiverUserId && !form.centerId

  return (
    <div className='flex w-full flex-1 flex-col bg-surface'>
      <section className='w-full bg-surface-container-low pb-10 sm:pb-12'>
        <div className='mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8'>
          <nav
            aria-label={t('customer.booking.breadcrumb.label')}
            className='mb-4 flex items-center gap-2 text-xs text-on-surface-variant sm:text-sm'
          >
            <Link className='transition-colors hover:text-primary' to='/customer'>
              {t('customer.booking.breadcrumb.home')}
            </Link>
            <Icon className='text-[16px] text-outline' name='chevron_right' />
            <Link className='transition-colors hover:text-primary' to='/customer/bookings'>
              {t('customer.booking.breadcrumb.bookings')}
            </Link>
            <Icon className='text-[16px] text-outline' name='chevron_right' />
            <span className='font-semibold text-primary'>{t('customer.booking.breadcrumb.current')}</span>
          </nav>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold tracking-tight text-on-surface sm:text-3xl md:text-4xl'>
              {t('customer.booking.header.title')}
            </h1>
            <p className='mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base'>
              {t('customer.booking.header.subtitle')}
            </p>
          </div>
          <BookingStepper
            done={{
              patient: Boolean(form.recipientId),
              provider: Boolean(form.centerId),
              services: selectedCount > 0 && form.plansChosen,
              schedule: Boolean(form.request),
              confirm: form.create.isSuccess
            }}
          />
        </div>
      </section>

      <div className='-mt-6 mb-16 w-full'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          {noProvider ? (
            <section className='flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-12 text-center shadow-sm'>
              <Icon className='text-5xl text-primary' name='person_search' />
              <h2 className='text-xl font-bold text-on-surface'>{t('customer.booking.start.title')}</h2>
              <p className='max-w-lg text-sm leading-6 text-on-surface-variant'>
                {t('customer.booking.start.description')}
              </p>
              <div className='flex flex-wrap justify-center gap-3'>
                <Link
                  className='rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary hover:bg-primary-container'
                  to='/customer/caregivers'
                >
                  {t('customer.booking.start.caregivers')}
                </Link>
                <Link
                  className='rounded-lg bg-surface-container px-5 py-3 text-sm font-semibold text-primary hover:bg-surface-container-high'
                  to='/customer/services'
                >
                  {t('customer.booking.start.services')}
                </Link>
              </div>
            </section>
          ) : (
            <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
              <div className='flex flex-col gap-6 lg:col-span-8'>
                <BookingPatientSection form={form} />
                <BookingProviderSection form={form} />
                <BookingServicesSection form={form} />
                <BookingScheduleSection form={form} />
              </div>
              <div className='lg:col-span-4'>
                <BookingSummarySidebar form={form} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
