import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import {
  approveCaregiverChangeRequest,
  assignBookingCaregiver,
  bookingErrorStatus,
  bookingKeys,
  cancelBookingRequest,
  fetchBooking,
  fetchBookingCaregiverChangeRequests,
  rejectCaregiverChangeRequest,
  type CaregiverChangeRequestRecord
} from '~/entities/booking/booking-api'
import { EXPIRING_STATUSES, isPastDeadline } from '~/entities/booking/booking-deadline'
import { BookingDeadlineChip } from '~/entities/booking/booking-deadline-chip'
import { bookingErrorKey, formatDateTime, isUpcomingOccurrence } from '~/entities/booking/booking-format'
import { BookingHistoryList } from '~/entities/booking/booking-history-list'
import { BookingOccurrenceList } from '~/entities/booking/booking-occurrence-list'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { BookingRecipientSnapshot } from '~/entities/booking/booking-recipient-snapshot'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import { ServiceAddressDialog, canChangeServiceAddress } from '~/entities/booking/service-address-dialog'
import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

import { CaregiverAssignDialog } from './components/caregiver-assign-dialog'
import { ManagerBookingActionDialog } from './components/manager-booking-action-dialog'
import { ManagerBookingSummary } from './components/manager-booking-summary'
import { ManagerOccurrenceActions } from './components/manager-occurrence-actions'
import { useCenterCaregivers } from './hooks/use-center-caregivers'
import { useFreeCaregivers } from './hooks/use-free-caregivers'

type Dialog = 'accept' | 'reject' | 'cancel' | 'reassign' | 'assign' | 'address' | null
// Spec §5.2: the center confirms or rejects a new booking, assigns a caregiver to a confirmed RECURRING / CUSTOM booking
// that has none (or rejects it), and cancels or reassigns once a caregiver holds the visits.
const ACCEPTED: readonly BookingStatus[] = ['AWAITING_INITIAL_PAYMENT', 'CONFIRMED', 'IN_PROGRESS']
const secondary =
  'inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-surface-container-low'

