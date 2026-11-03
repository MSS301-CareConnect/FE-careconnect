import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorStatus, bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { bookingErrorKey, bookingTypeKey } from '~/entities/booking/booking-format'
import { BookingHistoryList } from '~/entities/booking/booking-history-list'
import { BookingOccurrenceList } from '~/entities/booking/booking-occurrence-list'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import type { OccurrenceStatus } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ActionMenu } from '~/shared/ui/action-menu'
import { CopyButton } from '~/shared/ui/copy-button'
import { Icon } from '~/shared/ui/icon'
import { PageHeader, pageContainer } from '~/shared/ui/page-header'
import { SectionCard } from '~/shared/ui/section-card'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { CANCELLABLE } from './booking-lifecycle'
import { BookingAftercare } from './components/booking-aftercare'
import { BookingCancelDialog } from './components/booking-cancel-dialog'
import { BookingDetailSummary } from './components/booking-detail-summary'
import { BookingLifecycleStepper } from './components/booking-lifecycle-stepper'
import { BookingStatusPanel } from './components/booking-status-panel'

const key = 'customer.bookingDetail' as const
// Visits that have taken place: reports and complaints apply only after one of these.
const VISITED: ReadonlySet<OccurrenceStatus> = new Set(['IN_PROGRESS', 'COMPLETED', 'CAREGIVER_MISSED'])

function DetailSkeleton({ label }: { label: string }) {
  return (
    <SkeletonGroup className={`${pageContainer} pt-8 pb-16`} label={label}>
      <Skeleton className='h-4 w-48 rounded' />
      <Skeleton className='mt-4 h-9 w-72 rounded-lg' />
      <Skeleton className='mt-3 h-5 w-56 rounded' />
      <Skeleton className='mt-6 h-20 w-full rounded-2xl' />
      <div className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <Skeleton className='h-80 w-full rounded-2xl' />
        <Skeleton className='h-80 w-full rounded-2xl' />
      </div>
    </SkeletonGroup>
  )
}

export function CustomerBookingDetailPage({ id }: { id: string }) {
  const { t } = useTranslation()
  const [cancelling, setCancelling] = useState(false)
  const booking = useQuery({ queryKey: bookingKeys.detail(id), queryFn: () => fetchBooking(id), retry: false })
  useDocumentTitle(t(`${key}.documentTitle`, { code: booking.data?.bookingCode ?? '' }))

  if (booking.isPending) return <DetailSkeleton label={t(`${key}.loading`)} />

  if (booking.isError) {
    const missing = bookingErrorStatus(booking.error) === 404
    return (
      <div
        className={`${pageContainer} flex min-h-[60vh] flex-col items-center justify-center text-center`}
        role='alert'
      >
        <span className='grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-primary'>
          <Icon className='text-3xl' name='event_busy' />
        </span>
        <h1 className='mt-4 text-2xl font-bold'>{missing ? t(`${key}.notFound.title`) : t(`${key}.error`)}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>
          {missing ? t(`${key}.notFound.description`) : t(bookingErrorKey(booking.error))}
        </p>
        <Link
          className='mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-container'
          to='/customer/bookings'
        >
          {t(`${key}.back`)}
        </Link>
      </div>
    )
  }

  const data = booking.data
  const occurrences = data.occurrences ?? []
  return (
    <div className={`${pageContainer} pb-16`}>
      <PageHeader
        actions={
          CANCELLABLE.has(data.status) ? (
            <ActionMenu
              items={[
                {
                  id: 'cancel',
                  label: t(`${key}.cancel.open`),
                  icon: 'event_busy',
                  tone: 'danger',
                  onSelect: () => setCancelling(true)
                }
              ]}
              label={t(`${key}.moreActions`)}
            />
          ) : undefined
        }
        breadcrumb={[
          { label: t('customer.nav.home'), to: '/customer' },
          { label: t('customer.nav.myBookings'), to: '/customer/bookings' },
          { label: data.bookingCode }
        ]}
        breadcrumbLabel={t(`${key}.breadcrumb`)}
        meta={
          <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
            <BookingStatusBadge status={data.status} />
            <span className='sr-only'>{t(`${key}.code`)}</span>
            <span className='font-mono text-[13px] text-on-surface tabular-nums'>{data.bookingCode}</span>
            <CopyButton className='-my-2 -ml-1.5 text-xs' compact value={data.bookingCode} />
            <span>
              <span aria-hidden='true'>· </span>
              {t(bookingTypeKey(data))}
            </span>
          </span>
        }
        title={data.recipientSnapshot?.fullName ?? t(`${key}.title`)}
      />

      <BookingLifecycleStepper booking={data} />

      <div className='mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='flex flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1'>
          <BookingStatusPanel booking={data} />
          <BookingDetailSummary booking={data} />
        </div>
        <div className='flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1'>
          <SectionCard
            icon='event_note'
            title={`${t(`${key}.occurrences`)}${occurrences.length ? ` (${occurrences.length})` : ''}`}
          >
            <BookingOccurrenceList occurrences={occurrences} />
          </SectionCard>
          <BookingAftercare
            bookingId={data.id}
            completed={data.status === 'COMPLETED'}
            visited={occurrences.some((visit) => VISITED.has(visit.status))}
          />
          <SectionCard icon='history' title={t(`${key}.history`)}>
            <BookingHistoryList bookingId={data.id} />
          </SectionCard>
        </div>
      </div>
      {cancelling ? <BookingCancelDialog booking={data} onClose={() => setCancelling(false)} /> : null}
    </div>
  )
}
