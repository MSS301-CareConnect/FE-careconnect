import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { bookingPreviews } from './bookings-data'
import { CareReportActivities } from './components/care-report-activities'
import { CareReportSidebar } from './components/care-report-sidebar'
import { BookingReviewModal } from './components/booking-review-modal'

export function CustomerCareReportPage({ code }: { code: string }) {
  const { t, i18n } = useTranslation()
  const [reviewOpen, setReviewOpen] = useState(false)
  const booking = bookingPreviews.find((item) => item.code === code)
  useDocumentTitle(t('customer.careReport.documentTitle', { code }))

  if (!booking || booking.status !== 'completed') {
    return (
      <div className='mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center'>
        <Icon name='description' className='text-5xl text-primary' />
        <h1 className='mt-4 text-2xl font-bold'>{t('customer.careReport.unavailable')}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('customer.careReport.unavailableDescription')}</p>
        <Link
          to={booking ? `/customer/bookings/${booking.code}` : '/customer/bookings'}
          className='mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white'
        >
          {t('customer.careReport.back')}
        </Link>
      </div>
    )
  }

  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN'
  const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${booking.date}T12:00:00`)
  )
  const duration = Number(booking.end.slice(0, 2)) - Number(booking.start.slice(0, 2))
  const facts = [
    {
      key: 'patient',
      icon: 'elderly',
      value: t('customer.myBookings.items.completed.patient'),
      detail: t('customer.myBookings.items.completed.relation')
    },
    {
      key: 'caregiver',
      icon: 'medical_services',
      value: booking.caregiver,
      detail: t('customer.myBookings.items.completed.caregiverRole')
    },
    { key: 'schedule', icon: 'calendar_today', value: date, detail: `${booking.start}–${booking.end}` },
    {
      key: 'location',
      icon: 'location_on',
      value: t('customer.myBookings.items.completed.location'),
      detail: t('customer.myBookings.items.completed.service')
    }
  ] as const

  return (
    <div className='care-report-page bg-surface pb-16'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <nav
          aria-label={t('customer.careReport.breadcrumb')}
          className='flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant print:hidden'
        >
          <Link to='/customer/bookings'>{t('customer.nav.myBookings')}</Link>
          <Icon name='chevron_right' className='text-base' />
          <Link to={`/customer/bookings/${booking.code}`}>#{booking.code}</Link>
          <Icon name='chevron_right' className='text-base' />
          <span className='font-semibold text-primary'>{t('customer.careReport.breadcrumb')}</span>
        </nav>
        <div className='mt-5 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              {t('customer.careReport.title', { code: booking.code })}
            </h1>
            <p className='mt-2 text-sm text-on-surface-variant'>{t('customer.careReport.subtitle')}</p>
          </div>
          <div className='flex flex-wrap gap-2 print:hidden'>
            <button
              type='button'
              onClick={() => window.print()}
              className='flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container'
            >
              <Icon name='picture_as_pdf' className='text-lg' />
              {t('customer.careReport.print')}
            </button>
            <button
              type='button'
              onClick={() => setReviewOpen(true)}
              className='rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm'
            >
              {t('customer.careReport.rate')}
            </button>
            <Link
              to='/customer/booking'
              className='rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-on-surface shadow-sm'
            >
              {t('customer.careReport.rebook')}
            </Link>
          </div>
        </div>
        <p className='mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900'>
          {t('customer.careReport.preview')}
        </p>
        <section className='mt-6 rounded-2xl bg-emerald-50 p-5 sm:p-6'>
          <div className='flex flex-wrap justify-between gap-5'>
            <div className='flex max-w-xl gap-3'>
              <Icon name='task_alt' className='text-3xl text-primary' />
              <div>
                <h2 className='text-lg font-bold text-primary'>{t('customer.careReport.completed')}</h2>
                <p className='mt-1 text-sm leading-6 text-on-surface-variant'>
                  {t('customer.careReport.completedDescription')}
                </p>
              </div>
            </div>
            <dl className='flex flex-wrap gap-6 text-sm'>
              <div>
                <dt className='text-on-surface-variant'>{t('customer.careReport.duration')}</dt>
                <dd className='mt-1 font-bold text-primary'>{t('customer.careReport.hours', { count: duration })}</dd>
              </div>
              <div>
                <dt className='text-on-surface-variant'>{t('customer.careReport.compliance')}</dt>
                <dd className='mt-1 font-bold text-primary'>{t('customer.careReport.groupsCompleted')}</dd>
              </div>
            </dl>
          </div>
        </section>
        <dl className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {facts.map((fact) => (
            <div key={fact.key} className='rounded-xl bg-white p-5 shadow-sm'>
              <dt className='flex items-center gap-2 text-xs font-semibold text-on-surface-variant'>
                <Icon name={fact.icon} className='text-lg text-primary' />
                {t(`customer.careReport.${fact.key}`)}
              </dt>
              <dd className='mt-3 text-sm font-bold'>
                {fact.value}
                <span className='mt-1 block text-xs font-normal leading-5 text-on-surface-variant'>{fact.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className='mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
          <CareReportActivities caregiver={booking.caregiver} />
          <CareReportSidebar booking={booking} onReview={() => setReviewOpen(true)} />
        </div>
      </div>
      <BookingReviewModal key={booking.code} booking={booking} open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </div>
  )
}
