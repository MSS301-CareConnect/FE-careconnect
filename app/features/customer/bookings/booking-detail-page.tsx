import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { bookingPreviews } from './bookings-data'
import { BookingDetailSidebar } from './components/booking-detail-sidebar'
import { BookingProgress } from './components/booking-progress'
import { BookingVitalsAndFeed } from './components/booking-vitals-and-feed'
import { BookingReviewModal } from './components/booking-review-modal'

interface CustomerBookingDetailPageProps {
  code: string
}

export function CustomerBookingDetailPage({ code }: CustomerBookingDetailPageProps) {
  const { t, i18n } = useTranslation()
  const [reviewOpen, setReviewOpen] = useState(false)
  const booking = bookingPreviews.find((item) => item.code === code)
  useDocumentTitle(t('customer.bookingDetail.documentTitle', { code }))

  if (!booking) {
    return (
      <div className='mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center'>
        <Icon name='event_busy' className='text-5xl text-primary' />
        <h1 className='mt-4 text-2xl font-bold'>{t('customer.bookingDetail.notFound.title')}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('customer.bookingDetail.notFound.description')}</p>
        <Link to='/customer/bookings' className='mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white'>
          {t('customer.bookingDetail.notFound.back')}
        </Link>
      </div>
    )
  }

  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN'
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(`${booking.date}T12:00:00`))

  return (
    <div className='min-h-full bg-surface pb-16'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <nav
          aria-label={t('customer.bookingDetail.breadcrumb')}
          className='flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant'
        >
          <Link to='/customer' className='hover:text-primary'>
            {t('customer.nav.home')}
          </Link>
          <Icon name='chevron_right' className='text-base' />
          <Link to='/customer/bookings' className='hover:text-primary'>
            {t('customer.nav.myBookings')}
          </Link>
          <Icon name='chevron_right' className='text-base' />
          <span className='font-semibold text-primary'>
            {t('customer.bookingDetail.breadcrumb')} #{booking.code}
          </span>
        </nav>

        <div className='mt-5 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{t('customer.bookingDetail.title')}</h1>
            <p className='mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
              <span className='rounded-md bg-surface-container px-2 py-1 font-mono font-semibold text-on-surface'>
                #{booking.code}
              </span>
              <span>·</span>
              <span>{t(`customer.bookingDetail.status.${booking.status}`)}</span>
              <span>·</span>
              <span>
                {booking.start}–{booking.end}
              </span>
            </p>
          </div>
          <Link
            to='/customer/bookings'
            className='inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-surface-container-low'
          >
            <Icon name='arrow_back' className='text-lg' />
            {t('customer.bookingDetail.notFound.back')}
          </Link>
        </div>

        <p className='mt-5 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900'>
          <Icon name='info' className='mt-0.5 shrink-0 text-lg' />
          {t('customer.bookingDetail.sampleNotice')}
        </p>

        <div className='mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
          <div className='flex min-w-0 flex-col gap-6'>
            <BookingProgress booking={booking} date={date} />
            {booking.status === 'completed' && (
              <button
                type='button'
                onClick={() => setReviewOpen(true)}
                className='flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-semibold text-primary shadow-sm hover:bg-surface-container-low'
              >
                <Icon name='star' className='text-xl text-amber-500' />
                {t('customer.careReport.rate')}
              </button>
            )}
            {booking.status === 'completed' && (
              <Link
                to={`/customer/bookings/${booking.code}/report`}
                className='flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-sm font-semibold text-white hover:bg-primary-container'
              >
                <Icon name='clinical_notes' className='text-xl' />
                {t('customer.careReport.read')}
              </Link>
            )}
            {booking.status === 'ongoing' && <BookingVitalsAndFeed />}
          </div>
          <BookingDetailSidebar booking={booking} />
        </div>
      </div>
      {booking.status === 'completed' && (
        <BookingReviewModal
          key={booking.code}
          booking={booking}
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </div>
  )
}
