import { useTranslation } from 'react-i18next'

const ICON_WARNING = 'warning'
const ICON_EMERGENCY = 'emergency'
const ICON_BLOCK = 'block'
const ICON_MEDICAL_SERVICES = 'medical_services'
const ICON_MONITOR_HEART = 'monitor_heart'
const ICON_BLOOD_PRESSURE = 'blood_pressure'
const ICON_BED = 'bed'

export function ClinicalWarningsCard() {
  const { t } = useTranslation()

  return (
    <div className='space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <span className='material-symbols-outlined text-[24px] text-error'>{ICON_WARNING}</span>
        <h2 className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.warnings.title')}</h2>
      </div>

      {/* Emergency Alerts Container */}
      <div className='space-y-3 rounded-xl bg-error-container/40 p-4 border border-error/20'>
        {/* Urgent clinical note */}
        <div className='flex items-start gap-3'>
          <span className='material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-error'>{ICON_EMERGENCY}</span>
          <div className='space-y-1'>
            <span className='block text-xs font-bold text-error sm:text-sm'>
              {t('caregiver.shiftDetail.warnings.urgentLabel')}
            </span>
            <p className='text-xs leading-relaxed text-on-surface sm:text-sm'>
              <strong className='font-semibold text-error'>
                {t('caregiver.shiftDetail.warnings.underlyingCondition')}{' '}
              </strong>
              {t('caregiver.shiftDetail.warnings.underlyingDesc')}
            </p>
          </div>
        </div>

        {/* Allergy note */}
        <div className='flex items-start gap-3 border-t border-error/15 pt-3'>
          <span className='material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-error'>{ICON_BLOCK}</span>
          <div className='space-y-1'>
            <span className='block text-xs font-bold text-error sm:text-sm'>
              {t('caregiver.shiftDetail.warnings.allergyLabel')}
            </span>
            <p className='text-xs leading-relaxed text-on-surface sm:text-sm'>
              {t('caregiver.shiftDetail.warnings.allergyDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Available Medical Equipment */}
      <div className='space-y-2 rounded-xl bg-surface-container-low p-4'>
        <div className='flex items-center gap-2 text-xs font-bold text-primary sm:text-sm'>
          <span className='material-symbols-outlined text-[20px]'>{ICON_MEDICAL_SERVICES}</span>
          <span>{t('caregiver.shiftDetail.warnings.equipmentTitle')}</span>
        </div>
        <div className='grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3'>
          <div className='flex items-center gap-2 rounded-lg bg-surface-container-lowest p-2.5 text-xs font-medium text-on-surface shadow-xs'>
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_MONITOR_HEART}</span>
            <span>{t('caregiver.shiftDetail.warnings.eqOmron')}</span>
          </div>
          <div className='flex items-center gap-2 rounded-lg bg-surface-container-lowest p-2.5 text-xs font-medium text-on-surface shadow-xs'>
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_BLOOD_PRESSURE}</span>
            <span>{t('caregiver.shiftDetail.warnings.eqSpo2')}</span>
          </div>
          <div className='flex items-center gap-2 rounded-lg bg-surface-container-lowest p-2.5 text-xs font-medium text-on-surface shadow-xs'>
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_BED}</span>
            <span>{t('caregiver.shiftDetail.warnings.eqBed')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