export function ManagerBookingDetailPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<Dialog>(null)
  // "Now" is fixed when the page opens: render must stay pure (react-hooks/purity).
  const [openedAt] = useState(() => Date.now())
  const now = useClock(30_000)
  const caregivers = useCenterCaregivers()
  const booking = useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetchBooking(id),
    enabled: Boolean(id),
    // A waiting booking can expire on its own: refresh while its deadline runs.
    refetchInterval: (query) => (query.state.data && EXPIRING_STATUSES.has(query.state.data.status) ? 30_000 : false),
    retry: false
  })
  useDocumentTitle(t('centerManager.bookingDetail.documentTitle', { code: booking.data?.bookingCode ?? '' }))
  const free = useFreeCaregivers(booking.data, dialog === 'reassign')

  const [approvingRequest, setApprovingRequest] = useState<CaregiverChangeRequestRecord | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<CaregiverChangeRequestRecord | null>(null)

  const changeRequests = useQuery({
    queryKey: ['caregiver-change-requests', id],
    queryFn: () => fetchBookingCaregiverChangeRequests(id),
    enabled: Boolean(id)
  })

  const approveChange = useMutation({
    mutationFn: ({ requestId, newCaregiverId }: { requestId: string; newCaregiverId: string }) =>
      approveCaregiverChangeRequest(requestId, { newCaregiverId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: ['caregiver-change-requests', id] })
      setApprovingRequest(null)
    }
  })

  const rejectChange = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      rejectCaregiverChangeRequest(requestId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['caregiver-change-requests', id] })
      setRejectingRequest(null)
    }
  })

  function done(updated: BookingDetailRecord) {
    queryClient.setQueryData(bookingKeys.detail(id), updated)
    void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    setDialog(null)
  }
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
  const past = isPastDeadline(data, now)

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {data.recipientSnapshot?.fullName ?? `#${data.bookingCode}`}
          </h1>
          <p className='mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
            <span className='rounded-md bg-surface-container px-2 py-1 font-semibold text-on-surface tabular-nums'>
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
          {data.deadlineAt && data.deadlineType && EXPIRING_STATUSES.has(data.status) ? (
            <div className='mt-3 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant tabular-nums'>
              <BookingDeadlineChip
                dueAt={data.deadlineAt}
                now={now}
                prefix={t(`booking.deadline.types.${data.deadlineType}`)}
              />
              <span>
                {data.status === 'PENDING_CAREGIVER_CONFIRMATION'
                  ? t('centerManager.bookingDetail.caregiverAnswersBy', {
                      time: formatDateTime(data.deadlineAt, i18n.language)
                    })
                  : data.status === 'PENDING_CAREGIVER_ASSIGNMENT'
                    ? t('centerManager.bookingDetail.assignBy', {
                        time: formatDateTime(data.deadlineAt, i18n.language)
                      })
                    : data.status === 'PENDING_CENTER_CONFIRMATION'
                      ? t('centerManager.bookingDetail.acceptBy', {
                          time: formatDateTime(data.deadlineAt, i18n.language)
                        })
                      : formatDateTime(data.deadlineAt, i18n.language)}
              </span>
            </div>
          ) : null}
          {past ? (
            <p
              className='mt-2 flex max-w-xl items-start gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant'
              role='status'
            >
              <Icon className='text-base' name='timer_off' />
              {t('booking.deadline.pastHint')}
            </p>
          ) : null}
          {data.status === 'EXPIRED' && data.expiredReason ? (
            <p className='mt-2 inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface-variant'>
              <Icon className='text-base' name='timer_off' />
              {t(`booking.expiredReason.${data.expiredReason}`)}
            </p>
          ) : null}
        </div>
        <div className='flex flex-wrap gap-2'>
          {data.status === 'PENDING_CAREGIVER_ASSIGNMENT' && !past ? (
            <>
              <button
                className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container'
                onClick={() => setDialog('assign')}
                type='button'
              >
                <Icon className='text-lg' name='person_add' />
                {t('centerManager.bookingDetail.assignCaregiver')}
              </button>
              <button className={`${secondary} text-error`} onClick={() => setDialog('reject')} type='button'>
                <Icon className='text-lg' name='block' />
                {t('centerManager.bookingDetail.reject')}
              </button>
            </>
          ) : null}
          {data.status === 'PENDING_CAREGIVER_CONFIRMATION' && !past ? (
            <button className={`${secondary} text-error`} onClick={() => setDialog('reject')} type='button'>
              <Icon className='text-lg' name='block' />
              {t('centerManager.bookingDetail.reject')}
            </button>
          ) : null}
          {canChangeServiceAddress(data, openedAt, false) && !past ? (
            <button className={`${secondary} text-primary`} onClick={() => setDialog('address')} type='button'>
              <Icon className='text-lg' name='home_pin' />
              {t('booking.address.action')}
            </button>
          ) : null}
          {data.status === 'PENDING_CENTER_CONFIRMATION' && !past ? (
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

      {changeRequests.data?.filter((r) => r.status === 'PENDING').map((req) => (
        <div key={req.id} className='rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-xs'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2 font-bold text-primary'>
              <Icon className='text-xl' name='sync_alt' />
              <span>Khách hàng yêu cầu đổi người chăm sóc</span>
            </div>
            <span className='rounded-md bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-semibold'>
              Chờ quản lý xử lý
            </span>
          </div>
          <p className='mt-2 text-sm text-on-surface'>
            <strong>Lý do:</strong> {req.reasonCode} {req.reasonDetail ? `— ${req.reasonDetail}` : ''}
          </p>
          <p className='mt-0.5 text-xs text-on-surface-variant'>
            Phạm vi: {req.scopeType === 'ALL_REMAINING' ? 'Tất cả các buổi còn lại' : `Chỉ định ${req.occurrences?.length ?? 0} buổi`}
          </p>
          <div className='mt-3.5 flex items-center gap-3'>
            <button
              type='button'
              onClick={() => setApprovingRequest(req)}
              className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90'
            >
              <Icon className='text-sm' name='check' />
              Duyệt & chọn người mới
            </button>
            <button
              type='button'
              onClick={() => setRejectingRequest(req)}
              className='inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-xs font-semibold text-error hover:bg-surface-container-low'
            >
              <Icon className='text-sm' name='close' />
              Từ chối yêu cầu
            </button>
          </div>
        </div>
      ))}

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='flex min-w-0 flex-col gap-6'>
          <SectionCard icon='event_note' title={t('centerManager.bookingDetail.occurrences')}>
            <BookingOccurrenceList
              caregiverName={caregivers.nameOf}
              occurrences={data.occurrences ?? []}
              renderActions={(occurrence) => (
                <ManagerOccurrenceActions
                  bookingId={data.id}
                  bookingStatus={data.status}
                  caregivers={caregivers}
                  occurrence={occurrence}
                />
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

      {dialog === 'accept' || dialog === 'assign' || dialog === 'reject' ? (
        <ManagerBookingActionDialog action={dialog} booking={data} onClose={() => setDialog(null)} />
      ) : null}
      {dialog === 'address' ? (
        <ServiceAddressDialog booking={data} customer={false} onClose={() => setDialog(null)} open />
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
          checking={free.checking}
          freeIds={free.freeIds}
          options={caregivers.options}
          pending={reassign.isPending}
          title={t('centerManager.bookingDetail.reassignAll')}
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

      {approvingRequest ? (
        <CaregiverAssignDialog
          confirmLabel='Xác nhận đổi người'
          currentId={data.caregiverId}
          description={`Chọn chuyên viên mới để thay thế cho yêu cầu của khách hàng (${approvingRequest.reasonDetail ?? ''})`}
          error={approveChange.error ? t(bookingErrorKey(approveChange.error)) : undefined}
          loading={caregivers.caregivers.isPending}
          onClose={() => setApprovingRequest(null)}
          onConfirm={(caregiverId) => caregiverId && approveChange.mutate({ requestId: approvingRequest.id, newCaregiverId: caregiverId })}
          checking={free.checking}
          freeIds={free.freeIds}
          options={caregivers.options}
          pending={approveChange.isPending}
          title='Phân công chuyên viên mới'
        />
      ) : null}

      {rejectingRequest ? (
        <BookingReasonDialog
          confirmLabel='Từ chối yêu cầu'
          danger
          description='Nhập lý do từ chối để thông báo cho khách hàng.'
          error={rejectChange.error ? t(bookingErrorKey(rejectChange.error)) : undefined}
          label='Lý do từ chối'
          onClose={() => setRejectingRequest(null)}
          onConfirm={(reason) => rejectChange.mutate({ requestId: rejectingRequest.id, reason })}
          pending={rejectChange.isPending}
          title='Từ chối yêu cầu đổi người chăm sóc'
        />
      ) : null}
    </div>
  )
}
