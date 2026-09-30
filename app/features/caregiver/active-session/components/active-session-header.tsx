import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const ICON_HOME = 'home'
const ICON_CHEVRON = 'chevron_right'
const ICON_WIFI = 'wifi'

interface ActiveSessionHeaderProps {
  shiftCode: string
  currentClock: string
}

export function ActiveSessionHeader({ shiftCode, currentClock }: ActiveSessionHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      {/* Breadcrumb Bar */}
      <nav
        aria-label={t('caregiver.activeSession.breadcrumb.shifts')}
        className='flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant'
      >
        <Link className='flex items-center gap-1 transition-colors hover:text-primary' to='/caregiver/dashboard'>
          <span className='material-symbols-outlined text-[16px]'>{ICON_HOME}</span>
          <span>{t('caregiver.activeSession.breadcrumb.home')}</span>
        </Link>
        <span className='material-symbols-outlined text-[14px] text-outline-variant'>{ICON_CHEVRON}</span>
        <Link className='transition-colors hover:text-primary' to='/caregiver/shifts'>
          {t('caregiver.activeSession.breadcrumb.shifts')}
        </Link>
        <span className='material-symbols-outlined text-[14px] text-outline-variant'>{ICON_CHEVRON}</span>
        <span className='flex items-center gap-1.5 rounded bg-surface-container-high px-2 py-0.5 font-semibold text-on-surface'>
          <span className='h-1.5 w-1.5 rounded-full bg-secondary' />
          {t('caregiver.activeSession.breadcrumb.currentSession', { code: shiftCode })}
        </span>
      </nav>

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
