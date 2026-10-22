import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { CareRecipientDetailRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import type { ProfileDraftError } from '../profile-draft'

const SAVE_ERROR_KEYS = {
  nameRequired: 'customer.patientDetail.banner.nameRequired',
  phoneInvalid: 'customer.patientDetail.banner.phoneInvalid',
  conflict: 'customer.patientDetail.banner.conflictError',
  save: 'customer.patientDetail.banner.saveError'
} as const

export interface PatientDetailHeaderProps {
  detail: CareRecipientDetailRecord
  canEdit: boolean
  isEditMode: boolean
  isSaving: boolean
  saveError?: ProfileDraftError | 'conflict' | 'save'
  onToggleEditMode: () => void
  onSave: () => void
}

export function PatientDetailHeader({
  detail,
  canEdit,
  isEditMode,
  isSaving,
  saveError,
  onToggleEditMode,
  onSave
}: PatientDetailHeaderProps) {
  const { t } = useTranslation()
  const { profile, myAccessLevel } = detail

  return (
    <div className='flex flex-col gap-6'>
      {/* Breadcrumb */}
      <nav
        aria-label={t('customer.patientDetail.breadcrumb.title')}
        className='flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant'
      >
        <Link to='/customer' className='transition-colors hover:text-primary'>
          {t('customer.patientDetail.breadcrumb.home')}
        </Link>
        <Icon name='chevron_right' className='text-xs text-outline-variant' />
        <Link to='/customer/my-profile' className='transition-colors hover:text-primary'>
          {t('customer.patientDetail.breadcrumb.myAccount')}
        </Link>
        <Icon name='chevron_right' className='text-xs text-outline-variant' />
        <Link to='/customer/patient-profiles' className='transition-colors hover:text-primary'>
          {t('customer.patientDetail.breadcrumb.patientProfiles')}
        </Link>
        <Icon name='chevron_right' className='text-xs text-outline-variant' />
        <span className='font-semibold text-on-surface'>{t('customer.patientDetail.breadcrumb.title')}</span>
      </nav>

      {/* Top Action Header Banner */}
      <div className='flex flex-col justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm lg:flex-row lg:items-center'>
        <div className='flex flex-col gap-2'>
          <div className='flex flex-wrap items-center gap-3'>
            <Link
              to='/customer/patient-profiles'
              className='inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline'
            >
              <Icon name='arrow_back' className='text-base' />
              <span>{t('customer.patientDetail.banner.back')}</span>
            </Link>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-0.5 text-xs font-semibold text-primary'>
              <span className='h-2 w-2 rounded-full bg-primary' />
              <span>{t(`customer.careRecipient.status.${profile.status}`)}</span>
            </span>
          </div>

          <div className='mt-1 flex flex-wrap items-baseline gap-2'>
            <h1 className='text-2xl font-bold text-on-surface'>
              {t('customer.patientDetail.banner.title', { name: profile.fullName })}
            </h1>
            {myAccessLevel ? (
              <span className='text-sm text-on-surface-variant'>
                {t('customer.patientDetail.banner.yourAccess', {
                  level: t(`customer.careRecipient.access.${myAccessLevel}`)
                })}
              </span>
            ) : null}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className='flex flex-wrap items-center gap-3'>
          {canEdit ? (
            <div className='flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2'>
              <span
                className={`text-xs font-medium ${isEditMode ? 'font-semibold text-primary' : 'text-on-surface-variant'}`}
              >
                {isEditMode ? t('customer.patientDetail.banner.editMode') : t('customer.patientDetail.banner.viewMode')}
              </span>
              <button
                type='button'
                role='switch'
                aria-checked={isEditMode}
                aria-label={t('customer.patientDetail.banner.editToggle')}
                onClick={onToggleEditMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEditMode ? 'bg-primary' : 'bg-outline-variant'
                }`}
              >
                <span
                  className={`pointer-events-none mt-0.5 inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest shadow ring-0 transition duration-200 ease-in-out ${
                    isEditMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ) : null}

          {isEditMode && (
            <button
              type='button'
              onClick={onSave}
              disabled={isSaving}
              className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:opacity-60'
            >
              <Icon name='save' className='text-lg' />
              <span>
                {isSaving ? t('customer.patientDetail.banner.saving') : t('customer.patientDetail.banner.saveUpdate')}
              </span>
            </button>
          )}

          {profile.status === 'ACTIVE' ? (
            <Link
              to='/customer/caregivers'
              className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container'
            >
              <Icon name='calendar_add_on' className='text-lg' />
              <span>{t('customer.patientDetail.banner.bookNewCare')}</span>
            </Link>
          ) : null}
        </div>
      </div>

      {saveError ? (
        <p role='alert' className='rounded-lg bg-error-container/40 p-3 text-xs text-error'>
          {t(SAVE_ERROR_KEYS[saveError])}
        </p>
      ) : null}
    </div>
  )
}
