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
import type { BookingDetailRecord, BookingOccurrenceRecord, BookingStatus } from '~/shared/api/generated/contracts'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'
import { ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

import { BentoPageHeader } from '~/shared/ui/bento-page-header'
import { CaregiverAssignDialog } from './components/caregiver-assign-dialog'
import { ManagerBookingActionDialog } from './components/manager-booking-action-dialog'
import { ManagerBookingSummary } from './components/manager-booking-summary'
import { ManagerOccurrenceActions } from './components/manager-occurrence-actions'
import { ManagerVisitDetailDialog } from './components/manager-visit-detail-dialog'
import { BookingWithdrawalNotice } from './components/manager-withdrawal-queue'
import { useCenterCaregivers } from './hooks/use-center-caregivers'
import { useFreeCaregivers } from './hooks/use-free-caregivers'

type Dialog = 'accept' | 'reject' | 'cancel' | 'reassign' | 'assign' | 'address' | null
// Spec §5.2: the center confirms or rejects a new booking, assigns a caregiver to a confirmed RECURRING / CUSTOM booking
// that has none (or rejects it), and cancels or reassigns once a caregiver holds the visits.
const ACCEPTED: readonly BookingStatus[] = ['AWAITING_INITIAL_PAYMENT', 'CONFIRMED', 'IN_PROGRESS']
const k = 'centerManager.bookingDetail' as const
const container = 'mx-auto w-full max-w-[1280px] space-y-5 px-4 pb-10 sm:px-6'

export function ManagerBookingDetailPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [visit, setVisit] = useState<BookingOccurrenceRecord | null>(null)
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
  useDocumentTitle(t(`${k}.documentTitle`, { code: booking.data?.bookingCode ?? '' }))
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
  const breadcrumb = [
    { label: t('centerManager.bookingManagement.title'), to: '/center-manager/bookings' },
    { label: booking.data ? `#${booking.data.bookingCode}` : t(`${k}.loading`) }
  ]

  if (booking.isPending)
    return (
      <div className={`${container} py-8`}>
        <SkeletonBlock label={t(`${k}.loading`)} rows={6} />
      </div>
    )
  if (booking.isError)
    return (
      <div className={`${container} py-8`}>
        <ErrorState
          message={`${bookingErrorStatus(booking.error) === 404 ? t(`${k}.notFound`) : t(`${k}.error`)} — ${t(bookingErrorKey(booking.error))}`}
          onRetry={() => void booking.refetch()}
          retryLabel={t('booking.actions.retry')}
        />
        <Link className='mt-4 inline-block font-semibold text-primary underline' to='/center-manager/bookings'>
          {t(`${k}.back`)}
        </Link>
      </div>
    )

  const data = booking.data
  const hasUpcoming = (data.occurrences ?? []).some((occurrence) => isUpcomingOccurrence(occurrence))
  const caregiverName = data.caregiverId ? caregivers.nameOf(data.caregiverId) : undefined
  const past = isPastDeadline(data, now)
  const pendingRequests = (changeRequests.data ?? []).filter((request) => request.status === 'PENDING')
  const deadlineText =
    data.deadlineAt && data.deadlineType && EXPIRING_STATUSES.has(data.status)
      ? data.status === 'PENDING_CAREGIVER_CONFIRMATION'
        ? t(`${k}.caregiverAnswersBy`, { time: formatDateTime(data.deadlineAt, i18n.language) })
        : data.status === 'PENDING_CAREGIVER_ASSIGNMENT'
          ? t(`${k}.assignBy`, { time: formatDateTime(data.deadlineAt, i18n.language) })
          : data.status === 'PENDING_CENTER_CONFIRMATION'
            ? t(`${k}.acceptBy`, { time: formatDateTime(data.deadlineAt, i18n.language) })
            : formatDateTime(data.deadlineAt, i18n.language)
      : undefined

  return (
    <div className={container}>
      <BentoPageHeader
        actions={
          <>
            {data.status === 'PENDING_CENTER_CONFIRMATION' && !past ? (
              <>
                <Button leftIcon={<Icon name='check_circle' />} onClick={() => setDialog('accept')}>
                  {t(`${k}.accept`)}
                </Button>
                <Button leftIcon={<Icon name='block' />} onClick={() => setDialog('reject')} variant='outline'>
                  {t(`${k}.reject`)}
                </Button>
              </>
            ) : null}
            {data.status === 'PENDING_CAREGIVER_ASSIGNMENT' && !past ? (
              <>
                <Button leftIcon={<Icon name='person_add' />} onClick={() => setDialog('assign')}>
                  {t(`${k}.assignCaregiver`)}
                </Button>
                <Button leftIcon={<Icon name='block' />} onClick={() => setDialog('reject')} variant='outline'>
                  {t(`${k}.reject`)}
                </Button>
              </>
            ) : null}
            {data.status === 'PENDING_CAREGIVER_CONFIRMATION' && !past ? (
              <Button leftIcon={<Icon name='block' />} onClick={() => setDialog('reject')} variant='outline'>
                {t(`${k}.reject`)}
              </Button>
            ) : null}
            {ACCEPTED.includes(data.status) && hasUpcoming ? (
              <Button leftIcon={<Icon name='switch_account' />} onClick={() => setDialog('reassign')} variant='outline'>
                {t(`${k}.reassignAll`)}
              </Button>
            ) : null}
            {canChangeServiceAddress(data, openedAt, false) && !past ? (
              <Button leftIcon={<Icon name='home_pin' />} onClick={() => setDialog('address')} variant='outline'>
                {t('booking.address.action')}
              </Button>
            ) : null}
            {ACCEPTED.includes(data.status) ? (
              <Button
                className='text-error! hover:text-error!'
                leftIcon={<Icon name='event_busy' />}
                onClick={() => setDialog('cancel')}
                variant='ghost'
              >
                {t(`${k}.cancel`)}
              </Button>
            ) : null}
          </>
        }
        breadcrumb={breadcrumb}
        breadcrumbLabel={t(`${k}.breadcrumb`)}
        meta={
          <div className='flex flex-wrap items-center gap-2'>
            <span className='rounded-md bg-surface-container px-2 py-1 font-semibold text-on-surface tabular-nums'>
              #{data.bookingCode}
            </span>
            <BookingStatusBadge status={data.status} />
            <span className='inline-flex items-center gap-1'>
              <Icon className='text-base text-primary' name='badge' />
              {data.caregiverId
                ? t(`${k}.caregiver`, { name: caregiverName ?? t('booking.occurrences.assigned') })
                : t(`${k}.noCaregiver`)}
            </span>
            {deadlineText && data.deadlineAt && data.deadlineType ? (
              <>
                <BookingDeadlineChip
                  dueAt={data.deadlineAt}
                  now={now}
                  prefix={t(`booking.deadline.types.${data.deadlineType}`)}
                />
                <span className='text-xs tabular-nums'>{deadlineText}</span>
              </>
            ) : null}
          </div>
        }
        title={data.recipientSnapshot?.fullName ?? `#${data.bookingCode}`}
      />

      {past ? (
        <p
          className='flex items-start gap-1.5 rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant'
          role='status'
        >
          <Icon className='text-base' name='timer_off' />
          {t('booking.deadline.pastHint')}
        </p>
      ) : null}
      {data.status === 'EXPIRED' && data.expiredReason ? (
        <p className='flex items-center gap-1.5 rounded-xl bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface-variant'>
          <Icon className='text-base' name='timer_off' />
          {t(`booking.expiredReason.${data.expiredReason}`)}
        </p>
      ) : null}
      {data.rejectedReason || data.cancelReason ? (
        <p className='flex items-start gap-2 rounded-xl border border-error/25 bg-error-container/50 px-4 py-3 text-sm text-on-surface'>
          <Icon className='text-base text-error' name='info' />
          {t(`${k}.closedReason`, { reason: data.rejectedReason ?? data.cancelReason })}
        </p>
      ) : null}

      {pendingRequests.map((request) => (
        <section className='rounded-2xl border border-primary/30 bg-brand-50/60 p-4 sm:p-5' key={request.id}>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h2 className='flex items-center gap-2 font-bold text-primary'>
              <Icon className='text-xl' name='sync_alt' />
              {t(`${k}.changeRequest.title`)}
            </h2>
            <StatusBadge tone='warning'>{t(`${k}.changeRequest.pending`)}</StatusBadge>
          </div>
          <p className='mt-2 text-sm text-on-surface'>
            {t(`${k}.changeRequest.reason`, {
              reason: [request.reasonCode, request.reasonDetail].filter(Boolean).join(' — ')
            })}
          </p>
          <p className='mt-0.5 text-xs text-on-surface-variant'>
            {request.scopeType === 'ALL_REMAINING'
              ? t(`${k}.changeRequest.scopeAll`)
              : t(`${k}.changeRequest.scopeSome`, { count: request.occurrences?.length ?? 0 })}
          </p>
          <div className='mt-3.5 flex flex-wrap items-center gap-2'>
            <Button leftIcon={<Icon name='check' />} onClick={() => setApprovingRequest(request)} size='sm'>
              {t(`${k}.changeRequest.approve`)}
            </Button>
            <Button
              leftIcon={<Icon name='close' />}
              onClick={() => setRejectingRequest(request)}
              size='sm'
              variant='outline'
            >
              {t(`${k}.changeRequest.reject`)}
            </Button>
          </div>
        </section>
      ))}

      <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]'>
        <div className='flex min-w-0 flex-col gap-5'>
          <BookingWithdrawalNotice bookingId={data.id} />
          <SectionCard icon='event_note' title={t(`${k}.occurrences`)}>
            <p className='-mt-1 mb-3 text-sm text-on-surface-variant'>{t(`${k}.occurrencesHint`)}</p>
            <BookingOccurrenceList
              caregiverName={caregivers.nameOf}
              occurrences={data.occurrences ?? []}
              onSelectOccurrence={setVisit}
              renderActions={(occurrence) => (
                <ManagerOccurrenceActions
                  bookingId={data.id}
                  bookingStatus={data.status}
                  caregivers={caregivers}
                  occurrence={occurrence}
                />
              )}
              services={data.services}
            />
          </SectionCard>
          {data.recipientSnapshot ? (
            <SectionCard icon='personal_injury' title={t(`${k}.patient`)}>
              <BookingRecipientSnapshot snapshot={data.recipientSnapshot} />
            </SectionCard>
          ) : null}
          <SectionCard icon='history' title={t(`${k}.history`)}>
            <BookingHistoryList bookingId={data.id} />
          </SectionCard>
        </div>
        <ManagerBookingSummary booking={data} />
      </div>

      {visit ? (
        <ManagerVisitDetailDialog
          booking={data}
          caregiverName={visit.caregiverId ? caregivers.nameOf(visit.caregiverId) : undefined}
          occurrence={visit}
          onClose={() => setVisit(null)}
        />
      ) : null}
      {dialog === 'accept' || dialog === 'assign' || dialog === 'reject' ? (
        <ManagerBookingActionDialog action={dialog} booking={data} onClose={() => setDialog(null)} />
      ) : null}
      {dialog === 'address' ? (
        <ServiceAddressDialog booking={data} customer={false} onClose={() => setDialog(null)} open />
      ) : null}
      {dialog === 'reassign' ? (
        <CaregiverAssignDialog
          checking={free.checking}
          confirmLabel={t(`${k}.assign.confirm`)}
          currentId={data.caregiverId}
          description={t(`${k}.assign.allDescription`)}
          error={reassign.error ? t(bookingErrorKey(reassign.error)) : undefined}
          freeIds={free.freeIds}
          loading={caregivers.caregivers.isPending}
          onClose={() => setDialog(null)}
          onConfirm={(caregiverId) => caregiverId && reassign.mutate(caregiverId)}
          options={caregivers.options}
          pending={reassign.isPending}
          title={t(`${k}.reassignAll`)}
        />
      ) : null}
      {dialog === 'cancel' ? (
        <BookingReasonDialog
          confirmLabel={t(`${k}.cancel`)}
          danger
          description={t(`${k}.cancelHint`)}
          error={cancel.error ? t(bookingErrorKey(cancel.error)) : undefined}
          label={t(`${k}.reason`)}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => cancel.mutate(reason)}
          pending={cancel.isPending}
          title={t(`${k}.cancelTitle`, { code: data.bookingCode })}
        />
      ) : null}

      {approvingRequest ? (
        <CaregiverAssignDialog
          checking={free.checking}
          confirmLabel={t(`${k}.changeRequest.confirm`)}
          currentId={data.caregiverId}
          description={t(`${k}.changeRequest.assignDescription`, { reason: approvingRequest.reasonDetail ?? '—' })}
          error={approveChange.error ? t(bookingErrorKey(approveChange.error)) : undefined}
          freeIds={free.freeIds}
          loading={caregivers.caregivers.isPending}
          onClose={() => setApprovingRequest(null)}
          onConfirm={(caregiverId) =>
            caregiverId && approveChange.mutate({ requestId: approvingRequest.id, newCaregiverId: caregiverId })
          }
          options={caregivers.options}
          pending={approveChange.isPending}
          title={t(`${k}.changeRequest.assignTitle`)}
        />
      ) : null}

      {rejectingRequest ? (
        <BookingReasonDialog
          confirmLabel={t(`${k}.changeRequest.reject`)}
          danger
          description={t(`${k}.changeRequest.rejectHint`)}
          error={rejectChange.error ? t(bookingErrorKey(rejectChange.error)) : undefined}
          label={t(`${k}.changeRequest.rejectReason`)}
          onClose={() => setRejectingRequest(null)}
          onConfirm={(reason) => rejectChange.mutate({ requestId: rejectingRequest.id, reason })}
          pending={rejectChange.isPending}
          title={t(`${k}.changeRequest.rejectTitle`)}
        />
      ) : null}
    </div>
  )
}
