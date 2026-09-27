import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

export interface CreatePatientHeaderProps {
  onCancel: () => void
  onSaveDraft: () => void
  onSubmit: () => void
}

export function CreatePatientHeader({ onCancel, onSaveDraft, onSubmit }: CreatePatientHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-6'>
      {/* Breadcrumb Navigation */}
      <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
        <nav
          aria-label={t('customer.patientCreate.breadcrumb.current')}
          className='flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant'
        >
          <Link to='/' className='transition-colors hover:text-primary'>
            {t('customer.patientCreate.breadcrumb.home')}
          </Link>
          <Icon name='chevron_right' className='text-xs text-outline-variant' />
          <Link to='/customer/my-profile' className='transition-colors hover:text-primary'>
            {t('customer.patientCreate.breadcrumb.myAccount')}
          </Link>
          <Icon name='chevron_right' className='text-xs text-outline-variant' />
          <Link to='/customer/patient-profiles' className='transition-colors hover:text-primary'>
            {t('customer.patientCreate.breadcrumb.patientProfiles')}
          </Link>
          <Icon name='chevron_right' className='text-xs text-outline-variant' />
          <span className='font-semibold text-primary'>{t('customer.patientCreate.breadcrumb.current')}</span>
        </nav>

        <Link
          to='/customer/patient-profiles'
          className='group inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:text-primary'
        >
          <Icon name='arrow_back' className='text-base transition-transform group-hover:-translate-x-1' />
          <span>{t('customer.patientCreate.breadcrumb.backToList')}</span>
        </Link>
      </div>

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
            onClick={onSaveDraft}
            className='rounded-lg bg-surface-container-low px-4 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container'
          >
            {t('customer.patientCreate.header.saveDraft')}
          </button>
          <button
            type='button'
            onClick={onSubmit}
            className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow'
          >
            <Icon name='verified' className='text-base' />
            <span>{t('customer.patientCreate.header.saveProfile')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
