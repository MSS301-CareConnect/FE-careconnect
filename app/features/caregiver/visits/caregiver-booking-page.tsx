import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { VISIT_PAGE_SIZE, useVisitPage } from '../data/caregiver-queries'
import { CaregiverEmpty, CaregiverError, CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { VisitCard, visitPeople } from '../ui/visit-card'
import { WithdrawDialog, canWithdraw } from './components/withdraw-dialog'

// Visits that are still ahead (or running); the rest are past or closed.
const AHEAD = new Set(['SCHEDULED', 'ACKNOWLEDGED', 'IN_PROGRESS'])

/**
 * Every visit of one booking assigned to the caregiver (2026-11-09): upcoming first, then past or closed ones, each
 * opening its visit page. "Withdraw from the remaining visits" sends the visits more than 24 hours away at once.
 */
export function CaregiverBookingPage({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation()
  const now = useNow()
  const [withdrawing, setWithdrawing] = useState(false)
  const page = useVisitPage({ bookingId, page: 0, size: VISIT_PAGE_SIZE })
  const visits = [...(page.data?.items ?? [])].sort((first, second) => first.startAt.localeCompare(second.startAt))
  const first = visits[0]
  const name = (first ? visitPeople(first).name : undefined) ?? t('caregiver.visits.patientFallback')
  const code = first?.bookingCode ?? ''
  useDocumentTitle(t('caregiver.booking.page.documentTitle', { code }))
  const back = { to: '/caregiver/visits', label: t('caregiver.booking.page.back') }

  if (page.isPending)
    return (
      <div className={cgContainer}>
        <SkeletonGroup className='flex flex-col gap-3' label={t('caregiver.booking.page.loading')}>
          <Skeleton className='h-9 w-64 rounded-md' />
          <Skeleton className='h-40 rounded-xl' />
          <Skeleton className='h-40 rounded-xl' />
        </SkeletonGroup>
      </div>
    )
  if (page.isError)
    return (
      <div className={cgContainer}>
        <CaregiverPageHeader back={back} title={t('caregiver.booking.page.error')} />
        <CaregiverError
          message={t(bookingErrorKey(page.error))}
          onRetry={() => void page.refetch()}
          retryLabel={t('caregiver.ui.actions.retry')}
        />
      </div>
    )
  if (!first)
    return (
      <div className={cgContainer}>
        <CaregiverPageHeader back={back} title={t('caregiver.booking.page.notFound')} />
      </div>
    )

  const ahead = visits.filter((visit) => AHEAD.has(visit.status))
  const past = visits.filter((visit) => !AHEAD.has(visit.status)).reverse()
  const withdrawable = ahead.filter((visit) => canWithdraw(visit, now))
  const kept = ahead.filter(
    (visit) => !canWithdraw(visit, now) && visit.status !== 'IN_PROGRESS' && !visit.needsReassignment
  )

  return (
    <div className={`${cgContainer} pb-24`}>
      <CaregiverPageHeader
        actions={
          withdrawable.length ? (
            <Button
              leftIcon={<Icon className='text-lg' name='event_busy' />}
              onClick={() => setWithdrawing(true)}
              variant='secondary'
            >
              {t('caregiver.booking.page.withdrawAll')}
            </Button>
          ) : undefined
        }
        back={back}
        description={visitPeople(first).address || undefined}
        eyebrow={<span className='font-mono'>{code}</span>}
        title={t('caregiver.booking.page.title', { name })}
      />

      <section aria-labelledby='booking-upcoming' className='mb-6'>
        <h2 className='mb-1 text-base font-semibold text-on-surface' id='booking-upcoming'>
          {t('caregiver.booking.page.upcoming', { count: ahead.length })}
        </h2>
        {withdrawable.length ? (
          <p className='mb-3 text-sm text-on-surface-variant'>{t('caregiver.booking.page.withdrawAllHint')}</p>
        ) : null}
        {ahead.length ? (
          <ul className='cg-stagger flex flex-col gap-3'>
            {ahead.map((visit) => (
              <li key={visit.id}>
                <VisitCard now={now} showDate visit={visit} />
              </li>
            ))}
          </ul>
        ) : (
          <CaregiverEmpty icon='event_available' title={t('caregiver.booking.page.noUpcoming')} />
        )}
      </section>

      {past.length ? (
        <section aria-labelledby='booking-past'>
          <h2 className='mb-3 text-base font-semibold text-on-surface' id='booking-past'>
            {t('caregiver.booking.page.past', { count: past.length })}
          </h2>
          <ul className='flex flex-col gap-3'>
            {past.map((visit) => (
              <li key={visit.id}>
                <VisitCard now={now} showDate visit={visit} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {withdrawing ? <WithdrawDialog kept={kept} onClose={() => setWithdrawing(false)} visits={withdrawable} /> : null}
    </div>
  )
}
