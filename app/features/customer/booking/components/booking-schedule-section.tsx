import { useTranslation } from 'react-i18next'
import type { FrequencyType, ShiftType, WeekDayItem } from '../types'

const STEP_4_NUM = '4'
const ICON_CALENDAR = 'calendar_month'
const ICON_SCHEDULE = 'schedule'
const ICON_REPEAT = 'repeat'

const SHIFT_OPTIONS: ShiftType[] = ['day8h', 'morning4h', 'afternoon4h', 'night12h', 'full24h']
const FREQUENCY_OPTIONS: FrequencyType[] = ['days5', 'days7', 'days3', 'custom']

interface BookingScheduleSectionProps {
  scheduleMode: 'weekly' | 'single'
  startDate: string
  shiftType: ShiftType
  frequency: FrequencyType
  notes: string
  weekDays: WeekDayItem[]
  onScheduleModeChange: (mode: 'weekly' | 'single') => void
  onStartDateChange: (date: string) => void
  onShiftTypeChange: (shift: ShiftType) => void
  onFrequencyChange: (freq: FrequencyType) => void
  onNotesChange: (notes: string) => void
}

export function BookingScheduleSection({
  scheduleMode,
  startDate,
  shiftType,
  frequency,
  notes,
  weekDays,
  onScheduleModeChange,
  onStartDateChange,
  onShiftTypeChange,
  onFrequencyChange,
  onNotesChange
}: BookingScheduleSectionProps) {
  const { t } = useTranslation()

  return (
    <section className='rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md md:p-6'>
      {/* Header */}
      <div className='mb-4 flex flex-col justify-between gap-3 border-b border-outline-variant/20 pb-4 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low font-bold text-sm text-primary'>
            {STEP_4_NUM}
          </span>
          <div>
            <h2 className='text-lg font-bold text-on-surface sm:text-xl'>
              {t('customer.booking.scheduleSection.title')}
            </h2>
            <p className='text-xs text-on-surface-variant sm:text-sm'>
              {t('customer.booking.scheduleSection.subtitle')}
            </p>
          </div>
        </div>

        <div className='inline-flex rounded-lg bg-surface-container p-1 text-xs'>
          <button
            className={`rounded px-3 py-1.5 font-semibold transition-all ${
              scheduleMode === 'weekly'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type='button'
            onClick={() => onScheduleModeChange('weekly')}
          >
            {t('customer.booking.scheduleSection.weeklyTab')}
          </button>
          <button
            className={`rounded px-3 py-1.5 font-semibold transition-all ${
              scheduleMode === 'single'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type='button'
            onClick={() => onScheduleModeChange('single')}
          >
            {t('customer.booking.scheduleSection.singleTab')}
          </button>
        </div>
      </div>

      {/* Date & Shift configuration */}
      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
        {/* Date picker */}
        <div className='space-y-1.5'>
          <label className='flex items-center gap-1.5 text-xs font-semibold text-on-surface sm:text-sm'>
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_CALENDAR}</span>
            <span>{t('customer.booking.scheduleSection.startDateLabel')}</span>
          </label>
          <input
            className='h-11 w-full rounded-lg bg-surface-container-low px-3 text-sm text-on-surface shadow-inner focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary'
            type='date'
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <span className='block text-[12px] text-on-surface-variant'>
            {t('customer.booking.scheduleSection.firstShiftNotice')}
          </span>
        </div>

        {/* Shift hours select */}
        <div className='space-y-1.5'>
          <label className='flex items-center gap-1.5 text-xs font-semibold text-on-surface sm:text-sm'>
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_SCHEDULE}</span>
            <span>{t('customer.booking.scheduleSection.shiftHourLabel')}</span>
          </label>
          <select
            className='h-11 w-full cursor-pointer rounded-lg bg-surface-container-low px-3 text-xs text-on-surface shadow-inner focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm'
            value={shiftType}
            onChange={(e) => onShiftTypeChange(e.target.value as ShiftType)}
          >
            {SHIFT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {t(`customer.booking.scheduleSection.shifts.${s}`)}
              </option>
            ))}
          </select>
          <span className='block text-[12px] text-on-surface-variant'>
            {t('customer.booking.scheduleSection.shiftHourHint')}
          </span>
        </div>

        {/* Frequency select */}
        <div className='space-y-1.5'>
          <label className='flex items-center gap-1.5 text-xs font-semibold text-on-surface sm:text-sm'>
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_REPEAT}</span>
            <span>{t('customer.booking.scheduleSection.frequencyLabel')}</span>
          </label>
          <select
            className='h-11 w-full cursor-pointer rounded-lg bg-surface-container-low px-3 text-xs text-on-surface shadow-inner focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm'
            value={frequency}
            onChange={(e) => onFrequencyChange(e.target.value as FrequencyType)}
          >
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {t(`customer.booking.scheduleSection.frequencies.${f}`)}
              </option>
            ))}
          </select>
          <span className='block text-[12px] font-medium text-secondary'>
            {t('customer.booking.scheduleSection.frequencyHint')}
          </span>
        </div>
      </div>

      {/* Days visual checklist */}
      <div className='mb-6'>
        <label className='mb-2 block text-xs font-semibold text-on-surface sm:text-sm'>
          {t('customer.booking.scheduleSection.weeklyDaysLabel')}
        </label>
        <div className='grid grid-cols-7 gap-1.5 text-center sm:gap-2'>
          {weekDays.map((day) => (
            <div
              key={day.key}
              className={`rounded-lg py-2 px-1 text-center transition-colors ${
                day.active
                  ? 'bg-primary font-bold text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant/70 opacity-60'
              }`}
            >
              <p className='text-[11px] sm:text-xs'>{day.dayName}</p>
              <p className='text-xs font-semibold sm:text-sm'>{day.dateStr}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Special notes instructions */}
      <div className='space-y-1.5'>
        <label className='flex items-center justify-between text-xs font-semibold text-on-surface sm:text-sm'>
          <span>{t('customer.booking.scheduleSection.notesLabel')}</span>
          <span className='font-normal text-[12px] text-on-surface-variant'>
            {t('customer.booking.scheduleSection.notesLimit')}
          </span>
        </label>
        <textarea
          className='w-full rounded-lg bg-surface-container-low p-3.5 text-xs leading-relaxed text-on-surface shadow-inner focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm'
          placeholder={t('customer.booking.scheduleSection.notesPlaceholder')}
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </section>
  )
}
