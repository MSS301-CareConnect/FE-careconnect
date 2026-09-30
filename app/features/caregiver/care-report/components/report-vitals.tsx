import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'
import type { ReportEditor } from '../hooks/use-care-report-draft'

export function ReportVitals({ editor }: { editor: ReportEditor }) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage).format(value)
  const vitals = editor.draft.vitals
  const items = vitals
    ? ([
        {
          key: 'pressure',
          icon: 'favorite',
          value: t('caregiver.careReport.pressureValue', { value: vitals.pressure })
        },
        {
          key: 'pulse',
          icon: 'vital_signs',
          value: t('caregiver.careReport.pulseValue', { value: number(vitals.pulse) })
        },
        { key: 'oxygen', icon: 'air', value: t('caregiver.careReport.oxygenValue', { value: number(vitals.oxygen) }) },
        {
          key: 'temperature',
          icon: 'device_thermostat',
          value: t('caregiver.careReport.temperatureValue', { value: number(vitals.temperature) })
        }
      ] as const)
    : []
  return (
    <SectionCard title={t('caregiver.careReport.vitals')} icon='ecg_heart'>
      <fieldset className='mb-5'>
        <legend className='mb-3 text-xs font-semibold'>{t('caregiver.careReport.condition')}</legend>
        <div className='grid grid-cols-2 gap-2 rounded-xl bg-surface-container-low p-2'>
          {(['stable', 'monitor', 'concern'] as const).map((condition) => (
            <label
              className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-2 text-[11px] font-semibold focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${editor.draft.condition === condition ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}
              key={condition}
            >
              <input
                checked={editor.draft.condition === condition}
                className='sr-only'
                name='report-condition'
                onChange={() => editor.update({ condition })}
                type='radio'
                value={condition}
              />
              {t(`caregiver.careReport.${condition}`)}
            </label>
          ))}
        </div>
      </fieldset>
      {vitals ? (
        <>
          <div className='grid grid-cols-2 gap-3'>
            {items.map((item) => (
              <div className='rounded-xl bg-surface-container-low p-4' key={item.key}>
                <p className='flex items-center gap-2 text-xs text-on-surface-variant'>
                  <Icon className='text-lg text-primary' name={item.icon} />
                  {t(`caregiver.careReport.${item.key}`)}
                </p>
                <p className='mt-3 text-lg font-bold text-primary'>{item.value}</p>
              </div>
            ))}
          </div>
          {vitals.glucose !== null && (
            <div className='mt-4 flex items-center justify-between gap-3 rounded-xl border border-outline-variant/30 p-4'>
              <span className='flex items-center gap-2 text-xs'>
                <Icon className='text-primary' name='water_drop' />
                {t('caregiver.careReport.glucose')}
              </span>
              <strong className='text-sm'>
                {t('caregiver.careReport.glucoseValue', { value: number(vitals.glucose) })}
              </strong>
            </div>
          )}
        </>
      ) : (
        <p className='rounded-lg bg-surface-container-low p-4 text-sm text-outline'>
          {t('caregiver.careReport.noVitals')}
        </p>
      )}
      {editor.draft.record.code === 'BK-8821' && (
        <div className='mt-6 space-y-4 border-t border-outline-variant/20 pt-5'>
          <h3 className='text-sm font-bold'>{t('caregiver.careReport.assessment')}</h3>
          {(['mental', 'mobility'] as const).map((key) => (
            <div key={key}>
              <h4 className='text-xs font-bold text-primary'>{t(`caregiver.careReport.${key}`)}</h4>
              <p className='mt-2 text-xs leading-6 text-on-surface-variant'>{t(`caregiver.careReport.${key}Sample`)}</p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}
