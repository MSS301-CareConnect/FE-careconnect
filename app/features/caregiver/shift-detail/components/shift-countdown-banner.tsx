import { useTranslation } from 'react-i18next'

const ICON_TIMER = 'timer'

interface ShiftCountdownBannerProps {
  countdownText: string
  shiftStatus: 'ready' | 'ongoing'
}

export function ShiftCountdownBanner({ countdownText, shiftStatus }: ShiftCountdownBannerProps) {
  const { t } = useTranslation()

  return (
    <div className='relative overflow-hidden rounded-xl bg-primary p-6 text-on-primary shadow-lg sm:p-7'>
      <div className='pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-primary-container/30 blur-2xl' />
      <div className='relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div className='flex items-center gap-4'>
          <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-on-primary/10 shadow-inner'>
            <span className='material-symbols-outlined text-[32px] text-on-primary animate-pulse'>{ICON_TIMER}</span>
          </div>
          <div>
            <div className='text-xs font-bold uppercase tracking-wider text-on-primary/80'>
              {t('caregiver.shiftDetail.countdown.label')}
            </div>
            <div className='flex items-center gap-2 text-xl font-bold text-on-primary sm:text-2xl'>
              <span>
                {shiftStatus === 'ongoing'
                  ? t('caregiver.shiftDetail.header.statusOngoing')
                  : t('caregiver.shiftDetail.countdown.text')}
              </span>
              {shiftStatus === 'ready' && (
                <span
                  className='rounded bg-on-primary/20 px-2 py-1 font-mono text-base font-bold sm:text-lg'
                  id='countdownText'
                >
                  {countdownText}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2 rounded-full bg-on-primary/15 px-4 py-2 text-xs font-semibold text-on-primary backdrop-blur-xs'>
            <span className='h-2.5 w-2.5 animate-ping rounded-full bg-secondary-fixed' />
            {t('caregiver.shiftDetail.countdown.locationReady')}
          </div>
        </div>
      </div>
    </div>
  )
}
