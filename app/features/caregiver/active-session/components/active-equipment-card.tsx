import { useTranslation } from 'react-i18next'

const ICON_MEDICAL = 'medical_services'
const ICON_VERIFIED_USER = 'verified_user'

const EQUIPMENT_ITEMS = [
  {
    nameKey: 'caregiver.activeSession.equipment.eq1',
    statusKey: 'caregiver.activeSession.equipment.eq1Status',
    icon: 'blood_pressure'
  },
  {
    nameKey: 'caregiver.activeSession.equipment.eq2',
    statusKey: 'caregiver.activeSession.equipment.eq2Status',
    icon: 'monitor_weight'
  },
  {
    nameKey: 'caregiver.activeSession.equipment.eq3',
    statusKey: 'caregiver.activeSession.equipment.eq3Status',
    icon: 'bed'
  },
  {
    nameKey: 'caregiver.activeSession.equipment.eq4',
    statusKey: 'caregiver.activeSession.equipment.eq4Status',
    icon: 'pill'
  }
] as const

export function ActiveEquipmentCard() {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-4'>
      {/* Equipment List */}
      <section className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-xs'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary'>
              <span className='material-symbols-outlined text-[20px]'>{ICON_MEDICAL}</span>
            </div>
            <h3 className='text-sm font-bold text-on-surface sm:text-base'>
              {t('caregiver.activeSession.equipment.title')}
            </h3>
          </div>
          <span className='rounded bg-surface-container-low px-2 py-0.5 text-xs font-semibold text-secondary'>
            {t('caregiver.activeSession.equipment.readyCount')}
          </span>
        </div>

        <div className='flex flex-col gap-2 text-xs sm:text-sm'>
          {EQUIPMENT_ITEMS.map((item, idx) => (
            <div className='flex items-center justify-between rounded-lg bg-surface-container-low p-3' key={idx}>
              <div className='flex items-center gap-2'>
                <span className='material-symbols-outlined text-[18px] text-primary'>{item.icon}</span>
                <span className='text-on-surface'>{t(item.nameKey)}</span>
              </div>
              <span className='font-bold text-secondary'>{t(item.statusKey)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Protocol & Safety Compliance footer badge */}
      <div className='flex items-center gap-3 rounded-xl bg-surface-container-low p-4 text-xs text-on-surface-variant sm:text-sm'>
        <span className='material-symbols-outlined shrink-0 text-[24px] text-primary'>{ICON_VERIFIED_USER}</span>
        <p className='leading-relaxed'>{t('caregiver.activeSession.equipment.insuranceBadge')}</p>
      </div>
    </div>
  )
}
