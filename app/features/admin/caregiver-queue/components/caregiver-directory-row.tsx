import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import type { ProviderCaregiverRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

const key = 'admin.caregiverQueuePage' as const
const statusKeys = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const
const verificationKeys = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const

/**
 * One caregiver of the admin directory: who they are, both states (profile review and work status) and what the admin
 * can do — decide a pending profile here, or open the profile with its certificates on the center's page.
 */
export function CaregiverDirectoryRow({
  caregiver,
  busy,
  onApprove,
  onReject
}: {
  caregiver: ProviderCaregiverRecord
  busy: boolean
  onApprove: () => void
  onReject: () => void
}) {
  const { t, i18n } = useTranslation()
  const rating =
    caregiver.ratingCount && caregiver.ratingAverage
      ? t(`${key}.rating`, {
          average: new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(caregiver.ratingAverage),
          count: caregiver.ratingCount
        })
      : t(`${key}.noRating`)
  return (
    <li className='flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-mint-50/60'>
      <CaregiverAvatar caregiverId={caregiver.id} className='h-12 w-12 rounded-full' name={caregiver.fullName} />
      <div className='min-w-0 flex-1 basis-56'>
        <p className='truncate font-semibold text-on-surface'>{caregiver.fullName}</p>
        <p className='mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-on-surface-variant tabular-nums'>
          <span className='inline-flex items-center gap-1'>
            <Icon className='text-sm' name='work_history' />
            {t(`${key}.experience`, { count: caregiver.experienceYears ?? 0 })}
          </span>
          <span className='inline-flex items-center gap-1'>
            <Icon className='text-sm' name='star' />
            {rating}
          </span>
        </p>
        {caregiver.verificationStatus === 'REJECTED' && caregiver.verificationReason ? (
          <p className='mt-1 text-xs text-error'>
            {t(`${key}.rejectedBecause`, { reason: caregiver.verificationReason })}
          </p>
        ) : null}
      </div>
      <dl className='flex flex-wrap items-center gap-x-5 gap-y-2 text-xs'>
        <div>
          <dt className='mb-1 text-on-surface-variant'>{t(`${key}.columns.verification`)}</dt>
          <dd>
            <ProviderStatusBadge status={caregiver.verificationStatus}>
              {t(`admin.provider.${verificationKeys[caregiver.verificationStatus]}`)}
            </ProviderStatusBadge>
          </dd>
        </div>
        <div>
          <dt className='mb-1 text-on-surface-variant'>{t(`${key}.columns.status`)}</dt>
          <dd>
            <ProviderStatusBadge status={caregiver.caregiverStatus}>
              {t(`admin.provider.${statusKeys[caregiver.caregiverStatus]}`)}
            </ProviderStatusBadge>
          </dd>
        </div>
      </dl>
      <div className='flex flex-wrap items-center justify-end gap-2 sm:ml-auto'>
        {caregiver.verificationStatus === 'PENDING' ? (
          <>
            <Button disabled={busy} onClick={onApprove} size='sm'>
              {t(`${key}.approve`)}
            </Button>
            <Button disabled={busy} onClick={onReject} size='sm' variant='outline'>
              {t(`${key}.reject`)}
            </Button>
          </>
        ) : null}
        <Link
          aria-label={t(`${key}.openProfileOf`, { name: caregiver.fullName })}
          className='inline-flex min-h-9 items-center gap-1 rounded-full bg-mint-50 px-3.5 text-sm font-semibold text-forest-800 transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-forest-900'
          to={`/admin/centers/${caregiver.centerId}/caregivers?caregiver=${caregiver.id}`}
        >
          {t(`${key}.openProfile`)}
          <Icon className='text-base' name='chevron_right' />
        </Link>
      </div>
    </li>
  )
}
