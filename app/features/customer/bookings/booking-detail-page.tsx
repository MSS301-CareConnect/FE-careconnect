import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorStatus, bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { EXPIRING_STATUSES } from '~/entities/booking/booking-deadline'
import { bookingErrorKey, bookingTypeKey, isUpcomingOccurrence } from '~/entities/booking/booking-format'
import { BookingHistoryList } from '~/entities/booking/booking-history-list'
import { matchOccurrenceService } from '~/entities/booking/booking-occurrence-list'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import { BookingVisitSchedule } from '~/entities/booking/booking-visit-schedule'
import { ServiceAddressDialog, canChangeServiceAddress } from '~/entities/booking/service-address-dialog'
import { fetchPublicCaregiver, providerKeys } from '~/entities/provider/provider-api'
import type { BookingOccurrenceRecord, OccurrenceStatus } from '~/shared/api/generated/contracts'
import { calendarDayOf } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ActionMenu } from '~/shared/ui/action-menu'
import { CopyButton } from '~/shared/ui/copy-button'
import { Icon } from '~/shared/ui/icon'
import { pageContainer } from '~/shared/ui/page-header'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'
import { SectionCard } from '~/shared/ui/section-card'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { CANCELLABLE } from './booking-lifecycle'
import { BookingAftercare } from './components/booking-aftercare'
import { BookingCancelDialog } from './components/booking-cancel-dialog'
import { BookingDetailSummary } from './components/booking-detail-summary'
import { BookingLifecycleStepper } from './components/booking-lifecycle-stepper'
import { BookingOccurrenceDetailDialog } from './components/booking-occurrence-detail-dialog'
import { BookingCenterCard } from './components/booking-center-card'
import { BookingOverviewCard } from './components/booking-overview-card'
import { BookingStatusPanel } from './components/booking-status-panel'
import { CaregiverChangeDialog } from './components/caregiver-change-dialog'
import { OccurrenceRescheduleDialog } from './components/occurrence-reschedule-dialog'

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
      <div className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]'>
        <div className='flex flex-col gap-6'>
          <Skeleton className='h-40 w-full rounded-2xl' />
          <Skeleton className='h-72 w-full rounded-2xl' />
        </div>
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-44 w-full rounded-2xl' />
          <Skeleton className='h-72 w-full rounded-2xl' />
        </div>
      </div>
    </SkeletonGroup>
  )
}

