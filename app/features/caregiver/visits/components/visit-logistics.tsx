import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { directionsUrl, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { visitPeople } from '../../ui/visit-card'

const actionLink =
  'cg-press inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'

/** Where to go and whom to call, plus the services and the visit's milestones. */
export function VisitLogistics({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const people = visitPeople(visit)
  const emergency = visit.recipientSnapshot?.primaryEmergencyContact
  const milestones = [
    { key: 'acknowledged', at: visit.acknowledgedAt, icon: 'thumb_up' },
    { key: 'noShow', at: visit.noShowReportedAt, icon: 'person_off' }
  ] as const

  return (
    <div className='flex flex-col gap-4'>
      <section aria-labelledby='visit-where' className={`${cgCard} p-4 sm:p-5`}>
        <h2 className='text-sm font-semibold text-on-surface-variant' id='visit-where'>
          {t('caregiver.visitDetail.where')}
        </h2>
        <p className='mt-1 flex items-start gap-2 text-[15px] text-on-surface'>
          <Icon className='mt-0.5 text-lg text-primary' name='location_on' />
          {people.address || t('caregiver.today.next.noAddress')}
        </p>
        {people.address ? (
          <div className='mt-3 flex gap-2'>
            <a className={actionLink} href={directionsUrl(people.address)} rel='noopener noreferrer' target='_blank'>
              <Icon className='text-lg' name='directions' />
              {t('caregiver.ui.actions.directions')}
            </a>
            <button
              aria-label={t('caregiver.visits.card.copyAddress')}
              className='cg-press grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() =>
                void navigator.clipboard
                  ?.writeText(people.address)
                  .then(() => toast.success(t('caregiver.visits.card.addressCopied')))
              }
              type='button'
            >
              <Icon className='text-lg' name='content_copy' />
            </button>
          </div>
        ) : null}
      </section>

      <section aria-labelledby='visit-contact' className={`${cgCard} p-4 sm:p-5`}>
        <h2 className='text-sm font-semibold text-on-surface-variant' id='visit-contact'>
          {t('caregiver.visitDetail.contact.title')}
        </h2>
        <ul className='mt-2 flex flex-col gap-2'>
          {visit.customerPhone ? (
            <li className='flex items-center justify-between gap-3'>
              <span className='min-w-0 text-sm'>
                <span className='block text-on-surface-variant'>{t('caregiver.visitDetail.contact.family')}</span>
                <span className='font-semibold text-on-surface tabular-nums'>{format.phone(visit.customerPhone)}</span>
              </span>
              <a
                aria-label={t('caregiver.ui.actions.callNumber', { phone: format.phone(visit.customerPhone) })}
                className='cg-press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                href={`tel:${visit.customerPhone}`}
              >
                <Icon className='text-xl' name='call' />
              </a>
            </li>
          ) : null}
          {emergency?.phoneNumber ? (
            <li className='flex items-center justify-between gap-3'>
              <span className='min-w-0 text-sm'>
                <span className='block text-on-surface-variant'>{t('caregiver.visitDetail.contact.emergency')}</span>
                <span className='font-semibold text-on-surface'>
                  {[emergency.fullName, emergency.relationship].filter(Boolean).join(' · ')}
                </span>
                <span className='block text-on-surface tabular-nums'>{format.phone(emergency.phoneNumber)}</span>
              </span>
              <a
                aria-label={t('caregiver.ui.actions.callNumber', { phone: format.phone(emergency.phoneNumber) })}
                className='cg-press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-outline-variant text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
                href={`tel:${emergency.phoneNumber}`}
              >
                <Icon className='text-xl' name='call' />
              </a>
            </li>
          ) : null}
          {!visit.customerPhone && !emergency?.phoneNumber ? (
            <li className='text-sm text-on-surface-variant'>{t('caregiver.visitDetail.contact.none')}</li>
          ) : null}
        </ul>
      </section>

      {visit.services?.length ? (
        <section aria-labelledby='visit-services' className={`${cgCard} p-4 sm:p-5`}>
          <h2 className='text-sm font-semibold text-on-surface-variant' id='visit-services'>
            {t('caregiver.visitDetail.services')}
          </h2>
          <ul className='mt-2 flex flex-wrap gap-2'>
            {visit.services.map((service, index) => (
              <li
                className='rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-primary'
                key={service.careServiceId ?? index}
              >
                {service.serviceName}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {milestones.some((item) => item.at) ? (
        <section aria-labelledby='visit-timeline' className={`${cgCard} p-4 sm:p-5`}>
          <h2 className='text-sm font-semibold text-on-surface-variant' id='visit-timeline'>
            {t('caregiver.visitDetail.timeline.title')}
          </h2>
          <ol className='mt-2 flex flex-col gap-2'>
            {milestones
              .filter((item) => item.at)
              .map((item) => (
                <li className='flex items-center gap-2.5 text-sm' key={item.key}>
                  <span className='grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-primary'>
                    <Icon className='text-base' name={item.icon} />
                  </span>
                  <span className='flex-1 text-on-surface'>{t(`caregiver.visitDetail.timeline.${item.key}`)}</span>
                  <span className='text-on-surface-variant tabular-nums'>{format.shortDateTime(item.at)}</span>
                </li>
              ))}
          </ol>
        </section>
      ) : null}
    </div>
  )
}
