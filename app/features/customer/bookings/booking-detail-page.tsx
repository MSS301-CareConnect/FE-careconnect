import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorStatus, bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingHistoryList } from '~/entities/booking/booking-history-list'
import { BookingOccurrenceList } from '~/entities/booking/booking-occurrence-list'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import type { BookingStatus, OccurrenceStatus } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

import { BookingCancelDialog } from './components/booking-cancel-dialog'
import { BookingDetailSummary } from './components/booking-detail-summary'
import { BookingAftercare } from './components/booking-aftercare'
import { BookingStatusPanel } from './components/booking-status-panel'

const CANCELLABLE: readonly BookingStatus[] = ['PENDING', 'AWAITING_DEPOSIT', 'CONFIRMED', 'IN_PROGRESS']
// Visits that have taken place: reports and complaints apply only after one of these.
const VISITED: ReadonlySet<OccurrenceStatus> = new Set(['IN_PROGRESS', 'COMPLETED', 'MISSED'])

export function CustomerBookingDetailPage({ id }: { id: string }) {
  const { t } = useTranslation()
  const [cancelling, setCancelling] = useState(false)
  const booking = useQuery({ queryKey: bookingKeys.detail(id), queryFn: () => fetchBooking(id), retry: false })
  useDocumentTitle(t('customer.bookingDetail.documentTitle', { code: booking.data?.bookingCode ?? '' }))

  if (booking.isPending)
    return (
      <p className='mx-auto mt-10 max-w-7xl px-4 text-sm text-on-surface-variant' role='status'>
        {t('customer.bookingDetail.loading')}
      </p>
    )

  if (booking.isError) {
    const missing = bookingErrorStatus(booking.error) === 404
    return (
      <div
        className='mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center'
        role='alert'
      >
        <Icon className='text-5xl text-primary' name='event_busy' />
        <h1 className='mt-4 text-2xl font-bold'>
          {missing ? t('customer.bookingDetail.notFound.title') : t('customer.bookingDetail.error')}
        </h1>
        <p className='mt-2 text-sm text-on-surface-variant'>
          {missing ? t('customer.bookingDetail.notFound.description') : t(bookingErrorKey(booking.error))}
        </p>
        <Link
          className='mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary'
          to='/customer/bookings'
        >
          {t('customer.bookingDetail.back')}
        </Link>
      </div>
    )
  }

  const data = booking.data
  return (
    <div className='min-h-full bg-surface pb-16'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <nav
          aria-label={t('customer.bookingDetail.breadcrumb')}
          className='flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant'
        >
          <Link className='hover:text-primary' to='/customer'>
            {t('customer.nav.home')}
          </Link>
          <Icon className='text-base' name='chevron_right' />
          <Link className='hover:text-primary' to='/customer/bookings'>
            {t('customer.nav.myBookings')}
          </Link>
          <Icon className='text-base' name='chevron_right' />
          <span className='font-semibold text-primary'>#{data.bookingCode}</span>
        </nav>

        <div className='mt-5 flex flex-wrap items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              {data.recipientSnapshot?.fullName ?? t('customer.bookingDetail.title')}
            </h1>
            <p className='mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
              <span className='rounded-md bg-surface-container px-2 py-1 font-semibold text-on-surface'>
                #{data.bookingCode}
              </span>
              <BookingStatusBadge status={data.status} />
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {CANCELLABLE.includes(data.status) ? (
              <button
                className='inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-error shadow-sm hover:bg-error-container/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error'
                onClick={() => setCancelling(true)}
                type='button'
              >
                <Icon className='text-lg' name='event_busy' />
                {t('customer.bookingDetail.cancel.open')}
              </button>
            ) : null}
            <Link
              className='inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-surface-container-low'
              to='/customer/bookings'
            >
              <Icon className='text-lg' name='arrow_back' />
              {t('customer.bookingDetail.back')}
            </Link>
          </div>
        </div>

        <div className='mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
          <div className='flex min-w-0 flex-col gap-6'>
            <BookingStatusPanel booking={data} />
            <SectionCard icon='event_note' title={t('customer.bookingDetail.occurrences')}>
              <BookingOccurrenceList occurrences={data.occurrences ?? []} />
            </SectionCard>
            <SectionCard icon='history' title={t('customer.bookingDetail.history')}>
              <BookingHistoryList bookingId={data.id} />
            </SectionCard>
            <BookingAftercare
              bookingId={data.id}
              completed={data.status === 'COMPLETED'}
              visited={(data.occurrences ?? []).some((visit) => VISITED.has(visit.status))}
            />
          </div>
          <BookingDetailSummary booking={data} />
        </div>
      </div>
      {cancelling ? <BookingCancelDialog booking={data} onClose={() => setCancelling(false)} /> : null}
    </div>
  )
}
