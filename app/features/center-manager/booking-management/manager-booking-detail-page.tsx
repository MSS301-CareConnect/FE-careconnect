import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import {
  acceptBookingRequest,
  assignBookingCaregiver,
  bookingErrorStatus,
  bookingKeys,
  cancelBookingRequest,
  fetchBooking,
  rejectBookingRequest
} from '~/entities/booking/booking-api'
import { bookingErrorKey, formatDateTime, isUpcomingOccurrence } from '~/entities/booking/booking-format'
import { BookingHistoryList } from '~/entities/booking/booking-history-list'
import { BookingOccurrenceList } from '~/entities/booking/booking-occurrence-list'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { BookingRecipientSnapshot } from '~/entities/booking/booking-recipient-snapshot'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

import { CaregiverAssignDialog } from './components/caregiver-assign-dialog'
import { ManagerBookingSummary } from './components/manager-booking-summary'
import { ManagerOccurrenceActions } from './components/manager-occurrence-actions'
import { useCenterCaregivers } from './hooks/use-center-caregivers'

type Dialog = 'accept' | 'reject' | 'cancel' | 'reassign' | null
// A PENDING booking is accepted or rejected; cancel and reassign apply once the center has accepted it.
const ACCEPTED: readonly BookingStatus[] = ['AWAITING_DEPOSIT', 'CONFIRMED', 'IN_PROGRESS']
const secondary =
  'inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-surface-container-low'

