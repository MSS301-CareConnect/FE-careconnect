import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  acceptBookingRequest,
  assignBookingCaregiver,
  bookingKeys,
  fetchBooking,
  rejectBookingRequest
} from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { Modal } from '~/shared/ui/modal'

import { useCenterCaregivers } from '../hooks/use-center-caregivers'
import { useFreeCaregivers } from '../hooks/use-free-caregivers'
import { CaregiverAssignDialog } from './caregiver-assign-dialog'

/** The center's answers to a waiting booking: confirm (choosing a caregiver), assign one later, or reject. */
export type ManagerBookingAction = 'accept' | 'assign' | 'reject'

/**
 * Dialog of one center action on a booking, shared by the booking list (quick actions) and the detail page. A success
 * stores the returned booking and refreshes every booking list and the queue counts.
 */
export function ManagerBookingActionDialog({
  booking,
  action,
  onClose
}: {
  booking: BookingDetailRecord
  action: ManagerBookingAction
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const caregivers = useCenterCaregivers()
  const free = useFreeCaregivers(booking, action !== 'reject')
  const caregiverName = booking.caregiverId ? caregivers.nameOf(booking.caregiverId) : undefined

  function done(updated: BookingDetailRecord) {
    queryClient.setQueryData(bookingKeys.detail(booking.id), updated)
    void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    onClose()
  }
  // BOOKING_EXPIRED (5116) means the backend has just closed it: refresh so the screen shows EXPIRED.
  function failed() {
    void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
  }
  const accept = useMutation({
    mutationFn: (caregiverId?: string) => acceptBookingRequest(booking.id, caregiverId),
    onSuccess: done,
    onError: failed
  })
  const assign = useMutation({
    mutationFn: (caregiverId: string) => assignBookingCaregiver(booking.id, caregiverId),
    onSuccess: done,
    onError: failed
  })
  const reject = useMutation({
    mutationFn: (reason: string) => rejectBookingRequest(booking.id, reason),
    onSuccess: done,
    onError: failed
  })

  if (action === 'reject') {
    return (
      <BookingReasonDialog
        confirmLabel={t('centerManager.bookingDetail.reject')}
        danger
        description={t('centerManager.bookingDetail.rejectHint')}
        error={reject.error ? t(bookingErrorKey(reject.error)) : undefined}
        label={t('centerManager.bookingDetail.reason')}
        onClose={onClose}
        onConfirm={(reason) => reject.mutate(reason)}
        pending={reject.isPending}
        title={t('centerManager.bookingDetail.rejectTitle', { code: booking.bookingCode })}
      />
    )
  }
  if (action === 'assign') {
    return (
      <CaregiverAssignDialog
        checking={free.checking}
        confirmLabel={t('centerManager.bookingDetail.assignCaregiver')}
        description={t('centerManager.bookingDetail.assign.assignDescription')}
        error={assign.error ? t(bookingErrorKey(assign.error)) : undefined}
        freeIds={free.freeIds}
        loading={caregivers.caregivers.isPending}
        onClose={onClose}
        onConfirm={(caregiverId) => caregiverId && assign.mutate(caregiverId)}
        options={caregivers.options}
        pending={assign.isPending}
        title={t('centerManager.bookingDetail.assignTitle', { code: booking.bookingCode })}
      />
    )
  }
  return (
    <CaregiverAssignDialog
      checking={free.checking}
      confirmLabel={t('centerManager.bookingDetail.accept')}
      currentId={booking.caregiverId}
      description={
        booking.caregiverId
          ? t('centerManager.bookingDetail.acceptKeepDescription', { name: caregiverName ?? '' })
          : booking.bookingType === 'SHIFT'
            ? t('centerManager.bookingDetail.acceptDescription')
            : t('centerManager.bookingDetail.acceptAssignLaterDescription')
      }
      emptyLabel={booking.caregiverId ? undefined : t('centerManager.bookingDetail.assign.later')}
      error={accept.error ? t(bookingErrorKey(accept.error)) : undefined}
      freeIds={free.freeIds}
      loading={caregivers.caregivers.isPending}
      onClose={onClose}
      onConfirm={(caregiverId) => accept.mutate(caregiverId)}
      optional={Boolean(booking.caregiverId) || booking.bookingType !== 'SHIFT'}
      options={caregivers.options}
      pending={accept.isPending}
      title={t('centerManager.bookingDetail.acceptTitle', { code: booking.bookingCode })}
    />
  )
}

/** List quick action: reads the booking (visits and services decide who is free), then opens the same dialog. */
export function ManagerBookingQuickAction({
  bookingId,
  action,
  onClose
}: {
  bookingId: string
  action: ManagerBookingAction
  onClose: () => void
}) {
  const { t } = useTranslation()
  const booking = useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    retry: false
  })
  if (booking.isSuccess) return <ManagerBookingActionDialog action={action} booking={booking.data} onClose={onClose} />
  return (
    <Modal onClose={onClose} open title={t('centerManager.bookingManagement.dialogLoading')}>
      <p
        className={`text-sm ${booking.isError ? 'text-error' : 'text-on-surface-variant'}`}
        role={booking.isError ? 'alert' : 'status'}
      >
        {booking.isError ? t(bookingErrorKey(booking.error)) : t('centerManager.bookingManagement.dialogLoading')}
      </p>
    </Modal>
  )
}
