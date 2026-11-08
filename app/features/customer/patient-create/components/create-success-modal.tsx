import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { CareRecipientRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

export interface CreateSuccessModalProps {
  profile: CareRecipientRecord | undefined
  onClose: () => void
}

export function CreateSuccessModal({ profile, onClose }: CreateSuccessModalProps) {
  const { t } = useTranslation()

  if (!profile) return null

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='createSuccessTitle'
      className='fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 p-4 backdrop-blur-sm'
    >
      <div className='flex w-full max-w-md flex-col items-center rounded-2xl bg-surface-container-lowest p-6 text-center shadow-2xl sm:p-8'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container/40 text-primary'>
          <Icon name='verified' className='text-4xl' />
        </div>

        <h3 id='createSuccessTitle' className='text-xl font-bold text-on-surface'>
          {t('customer.patientCreate.modal.title')}
        </h3>

        <p className='mt-2 mb-6 text-sm text-on-surface-variant leading-relaxed'>
          {t('customer.patientCreate.modal.desc', { name: profile.fullName })}
        </p>

        <div className='flex w-full flex-col gap-3'>
          <Link
            to={`/customer/patient-profiles/${profile.id}`}
            onClick={onClose}
            className='w-full rounded-lg bg-primary px-4 py-2.5 text-center text-xs font-semibold text-on-primary transition-colors hover:bg-primary-container'
          >
            {t('customer.patientCreate.modal.viewProfile')}
          </Link>
          <Link
            to='/customer/caregivers'
            onClick={onClose}
            className='w-full rounded-lg bg-surface-container-low px-4 py-2.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-surface-container'
          >
            {t('customer.patientCreate.modal.findCaregiver')}
          </Link>
          <Link
            to='/customer/patient-profiles'
            onClick={onClose}
            className='w-full rounded-lg bg-surface-container-low px-4 py-2.5 text-center text-xs font-medium text-on-surface transition-colors hover:bg-surface-container'
          >
            {t('customer.patientCreate.modal.backToList')}
          </Link>
        </div>
      </div>
    </div>
  )
}
