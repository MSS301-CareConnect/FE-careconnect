import { useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchBookings } from '~/entities/booking/booking-api'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import { careCatalogKeys, fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { SERVICE_CATEGORY_ICONS, serviceCategoryGroup } from '~/entities/care-catalog/service-category'
import { useSelectedCenter } from '~/entities/care-center/selected-center'
import { fetchCaregiverCatalog, providerKeys } from '~/entities/provider/provider-api'
import type { BookingStatus, BookingSummaryRecord, ListBookingsParams } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { Rating } from '~/shared/ui/rating'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { planPrice } from '~/entities/care-catalog/price-plan-price'

const key = 'customer.home' as const
const RECENT: ListBookingsParams = { page: 0, size: 20 }
const AWAITING_PAYMENT: ListBookingsParams = { status: 'AWAITING_INITIAL_PAYMENT', page: 0, size: 1 }
const FINISHED: ReadonlySet<BookingStatus> = new Set(['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'])
const FEATURED = 3

const sectionTitle = 'text-lg font-semibold text-on-surface'
const seeAll =
  'inline-flex items-center gap-1 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'

/** The booking that matters next: the soonest future visit, otherwise the newest booking still in progress. */
function nextBooking(items: BookingSummaryRecord[], now: number) {
  const open = items.filter((item) => !FINISHED.has(item.status))
  const withVisit = open
    .filter((item) => item.nextOccurrenceAt && Date.parse(item.nextOccurrenceAt) >= now)
    .sort((a, b) => Date.parse(a.nextOccurrenceAt!) - Date.parse(b.nextOccurrenceAt!))
  return withVisit[0] ?? open[0]
}

/** What a signed-in customer needs first: the next visit, shortcuts and what their center offers. */
export function CustomerDashboard() {
  return (
    <div className='flex flex-col gap-12'>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'>
        <UpcomingBooking />
        <Shortcuts />
      </div>
      <FeaturedServices />
      <FeaturedCaregivers />
    </div>
  )
}

function UpcomingBooking() {
  const { t } = useTranslation()
  const format = useFormat()
  const [now] = useState(() => Date.now())
  const bookings = useQuery({
    queryKey: bookingKeys.list(RECENT),
    queryFn: () => fetchBookings(RECENT),
    retry: false
  })
  const booking = bookings.data ? nextBooking(bookings.data.items ?? [], now) : undefined

  return (
    <section aria-labelledby='home-upcoming' className='flex flex-col gap-3'>
      <div className='flex items-baseline justify-between gap-3'>
        <h2 className={sectionTitle} id='home-upcoming'>
          {t(`${key}.upcoming.title`)}
        </h2>
        <Link className={seeAll} to='/customer/bookings'>
          {t(`${key}.upcoming.all`)}
          <Icon className='text-base' name='arrow_forward' />
        </Link>
      </div>
      {bookings.isPending ? (
        <SkeletonGroup
          className='space-y-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5'
          label={t(`${key}.upcoming.loading`)}
        >
          <Skeleton className='h-5 w-1/2 rounded' />
          <Skeleton className='h-8 w-2/3 rounded' />
          <Skeleton className='h-4 w-1/3 rounded' />
        </SkeletonGroup>
      ) : bookings.isError ? (
        <p className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 text-sm text-on-surface-variant'>
          {t(`${key}.upcoming.error`)}
        </p>
      ) : booking ? (
        <article className='cc-fade-up flex flex-1 flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='font-semibold text-on-surface'>{booking.recipientName}</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className='mt-0.5 text-xs text-on-surface-variant'>
            {t(`${key}.upcoming.code`, { code: booking.bookingCode })}
          </p>
          <div className='mt-4 flex items-start gap-3 rounded-xl bg-brand-50 p-4'>
            <Icon className='text-2xl text-primary' name='event_upcoming' />
            <div>
              <p className='text-xs font-medium text-on-surface-variant'>{t(`${key}.upcoming.nextVisit`)}</p>
              <p className='text-lg font-semibold text-on-surface tabular-nums'>
                {booking.nextOccurrenceAt ? format.dateTime(booking.nextOccurrenceAt) : null}
              </p>
              {!booking.nextOccurrenceAt ? (
                <p className='text-sm text-on-surface-variant'>{t(`${key}.upcoming.noVisitYet`)}</p>
              ) : null}
            </div>
          </div>
          <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
            <span className='text-sm text-on-surface-variant tabular-nums'>
              {booking.totalCount
                ? t(`${key}.upcoming.progress`, { done: booking.completedCount ?? 0, total: booking.totalCount })
                : null}
            </span>
            {booking.status === 'AWAITING_INITIAL_PAYMENT' ? (
              <Link
                className='inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                to={`/customer/bookings/${booking.id}/deposit`}
              >
                <Icon className='text-lg' name='payments' />
                {t(`${key}.upcoming.payDeposit`)}
              </Link>
            ) : (
              <Link
                className='inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                to={`/customer/bookings/${booking.id}`}
              >
                {t(`${key}.upcoming.view`)}
              </Link>
            )}
          </div>
        </article>
      ) : (
        <div className='flex flex-1 flex-col items-start justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-6'>
          <span aria-hidden='true' className='grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-primary'>
            <Icon name='event_available' />
          </span>
          <div>
            <p className='font-semibold text-on-surface'>{t(`${key}.upcoming.emptyTitle`)}</p>
            <p className='mt-0.5 text-sm text-on-surface-variant'>{t(`${key}.upcoming.empty`)}</p>
          </div>
          <Link
            className='inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to='/customer/booking'
          >
            <Icon className='text-lg' name='add' />
            {t(`${key}.book`)}
          </Link>
        </div>
      )}
    </section>
  )
}

function Shortcuts() {
  const { t } = useTranslation()
  const awaiting = useQuery({
    queryKey: bookingKeys.list(AWAITING_PAYMENT),
    queryFn: () => fetchBookings(AWAITING_PAYMENT),
    retry: false,
    staleTime: 60_000
  })
  const due = awaiting.data?.totalElements ?? 0
  const items = [
    { to: '/customer/booking', icon: 'event_available', id: 'book' as const },
    { to: '/customer/patient-profiles', icon: 'family_restroom', id: 'relatives' as const },
    { to: '/customer/payments', icon: 'payments', id: 'payments' as const }
  ]

  return (
    <section aria-labelledby='home-shortcuts' className='flex flex-col gap-3'>
      <h2 className={sectionTitle} id='home-shortcuts'>
        {t(`${key}.shortcuts.title`)}
      </h2>
      <ul className='flex flex-col gap-3'>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              className='cc-lift flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 hover:border-brand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              to={item.to}
            >
              <span
                aria-hidden='true'
                className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary'
              >
                <Icon name={item.icon} />
              </span>
              <span className='min-w-0 flex-1'>
                <span className='block font-semibold text-on-surface'>{t(`${key}.shortcuts.${item.id}.title`)}</span>
                <span className='block text-sm text-on-surface-variant'>
                  {item.id === 'payments' && due > 0
                    ? t(`${key}.shortcuts.payments.due`, { count: due })
                    : t(`${key}.shortcuts.${item.id}.description`)}
                </span>
              </span>
              {item.id === 'payments' && due > 0 ? (
                <span className='grid h-6 min-w-6 place-items-center rounded-full bg-warning px-1.5 text-xs font-semibold text-white tabular-nums'>
                  {due}
                </span>
              ) : (
                <Icon className='text-xl text-outline' name='chevron_right' />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FeaturedServices() {
  const { t } = useTranslation()
  const format = useFormat()
  const { center } = useSelectedCenter()
  const offerings = useQuery({
    queryKey: careCatalogKeys.centerOfferings(center?.id ?? ''),
    queryFn: () => fetchCenterOfferings(center!.id),
    enabled: Boolean(center),
    retry: false,
    select: (items) =>
      items.filter((item) => item.status === 'ACTIVE' && item.catalogItem.status === 'ACTIVE').slice(0, FEATURED)
  })
  const plans = useQueries({
    queries: (offerings.data ?? []).map((offering) => ({
      queryKey: careCatalogKeys.pricePlans(offering.id),
      queryFn: () => fetchPricePlans(offering.id),
      retry: false
    }))
  })
  if (!center || offerings.isError || (offerings.isSuccess && offerings.data.length === 0)) return null

  return (
    <section aria-labelledby='home-services' className='flex flex-col gap-4'>
      <div className='flex items-baseline justify-between gap-3'>
        <h2 className={sectionTitle} id='home-services'>
          {t(`${key}.featuredServices.title`)}
        </h2>
        <Link className={seeAll} to='/customer/services'>
          {t(`${key}.featuredServices.all`)}
          <Icon className='text-base' name='arrow_forward' />
        </Link>
      </div>
      <div className='cc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {offerings.isPending
          ? [0, 1, 2].map((index) => <Skeleton className='h-36 rounded-2xl' key={index} />)
          : offerings.data.map((offering, index) => {
              const group = serviceCategoryGroup(offering.catalogItem.category)
              const cheapest = [...(plans[index]?.data ?? [])]
                .filter((plan) => plan.isActive !== false)
                .sort((a, b) => planPrice(a).finalPrice - planPrice(b).finalPrice)[0]
              return (
                <Link
                  className='cc-lift flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 hover:border-brand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  key={offering.id}
                  to={`/customer/services/${offering.id}`}
                >
                  <span className='flex items-center gap-2 text-sm text-on-surface-variant'>
                    <Icon className='text-xl text-primary' name={SERVICE_CATEGORY_ICONS[group]} />
                    {t(`common.serviceCategories.${group}`)}
                  </span>
                  <span className='mt-3 font-semibold text-on-surface'>{offering.catalogItem.name}</span>
                  <span className='mt-auto pt-3 text-sm font-medium text-on-surface tabular-nums'>
                    {cheapest
                      ? t(`${key}.featuredServices.from`, {
                          price: format.money(planPrice(cheapest).finalPrice),
                          unit: t(`${key}.priceUnit.${cheapest.pricingUnit}`)
                        })
                      : null}
                  </span>
                </Link>
              )
            })}
      </div>
    </section>
  )
}

function FeaturedCaregivers() {
  const { t } = useTranslation()
  const { center } = useSelectedCenter()
  const caregivers = useQuery({
    queryKey: [...providerKeys.catalog, 'featured', center?.id ?? ''],
    queryFn: () => fetchCaregiverCatalog({ page: 0, size: 12, centerId: center?.id }),
    retry: false,
    select: (page) => [...page.items].sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0)).slice(0, FEATURED)
  })
  if (caregivers.isError || (caregivers.isSuccess && caregivers.data.length === 0)) return null

  return (
    <section aria-labelledby='home-caregivers' className='flex flex-col gap-4'>
      <div className='flex items-baseline justify-between gap-3'>
        <h2 className={sectionTitle} id='home-caregivers'>
          {t(`${key}.featuredCaregivers.title`)}
        </h2>
        <Link className={seeAll} to='/customer/caregivers'>
          {t(`${key}.featuredCaregivers.all`)}
          <Icon className='text-base' name='arrow_forward' />
        </Link>
      </div>
      <div className='cc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {caregivers.isPending
          ? [0, 1, 2].map((index) => <Skeleton className='h-24 rounded-2xl' key={index} />)
          : caregivers.data.map((person) => (
              <Link
                className='cc-lift flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 hover:border-brand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                key={person.caregiverId}
                to={`/customer/caregivers/${person.caregiverId}`}
              >
                <Avatar
                  className='h-14 w-14 rounded-full text-base'
                  decorative
                  name={person.fullName}
                  src={person.avatarUrl}
                />
                <span className='min-w-0'>
                  <span className='block truncate font-semibold text-on-surface'>{person.fullName}</span>
                  <span className='mt-1 block'>
                    <Rating average={person.ratingAverage} count={person.ratingCount} />
                  </span>
                </span>
              </Link>
            ))}
      </div>
    </section>
  )
}
