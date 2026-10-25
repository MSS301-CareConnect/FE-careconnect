import { useTranslation } from 'react-i18next'
const ICON_WIFI = 'wifi'

interface ActiveSessionHeaderProps {
  currentClock: string
}

export function ActiveSessionHeader({ currentClock }: ActiveSessionHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-wrap items-center justify-end gap-3'>
      {/* Real-time Clock and Sync Status */}
      <div className='flex items-center gap-2 text-xs text-on-surface-variant'>
        <span className='flex items-center gap-1'>
          <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_WIFI}</span>
          {t('caregiver.activeSession.sync.realTime')}
        </span>
        <span className='h-1 w-1 rounded-full bg-outline-variant' />
        <span className='font-semibold text-on-surface' id='current-clock'>
          {currentClock}
        </span>
      </div>
    </div>
  )
}