export function CustomerBookingDetailPage({ id }: { id: string }) {
  const { t } = useTranslation()
  const [cancelling, setCancelling] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [selectedOccurrence, setSelectedOccurrence] = useState<BookingOccurrenceRecord | null>(null)
  const [requestingCaregiverChange, setRequestingCaregiverChange] = useState(false)
  const [reschedulingOccurrence, setReschedulingOccurrence] = useState<BookingOccurrenceRecord | null>(null)
  // "Now" is fixed when the page opens: render must stay pure (react-hooks/purity).
  const [now] = useState(() => Date.now())
  const booking = useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetchBooking(id),
    // A waiting booking can be answered or expire at any time: refresh while its deadline runs.
    refetchInterval: (query) => (query.state.data && EXPIRING_STATUSES.has(query.state.data.status) ? 30_000 : false),
    retry: false
  })

  const caregiverId = booking.data?.caregiverId
  const caregiverProfile = useQuery({
    queryKey: providerKeys.publicCaregiver(caregiverId ?? ''),
    queryFn: () => fetchPublicCaregiver(caregiverId ?? ''),
    enabled: Boolean(caregiverId),
    retry: false,
    staleTime: 5 * 60_000
  })

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
          className='mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-container'
          to='/customer/bookings'
        >
          {t(`${key}.back`)}
        </Link>
      </div>
    )
  }

  const data = booking.data
  const occurrences = data.occurrences ?? []
  const hasUpcoming = occurrences.some((occurrence) => isUpcomingOccurrence(occurrence))
  const menuItems = [
    ...(canChangeServiceAddress(data, now)
      ? [
          {
            id: 'address',
            label: t('booking.address.action'),
            icon: 'home_pin',
            onSelect: () => setEditingAddress(true)
          }
        ]
      : []),
    ...((data.status === 'CONFIRMED' || data.status === 'IN_PROGRESS') && hasUpcoming
      ? [
          {
            id: 'change-caregiver',
            label: t('customer.caregiverChange.open'),
            icon: 'sync_alt',
            onSelect: () => setRequestingCaregiverChange(true)
          }
        ]
      : []),
    ...(CANCELLABLE.has(data.status)
      ? [
          {
            id: 'cancel',
            label: t(`${key}.cancel.open`),
            icon: 'event_busy',
            tone: 'danger' as const,
            onSelect: () => setCancelling(true)
          }
        ]
      : [])
  ]

  const resolveCaregiverName = (occCaregiverId: string) => {
    if (occCaregiverId === caregiverId && caregiverProfile.data?.fullName) {
      return caregiverProfile.data.fullName
    }
    return undefined
  }

  const selectedService = selectedOccurrence ? matchOccurrenceService(selectedOccurrence, data.services) : undefined

  return (
    <div className={`${pageContainer} pb-16`}>
      <CustomerPageHeader
        actions={menuItems.length > 0 ? <ActionMenu items={menuItems} label={t(`${key}.moreActions`)} /> : undefined}
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

      <div className='mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]'>
        {/* Right column: Action & Status Panel, Caregiver, Payment Summary */}
        <div className='flex flex-col gap-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1'>
          <BookingStatusPanel booking={data} />
          <BookingDetailSummary booking={data} />
        </div>

        {/* Left column: Overview, Occurrences, Aftercare, History */}
        <div className='flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1'>
          <BookingOverviewCard
            booking={data}
            now={now}
            onEditAddress={canChangeServiceAddress(data, now) ? () => setEditingAddress(true) : undefined}
          />
          <BookingCenterCard centerId={data.centerId} />
          <SectionCard
            icon='event_note'
            title={`${t(`${key}.occurrences`)}${occurrences.length ? ` (${occurrences.length})` : ''}`}
          >
            <BookingVisitSchedule
              caregiverName={resolveCaregiverName}
              occurrences={occurrences}
              onSelect={(occ) => setSelectedOccurrence(occ)}
              services={data.services}
              today={calendarDayOf(new Date(now))}
            />
          </SectionCard>
          <BookingAftercare
            bookingId={data.id}
            completed={data.status === 'COMPLETED'}
            visited={occurrences.some((visit) => VISITED.has(visit.status))}
          />
          <SectionCard icon='history' title={t(`${key}.history`)}>
            <BookingHistoryList bookingId={data.id} collapsedCount={4} />
          </SectionCard>
        </div>
      </div>

      {selectedOccurrence ? (
        <BookingOccurrenceDetailDialog
          booking={data}
          caregiverName={
            selectedOccurrence.caregiverId ? resolveCaregiverName(selectedOccurrence.caregiverId) : undefined
          }
          caregiverProfile={caregiverProfile.data}
          occurrence={selectedOccurrence}
          onClose={() => setSelectedOccurrence(null)}
          onReschedule={(occ) => {
            setSelectedOccurrence(null)
            setReschedulingOccurrence(occ)
          }}
          service={selectedService}
        />
      ) : null}

      {requestingCaregiverChange ? (
        <CaregiverChangeDialog booking={data} onClose={() => setRequestingCaregiverChange(false)} />
      ) : null}

      {reschedulingOccurrence ? (
        <OccurrenceRescheduleDialog
          booking={data}
          occurrence={reschedulingOccurrence}
          onClose={() => setReschedulingOccurrence(null)}
        />
      ) : null}

      {cancelling ? <BookingCancelDialog booking={data} onClose={() => setCancelling(false)} /> : null}
      {editingAddress ? (
        <ServiceAddressDialog booking={data} onClose={() => setEditingAddress(false)} open={editingAddress} />
      ) : null}
    </div>
  )
}
