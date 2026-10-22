import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { canEditCareRecipient, formatRecipientDate } from '~/entities/care-recipient/care-recipient-format'
import type { CareRecipientSummaryRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const STATUS_STYLES: Record<CareRecipientSummaryRecord['status'], { badge: string; dot: string }> = {
  ACTIVE: { badge: 'bg-secondary-container/50 text-on-secondary-container', dot: 'bg-primary' },
  INACTIVE: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  ARCHIVED: { badge: 'bg-surface-container text-on-surface-variant', dot: 'bg-outline' }
}

export interface PatientCardProps {
  patient: CareRecipientSummaryRecord
  onDelete: (id: string) => void
  isDeleting: boolean
  deleteFailed: boolean
}

export function PatientCard({ patient, onDelete, isDeleting, deleteFailed }: PatientCardProps) {
  const { t, i18n } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  const canEdit = canEditCareRecipient(patient.myAccessLevel) && patient.status !== 'ARCHIVED'
  const canDelete = patient.myAccessLevel === 'OWNER' && patient.status !== 'ARCHIVED'
  const location = [patient.district, patient.province].filter(Boolean).join(', ')
  const birthDate = formatRecipientDate(patient.dateOfBirth, i18n.language)
  const createdAt = formatRecipientDate(patient.createdAt, i18n.language)
  const status = STATUS_STYLES[patient.status]

  return (
    <article className='group relative flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-4'>
          {patient.avatarUrl ? (
            <img
              src={patient.avatarUrl}
              alt={t('customer.patientProfiles.card.avatarAlt', { name: patient.fullName })}
              className='h-16 w-16 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-primary/20 sm:h-20 sm:w-20'
            />
          ) : (
            <span className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary ring-2 ring-primary/20 sm:h-20 sm:w-20'>
              <Icon name='person' className='text-4xl' />
            </span>
          )}

          <div className='flex flex-col'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-lg font-bold text-on-surface'>{patient.fullName}</h3>
            </div>

            {/* Basic Info Line */}
            <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant'>
              {patient.age !== undefined ? (
                <span className='font-semibold text-on-surface'>
                  {t('customer.careRecipient.yearsOld', { age: patient.age })}
                </span>
              ) : null}
              {patient.gender ? (
                <span>
                  {t('customer.patientProfiles.card.genderLabel')}{' '}
                  <strong className='font-semibold text-on-surface'>
                    {t(`customer.careRecipient.gender.${patient.gender}`)}
                  </strong>
                </span>
              ) : null}
              {birthDate ? <span>{t('customer.patientProfiles.card.birthDate', { date: birthDate })}</span> : null}
              {location ? (
                <span className='inline-flex items-center gap-1'>
                  <Icon name='location_on' className='text-sm text-primary' />
                  <span>{location}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-bold sm:self-center ${status.badge}`}
        >
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          <span>{t(`customer.careRecipient.status.${patient.status}`)}</span>
        </span>
      </div>

      {createdAt ? (
        <p className='text-[11px] text-on-surface-variant'>
          {t('customer.patientProfiles.card.createdAt', { date: createdAt })}
        </p>
      ) : null}

      {confirming ? (
        <div className='flex flex-col gap-3 rounded-lg bg-error-container/30 p-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs text-on-surface'>{t('customer.patientProfiles.card.confirmDelete')}</p>
          <div className='flex shrink-0 gap-2'>
            <button
              type='button'
              disabled={isDeleting}
              onClick={() => onDelete(patient.id)}
              className='rounded-lg bg-error px-3 py-2 text-xs font-semibold text-on-error disabled:opacity-60'
            >
              {isDeleting
                ? t('customer.patientProfiles.card.deleting')
                : t('customer.patientProfiles.card.confirmDeleteButton')}
            </button>
            <button
              type='button'
              disabled={isDeleting}
              onClick={() => setConfirming(false)}
              className='rounded-lg bg-surface-container-lowest px-3 py-2 text-xs font-medium text-on-surface'
            >
              {t('customer.patientProfiles.card.cancelDelete')}
            </button>
          </div>
        </div>
      ) : null}
      {deleteFailed ? (
        <p role='alert' className='text-xs text-error'>
          {t('customer.patientProfiles.card.deleteError')}
        </p>
      ) : null}

      {/* Action Buttons Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
        <div className='flex items-center gap-2'>
          <Link
            to={`/customer/patient-profiles/${patient.id}`}
            className='inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-high'
          >
            <Icon name='visibility' className='text-base' />
            <span>{t('customer.patientProfiles.card.viewDetails')}</span>
          </Link>
          {canEdit ? (
            <Link
              to={`/customer/patient-profiles/${patient.id}?mode=edit`}
              className='inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container'
            >
              <Icon name='edit' className='text-base' />
              <span>{t('customer.patientProfiles.card.edit')}</span>
            </Link>
          ) : null}
          {canDelete && !confirming ? (
            <button
              type='button'
              onClick={() => setConfirming(true)}
              className='inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-error-container/40'
            >
              <Icon name='delete' className='text-base' />
              <span>{t('customer.patientProfiles.card.delete')}</span>
            </button>
          ) : null}
        </div>

        {patient.status === 'ACTIVE' ? (
          <Link
            to={`/customer/booking?patientId=${patient.id}`}
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow'
          >
            <Icon name='event_available' className='text-base' />
            <span>{t('customer.patientProfiles.card.bookCare')}</span>
          </Link>
        ) : null}
      </div>
    </article>
  )
}
