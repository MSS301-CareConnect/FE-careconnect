import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import type { PatientProfile } from '../types'

export interface PatientCardProps {
  patient: PatientProfile
  onDelete: (id: string) => void
}

export function PatientCard({ patient, onDelete }: PatientCardProps) {
  const { t } = useTranslation()

  const getStatusBadge = () => {
    switch (patient.status) {
      case 'in-care':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700'>
            <span className='h-2 w-2 rounded-full bg-blue-600' />
            <span>{t('customer.patientProfiles.card.statusInCare')}</span>
          </span>
        )
      case 'stable':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary-container/50 px-3 py-1 text-xs font-bold text-on-secondary-container'>
            <span className='h-2 w-2 rounded-full bg-primary' />
            <span>{t('customer.patientProfiles.card.statusStable')}</span>
          </span>
        )
      case 'post-op':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700'>
            <span className='h-2 w-2 rounded-full bg-amber-500' />
            <span>{t('customer.patientProfiles.card.statusPostOp')}</span>
          </span>
        )
    }
  }

  const getDiagnosesTitle = () => {
    switch (patient.diagnosesTitleType) {
      case 'diagnoses':
        return t('customer.patientProfiles.card.diagnoses')
      case 'primary':
        return t('customer.patientProfiles.card.primaryDiagnosis')
      case 'current':
        return t('customer.patientProfiles.card.currentStatus')
    }
  }

  const getInstructionsTitle = () => {
    switch (patient.instructionsTitleType) {
      case 'special':
        return t('customer.patientProfiles.card.specialInstructions')
      case 'rehab':
        return t('customer.patientProfiles.card.rehabInstructions')
      case 'diet':
        return t('customer.patientProfiles.card.dietInstructions')
    }
  }

  return (
    <article className='group relative flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-4'>
          <div className='relative shrink-0'>
            <img
              src={patient.avatar}
              alt={patient.name}
              className='h-16 w-16 rounded-full object-cover shadow-sm ring-2 ring-primary/20 sm:h-20 sm:w-20'
            />
            <span
              title={t('customer.patientProfiles.card.readyTooltip')}
              className='absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary ring-2 ring-surface-container-lowest'
            >
              <Icon name='done' className='text-xs' />
            </span>
          </div>

          <div className='flex flex-col'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-lg font-bold text-on-surface'>{patient.name}</h3>
              <span className='rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-semibold text-primary'>
                {patient.relationshipLabel}
              </span>
            </div>

            {/* Basic Vitals Grid */}
            <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant'>
              <span className='font-semibold text-on-surface'>
                {t('customer.patientProfiles.card.yearsOld', { age: patient.age })}
              </span>
              <span className='text-outline-variant'>•</span>
              <span>
                {t('customer.patientProfiles.card.genderLabel')}{' '}
                <strong className='font-semibold text-on-surface'>
                  {patient.gender === 'male'
                    ? t('customer.patientProfiles.card.genderMale')
                    : t('customer.patientProfiles.card.genderFemale')}
                </strong>
              </span>
              <span className='text-outline-variant'>•</span>
              <span className='inline-flex items-center gap-1 font-semibold text-error'>
                <Icon name='water_drop' className='text-sm' />
                <span>{patient.bloodType}</span>
              </span>
              <span className='text-outline-variant'>•</span>
              <span>{patient.weight}</span>
              <span className='text-outline-variant'>•</span>
              <span>{patient.height}</span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className='self-start sm:self-center'>{getStatusBadge()}</div>
      </div>

      {/* Medical Alert & Care Notes Panel */}
      <div className='grid grid-cols-1 gap-3 rounded-xl bg-surface-container-low/60 p-4 md:grid-cols-12'>
        {/* Diagnoses */}
        <div className={`${patient.attendingDoctor ? 'md:col-span-5' : 'md:col-span-6'} flex flex-col gap-1`}>
          <span className='flex items-center gap-1 text-[11px] font-bold tracking-wider text-on-surface-variant uppercase'>
            <Icon name='emergency' className='text-sm text-error' />
            <span>{getDiagnosesTitle()}</span>
          </span>
          <p className='text-xs font-medium text-on-surface leading-relaxed'>{patient.diagnoses}</p>
        </div>

        {/* Instructions */}
        <div className={`${patient.attendingDoctor ? 'md:col-span-4' : 'md:col-span-6'} flex flex-col gap-1`}>
          <span className='flex items-center gap-1 text-[11px] font-bold tracking-wider text-on-surface-variant uppercase'>
            <Icon name='assignment_late' className='text-sm text-primary' />
            <span>{getInstructionsTitle()}</span>
          </span>
          <p className='text-xs text-on-surface leading-relaxed'>{patient.instructions}</p>
        </div>

        {/* Attending Doctor (if present) */}
        {patient.attendingDoctor && (
          <div className='flex flex-col gap-1 md:col-span-3'>
            <span className='flex items-center gap-1 text-[11px] font-bold tracking-wider text-on-surface-variant uppercase'>
              <Icon name='medical_services' className='text-sm text-primary' />
              <span>{t('customer.patientProfiles.card.attendingDoctor')}</span>
            </span>
            <p className='text-xs font-semibold text-on-surface'>{patient.attendingDoctor.name}</p>
            <span className='text-[11px] text-on-surface-variant'>{patient.attendingDoctor.hospital}</span>
          </div>
        )}
      </div>

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
          <Link
            to={`/customer/patient-profiles/${patient.id}?mode=edit`}
            className='inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container'
          >
            <Icon name='edit' className='text-base' />
            <span>{t('customer.patientProfiles.card.edit')}</span>
          </Link>
          <button
            type='button'
            onClick={() => onDelete(patient.id)}
            className='inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-error-container/40'
          >
            <Icon name='delete' className='text-base' />
            <span>{t('customer.patientProfiles.card.delete')}</span>
          </button>
        </div>

        <Link
          to={`/customer/bookings/new?patientId=${patient.id}`}
          className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow'
        >
          <Icon name='event_available' className='text-base' />
          <span>
            {patient.status === 'in-care'
              ? t('customer.patientProfiles.card.bookCareNow')
              : t('customer.patientProfiles.card.bookCare')}
          </span>
        </Link>
      </div>
    </article>
  )
}