export function ManagerBookingDetailPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<Dialog>(null)
  const caregivers = useCenterCaregivers()
  const booking = useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetchBooking(id),
    enabled: Boolean(id),
    retry: false
  })
  useDocumentTitle(t('centerManager.bookingDetail.documentTitle', { code: booking.data?.bookingCode ?? '' }))

  function done(updated: BookingDetailRecord) {
    queryClient.setQueryData(bookingKeys.detail(id), updated)
    void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    setDialog(null)
  }
  const accept = useMutation({
    mutationFn: (caregiverId?: string) => acceptBookingRequest(id, caregiverId),
    onSuccess: done
  })
  const reject = useMutation({ mutationFn: (reason: string) => rejectBookingRequest(id, reason), onSuccess: done })
  const cancel = useMutation({ mutationFn: (reason: string) => cancelBookingRequest(id, { reason }), onSuccess: done })
  const reassign = useMutation({
    mutationFn: (caregiverId: string) => assignBookingCaregiver(id, caregiverId),
    onSuccess: done
  })

  if (booking.isPending)
    return (
      <p className='mx-auto max-w-7xl px-6 py-10 text-sm text-on-surface-variant' role='status'>
        {t('centerManager.bookingDetail.loading')}
      </p>
    )
  if (booking.isError)
    return (
      <div className='mx-auto max-w-7xl px-6 py-10' role='alert'>
        <h1 className='text-xl font-bold'>
          {bookingErrorStatus(booking.error) === 404
            ? t('centerManager.bookingDetail.notFound')
            : t('centerManager.bookingDetail.error')}
        </h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t(bookingErrorKey(booking.error))}</p>
        <Link className='mt-4 inline-block font-semibold text-primary underline' to='/center-manager/bookings'>
          {t('centerManager.bookingDetail.back')}
        </Link>
      </div>
    )

  const data = booking.data
  const hasUpcoming = (data.occurrences ?? []).some((occurrence) => isUpcomingOccurrence(occurrence))
  const caregiverName = data.caregiverId ? caregivers.nameOf(data.caregiverId) : undefined

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <nav
        aria-label={t('centerManager.bookingDetail.breadcrumb')}
        className='flex items-center gap-1.5 text-xs text-outline'
      >
        <Link className='hover:text-primary' to='/center-manager/bookings'>
          {t('centerManager.bookingManagement.title')}
        </Link>
        <Icon className='text-base' name='chevron_right' />
        <span className='font-semibold text-primary'>#{data.bookingCode}</span>
      </nav>

      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {data.recipientSnapshot?.fullName ?? `#${data.bookingCode}`}
          </h1>
          <p className='mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
            <span className='rounded-md bg-surface-container px-2 py-1 font-semibold text-on-surface'>
              #{data.bookingCode}
            </span>
            <BookingStatusBadge status={data.status} />
            <span>
              {data.caregiverId
                ? t('centerManager.bookingDetail.caregiver', {
                    name: caregiverName ?? t('booking.occurrences.assigned')
                  })
                : t('centerManager.bookingDetail.noCaregiver')}
            </span>
          </p>
          {data.status === 'PENDING' && data.acceptanceDueAt ? (
            <p className='mt-2 text-sm font-semibold text-amber-800'>
              {t('centerManager.bookingDetail.acceptBy', { time: formatDateTime(data.acceptanceDueAt, i18n.language) })}
            </p>
          ) : null}
        </div>
        <div className='flex flex-wrap gap-2'>
          {data.status === 'PENDING' ? (
            <>
              <button
                className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container'
                onClick={() => setDialog('accept')}
                type='button'
              >
                <Icon className='text-lg' name='check_circle' />
                {t('centerManager.bookingDetail.accept')}
              </button>
              <button className={`${secondary} text-error`} onClick={() => setDialog('reject')} type='button'>
                <Icon className='text-lg' name='block' />
                {t('centerManager.bookingDetail.reject')}
              </button>
            </>
          ) : null}
          {ACCEPTED.includes(data.status) && hasUpcoming ? (
            <button className={`${secondary} text-primary`} onClick={() => setDialog('reassign')} type='button'>
              <Icon className='text-lg' name='switch_account' />
              {t('centerManager.bookingDetail.reassignAll')}
            </button>
          ) : null}
          {ACCEPTED.includes(data.status) ? (
            <button className={`${secondary} text-error`} onClick={() => setDialog('cancel')} type='button'>
              <Icon className='text-lg' name='event_busy' />
              {t('centerManager.bookingDetail.cancel')}
            </button>
          ) : null}
        </div>
      </header>

      {data.rejectedReason || data.cancelReason ? (
        <p className='rounded-xl bg-white p-4 text-sm text-on-surface-variant shadow-sm'>
          {t('centerManager.bookingDetail.closedReason', { reason: data.rejectedReason ?? data.cancelReason })}
        </p>
      ) : null}

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='flex min-w-0 flex-col gap-6'>
          <SectionCard icon='event_note' title={t('centerManager.bookingDetail.occurrences')}>
            <BookingOccurrenceList
              caregiverName={caregivers.nameOf}
              occurrences={data.occurrences ?? []}
              renderActions={(occurrence) => (
                <ManagerOccurrenceActions bookingId={data.id} caregivers={caregivers} occurrence={occurrence} />
              )}
            />
          </SectionCard>
          {data.recipientSnapshot ? (
            <SectionCard icon='personal_injury' title={t('centerManager.bookingDetail.patient')}>
              <BookingRecipientSnapshot snapshot={data.recipientSnapshot} />
            </SectionCard>
          ) : null}
          <SectionCard icon='history' title={t('centerManager.bookingDetail.history')}>
            <BookingHistoryList bookingId={data.id} />
          </SectionCard>
        </div>
        <ManagerBookingSummary booking={data} />
      </div>

      {dialog === 'accept' ? (
        <CaregiverAssignDialog
          confirmLabel={t('centerManager.bookingDetail.accept')}
          currentId={data.caregiverId}
          description={
            data.caregiverId
              ? t('centerManager.bookingDetail.acceptKeepDescription', { name: caregiverName ?? '' })
              : t('centerManager.bookingDetail.acceptDescription')
          }
          error={accept.error ? t(bookingErrorKey(accept.error)) : undefined}
          loading={caregivers.caregivers.isPending}
          onClose={() => setDialog(null)}
          onConfirm={(caregiverId) => accept.mutate(caregiverId)}
          optional={Boolean(data.caregiverId)}
          options={caregivers.options}
          pending={accept.isPending}
          title={t('centerManager.bookingDetail.acceptTitle', { code: data.bookingCode })}
        />
      ) : null}
      {dialog === 'reassign' ? (
        <CaregiverAssignDialog
          confirmLabel={t('centerManager.bookingDetail.assign.confirm')}
          currentId={data.caregiverId}
          description={t('centerManager.bookingDetail.assign.allDescription')}
          error={reassign.error ? t(bookingErrorKey(reassign.error)) : undefined}
          loading={caregivers.caregivers.isPending}
          onClose={() => setDialog(null)}
          onConfirm={(caregiverId) => caregiverId && reassign.mutate(caregiverId)}
          options={caregivers.options}
          pending={reassign.isPending}
          title={t('centerManager.bookingDetail.reassignAll')}
        />
      ) : null}
      {dialog === 'reject' ? (
        <BookingReasonDialog
          confirmLabel={t('centerManager.bookingDetail.reject')}
          danger
          description={t('centerManager.bookingDetail.rejectHint')}
          error={reject.error ? t(bookingErrorKey(reject.error)) : undefined}
          label={t('centerManager.bookingDetail.reason')}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => reject.mutate(reason)}
          pending={reject.isPending}
          title={t('centerManager.bookingDetail.rejectTitle', { code: data.bookingCode })}
        />
      ) : null}
      {dialog === 'cancel' ? (
        <BookingReasonDialog
          confirmLabel={t('centerManager.bookingDetail.cancel')}
          danger
          description={t('centerManager.bookingDetail.cancelHint')}
          error={cancel.error ? t(bookingErrorKey(cancel.error)) : undefined}
          label={t('centerManager.bookingDetail.reason')}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => cancel.mutate(reason)}
          pending={cancel.isPending}
          title={t('centerManager.bookingDetail.cancelTitle', { code: data.bookingCode })}
        />
      ) : null}
    </div>
  )
}
