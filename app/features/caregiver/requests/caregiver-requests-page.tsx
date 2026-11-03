import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { acceptAsCaregiverRequest, bookingKeys, declineAsCaregiverRequest } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { CaregiverBookingRequestRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { useBookingRequests } from '../data/caregiver-queries'
import { CaregiverEmpty, CaregiverError, CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { VisitListSkeleton } from '../ui/visit-skeleton'
import { BookingRequestCard } from './components/booking-request-card'

/**
 * CR-3: bookings customers sent straight to this caregiver. Accepting moves the booking to payment without the
 * center; declining hands a RECURRING / CUSTOM booking to the center and closes a SHIFT booking.
 */
export function CaregiverRequestsPage() {
  const { t } = useTranslation()
  const now = useNow(60_000)
  const queryClient = useQueryClient()
  const requests = useBookingRequests()
  const [declining, setDeclining] = useState<CaregiverBookingRequestRecord | null>(null)
  useDocumentTitle(t('caregiver.requests.documentTitle'))

  const refresh = () => queryClient.invalidateQueries({ queryKey: bookingKeys.all })
  const failed = (error: unknown) => toast.error(t(bookingErrorKey(error)))
  const accept = useMutation({
    mutationFn: (id: string) => acceptAsCaregiverRequest(id),
    onSuccess: async () => {
      toast.success(t('caregiver.requests.accepted'))
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
      await refresh()
    },
    onError: failed
  })
  const items = requests.data?.items ?? []

  return (
    <div className={cgContainer}>
      <CaregiverPageHeader description={t('caregiver.requests.subtitle')} title={t('caregiver.requests.title')} />

      {requests.isPending ? (
        <VisitListSkeleton />
      ) : requests.isError ? (
        <CaregiverError
          message={t('caregiver.requests.error')}
          onRetry={() => void requests.refetch()}
          retryLabel={t('caregiver.requests.retry')}
        />
      ) : items.length === 0 ? (
        <CaregiverEmpty
          description={t('caregiver.requests.empty')}
          icon='inbox'
          title={t('caregiver.requests.emptyTitle')}
        />
      ) : (
        <ul className='flex flex-col gap-4'>
          {items.map((request) => (
            <li key={request.id}>
              <BookingRequestCard
                busy={(accept.isPending && accept.variables === request.id) || decline.isPending}
                now={now}
                onAccept={() => accept.mutate(request.id)}
                onDecline={() => setDeclining(request)}
                request={request}
              />
            </li>
          ))}
        </ul>
      )}

      {declining ? (
        <BookingReasonDialog
          confirmLabel={t('caregiver.requests.declineConfirm')}
          danger
          description={t('caregiver.requests.declineDescription')}
          label={t('caregiver.requests.declineReason')}
          onClose={() => setDeclining(null)}
          onConfirm={(reason) => decline.mutate({ id: declining.id, reason })}
          pending={decline.isPending}
          title={t('caregiver.requests.declineTitle')}
        />
      ) : null}
    </div>
  )
}
