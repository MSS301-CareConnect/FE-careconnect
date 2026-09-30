import { useTranslation } from 'react-i18next'
import type { ShiftDetailData } from '../shift-preview'

const ICON_SCHEDULE = 'schedule'
const ICON_VERIFIED = 'verified'

interface ShiftTimingEarningsCardProps {
  shift: ShiftDetailData
}

export function ShiftTimingEarningsCard({ shift }: ShiftTimingEarningsCardProps) {
  void shift
  const { t } = useTranslation()

  return (
    <div className='space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_SCHEDULE}</span>
          <h2 className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.timingEarnings.title')}</h2>
        </div>
        <span className='rounded bg-surface-container px-2 py-0.5 text-xs font-bold text-on-surface-variant'>
          {t('caregiver.shiftDetail.timingEarnings.durationBadge')}
        </span>
      </div>

      {/* Schedule block */}
      <div className='space-y-2 rounded-xl bg-surface-container-low p-4'>
        <div className='text-xs font-semibold uppercase tracking-wider text-on-surface-variant'>
          {t('caregiver.shiftDetail.timingEarnings.scheduleLabel')}
        </div>
        <div className='text-base font-bold text-on-surface sm:text-lg'>
          {t('caregiver.shiftDetail.timingEarnings.scheduleDate')}
        </div>
        <div className='flex items-center justify-between text-xs text-on-surface sm:text-sm'>
          <span>{t('caregiver.shiftDetail.timingEarnings.timeRangeLabel')}</span>
          <strong className='font-mono font-bold text-primary'>
            {t('caregiver.shiftDetail.timingEarnings.timeRangeValue')}
          </strong>
        </div>
        <div className='flex items-center justify-between text-xs text-on-surface-variant sm:text-sm'>
          <span>{t('caregiver.shiftDetail.timingEarnings.totalDurationLabel')}</span>
          <span>{t('caregiver.shiftDetail.timingEarnings.totalDurationValue')}</span>
        </div>
      </div>

      {/* Remuneration block */}
      <div className='flex flex-col justify-between gap-2 rounded-xl bg-surface-container p-4'>
        <div className='text-xs text-on-surface-variant font-medium'>
          {t('caregiver.shiftDetail.timingEarnings.earningsLabel')}
        </div>
        <div className='flex items-baseline gap-1.5'>
          <span className='text-3xl font-extrabold tracking-tight text-primary sm:text-4xl'>
            {t('caregiver.shiftDetail.timingEarnings.earningsAmount')}
          </span>
          <span className='text-base font-bold text-primary'>{t('caregiver.shiftDetail.timingEarnings.currency')}</span>
        </div>
        <div className='flex items-start gap-1.5 pt-1 text-xs text-on-surface-variant'>
          <span className='material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-primary'>{ICON_VERIFIED}</span>
          <span className='leading-tight'>{t('caregiver.shiftDetail.timingEarnings.escrowNotice')}</span>
        </div>
      </div>
    </div>
  )
}
