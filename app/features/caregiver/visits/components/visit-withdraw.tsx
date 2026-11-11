import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { VISIT_PAGE_SIZE, useVisitPage } from '../../data/caregiver-queries'
import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { useNow } from '../../ui/use-now'
import { dayWithdrawal } from '../withdraw-model'
import { WithdrawDialog } from './withdraw-dialog'

/**
 * Withdrawing from this visit (2026-11-10): when the day holds other visits of the booking, only the whole day can be
 * given back (BookingService 5265), so the action names the day and lists its visits; otherwise the visit alone. Shows
 * why it is no longer possible, or the "being replaced" state after the caregiver withdrew. Nothing once under way.
 */
export function VisitWithdraw({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const now = useNow()
  const [open, setOpen] = useState(false)
  const notStarted = visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED'
  const day = calendarDayOf(visit.startAt)
  const sameDay = useVisitPage(
    { bookingId: visit.bookingId, from: day, to: day, page: 0, size: VISIT_PAGE_SIZE },
    notStarted && !visit.needsReassignment
  )
  if (!notStarted) return null

  const dayVisits = sameDay.data?.items.filter((item) => calendarDayOf(item.startAt) === day) ?? [visit]
  const plan = dayWithdrawal(dayVisits.some((item) => item.id === visit.id) ? dayVisits : [visit, ...dayVisits], now)
  const wholeDay = plan.scope === 'day'

  return (
    <section className={`${cgCard} flex flex-col gap-3 p-4 sm:p-5`}>
      {visit.needsReassignment ? (
        <p className='flex items-start gap-2 text-sm font-semibold text-on-caution-container'>
          <Icon className='mt-0.5 text-lg text-caution' name='person_alert' />
          {t('caregiver.booking.withdraw.alreadyRequested')}
        </p>
      ) : (
        <>
          <div className='flex items-start gap-3'>
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-peach-50 text-peach-700'>
              <Icon className='text-xl' name='event_busy' />
            </span>
            <div className='min-w-0 text-sm'>
              <h2 className='font-semibold text-on-surface'>{t('caregiver.booking.withdraw.sectionTitle')}</h2>
              <p className='mt-0.5 text-on-surface-variant'>
                {wholeDay
                  ? t('caregiver.booking.withdraw.wholeDayHint', {
                      count: plan.visits.length,
                      day: format.shortDay(day)
                    })
                  : t('caregiver.booking.withdraw.singleHint')}
              </p>
            </div>
          </div>
          {sameDay.isPending ? null : plan.allowed ? (
            <Button
              className='self-start'
              leftIcon={<Icon className='text-lg' name='event_busy' />}
              onClick={() => setOpen(true)}
              variant='outline'
            >
              {wholeDay
                ? t('caregiver.booking.withdraw.openDay', { count: plan.visits.length })
                : t('caregiver.booking.withdraw.open')}
            </Button>
          ) : (
            <p className='rounded-xl bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant'>
              {wholeDay ? t('caregiver.booking.withdraw.tooLateDay') : t('caregiver.booking.withdraw.tooLate')}
            </p>
          )}
        </>
      )}
      {open ? <WithdrawDialog onClose={() => setOpen(false)} scope={plan.scope} visits={plan.visits} /> : null}
    </section>
  )
}
