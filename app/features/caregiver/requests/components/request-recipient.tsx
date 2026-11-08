import { useTranslation } from 'react-i18next'

import type { CaregiverBookingRequestRecord } from '~/shared/api/generated/contracts'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'

import { cgCard } from '../../ui/caregiver-page'
import { AllergyCallout } from '../../visits/components/care-profile'
import { useRequestSummary } from '../hooks/use-request-summary'

const MOBILITY = ['INDEPENDENT', 'NEEDS_ASSISTANCE', 'WHEELCHAIR', 'BEDRIDDEN'] as const
const INDEPENDENCE = ['INDEPENDENT', 'PARTIALLY_DEPENDENT', 'FULLY_DEPENDENT'] as const

/**
 * The person cared for, as far as the caregiver may see before payment: name, age, gender and health (mobility,
 * conditions, allergies, care needs, diet, behaviour, how many medicines). Address, phones and medicine names stay
 * hidden until the customer pays.
 */
export function RequestRecipient({ request }: { request: CaregiverBookingRequestRecord }) {
  const { t } = useTranslation()
  const summary = useRequestSummary(request)
  const mobility = MOBILITY.find((value) => value === request.mobilityLevel)
  const independence = INDEPENDENCE.find((value) => value === request.independenceLevel)

  const sections = [
    {
      key: 'mobility',
      icon: 'accessible',
      value: [
        mobility ? t(`caregiver.visitDetail.care.mobilityLevels.${mobility}`) : null,
        independence ? t(`caregiver.visitDetail.care.independenceLevels.${independence}`) : null
      ]
        .filter(Boolean)
        .join(' · ')
    },
    { key: 'chronicConditions', icon: 'monitor_heart', value: request.chronicConditions },
    { key: 'requirements', icon: 'assignment', value: request.careRequirements },
    { key: 'diet', icon: 'restaurant', value: request.dietaryNotes },
    { key: 'behavior', icon: 'psychology', value: request.behaviorNotes }
  ] as const
  const filled = sections.filter((section) => Boolean(section.value))
  const medicationCount = request.medicationCount ?? 0

  return (
    <section aria-labelledby='request-recipient' className={`${cgCard} flex flex-col gap-4 p-4 sm:p-5`}>
      <div className='flex items-center gap-3'>
        <Avatar className='h-12 w-12 rounded-full text-base' decorative name={summary.recipientName} />
        <div className='min-w-0'>
          <h2 className='text-xs font-medium text-on-surface-variant' id='request-recipient'>
            {t('caregiver.requests.detail.recipient.title')}
          </h2>
          <p className='truncate text-lg font-semibold text-on-surface'>{summary.recipientName}</p>
          {summary.recipientMeta ? <p className='text-sm text-on-surface-variant'>{summary.recipientMeta}</p> : null}
        </div>
      </div>

      {request.allergies ? <AllergyCallout value={request.allergies} /> : null}

      {filled.length ? (
        <dl className='grid gap-3 sm:grid-cols-2'>
          {filled.map((section) => (
            <div className='rounded-lg bg-surface-container-low p-3' key={section.key}>
              <dt className='flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant'>
                <Icon className='text-base text-primary' name={section.icon} />
                {t(`caregiver.visitDetail.care.${section.key}`)}
              </dt>
              <dd className='mt-1 text-sm whitespace-pre-line text-on-surface'>{section.value}</dd>
            </div>
          ))}
        </dl>
      ) : !request.allergies ? (
        <p className='text-sm text-on-surface-variant'>{t('caregiver.requests.detail.recipient.noNotes')}</p>
      ) : null}

      <p className='flex items-center gap-2 text-sm text-on-surface'>
        <Icon className='text-lg text-primary' name='medication' />
        {medicationCount > 0
          ? t('caregiver.requests.detail.recipient.medications', { count: medicationCount })
          : t('caregiver.requests.detail.recipient.noMedication')}
      </p>

      <p className='flex items-start gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant'>
        <Icon className='text-sm' name='lock' />
        {t('caregiver.requests.detail.recipient.locked')}
      </p>
    </section>
  )
}
