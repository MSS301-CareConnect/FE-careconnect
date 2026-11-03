import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { nextVisitStep, useVisitActions } from '../../data/use-visit-actions'
import { calendarDayOf, directionsUrl, minutesBetweenInstants, useCaregiverFormat } from '../../ui/caregiver-format'
import { Countdown } from '../../ui/countdown'
import { visitPeople } from '../../ui/visit-card'
import { VisitStatusBadge } from '../../ui/visit-status-badge'

const secondary =
  'cg-press inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'

/** The next visit, large: when, a countdown, who, where, the allergy alert and the one thing to do now. */
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

  return (
    <section
      aria-labelledby='next-visit-title'
      className='overflow-hidden rounded-2xl border border-brand-200 bg-surface-container-lowest shadow-[var(--cg-shadow-2)]'
    >
      <div className='bg-brand-50 px-4 pt-4 pb-3 sm:px-5'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <h2 className='text-sm font-semibold text-primary' id='next-visit-title'>
            {running
              ? t('caregiver.today.next.now')
              : day === today
                ? t('caregiver.today.next.label')
                : t('caregiver.today.next.laterDay', { day: format.relativeDay(day, today) })}
          </h2>
          {running ? (
            <VisitStatusBadge status={visit.status} />
          ) : (
            <Countdown kind='startsIn' target={visit.startAt} warnMs={60 * 60 * 1000} />
          )}
        </div>
        <p className='mt-1 text-[32px] leading-tight font-bold text-on-surface tabular-nums sm:text-4xl'>
          {format.clockRange(visit.startAt, visit.endAt)}
        </p>
        <p className='text-sm text-on-surface-variant tabular-nums'>
          {format.duration(minutesBetweenInstants(visit.startAt, visit.endAt))}
          {visit.services?.length
            ? ` · ${visit.services
                .map((service) => service.serviceName)
                .filter(Boolean)
                .join(', ')}`
            : ''}
        </p>
      </div>

      <div className='flex flex-col gap-3 px-4 py-4 sm:px-5'>
        <div>
          <p className='text-lg font-semibold text-on-surface'>
            <Link className='hover:underline focus-visible:outline-2 focus-visible:outline-primary' to={detail}>
              {name}
            </Link>
            {people.age !== undefined || gender ? (
              <span className='font-normal text-on-surface-variant'>
                {' · '}
                {[people.age !== undefined ? t('caregiver.ui.age', { count: people.age }) : null, gender]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            ) : null}
          </p>
          <p className='mt-1 flex items-start gap-1.5 text-[15px] text-on-surface-variant'>
            <Icon className='mt-0.5 shrink-0 text-lg text-primary' name='location_on' />
            {people.address || t('caregiver.today.next.noAddress')}
          </p>
        </div>

        {people.allergies ? (
          <p
            className='flex items-start gap-2 rounded-lg border border-error/25 bg-error-container px-3 py-2.5 text-sm font-semibold text-on-error-container'
            role='note'
          >
            <Icon className='text-lg' filled name='warning' />
            {t('caregiver.today.next.allergyAlert', { value: people.allergies })}
          </p>
        ) : null}

        <div className='flex gap-2'>
          {people.address ? (
            <a className={secondary} href={directionsUrl(people.address)} rel='noopener noreferrer' target='_blank'>
              <Icon className='text-lg' name='directions' />
              {t('caregiver.ui.actions.directions')}
            </a>
          ) : null}
          {people.phone ? (
            <a
              aria-label={t('caregiver.ui.actions.callNumber', { phone: format.phone(people.phone) })}
              className={secondary}
              href={`tel:${people.phone}`}
            >
              <Icon className='text-lg' name='call' />
              {t('caregiver.ui.actions.call')}
            </a>
          ) : null}
        </div>

        {step === 'accept' ? (
          <Button
            leftIcon={<Icon className='text-xl' name='thumb_up' />}
            loading={accept.isPending}
            onClick={() => accept.mutate()}
            size='lg'
          >
            {t('caregiver.visits.card.accept')}
          </Button>
        ) : step === 'start' ? (
          <Button
            leftIcon={<Icon className='text-xl' name='play_arrow' />}
            loading={start.isPending}
            onClick={() => start.mutate()}
            size='lg'
          >
            {t('caregiver.visits.card.start')}
          </Button>
        ) : (
          <Link
            className='cg-press inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={detail}
          >
            <Icon className='text-xl' name={step === 'continue' ? 'checklist' : 'arrow_forward'} />
            {step === 'continue' ? t('caregiver.visits.card.continue') : t('caregiver.ui.actions.viewDetail')}
          </Link>
        )}
      </div>
    </section>
  )
}
