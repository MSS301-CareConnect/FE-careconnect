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

  return (
    <div className='flex w-full flex-1 flex-col bg-surface text-on-surface'>
      <section className='border-b border-outline-variant/60 bg-surface-container-low'>
        <div className='mx-auto w-full max-w-[1440px] px-5 pt-6 pb-8 sm:px-8 lg:px-12 lg:pt-8 lg:pb-10'>
          <nav
            aria-label={t('customer.booking.breadcrumb.label')}
            className='flex items-center gap-1.5 text-sm text-on-surface-variant'
          >
            <Link className='hover:text-primary' to='/customer'>
              {t('customer.booking.breadcrumb.home')}
            </Link>
            <Icon className='text-base' name='chevron_right' />
            <span className='font-semibold text-primary'>{t('customer.booking.breadcrumb.current')}</span>
          </nav>
          <h1 className='mt-4 text-3xl font-extrabold tracking-[-0.045em] text-on-surface sm:text-4xl'>
            {t('customer.booking.header.title')}
          </h1>
          <p className='mt-3 max-w-2xl text-base leading-7 text-on-surface-variant'>
            {t('customer.booking.header.subtitle')}
          </p>
          <div className='mt-8'>
            <BookingStepper
              done={{
                patient: Boolean(form.recipientId),
                provider: Boolean(form.centerId),
                services: Object.keys(form.services).length > 0 && form.plansChosen,
                schedule: Boolean(form.request),
                confirm: form.create.isSuccess
              }}
            />
          </div>
        </div>
      </section>

      <div className='mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12'>
        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8'>
          <div className='flex min-w-0 flex-col gap-6'>
            <BookingPatientSection form={form} />
            <BookingProviderSection form={form} />
            <BookingServicesSection form={form} />
            <BookingScheduleSection form={form} />
          </div>
          <BookingSummarySidebar form={form} />
        </div>
      </div>
    </div>
  )
}
