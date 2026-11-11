import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

import { nextVisitStep, useVisitActions } from '../../data/use-visit-actions'
import { minutesBetweenInstants, useCaregiverFormat } from '../../ui/caregiver-format'
import { VisitAbsenceBadge } from '../../ui/visit-absence-badge'
import { VISIT_TONE, VisitStatusBadge } from '../../ui/visit-status-badge'
import { visitServiceNames } from './visit-day-digest'

const RAIL: Record<string, string> = {
  warning: 'bg-peach-300',
  info: 'bg-forest-700',
  active: 'bg-mint-400',
  success: 'bg-mint-300',
  error: 'bg-error',
  neutral: 'bg-outline-variant'
}

/**
 * One visit inside a day of the booking page (2026-11-10): hours as a time column, the services, the status (and
 * absence or replacement state) and the one next step — accept, start, continue — or a link to the visit.
 */
export function BookingVisitRow({ visit, now }: { visit: CaregiverOccurrenceRecord; now: number }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const format = useCaregiverFormat()
  const detail = `/caregiver/visits/${visit.id}`
  const step = nextVisitStep(visit, now)
  const { accept, start } = useVisitActions(visit, () => void navigate(detail))
  const services = visitServiceNames(visit) || t('caregiver.booking.row.noService')
  const closed = visit.status === 'CANCELLED' || visit.status === 'EXPIRED'

  return (
    <li className='group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-mint-50/60'>
      <span
        aria-hidden='true'
        className={`h-11 w-1 shrink-0 rounded-full ${RAIL[VISIT_TONE[visit.status]] ?? RAIL.neutral}`}
      />
      <span className='w-[4.5rem] shrink-0 leading-tight tabular-nums'>
        <span
          className={`block text-[15px] font-bold ${closed ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}
        >
          {format.clock(visit.startAt)}
        </span>
        <span className='block text-xs text-on-surface-variant'>{format.clock(visit.endAt)}</span>
      </span>
      <span className='min-w-0 flex-1'>
        <Link
          aria-label={t('caregiver.booking.row.open', { number: visit.occurrenceNo, services })}
          className='block truncate text-sm font-semibold text-on-surface after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-primary'
          to={detail}
        >
          {services}
        </Link>
        <span className='mt-1 flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant tabular-nums'>
          {t('caregiver.booking.row.visitNo', { number: visit.occurrenceNo })}
          <span aria-hidden='true'>·</span>
          {format.duration(minutesBetweenInstants(visit.startAt, visit.endAt))}
          <VisitStatusBadge status={visit.status} />
          <VisitAbsenceBadge visit={visit} />
          {visit.needsReassignment ? (
            <StatusBadge tone='caution'>{t('caregiver.booking.badge.replacing')}</StatusBadge>
          ) : null}
        </span>
      </span>
      <span className='relative z-10 flex shrink-0 items-center gap-1'>
        {step === 'accept' && !visit.needsReassignment ? (
          <Button
            leftIcon={<Icon className='text-base' name='thumb_up' />}
            loading={accept.isPending}
            onClick={() => accept.mutate()}
            size='sm'
            variant='dark'
          >
            {t('caregiver.visits.card.accept')}
          </Button>
        ) : step === 'start' ? (
          <Button
            leftIcon={<Icon className='text-base' name='play_arrow' />}
            loading={start.isPending}
            onClick={() => start.mutate()}
            size='sm'
            variant='dark'
          >
            {t('caregiver.visits.card.start')}
          </Button>
        ) : (
          <Icon
            aria-hidden='true'
            className='text-xl text-on-surface-variant transition-transform group-hover:translate-x-0.5'
            name='chevron_right'
          />
        )}
      </span>
    </li>
  )
}
