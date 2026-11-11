import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchSessionsForReview, reviewSession } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { CareSessionRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { ConfirmDialog } from '~/shared/ui/modal'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

const key = 'centerManager.sessionReview' as const

/**
 * Visits the system closed because nobody checked out (2026-11-11). Their money is held until the center says whether
 * the visit was delivered: "delivered" lets PaymentService settle it, "not delivered" refunds the customer in full and
 * opens an absence record for the caregiver. Shown in the bookings page's attention popup (2026-11-11), paged by
 * BookingService.
 */
export function ManagerSessionReviewQueue() {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const [deciding, setDeciding] = useState<{ item: CareSessionRecord; delivered: boolean } | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const sessions = useQuery({
    queryKey: bookingKeys.sessionReviews(page, size),
    queryFn: () => fetchSessionsForReview(page, size),
    refetchInterval: 60_000,
    retry: false
  })
  const review = useMutation({
    mutationFn: ({ item, delivered, note }: { item: CareSessionRecord; delivered: boolean; note?: string }) =>
      reviewSession(item.sessionId, { delivered, note }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      setDeciding(null)
    }
  })
  const items = sessions.data?.items ?? []
  if (sessions.isPending) return <SkeletonBlock label={t('centerManager.attention.loading')} rows={2} />
  if (sessions.isError) {
    return (
      <ErrorState
        message={t(bookingErrorKey(sessions.error))}
        onRetry={() => void sessions.refetch()}
        retryLabel={t('booking.actions.retry')}
      />
    )
  }
  if (items.length === 0) return <EmptyState icon='task_alt' title={t('centerManager.attention.empty')} />
  const total = sessions.data.totalElements
  const error = review.error ? t(bookingErrorKey(review.error)) : undefined

  function open(item: CareSessionRecord, delivered: boolean) {
    review.reset()
    setDeciding({ item, delivered })
  }

  return (
    <div>
      <p className='text-sm text-on-surface-variant'>{t(`${key}.description`)}</p>
      <ul className='mt-3 flex flex-col gap-2'>
        {items.map((item) => (
          <li
            className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3 text-sm'
            key={item.sessionId}
          >
            <p className='font-semibold text-on-surface tabular-nums'>
              {t(`${key}.visit`, {
                number: item.occurrenceNo ?? '',
                time: item.startAt
                  ? `${format.longDayLabel(calendarDayOf(item.startAt))} · ${format.clock(item.startAt)}–${format.clock(item.endAt)}`
                  : ''
              })}
            </p>
            <p className='text-on-surface-variant'>
              {item.bookingCode ? <span className='font-mono'>{item.bookingCode}</span> : null}
              {item.recipientName ? ` · ${item.recipientName}` : ''}
            </p>
            <p className='mt-0.5 text-xs text-on-surface-variant tabular-nums'>
              {t(`${key}.checkedIn`, { time: format.dateTime(item.checkInAt) })}
            </p>
            {item.customerReportNote ? (
              <p className='mt-1.5 rounded-lg bg-error-container/40 px-2.5 py-1.5 text-xs text-on-surface'>
                <span className='font-semibold text-error'>{t(`${key}.customerReport`)}</span> {item.customerReportNote}
              </p>
            ) : null}
            <div className='mt-2.5 flex flex-wrap gap-2'>
              {item.bookingId ? (
                <Link
                  className='inline-flex min-h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-primary hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
                  to={`/center-manager/bookings/${item.bookingId}`}
                >
                  {t('booking.group.open')}
                </Link>
              ) : null}
              <Button onClick={() => open(item, false)} size='sm' variant='outline'>
                {t(`${key}.notDelivered`)}
              </Button>
              <Button onClick={() => open(item, true)} size='sm'>
                {t(`${key}.delivered`)}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Pagination
        className='mt-4'
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setSize(next)
          setPage(0)
        }}
        page={page}
        pageSize={size}
        pageSizeOptions={[5, 10, 20]}
        totalElements={total}
        totalPages={Math.ceil(total / size)}
      />

      {deciding?.delivered ? (
        <ConfirmDialog
          confirmLabel={t(`${key}.delivered`)}
          description={t(`${key}.deliveredHint`)}
          error={error}
          loading={review.isPending}
          onClose={() => setDeciding(null)}
          onConfirm={() => review.mutate({ item: deciding.item, delivered: true })}
          open
          title={t(`${key}.deliveredTitle`, { number: deciding.item.occurrenceNo ?? '' })}
        />
      ) : null}
      {deciding && !deciding.delivered ? (
        <BookingReasonDialog
          confirmLabel={t(`${key}.notDelivered`)}
          danger
          description={t(`${key}.notDeliveredHint`)}
          error={error}
          label={t(`${key}.note`)}
          minLength={10}
          onClose={() => setDeciding(null)}
          onConfirm={(note) => review.mutate({ item: deciding.item, delivered: false, note })}
          pending={review.isPending}
          title={t(`${key}.notDeliveredTitle`, { number: deciding.item.occurrenceNo ?? '' })}
        />
      ) : null}
    </div>
  )
}
