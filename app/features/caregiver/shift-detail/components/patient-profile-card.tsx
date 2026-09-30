import { useTranslation } from 'react-i18next'
import type { ShiftDetailData } from '../shift-preview'

const ICON_PATIENT = 'assignment_ind'
const ICON_CHECK = 'check'
const ICON_FAMILY = 'family_restroom'
const ICON_CALL = 'call'
const ICON_CHAT = 'chat'

interface PatientProfileCardProps {
  shift: ShiftDetailData
}

export function PatientProfileCard({ shift }: PatientProfileCardProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Card Header */}
      <div className='flex items-center justify-between pb-1'>
        <div className='flex items-center gap-2'>
          <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_PATIENT}</span>
          <h2 className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.patient.title')}</h2>
        </div>
        <span className='rounded bg-surface-container px-2.5 py-1 text-xs font-semibold text-on-surface'>
          {t('caregiver.shiftDetail.patient.patientCode', { code: shift.patientCode })}
        </span>
      </div>

      {/* Patient Profile Tile */}
      <div className='flex flex-col items-start gap-4 rounded-xl bg-surface-container-low p-4 sm:flex-row sm:items-center'>
        <div className='relative shrink-0'>
          <img
            alt={t('caregiver.shiftDetail.patient.avatarAlt')}
            className='h-20 w-20 rounded-full object-cover shadow-sm'
            src={shift.patientImage}
          />
          <span className='absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm'>
            <span className='material-symbols-outlined text-[14px]'>{ICON_CHECK}</span>
          </span>
        </div>
        <div className='min-w-0 flex-1 space-y-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.patient.name')}</span>
            <span className='rounded bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant'>
              {t('caregiver.shiftDetail.patient.ageGender')}
            </span>
            <span className='rounded bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant'>
              {t('caregiver.shiftDetail.patient.bloodType')}
            </span>
          </div>
          <p className='text-xs leading-relaxed text-on-surface-variant sm:text-sm'>
            <strong className='font-semibold text-on-surface'>
              {t('caregiver.shiftDetail.patient.summaryLabel')}{' '}
            </strong>
            {t('caregiver.shiftDetail.patient.summary')}
          </p>
        </div>
      </div>

      {/* Guardian / Contact Section */}
      <div className='flex flex-col justify-between gap-4 rounded-xl bg-surface p-4 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-4'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary'>
            <span className='material-symbols-outlined text-[22px]'>{ICON_FAMILY}</span>
          </div>
          <div>
            <div className='text-xs text-on-surface-variant'>{t('caregiver.shiftDetail.patient.guardianLabel')}</div>
            <div className='text-sm font-bold text-on-surface'>{t('caregiver.shiftDetail.patient.guardianName')}</div>
            <div className='font-mono text-xs text-on-surface-variant'>
              {t('caregiver.shiftDetail.patient.guardianPhone')}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <a
            className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-xs transition-colors hover:bg-primary-container'
            href={`tel:${shift.guardianPhone}`}
          >
            <span className='material-symbols-outlined text-[18px]'>{ICON_CALL}</span>
            {t('caregiver.shiftDetail.patient.call')}
          </a>
          <button
            className='inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface-container-high px-4 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-highest'
            onClick={() => alert(`SMS: ${shift.guardianPhone}`)}
            type='button'
          >
            <span className='material-symbols-outlined text-[18px]'>{ICON_CHAT}</span>
            {t('caregiver.shiftDetail.patient.chat')}
          </button>
        </div>
      </div>
    </div>
  )
}
