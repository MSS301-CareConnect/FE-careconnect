import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

export interface CreatePatientHeaderProps {
  onCancel: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function CreatePatientHeader({ onCancel, onSubmit, isSubmitting }: CreatePatientHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-6'>
      <Link
        to='/customer/patient-profiles'
        className='group inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-container focus-visible:rounded focus-visible:outline-2 focus-visible:outline-primary'
      >
        <Icon name='arrow_back' className='text-lg transition-transform group-hover:-translate-x-1' />
        <span>{t('customer.patientCreate.breadcrumb.backToList')}</span>
      </Link>

      {/* Main Header Banner */}
      <div className='flex flex-col justify-between gap-6 pb-2 lg:flex-row lg:items-center'>
        <div className='max-w-3xl'>
          <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-secondary-container/20 px-3 py-1 text-xs font-semibold text-on-secondary-container uppercase tracking-wider'>
            <span className='h-2 w-2 animate-pulse rounded-full bg-primary' />
            <span>{t('customer.patientCreate.header.badge')}</span>
          </div>
          <h1 className='text-3xl font-bold tracking-tight text-on-surface'>
            {t('customer.patientCreate.header.title')}
          </h1>
          <p className='mt-2 text-sm text-on-surface-variant leading-relaxed'>
            {t('customer.patientCreate.header.subtitle')}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <button
            type='button'
            onClick={onCancel}
            className='rounded-lg bg-surface-container-high px-4 py-2.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-variant'
          >
            {t('customer.patientCreate.header.cancel')}
          </button>
          <button
            type='button'
            onClick={onSubmit}
            disabled={isSubmitting}
            className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow disabled:opacity-60'
          >
            <Icon name='verified' className='text-base' />
            <span>
              {isSubmitting ? t('customer.patientCreate.submitting') : t('customer.patientCreate.header.saveProfile')}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
