import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorStatus, bookingKeys, cancelBookingRequest, fetchBooking } from '~/entities/booking/booking-api'
import { bookingErrorKey, formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import { BookingHistoryList } from '~/entities/booking/booking-history-list'
import { BookingOccurrenceList } from '~/entities/booking/booking-occurrence-list'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import { useCaregiverNames, useCenterName } from '~/entities/provider/use-provider-names'
import type { BookingStatus } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { SectionCard } from '~/shared/ui/section-card'

// Statuses that still hold a schedule; BookingService rejects a cancel outside them.
const CANCELLABLE: ReadonlySet<BookingStatus> = new Set(['PENDING', 'AWAITING_DEPOSIT', 'CONFIRMED', 'IN_PROGRESS'])

/** M-11: one booking as the platform sees it, with the admin's cancel-on-behalf action (full refund like a center cancel). */
export function AdminBookingDetailPage({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [cancelling, setCancelling] = useState(false)
  const booking = useQuery({ queryKey: bookingKeys.detail(id), queryFn: () => fetchBooking(id), retry: false })
  const centerName = useCenterName(booking.data?.centerId)
  const caregiverName = useCaregiverNames((booking.data?.occurrences ?? []).map((occurrence) => occurrence.caregiverId))
  useDocumentTitle(booking.data ? `#${booking.data.bookingCode}` : t('admin.bookingsPage.title'))
  const cancel = useMutation({
    mutationFn: (reason: string) => cancelBookingRequest(id, { reason }),
    onSuccess: async () => {
      setCancelling(false)
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    }
  })

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
    <div className='flex flex-col gap-5 p-5 lg:p-8'>
      <Link className='text-sm font-semibold text-primary' to='/admin/bookings'>
        {t('admin.bookingsPage.back')}
      </Link>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>
            {data.recipientSnapshot?.fullName ?? t('admin.bookingsPage.noRecipient')} · #{data.bookingCode}
          </h1>
          <p className='mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
            <BookingStatusBadge status={data.status} />
            <span>{t(`booking.scheduleType.${data.scheduleType}`)}</span>
            <span className='tabular-nums'>{formatMoney(data.totalAmount, language)}</span>
          </p>
        </div>
        {CANCELLABLE.has(data.status) ? (
          <button
            className='rounded-lg border border-error px-4 py-2.5 text-sm font-semibold text-error'
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
      <SectionCard icon='history' title={t('admin.bookingsPage.history')}>
        <BookingHistoryList bookingId={id} />
      </SectionCard>
      {cancelling ? (
        <BookingReasonDialog
          confirmLabel={t('admin.bookingsPage.cancel')}
          danger
          description={t('admin.bookingsPage.cancelHint')}
          error={cancel.error ? t(bookingErrorKey(cancel.error)) : undefined}
          label={t('admin.bookingsPage.reason')}
          onClose={() => setCancelling(false)}
          onConfirm={(reason) => cancel.mutate(reason)}
          pending={cancel.isPending}
          title={t('admin.bookingsPage.cancelTitle')}
        />
      ) : null}
    </div>
  )
}
