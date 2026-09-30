import { useTranslation } from 'react-i18next'
import type { ActiveSessionData } from '../active-session-preview'

const ICON_VITALS = 'vital_signs'
const ICON_ADD = 'add'
const ICON_BP = 'favorite'
const ICON_AIR = 'air'
const ICON_PULSE = 'monitor_heart'
const ICON_THERMOSTAT = 'device_thermostat'

interface ActiveVitalsBoardCardProps {
  vitals: ActiveSessionData['vitals']
  onRemeasure: () => void
}

export function ActiveVitalsBoardCard({ vitals, onRemeasure }: ActiveVitalsBoardCardProps) {
  const { t } = useTranslation()

  return (
    <section className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-xs'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary'>
            <span className='material-symbols-outlined text-[20px]'>{ICON_VITALS}</span>
          </div>
          <div>
            <h2 className='text-base font-bold text-on-surface sm:text-lg'>
              {t('caregiver.activeSession.vitals.title')}
            </h2>
            <span className='text-xs text-on-surface-variant'>
              {t('caregiver.activeSession.vitals.lastMeasured', { time: vitals.lastMeasured })}
            </span>
          </div>
        </div>

        <button
          className='inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-surface-container'
          onClick={onRemeasure}
          type='button'
        >
          <span className='material-symbols-outlined text-[16px]'>{ICON_ADD}</span>
          <span>{t('caregiver.activeSession.vitals.reMeasure')}</span>
        </button>
      </div>

      {/* 2x2 Metric Cards Grid */}
      <div className='grid grid-cols-2 gap-3'>
        {/* Blood Pressure */}
        <div className='flex flex-col justify-between rounded-xl bg-surface-container-low p-3.5'>
          <div className='flex items-center justify-between text-on-surface-variant'>
            <span className='text-xs font-semibold'>{t('caregiver.activeSession.vitals.bpLabel')}</span>
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_BP}</span>
          </div>
          <div className='my-2'>
            <div className='font-mono text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
              {vitals.bloodPressure}
            </div>
            <span className='text-xs text-on-surface-variant'>{t('caregiver.activeSession.vitals.bpUnit')}</span>
          </div>
          <div className='inline-flex w-fit items-center gap-1 rounded bg-surface-container-lowest px-2 py-0.5 text-xs font-bold text-secondary'>
            <span className='h-1.5 w-1.5 rounded-full bg-secondary' />
            <span>{t('caregiver.activeSession.vitals.bpStatus')}</span>
          </div>
        </div>

        {/* SpO2 */}
        <div className='flex flex-col justify-between rounded-xl bg-surface-container-low p-3.5'>
          <div className='flex items-center justify-between text-on-surface-variant'>
            <span className='text-xs font-semibold'>{t('caregiver.activeSession.vitals.spo2Label')}</span>
            <span className='material-symbols-outlined text-[18px] text-tertiary'>{ICON_AIR}</span>
          </div>
          <div className='my-2'>
            <div className='font-mono text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
              {vitals.spo2}%
            </div>
            <span className='text-xs text-on-surface-variant'>{t('caregiver.activeSession.vitals.spo2Unit')}</span>
          </div>
          <div className='inline-flex w-fit items-center gap-1 rounded bg-surface-container-lowest px-2 py-0.5 text-xs font-bold text-secondary'>
            <span className='h-1.5 w-1.5 rounded-full bg-secondary' />
            <span>{t('caregiver.activeSession.vitals.spo2Status')}</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className='flex flex-col justify-between rounded-xl bg-surface-container-low p-3.5'>
          <div className='flex items-center justify-between text-on-surface-variant'>
            <span className='text-xs font-semibold'>{t('caregiver.activeSession.vitals.pulseLabel')}</span>
            <span className='material-symbols-outlined text-[18px] text-secondary'>{ICON_PULSE}</span>
          </div>
          <div className='my-2'>
            <div className='font-mono text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
              {vitals.heartRate}
            </div>
            <span className='text-xs text-on-surface-variant'>{t('caregiver.activeSession.vitals.pulseUnit')}</span>
          </div>
          <div className='inline-flex w-fit items-center gap-1 rounded bg-surface-container-lowest px-2 py-0.5 text-xs font-bold text-secondary'>
            <span className='h-1.5 w-1.5 rounded-full bg-secondary' />
            <span>{t('caregiver.activeSession.vitals.pulseStatus')}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className='flex flex-col justify-between rounded-xl bg-surface-container-low p-3.5'>
          <div className='flex items-center justify-between text-on-surface-variant'>
            <span className='text-xs font-semibold'>{t('caregiver.activeSession.vitals.tempLabel')}</span>
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_THERMOSTAT}</span>
          </div>
          <div className='my-2'>
            <div className='font-mono text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
              {vitals.temperature}
            </div>
            <span className='text-xs text-on-surface-variant'>{t('caregiver.activeSession.vitals.tempUnit')}</span>
          </div>
          <div className='inline-flex w-fit items-center gap-1 rounded bg-surface-container-lowest px-2 py-0.5 text-xs font-bold text-secondary'>
            <span className='h-1.5 w-1.5 rounded-full bg-secondary' />
            <span>{t('caregiver.activeSession.vitals.tempStatus')}</span>
          </div>
        </div>
      </div>

      {/* Mini Sparkline Graph */}
      <div className='flex flex-col gap-1.5 rounded-xl bg-surface-container-low/60 p-3'>
        <div className='flex items-center justify-between text-xs text-on-surface-variant'>
          <span className='font-semibold'>{t('caregiver.activeSession.vitals.trendLabel')}</span>
          <span className='font-bold text-secondary'>{t('caregiver.activeSession.vitals.trendStatus')}</span>
        </div>
        <div className='flex h-12 w-full items-center justify-center'>
          <svg className='h-full w-full text-primary' fill='none' viewBox='0 0 320 48'>
            <path
              d='M0 28 L40 26 L80 30 L120 22 L160 25 L200 18 L240 20 L280 16 L320 18'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2.5'
            />
            <circle className='fill-primary' cx='280' cy='16' r='3.5' />
            <circle className='fill-secondary-fixed-dim' cx='320' cy='18' r='3.5' />
          </svg>
        </div>
      </div>
    </section>
  )
}
