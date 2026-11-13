import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { bookingKeys, fetchSessionsForReview } from '~/entities/booking/booking-api'
import { CaregiverAbsenceQueue, usePendingAbsences } from '~/entities/booking/caregiver-absence-queue'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

import { useCenterCaregivers } from '../hooks/use-center-caregivers'
import { ManagerSessionReviewQueue } from './manager-session-review-queue'
import { ManagerUnassignedQueue, useUnassignedVisits } from './manager-unassigned-queue'
import { ManagerWithdrawalQueue, useCenterWithdrawals } from './manager-withdrawal-queue'

const key = 'centerManager.attention' as const
const QUEUES = ['unassigned', 'withdrawals', 'reviews', 'absences'] as const
type Queue = (typeof QUEUES)[number]

const TONES: Record<Queue, { icon: string; badge: string; ring: string }> = {
  unassigned: { icon: 'person_search', badge: 'bg-error-container text-error', ring: 'border-error/30' },
  withdrawals: { icon: 'person_alert', badge: 'bg-caution-container text-caution', ring: 'border-caution/40' },
  reviews: { icon: 'timer_off', badge: 'bg-peach-100 text-peach-700', ring: 'border-peach-200' },
  absences: { icon: 'person_off', badge: 'bg-error-container text-error', ring: 'border-error/30' }
}

/**
 * What waits on the center besides bookings (2026-11-11): paid visits without a caregiver (2026-11-13), caregiver
 * withdrawals, visits to confirm and caregiver absences as one row of compact cards above the list — count and a "Details" button that opens the paged queue in a
 * popup (`?queue=`). A card with nothing waiting is hidden; the row disappears when all are empty.
 */
export function ManagerAttentionStrip() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const { nameOf } = useCenterCaregivers()
  // One-row reads only for the counts; the popup reads its own pages.
  const withdrawals = useCenterWithdrawals(undefined, 0, 1)
  const reviews = useQuery({
    queryKey: bookingKeys.sessionReviews(0, 1),
    queryFn: () => fetchSessionsForReview(0, 1),
    refetchInterval: 60_000,
    retry: false
  })
  const absences = usePendingAbsences(undefined, 0, 1)
  const unassigned = useUnassignedVisits(0, 1)
  const counts: Record<Queue, number> = {
    unassigned: unassigned.data?.totalElements ?? 0,
    withdrawals: withdrawals.data?.totalElements ?? 0,
    reviews: reviews.data?.totalElements ?? 0,
    absences: absences.data?.totalElements ?? 0
  }
  const opened = QUEUES.find((item) => item === params.get('queue'))
  const visible = QUEUES.filter((item) => counts[item] > 0)

  function openQueue(queue: Queue | undefined) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (queue) next.set('queue', queue)
        else next.delete('queue')
        return next
      },
      { replace: true }
    )
  }

  const bodies: Record<Queue, ReactNode> = {
    unassigned: <ManagerUnassignedQueue />,
    withdrawals: <ManagerWithdrawalQueue />,
    reviews: <ManagerSessionReviewQueue />,
    absences: <CaregiverAbsenceQueue nameOf={nameOf} role='manager' />
  }

  return (
    <>
      {visible.length > 0 ? (
        <section aria-label={t(`${key}.label`)} className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {visible.map((queue) => (
            <div
              className={`flex items-center gap-3 rounded-2xl border bg-surface-container-lowest p-3.5 shadow-[var(--shadow-card)] ${TONES[queue].ring}`}
              key={queue}
            >
              <span
                aria-hidden='true'
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${TONES[queue].badge}`}
              >
                <Icon className='text-xl' name={TONES[queue].icon} />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='flex items-baseline gap-2'>
                  <span className='text-2xl font-extrabold text-forest-950 tabular-nums'>{counts[queue]}</span>
                  <span className='truncate text-sm font-semibold text-on-surface'>
                    {t(`${key}.cards.${queue}.title`)}
                  </span>
                </p>
                <p className='truncate text-xs text-on-surface-variant'>{t(`${key}.cards.${queue}.hint`)}</p>
              </div>
              <Button
                aria-label={`${t(`${key}.details`)} — ${t(`${key}.cards.${queue}.title`)}`}
                onClick={() => openQueue(queue)}
                rightIcon={<Icon className='text-base' name='chevron_right' />}
                size='sm'
                variant='outline'
              >
                {t(`${key}.details`)}
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      {opened ? (
        <Modal
          footer={
            <Button onClick={() => openQueue(undefined)} variant='outline'>
              {t(`${key}.close`)}
            </Button>
          }
          onClose={() => openQueue(undefined)}
          open
          size='xl'
          title={t(`${key}.dialogTitle`, { title: t(`${key}.cards.${opened}.title`), count: counts[opened] })}
        >
          {bodies[opened]}
        </Modal>
      ) : null}
    </>
  )
}
