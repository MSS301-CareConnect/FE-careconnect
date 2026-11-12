import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorStatus, bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { bookingTypeKey, formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import { BookingHistoryList } from '~/entities/booking/booking-history-list'
import { BookingOccurrenceList } from '~/entities/booking/booking-occurrence-list'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import { useCaregiverNames, useCenterName } from '~/entities/provider/use-provider-names'
import { BookingSettlementCard } from '~/entities/wallet/booking-settlement-card'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { SectionCard } from '~/shared/ui/section-card'
import { bentoBackLink, bentoContainer } from '~/shared/ui/bento-page-header'
import { Icon } from '~/shared/ui/icon'

import { CancelBookingDialog, canAdminCancel } from './components/cancel-booking-dialog'

/** M-11: one booking as the platform sees it, with the admin's cancel-on-behalf action (full refund like a center cancel). */
export function AdminBookingDetailPage({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const [cancelling, setCancelling] = useState(false)
  const now = useClock(30_000)
  const booking = useQuery({ queryKey: bookingKeys.detail(id), queryFn: () => fetchBooking(id), retry: false })
  const centerName = useCenterName(booking.data?.centerId)
  const caregiverName = useCaregiverNames((booking.data?.occurrences ?? []).map((occurrence) => occurrence.caregiverId))
  useDocumentTitle(booking.data ? `#${booking.data.bookingCode}` : t('admin.bookingsPage.title'))
  if (booking.isPending)
    return (
      <p className='p-8 text-sm text-on-surface-variant' role='status'>
        {t('admin.bookingsPage.loading')}
      </p>
    )
  if (booking.isError)
    return (
      <div className='p-8' role='alert'>
        <h1 className='text-xl font-bold'>
          {bookingErrorStatus(booking.error) === 404 ? t('admin.bookingsPage.notFound') : t('admin.bookingsPage.error')}
        </h1>
        <Link className='mt-4 inline-block font-semibold text-primary underline' to='/admin/bookings'>
          {t('admin.bookingsPage.back')}
        </Link>
      </div>
    )

  const data = booking.data
  const language = i18n.language
  return (
    <div className={bentoContainer}>
      <Link className={bentoBackLink} to='/admin/bookings'>
        <Icon className='text-lg' name='arrow_back' />
        {t('admin.bookingsPage.back')}
      </Link>
      <header className='flex flex-wrap items-start justify-between gap-4 rounded-[1.75rem] border border-forest-900/[0.06] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6'>
        <div>
          <h1 className='text-[24px] leading-tight text-forest-950 sm:text-[30px]'>
            {data.recipientSnapshot?.fullName ?? t('admin.bookingsPage.noRecipient')} · #{data.bookingCode}
          </h1>
          <p className='mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
            <BookingStatusBadge status={data.status} />
            <span>{t(bookingTypeKey(data))}</span>
            <span className='tabular-nums'>{formatMoney(data.totalAmount, language)}</span>
          </p>
        </div>
        {canAdminCancel(data, now) ? (
          <button
            className='min-h-11 rounded-full border border-error/40 px-5 text-sm font-semibold text-error hover:bg-error-container/50'
            onClick={() => setCancelling(true)}
            type='button'
          >
            {t('admin.bookingsPage.cancel')}
          </button>
        ) : null}
      </header>
      <SectionCard icon='person' title={t('admin.bookingsPage.parties')}>
        <dl className='grid gap-2 text-sm sm:grid-cols-2'>
          <div>
            <dt className='text-xs text-on-surface-variant'>{t('admin.bookingsPage.customer')}</dt>
            <dd>
              {data.customer?.fullName ?? t('admin.bookingsPage.unknown')}
              {data.customer?.phoneNumber ? ` · ${data.customer.phoneNumber}` : ''}
            </dd>
          </div>
          <div>
            <dt className='text-xs text-on-surface-variant'>{t('admin.bookingsPage.center')}</dt>
            <dd>
              <Link className='font-semibold text-primary hover:underline' to={`/admin/centers/${data.centerId}`}>
                {centerName}
              </Link>
            </dd>
          </div>
          <div>
            <dt className='text-xs text-on-surface-variant'>{t('admin.bookingsPage.createdAt')}</dt>
            <dd>{formatDateTime(data.createdAt, language)}</dd>
          </div>
          {data.cancelReason ? (
            <div>
              <dt className='text-xs text-on-surface-variant'>{t('admin.bookingsPage.cancelReason')}</dt>
              <dd>{data.cancelReason}</dd>
            </div>
          ) : null}
        </dl>
      </SectionCard>
      <SectionCard icon='event' title={t('admin.bookingsPage.occurrences')}>
        <BookingOccurrenceList caregiverName={caregiverName} occurrences={data.occurrences ?? []} />
      </SectionCard>
      <BookingSettlementCard bookingId={id} />
      <SectionCard icon='history' title={t('admin.bookingsPage.history')}>
        <BookingHistoryList bookingId={id} collapsedCount={4} />
      </SectionCard>
      {cancelling ? (
        <CancelBookingDialog bookingCode={data.bookingCode} bookingId={id} onClose={() => setCancelling(false)} />
      ) : null}
    </div>
  )
}
