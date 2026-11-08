import { useTranslation } from 'react-i18next'

import { useBookingRequests } from '../data/caregiver-queries'
import { CaregiverEmpty, CaregiverError } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { VisitListSkeleton } from '../ui/visit-skeleton'
import { BookingRequestCard } from './components/booking-request-card'
import { useRequestAnswer } from './hooks/use-request-answer'

/**
 * CR-3: bookings customers sent straight to this caregiver, shown in the visits tab "Needs your answer". Each card
 * answers in place or opens the full request. `hideEmpty` lets the tab show one empty state for both sources.
 */
export function BookingRequestsList({ hideEmpty = false }: { hideEmpty?: boolean }) {
  const { t } = useTranslation()
  const now = useNow(30_000)
  const requests = useBookingRequests()
  const answer = useRequestAnswer()
  const items = requests.data?.items ?? []

  return (
    <div>
      {requests.isPending ? (
        <VisitListSkeleton />
      ) : requests.isError ? (
        <CaregiverError
          message={t('caregiver.requests.error')}
          onRetry={() => void requests.refetch()}
          retryLabel={t('caregiver.requests.retry')}
        />
      ) : items.length === 0 ? (
        hideEmpty ? null : (
          <CaregiverEmpty
            description={t('caregiver.requests.empty')}
            icon='inbox'
            title={t('caregiver.requests.emptyTitle')}
          />
        )
      ) : (
        <ul className='flex flex-col gap-4'>
          {items.map((request) => (
            <li key={request.id}>
              <BookingRequestCard
                busy={answer.busy(request.id)}
                now={now}
                onAccept={() => answer.accept(request.id)}
                onDecline={() => answer.startDecline(request.id)}
                request={request}
              />
            </li>
          ))}
        </ul>
      )}
      {answer.declineDialog}
    </div>
  )
}
