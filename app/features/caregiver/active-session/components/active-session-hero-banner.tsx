import { useTranslation } from 'react-i18next'

const ICON_SCHEDULE = 'schedule'
const ICON_HOW_TO_REG = 'how_to_reg'
const ICON_VERIFIED = 'verified'
const ICON_SOS = 'e911_emergency'
const ICON_SUPPORT = 'support_agent'

interface ActiveSessionHeroBannerProps {
  orderCode: string
  elapsedFormatted: string
  onOpenSos: () => void
}

export function ActiveSessionHeroBanner({ orderCode, elapsedFormatted, onOpenSos }: ActiveSessionHeroBannerProps) {
  const { t } = useTranslation()

  return (
    <section className='relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary-container to-tertiary p-6 text-on-primary shadow-md sm:p-7'>
      <div className='pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-surface-container-lowest/5 blur-2xl' />

      <div className='relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center'>
        {/* Session Identification */}
        <div className='flex flex-col gap-2'>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/20 px-3 py-1 text-xs font-bold tracking-wide uppercase text-on-primary backdrop-blur-xs'>
              <span className='relative flex h-2.5 w-2.5'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary-fixed opacity-75' />
                <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary-fixed' />
              </span>
              <span>{t('caregiver.activeSession.hero.liveGps')}</span>
            </div>
            <span className='text-xs text-on-primary/75'>
              {t('caregiver.activeSession.hero.orderCode', { code: orderCode })}
            </span>
          </div>

          <h1 className='text-xl font-bold tracking-tight text-on-primary sm:text-2xl lg:text-3xl'>
            {t('caregiver.activeSession.hero.title')}
          </h1>

          <div className='flex flex-wrap items-center gap-3 text-xs text-on-primary/90 sm:text-sm'>
            <div className='flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-[18px]'>{ICON_SCHEDULE}</span>
              <span>{t('caregiver.activeSession.hero.timeSlot')}</span>
            </div>
            <div className='hidden text-on-primary/40 sm:block'>•</div>
            <div className='flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-[18px]'>{ICON_HOW_TO_REG}</span>
              <span>{t('caregiver.activeSession.hero.checkIn')}</span>
            </div>
            <div className='hidden text-on-primary/40 sm:block'>•</div>
            <div className='flex items-center gap-1.5 text-secondary-fixed'>
              <span className='material-symbols-outlined text-[18px]'>{ICON_VERIFIED}</span>
              <span>{t('caregiver.activeSession.hero.verified')}</span>
            </div>
          </div>
        </div>

        {/* Live Timer & Fast Actions */}
        <div className='flex flex-col items-stretch gap-4 sm:flex-row sm:items-center'>
          {/* Digital Timer Card */}
          <div className='flex min-w-[240px] flex-col justify-between rounded-xl bg-surface-container-lowest/15 p-4 backdrop-blur-md'>
            <div className='mb-1 flex items-center justify-between text-xs text-on-primary/80'>
              <span>{t('caregiver.activeSession.hero.elapsedTitle')}</span>
              <span className='font-bold text-secondary-fixed'>
                {t('caregiver.activeSession.hero.elapsedProgress')}
              </span>
            </div>

            <div className='my-1 flex items-baseline gap-1 font-mono text-3xl font-bold tracking-tight text-on-primary sm:text-4xl'>
              <span id='shift-stopwatch'>{elapsedFormatted}</span>
              <span className='text-xs font-normal text-on-primary/70 sm:text-sm'>
                {t('caregiver.activeSession.hero.maxTime')}
              </span>
            </div>

            <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-lowest/20'>
              <div
                className='h-full rounded-full bg-secondary-fixed transition-all duration-500'
                style={{ width: '44%' }}
              />
            </div>

            <div className='mt-2 flex items-center justify-between text-xs text-on-primary/70'>
              <span>{t('caregiver.activeSession.hero.completedInfo')}</span>
              <span>{t('caregiver.activeSession.hero.remainingInfo')}</span>
            </div>
          </div>

          {/* Hot Actions */}
          <div className='flex justify-center gap-2 sm:flex-col'>
            <button
              className='inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-error px-4 py-2.5 text-xs font-bold text-on-error shadow-sm transition-all hover:bg-error/90 sm:flex-none sm:text-sm'
              onClick={onOpenSos}
              type='button'
            >
              <span className='material-symbols-outlined text-[20px]'>{ICON_SOS}</span>
              <span>{t('caregiver.activeSession.hero.sosBtn')}</span>
            </button>
            <a
              className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2.5 text-xs font-bold text-primary shadow-sm transition-all hover:bg-surface-container-low sm:flex-none sm:text-sm'
              href='tel:19006868'
            >
              <span className='material-symbols-outlined text-[20px] text-secondary'>{ICON_SUPPORT}</span>
              <span>{t('caregiver.activeSession.hero.supervisorBtn')}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
