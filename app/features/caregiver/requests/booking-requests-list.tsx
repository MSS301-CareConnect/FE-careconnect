import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Pagination } from '~/shared/ui/pagination'

import { useBookingRequests } from '../data/caregiver-queries'
import { CaregiverEmpty, CaregiverError } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { VisitListSkeleton } from '../ui/visit-skeleton'
import { BookingRequestCard } from './components/booking-request-card'
import { useRequestAnswer } from './hooks/use-request-answer'

const PAGE_SIZE = 10

/**
 * CR-3: bookings customers sent straight to this caregiver, shown in the visits tab "Needs your answer". Each card
 * answers in place or opens the full request. `hideEmpty` lets the tab show one empty state for both sources.
 */
export function BookingRequestsList({ hideEmpty = false }: { hideEmpty?: boolean }) {
  const { t } = useTranslation()
  const now = useNow(30_000)
  const [page, setPage] = useState(0)
  const requests = useBookingRequests(page, PAGE_SIZE)
  const answer = useRequestAnswer()
  const items = requests.data?.items ?? []
  const totalPages = requests.data?.totalPages ?? 0

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
        <div className='flex flex-col gap-4'>
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
          <Pagination
            ariaLabel={t('caregiver.requests.pagination')}
            onPageChange={setPage}
            page={Math.min(page, Math.max(0, totalPages - 1))}
            totalPages={totalPages}
          />
        </div>
      )}
      {answer.declineDialog}
    </div>
  )
}
