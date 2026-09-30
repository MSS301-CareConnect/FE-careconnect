import { useTranslation } from 'react-i18next'

const ICON_ADMIN = 'admin_panel_settings'
const ICON_GPS = 'fmd_good'
const ICON_VERIFIED = 'verified'
const ICON_COFFEE = 'coffee'
const ICON_REPORT = 'report_problem'

interface ActiveActionCommandCardProps {
  isBreakActive: boolean
  onOpenSignModal: () => void
  onToggleBreak: () => void
  onOpenSos: () => void
}

export function ActiveActionCommandCard({
  isBreakActive,
  onOpenSignModal,
  onToggleBreak,
  onOpenSos
}: ActiveActionCommandCardProps) {
  const { t } = useTranslation()

  return (
    <section className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-xs'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary'>
          <span className='material-symbols-outlined text-[20px]'>{ICON_ADMIN}</span>
        </div>
        <div>
          <h2 className='text-base font-bold text-on-surface sm:text-lg'>
            {t('caregiver.activeSession.commandCenter.title')}
          </h2>
          <span className='text-xs text-on-surface-variant'>{t('caregiver.activeSession.commandCenter.subtitle')}</span>
        </div>
      </div>

      {/* Live GPS Match Badge */}
      <div className='flex items-center gap-3 rounded-lg bg-surface-container-low p-3'>
        <span className='material-symbols-outlined text-[20px] text-secondary'>{ICON_GPS}</span>
        <div className='flex flex-col'>
          <span className='text-xs font-bold text-on-surface'>
            {t('caregiver.activeSession.commandCenter.gpsTitle')}
          </span>
          <span className='text-xs text-on-surface-variant'>{t('caregiver.activeSession.commandCenter.gpsDesc')}</span>
        </div>
      </div>

      {/* Major Shift Actions */}
      <div className='flex flex-col gap-2.5'>
        {/* Primary CTA Complete Shift */}
        <button
          className='group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3.5 text-sm font-bold text-on-primary shadow-md transition-all hover:shadow-lg active:scale-[0.99]'
          onClick={onOpenSignModal}
          type='button'
        >
          <span className='material-symbols-outlined text-[22px] transition-transform group-hover:scale-110'>
            {ICON_VERIFIED}
          </span>
          <span>{t('caregiver.activeSession.commandCenter.completeBtn')}</span>
        </button>

        {/* Break Button */}
        <button
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
            isBreakActive
              ? 'bg-secondary text-on-secondary shadow-xs'
              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
          }`}
          onClick={onToggleBreak}
          type='button'
        >
          <span className='material-symbols-outlined text-[20px]'>{ICON_COFFEE}</span>
          <span>{t('caregiver.activeSession.commandCenter.breakBtn')}</span>
        </button>

        {/* Problem Escalation */}
        <button
          className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-error-container/30 px-4 py-2.5 text-xs font-bold text-error transition-colors hover:bg-error-container/60 sm:text-sm'
          onClick={onOpenSos}
          type='button'
        >
          <span className='material-symbols-outlined text-[18px]'>{ICON_REPORT}</span>
          <span>{t('caregiver.activeSession.commandCenter.incidentBtn')}</span>
        </button>
      </div>
    </section>
  )
}
