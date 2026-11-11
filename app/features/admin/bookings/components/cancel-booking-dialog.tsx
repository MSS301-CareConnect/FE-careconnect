import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { bookingKeys, cancelBookingRequest } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { classifyApiError } from '~/shared/api/api-error'
import type { BookingStatus } from '~/shared/api/generated/contracts'
import { useActionToast } from '~/shared/ui/use-action-toast'

// Statuses that still hold a schedule; BookingService rejects a cancel outside them.
const CANCELLABLE: ReadonlySet<BookingStatus> = new Set([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS'
])

export function canAdminCancel(status: BookingStatus) {
  return CANCELLABLE.has(status)
}

/** M-11: the admin cancels a booking on behalf of the platform (full refund like a center cancel), with a reason. */
export function CancelBookingDialog({
  bookingId,
  bookingCode,
  onClose
}: {
  bookingId: string
  bookingCode: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const notify = useActionToast()
  const cancel = useMutation({
    mutationFn: (reason: string) => cancelBookingRequest(bookingId, { reason }),
    onError: (error, reason) => {
      if (notify.systemError(error, t('admin.toast.bookings.actions.cancel'), () => cancel.mutate(reason))) onClose()
    },
    onSuccess: async () => {
      onClose()
      notify.success(t('admin.toast.bookings.cancelled', { code: bookingCode }))
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    }
  })
  return (
    <BookingReasonDialog
      confirmLabel={t('admin.bookingsPage.cancel')}
      danger
      description={t('admin.bookingsPage.cancelHint')}
      error={
        cancel.error && classifyApiError(cancel.error).kind !== 'system' ? t(bookingErrorKey(cancel.error)) : undefined
      }
      label={t('admin.bookingsPage.reason')}
      onClose={onClose}
      onConfirm={(reason) => cancel.mutate(reason)}
      pending={cancel.isPending}
      title={t('admin.bookingsPage.cancelTitle')}
    />
  )
}
