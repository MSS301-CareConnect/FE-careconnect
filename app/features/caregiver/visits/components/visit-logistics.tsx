import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { formatPhone, phoneHref } from '~/shared/lib/phone'
import { Icon } from '~/shared/ui/icon'

import { directionsUrl, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { visitPeople } from '../../ui/visit-card'
import { VisitBooking } from './visit-booking'

const actionLink =
  'cg-press inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'

/**
 * One person to call: who they are, the number grouped for reading and a call button. BookingService hides the middle
 * digits of the customer's number until 24 hours before the visit; such a number is shown with dots and a note, and
 * has no call button because it cannot be dialled.
 */
function ContactRow({
  label,
  name,
  phone,
  primary = false
}: {
  label: string
  name?: string
  phone: string
  primary?: boolean
}) {
  const { t } = useTranslation()
  const href = phoneHref(phone)
  const shown = formatPhone(phone)
  return (
    <li className='flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0'>
      <div className='min-w-0 text-sm'>
        <p className='text-on-surface-variant'>{label}</p>
        {name ? <p className='font-semibold break-words text-on-surface'>{name}</p> : null}
        <p className='mt-0.5 text-[15px] font-semibold tracking-wide whitespace-nowrap text-on-surface tabular-nums'>
          {shown}
        </p>
        {href ? null : (
          <p className='mt-1 flex items-start gap-1 text-xs text-on-surface-variant'>
            <Icon className='text-sm' name='lock_clock' />
            {t('caregiver.visitDetail.contact.masked')}
          </p>
        )}
      </div>
      {href ? (
        <a
          aria-label={t('caregiver.ui.actions.callNumber', { phone: shown })}
          className={`cg-press grid h-11 w-11 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            primary
              ? 'bg-primary text-on-primary hover:bg-primary-container'
              : 'border border-outline-variant text-primary hover:bg-brand-50'
          }`}
          href={href}
        >
          <Icon className='text-xl' name='call' />
        </a>
      ) : null}
    </li>
  )
}

/** Where to go and whom to call, the booking (customer, shift, price, services) and the visit's milestones. */
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
        <ul className='mt-2 flex flex-col divide-y divide-outline-variant'>
          {visit.customerPhone ? (
            <ContactRow
              label={t('caregiver.visitDetail.contact.family')}
              name={visit.customerName}
              phone={visit.customerPhone}
              primary
            />
          ) : null}
          {emergency?.phoneNumber ? (
            <ContactRow
              label={t('caregiver.visitDetail.contact.emergency')}
              name={[emergency.fullName, emergency.relationship].filter(Boolean).join(' · ')}
              phone={emergency.phoneNumber}
            />
          ) : null}
          {!visit.customerPhone && !emergency?.phoneNumber ? (
            <li className='text-sm text-on-surface-variant'>{t('caregiver.visitDetail.contact.none')}</li>
          ) : null}
        </ul>
      </section>

      <VisitBooking visit={visit} />

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
