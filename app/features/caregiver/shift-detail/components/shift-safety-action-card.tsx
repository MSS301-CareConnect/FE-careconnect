import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

const ICON_SECURITY = 'verified_user'
const ICON_PLAY = 'play_circle'
const ICON_SPIN = 'refresh'
const ICON_REPORT = 'report_problem'

interface ShiftSafetyActionCardProps {
  code: string
  shiftStatus: 'ready' | 'ongoing'
  onStartShift: () => void
  onOpenIncidentModal: () => void
}

export function ShiftSafetyActionCard({
  code,
  shiftStatus,
  onStartShift,
  onOpenIncidentModal
}: ShiftSafetyActionCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleStartClick = () => {
    if (shiftStatus === 'ready') {
      const confirmed = window.confirm(t('caregiver.shiftDetail.shiftAction.startConfirm'))
      if (confirmed) {
        onStartShift()
        navigate(`/caregiver/shifts/${code}/active`)
      }
    } else {
      navigate(`/caregiver/shifts/${code}/active`)
    }
  }

  return (
    <div className='space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-xl'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_SECURITY}</span>
        <h2 className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.shiftAction.safetyTitle')}</h2>
      </div>

      <p className='text-xs leading-relaxed text-on-surface-variant sm:text-sm'>
        {t('caregiver.shiftDetail.shiftAction.safetyDesc')}
      </p>

      {/* Main Start Action */}
      <div className='space-y-3 pt-1'>
        <button
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold shadow-lg transition-all active:scale-[0.98] sm:text-lg ${
            shiftStatus === 'ongoing'
              ? 'bg-tertiary text-on-tertiary cursor-default pointer-events-none'
              : 'bg-primary text-on-primary hover:bg-primary-container hover:shadow-xl'
          }`}
          id='startShiftBtn'
          onClick={handleStartClick}
          type='button'
        >
          {shiftStatus === 'ongoing' ? (
            <>
              <span className='material-symbols-outlined text-[28px] animate-spin'>{ICON_SPIN}</span>
              <span>{t('caregiver.shiftDetail.shiftAction.ongoingBtn')}</span>
            </>
          ) : (
            <>
              <span className='material-symbols-outlined text-[28px]'>{ICON_PLAY}</span>
              <span>{t('caregiver.shiftDetail.shiftAction.startShiftBtn')}</span>
            </>
          )}
        </button>

        <div className='flex items-center justify-between px-1 text-xs text-on-surface-variant'>
          <span className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-primary' />
            {t('caregiver.shiftDetail.shiftAction.statusConfirmed')}
          </span>
          <span className='font-mono font-semibold text-primary'>
            {t('caregiver.shiftDetail.shiftAction.shiftCodeLabel', { code })}
          </span>
        </div>

        <p className='text-center text-xs italic text-on-surface-variant'>
          {t('caregiver.shiftDetail.shiftAction.startNote')}
        </p>
      </div>

      {/* Secondary Incident Report Action */}
      <div className='border-t border-outline-variant/20 pt-2'>
        <button
          className='flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2.5 px-4 text-xs font-semibold text-error transition-colors hover:bg-error-container/20 sm:text-sm'
          id='reportIncidentBtn'
          onClick={onOpenIncidentModal}
          type='button'
        >
          <span className='material-symbols-outlined text-[18px]'>{ICON_REPORT}</span>
          <span>{t('caregiver.shiftDetail.shiftAction.reportIncidentBtn')}</span>
        </button>
      </div>
    </div>
  )
}
