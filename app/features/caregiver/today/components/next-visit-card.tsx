import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { nextVisitStep, useVisitActions } from '../../data/use-visit-actions'
import { calendarDayOf, directionsUrl, minutesBetweenInstants, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgForestCard } from '../../ui/caregiver-page'
import { Countdown } from '../../ui/countdown'
import { visitPeople } from '../../ui/visit-card'
import { VisitStatusBadge } from '../../ui/visit-status-badge'

const glass =
  'cg-press inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white'

const mainAction =
  'cg-press inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-peach-300 px-5 text-base font-semibold text-forest-950 shadow-[0_14px_30px_-14px_rgb(246_146_95/0.9)] hover:bg-peach-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-200 disabled:opacity-60'

/**
 * The next visit as the forest hero of the Today bento ("Soft Bento", 2026-11-09): when (large), a countdown, who,
 * where, the allergy alert and the one thing to do now as the peach call to action.
 */
export function NextVisitCard({ visit, now, today }: { visit: CaregiverOccurrenceRecord; now: number; today: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const format = useCaregiverFormat()
  const people = visitPeople(visit)
  const step = nextVisitStep(visit, now)
  const detail = `/caregiver/visits/${visit.id}`
  const { accept, start } = useVisitActions(visit, () => void navigate(detail))
  const day = calendarDayOf(visit.startAt)
  const running = visit.status === 'IN_PROGRESS'
  const name = people.name ?? t('caregiver.visits.patientFallback')
  const gender =
    people.gender === 'MALE' || people.gender === 'FEMALE' || people.gender === 'OTHER'
      ? t(`caregiver.ui.gender.${people.gender}`)
      : null
  const pending = step === 'accept' ? accept.isPending : step === 'start' ? start.isPending : false

  return (
    <section aria-labelledby='next-visit-title' className={`${cgForestCard} p-5 sm:p-6`}>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2
          className='inline-flex items-center gap-2 rounded-full bg-mint-300 px-3 py-1 text-[13px] font-bold text-forest-950'
          id='next-visit-title'
        >
          {running
            ? t('caregiver.today.next.now')
            : day === today
              ? t('caregiver.today.next.label')
              : t('caregiver.today.next.laterDay', { day: format.relativeDay(day, today) })}
        </h2>
        {running ? (
          <VisitStatusBadge status={visit.status} />
        ) : (
          <Countdown kind='startsIn' onDark target={visit.startAt} warnMs={60 * 60 * 1000} />
        )}
      </div>

      <div className='mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-end'>
        <div>
          <p className='text-[40px] leading-none font-bold tracking-tight tabular-nums sm:text-[50px]'>
            {format.clockRange(visit.startAt, visit.endAt)}
          </p>
          <p className='mt-2 text-sm text-white/70 tabular-nums'>
            {format.duration(minutesBetweenInstants(visit.startAt, visit.endAt))}
            {visit.services?.length
              ? ` · ${visit.services
                  .map((service) => service.serviceName)
                  .filter(Boolean)
                  .join(', ')}`
              : ''}
          </p>
        </div>

        <div className='rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10'>
          <p className='text-lg font-semibold'>
            <Link className='hover:underline focus-visible:outline-2 focus-visible:outline-white' to={detail}>
              {name}
            </Link>
            {people.age !== undefined || gender ? (
              <span className='font-normal text-white/65'>
                {' · '}
                {[people.age !== undefined ? t('caregiver.ui.age', { count: people.age }) : null, gender]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            ) : null}
          </p>
          <p className='mt-1 flex items-start gap-1.5 text-[15px] text-white/75'>
            <Icon className='mt-0.5 shrink-0 text-lg text-mint-300' name='location_on' />
            {people.address || t('caregiver.today.next.noAddress')}
          </p>
        </div>
      </div>

      {people.allergies ? (
        <p
          className='mt-4 flex items-start gap-2 rounded-2xl bg-peach-100 px-4 py-3 text-sm font-semibold text-peach-700'
          role='note'
        >
          <Icon className='text-lg' filled name='warning' />
          {t('caregiver.today.next.allergyAlert', { value: people.allergies })}
        </p>
      ) : null}

      <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
        {people.address || people.phone ? (
          <div className='flex gap-2 sm:flex-1'>
            {people.address ? (
              <a className={glass} href={directionsUrl(people.address)} rel='noopener noreferrer' target='_blank'>
                <Icon className='text-lg' name='directions' />
                {t('caregiver.ui.actions.directions')}
              </a>
            ) : null}
            {people.phone ? (
              <a
                aria-label={t('caregiver.ui.actions.callNumber', { phone: format.phone(people.phone) })}
                className={glass}
                href={`tel:${people.phone}`}
              >
                <Icon className='text-lg' name='call' />
                {t('caregiver.ui.actions.call')}
              </a>
            ) : null}
          </div>
        ) : null}

        <div className='sm:flex-1'>
          {step === 'accept' || step === 'start' ? (
            <button
              aria-busy={pending || undefined}
              className={mainAction}
              disabled={pending}
              onClick={() => (step === 'accept' ? accept.mutate() : start.mutate())}
              type='button'
            >
              <Icon
                className={`text-xl ${pending ? 'animate-spin' : ''}`}
                name={pending ? 'progress_activity' : step === 'accept' ? 'thumb_up' : 'play_arrow'}
              />
              {step === 'accept' ? t('caregiver.visits.card.accept') : t('caregiver.visits.card.start')}
            </button>
          ) : (
            <Link className={mainAction} to={detail}>
              <Icon className='text-xl' name={step === 'continue' ? 'checklist' : 'arrow_forward'} />
              {step === 'continue' ? t('caregiver.visits.card.continue') : t('caregiver.ui.actions.viewDetail')}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
