import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { fetchCertificates, providerKeys } from '~/entities/provider/provider-api'
import { Icon } from '~/shared/ui/icon'

import { useMyRegistrations, useOpenShifts } from '../../data/caregiver-queries'
import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'

const DAY_MS = 24 * 60 * 60 * 1000
const EXPIRY_WARNING_MS = 30 * DAY_MS

interface AttentionItem {
  key: string
  icon: string
  text: string
  action: string
  to: string
  tone: 'warning' | 'info'
}

/**
 * Things only the caregiver can move forward: visits to accept, shift sign-ups that close within a day, and a profile
 * without a valid certificate.
 */
export function NeedsAttention({
  toAccept,
  profileId,
  centerId,
  now
}: {
  toAccept: number
  profileId?: string
  centerId?: string
  now: number
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const shifts = useOpenShifts(centerId)
  const registrations = useMyRegistrations()
  const certificates = useQuery({
    queryKey: providerKeys.certificates(profileId ?? ''),
    queryFn: () => fetchCertificates(profileId ?? ''),
    enabled: Boolean(profileId),
    retry: false
  })

  const registered = new Set(
    (registrations.data?.items ?? [])
      .filter((item) => item.registrationStatus === 'PENDING' || item.registrationStatus === 'APPROVED')
      .map((item) => item.workShiftId)
  )
  const closing = (shifts.data?.items ?? []).find((shift) => {
    if (!shift.registrationDeadline || registered.has(shift.id)) return false
    const left = new Date(shift.registrationDeadline).getTime() - now
    return left > 0 && left < DAY_MS
  })
  const expiring = (certificates.data ?? []).filter(
    (item) => item.expiryDate && new Date(`${item.expiryDate}T00:00:00`).getTime() - now < EXPIRY_WARNING_MS
  ).length

  const items: AttentionItem[] = [
    ...(toAccept > 0
      ? [
          {
            key: 'accept',
            icon: 'assignment_late',
            text: t('caregiver.today.attention.toAccept', { count: toAccept }),
            action: t('caregiver.today.attention.toAcceptAction'),
            to: '/caregiver/visits?tab=toAccept',
            tone: 'warning' as const
          }
        ]
      : []),
    ...(closing
      ? [
          {
            key: 'shift',
            icon: 'timer',
            text: t('caregiver.today.attention.shiftClosing', { day: format.shortDay(closing.workDate) }),
            action: t('caregiver.today.attention.shiftAction'),
            to: '/caregiver/work-shifts',
            tone: 'warning' as const
          }
        ]
      : []),
    ...(certificates.isSuccess && certificates.data.length === 0
      ? [
          {
            key: 'certificates',
            icon: 'workspace_premium',
            text: t('caregiver.today.attention.noCertificates'),
            action: t('caregiver.today.attention.certificateAction'),
            to: '/caregiver/profile?tab=certificates',
            tone: 'info' as const
          }
        ]
      : expiring > 0
        ? [
            {
              key: 'expiring',
              icon: 'workspace_premium',
              text: t('caregiver.today.attention.expiredCertificate', { count: expiring }),
              action: t('caregiver.today.attention.certificateAction'),
              to: '/caregiver/profile?tab=certificates',
              tone: 'warning' as const
            }
          ]
        : [])
  ]

  return (
    <section aria-labelledby='needs-attention' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='mb-2 text-base font-semibold text-on-surface' id='needs-attention'>
        {t('caregiver.today.attention.title')}
      </h2>
      {items.length === 0 ? (
        <p className='flex items-center gap-2 text-sm text-on-surface-variant'>
          <Icon className='text-lg text-success' name='task_alt' />
          {t('caregiver.today.attention.allClear')}
        </p>
      ) : (
        <ul className='cg-stagger flex flex-col gap-2'>
          {items.map((item) => (
            <li key={item.key}>
              <Link
                className='cg-press flex min-h-12 items-center gap-3 rounded-lg border border-outline-variant px-3 py-2 hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
                to={item.to}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${item.tone === 'warning' ? 'bg-warning-container text-on-warning-container' : 'bg-info-container text-on-info-container'}`}
                >
                  <Icon className='text-lg' name={item.icon} />
                </span>
                <span className='min-w-0 flex-1 text-sm font-medium text-on-surface'>{item.text}</span>
                <span className='flex shrink-0 items-center text-sm font-semibold text-primary'>
                  {item.action}
                  <Icon className='text-lg' name='chevron_right' />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
