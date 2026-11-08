import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { acceptAsCaregiverRequest, bookingKeys, declineAsCaregiverRequest } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'

/**
 * Accept or decline a booking request (CR-3). Accepting moves the booking to payment without the center; declining
 * hands a RECURRING / CUSTOM booking to the center and closes a SHIFT booking. `onDone` runs before the booking cache
 * is refreshed, so a detail page can leave before its request turns into a 404.
 */
export function useRequestAnswer(onDone?: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [declining, setDeclining] = useState<string | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: bookingKeys.all })
  const failed = (error: unknown) => toast.error(t(bookingErrorKey(error)))
  const accept = useMutation({
    mutationFn: (id: string) => acceptAsCaregiverRequest(id),
    onSuccess: async () => {
      toast.success(t('caregiver.requests.accepted'))
      onDone?.()
      await refresh()
    },
    onError: failed
  })
  const decline = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => declineAsCaregiverRequest(id, reason),
    onSuccess: async (record) => {
      setDeclining(null)
      toast.success(
        record.status === 'PENDING_CAREGIVER_ASSIGNMENT'
          ? t('caregiver.requests.declinedToCenter')
          : t('caregiver.requests.declined')
      )
      onDone?.()
      await refresh()
    },
    onError: failed
  })

  const declineDialog = declining ? (
    <BookingReasonDialog
      confirmLabel={t('caregiver.requests.declineConfirm')}
      danger
      description={t('caregiver.requests.declineDescription')}
      label={t('caregiver.requests.declineReason')}
      onClose={() => setDeclining(null)}
      onConfirm={(reason) => decline.mutate({ id: declining, reason })}
      pending={decline.isPending}
      title={t('caregiver.requests.declineTitle')}
    />
  ) : null

  /** True while this request is being answered (accept of this one, or any decline). */
  const busy = (id: string) => (accept.isPending && accept.variables === id) || decline.isPending

  return { accept: (id: string) => accept.mutate(id), startDecline: setDeclining, busy, declineDialog }
}
