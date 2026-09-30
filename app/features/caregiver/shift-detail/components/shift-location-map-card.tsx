import { useTranslation } from 'react-i18next'
import type { ShiftDetailData } from '../shift-preview'

const ICON_PIN = 'pin_drop'
const ICON_INFO = 'info'
const ICON_LOCATION = 'location_on'
const ICON_DIRECTIONS = 'directions'
const ICON_ARRIVED = 'where_to_vote'
const ICON_CHECK = 'check'

interface ShiftLocationMapCardProps {
  shift: ShiftDetailData
  hasArrived: boolean
  onArrive: () => void
}

export function ShiftLocationMapCard({ shift, hasArrived, onArrive }: ShiftLocationMapCardProps) {
  const { t } = useTranslation()

  const handleArriveClick = () => {
    if (!hasArrived) {
      onArrive()
      alert(t('caregiver.shiftDetail.locationMap.arrivedAlert'))
    }
  }

  return (
    <div className='space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_PIN}</span>
          <h2 className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.locationMap.title')}</h2>
        </div>
        <span className='rounded bg-surface-container px-2 py-0.5 text-xs font-bold text-primary'>
          {t('caregiver.shiftDetail.locationMap.distance')}
        </span>
      </div>

      {/* Address Text */}
      <div className='space-y-1'>
        <div className='text-sm font-bold text-on-surface sm:text-base'>{shift.building}</div>
        <p className='text-xs text-on-surface-variant leading-relaxed sm:text-sm'>{shift.address}</p>
      </div>

      {/* Entry Hint */}
      <div className='flex items-start gap-2 rounded-lg bg-surface-container-low p-3 text-xs text-on-surface-variant'>
        <span className='material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-primary'>{ICON_INFO}</span>
        <span>{t('caregiver.shiftDetail.locationMap.hint')}</span>
      </div>

      {/* Interactive Map Preview */}
      <div className='relative overflow-hidden rounded-xl shadow-xs'>
        <div
          className='relative h-44 w-full bg-cover bg-center'
          style={{ backgroundImage: `url('${shift.mapImage}')` }}
        >
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-on-surface/20 p-3 text-center'>
            <div className='mb-2 flex h-10 w-10 animate-bounce items-center justify-center rounded-full bg-primary text-on-primary shadow-lg'>
              <span className='material-symbols-outlined text-[24px]'>{ICON_LOCATION}</span>
            </div>
            <span className='rounded-full bg-surface-container-lowest/90 px-3 py-1 text-xs font-bold text-on-surface shadow-md'>
              {shift.coordinates}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='grid grid-cols-2 gap-2 pt-1'>
        <a
          className='inline-flex items-center justify-center gap-1.5 rounded-lg bg-surface-container px-3 py-2.5 text-center text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high'
          href='https://maps.google.com'
          rel='noopener noreferrer'
          target='_blank'
        >
          <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_DIRECTIONS}</span>
          <span>{t('caregiver.shiftDetail.locationMap.mapDirections')}</span>
        </a>

        <button
          className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-center text-xs font-semibold transition-colors ${
            hasArrived
              ? 'bg-surface-container-high text-on-surface-variant opacity-75'
              : 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed'
          }`}
          disabled={hasArrived}
          onClick={handleArriveClick}
          type='button'
        >
          <span className='material-symbols-outlined text-[18px]'>{hasArrived ? ICON_CHECK : ICON_ARRIVED}</span>
          <span>
            {hasArrived
              ? t('caregiver.shiftDetail.locationMap.arrivedDone')
              : t('caregiver.shiftDetail.locationMap.arrived')}
          </span>
        </button>
      </div>
    </div>
  )
}
