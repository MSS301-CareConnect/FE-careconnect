import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import type { ProviderCaregiverRecord, VerificationRequest } from '~/shared/api/generated/contracts'

interface PendingCaregiverCardProps {
  caregiver: ProviderCaregiverRecord
  busy: boolean
  onDecide: (request: VerificationRequest) => void
}

export function PendingCaregiverCard({ caregiver, busy, onDecide }: PendingCaregiverCardProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  return (
    <li className='rounded-xl border border-outline-variant/60 bg-white p-4 text-sm'>
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div className='flex items-center gap-3'>
          <CaregiverAvatar caregiverId={caregiver.id} className='h-10 w-10 rounded-full' name={caregiver.fullName} />
          <div>
            <p className='font-semibold'>{caregiver.fullName}</p>
            <p className='text-xs text-on-surface-variant'>
              {caregiver.centerName ?? t('common.ui.unknownName')} ·{' '}
              {t('admin.caregiverQueuePage.experience', { count: caregiver.experienceYears ?? 0 })}
            </p>
          </div>
        </div>
        <Link
          className='text-xs font-semibold text-primary underline'
          to={`/admin/centers/${caregiver.centerId}/caregivers`}
        >
          {t('admin.caregiverQueuePage.openCenter')}
        </Link>
      </div>
      {caregiver.bio ? <p className='mt-2 text-on-surface-variant'>{caregiver.bio}</p> : null}
      <div className='mt-3 flex flex-wrap items-end gap-2'>
        <button
          className='rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-50'
          disabled={busy}
          onClick={() => onDecide({ status: 'VERIFIED', version: caregiver.version })}
          type='button'
        >
          {t('admin.caregiverQueuePage.approve')}
        </button>
        <label className='flex min-w-48 flex-1 flex-col text-xs font-medium'>
          {t('admin.caregiverQueuePage.reason')}
          <input
            className='mt-1 rounded-lg border border-outline-variant px-3 py-2 text-sm'
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            value={reason}
          />
        </label>
        <button
          className='rounded-lg border border-error px-3 py-2 text-xs font-semibold text-error disabled:opacity-50'
          disabled={busy || !reason.trim()}
          onClick={() => onDecide({ status: 'REJECTED', reason: reason.trim(), version: caregiver.version })}
          type='button'
        >
          {t('admin.caregiverQueuePage.reject')}
        </button>
      </div>
    </li>
  )
}
