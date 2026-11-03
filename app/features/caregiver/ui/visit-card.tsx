import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

import { nextVisitStep, useVisitActions } from '../data/use-visit-actions'
import { OverflowMenu, type MenuAction } from './action-bits'
import { calendarDayOf, directionsUrl, minutesBetweenInstants, useCaregiverFormat } from './caregiver-format'
import { Countdown } from './countdown'
import { cgCard } from './caregiver-page'
import { VisitStatusBadge } from './visit-status-badge'

/** Who and where a visit is for, from the booking snapshot when the caregiver may read it. */
export function visitPeople(visit: CaregiverOccurrenceRecord) {
  const snapshot = visit.recipientSnapshot
  const address =
    visit.serviceAddress ||
    [snapshot?.addressLine, snapshot?.ward, snapshot?.district, snapshot?.province].filter(Boolean).join(', ')
  const allergies = snapshot?.allergies || visit.specialNotes?.allergies
  return {
    name: visit.recipientName || snapshot?.fullName,
    age: snapshot?.age,
    gender: snapshot?.gender,
    address,
    allergies,
    phone: visit.customerPhone || snapshot?.primaryEmergencyContact?.phoneNumber
  }
}

/**
 * One visit: the time first and large, then who and where, the status and exactly one next action. The whole card
 * opens the detail; secondary actions sit in the "⋯" menu.
 */
export function VisitCard({
  visit,
  now,
  showDate = false
}: {
  visit: CaregiverOccurrenceRecord
  now: number
  showDate?: boolean
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const format = useCaregiverFormat()
  const people = visitPeople(visit)
  const step = nextVisitStep(visit, now)
  const { accept, start } = useVisitActions(visit, () => void navigate(`/caregiver/visits/${visit.id}`))
  const detail = `/caregiver/visits/${visit.id}`
  const name = people.name ?? t('caregiver.visits.patientFallback')
  const meta = [
    people.age !== undefined ? t('caregiver.ui.age', { count: people.age }) : null,
    people.gender && (people.gender === 'MALE' || people.gender === 'FEMALE' || people.gender === 'OTHER')
      ? t(`caregiver.ui.gender.${people.gender}`)
      : null
  ].filter(Boolean)

  const menu: MenuAction[] = [
    {
      key: 'open',
      label: t('caregiver.ui.actions.viewDetail'),
      icon: 'open_in_new',
      onSelect: () => void navigate(detail)
    },
    ...(people.address
      ? [
          {
            key: 'directions',
            label: t('caregiver.ui.actions.directions'),
            icon: 'directions',
            onSelect: () => window.open(directionsUrl(people.address), '_blank', 'noopener')
          }
        ]
      : []),
    ...(people.phone
      ? [
          {
            key: 'call',
            label: t('caregiver.ui.actions.callNumber', { phone: format.phone(people.phone) }),
            icon: 'call',
            onSelect: () => window.location.assign(`tel:${people.phone}`)
          }
        ]
      : [])
  ]

  return (
    <article
      className={`${cgCard} cg-press group relative flex flex-col gap-3 p-4 hover:border-brand-200 hover:shadow-[var(--cg-shadow-2)] sm:p-5`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-[22px] leading-tight font-bold text-on-surface tabular-nums'>
            {format.clockRange(visit.startAt, visit.endAt)}
          </p>
          <p className='mt-0.5 text-sm text-on-surface-variant tabular-nums'>
            {showDate ? `${format.shortDay(calendarDayOf(visit.startAt))} · ` : ''}
            {format.duration(minutesBetweenInstants(visit.startAt, visit.endAt))}
          </p>
        </div>
        <div className='flex shrink-0 flex-col items-end gap-1'>
          <VisitStatusBadge status={visit.status} />
          {visit.noShowReportedAt && !visit.noShowDecidedAt ? (
            <StatusBadge tone='warning'>{t('caregiver.visits.noShowPending')}</StatusBadge>
          ) : null}
        </div>
      </div>

      <div className='min-w-0'>
        <h3 className='text-base font-semibold text-on-surface'>
          <Link
            aria-label={t('caregiver.visits.openLabel', { name, number: visit.occurrenceNo })}
            className='after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary'
            to={detail}
          >
            {name}
          </Link>
          {meta.length ? <span className='font-normal text-on-surface-variant'> · {meta.join(' · ')}</span> : null}
        </h3>
        {people.address ? (
          <p className='mt-1 flex items-start gap-1.5 text-sm text-on-surface-variant'>
            <Icon className='mt-0.5 shrink-0 text-base text-primary' name='location_on' />
            <span className='line-clamp-1'>{people.address}</span>
          </p>
        ) : null}
        {visit.services?.length ? (
          <p className='mt-1 flex items-start gap-1.5 text-sm text-on-surface-variant'>
            <Icon className='mt-0.5 shrink-0 text-base text-primary' name='medical_services' />
            <span className='line-clamp-1'>
              {visit.services
                .map((service) => service.serviceName)
                .filter(Boolean)
                .join(' · ')}
            </span>
          </p>
        ) : null}
        {people.allergies ? (
          <p className='mt-2 inline-flex items-center gap-1.5 rounded-md bg-error-container px-2 py-1 text-xs font-semibold text-on-error-container'>
            <Icon className='text-sm' name='warning' />
            <span className='line-clamp-1'>{t('caregiver.today.next.allergyAlert', { value: people.allergies })}</span>
          </p>
        ) : null}
      </div>

      <div className='relative z-10 flex items-center gap-2'>
        {step === 'accept' ? (
          <Button
            className='cg-press flex-1 sm:flex-none'
            leftIcon={<Icon className='text-lg' name='thumb_up' />}
            loading={accept.isPending}
            onClick={() => accept.mutate()}
          >
            {t('caregiver.visits.card.accept')}
          </Button>
        ) : step === 'start' ? (
          <Button
            className='cg-press flex-1 sm:flex-none'
            leftIcon={<Icon className='text-lg' name='play_arrow' />}
            loading={start.isPending}
            onClick={() => start.mutate()}
          >
            {t('caregiver.visits.card.start')}
          </Button>
        ) : step === 'continue' ? (
          <Link
            className='cg-press inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex-none'
            to={detail}
          >
            <Icon className='text-lg' name='checklist' />
            {t('caregiver.visits.card.continue')}
          </Link>
        ) : step === 'waitToStart' ? (
          <Countdown kind='startsIn' target={visit.startAt} warnMs={60 * 60 * 1000} />
        ) : (
          <span className='flex-1' />
        )}
        <span className='ml-auto'>
          <OverflowMenu actions={menu} />
        </span>
      </div>
    </article>
  )
}
