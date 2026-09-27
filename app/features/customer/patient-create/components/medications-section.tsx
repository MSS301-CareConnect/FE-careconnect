import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { MedicationItem } from '../types'

export interface MedicationsSectionProps {
  medications: MedicationItem[]
  onAddMedicine: () => void
  onUpdateMedicine: (id: string, partial: Partial<MedicationItem>) => void
  onDeleteMedicine: (id: string) => void
  onCancel: () => void
  onSaveDraft: () => void
  onSubmit: () => void
}

const SECTION_STEP = '3'

export function MedicationsSection({
  medications,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
  onCancel,
  onSaveDraft,
  onSubmit
}: MedicationsSectionProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-6'>
      <section className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
        {/* Section Header */}
        <div className='mb-6 flex items-center justify-between border-b border-surface-container-low pb-4'>
          <div className='flex items-center gap-3'>
            <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary'>
              {SECTION_STEP}
            </span>
            <div>
              <h2 className='text-xl font-bold text-on-surface'>{t('customer.patientCreate.section3.title')}</h2>
              <p className='text-xs text-on-surface-variant'>{t('customer.patientCreate.section3.subtitle')}</p>
            </div>
          </div>

          <button
            type='button'
            onClick={onAddMedicine}
            className='inline-flex items-center gap-1.5 rounded-lg bg-secondary-container/40 px-3 py-2 text-xs font-semibold text-on-secondary-container transition-colors hover:bg-secondary-container'
          >
            <Icon name='add' className='text-sm' />
            <span>{t('customer.patientCreate.section3.addMedicineBtn')}</span>
          </button>
        </div>

        {/* Medicine List */}
        <div className='mb-6 flex flex-col gap-4'>
          {medications.map((item, index) => (
            <div key={item.id} className='flex flex-col gap-3 rounded-xl bg-surface-container-low/70 p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary'>
                    {index + 1}
                  </span>
                  <input
                    type='text'
                    value={item.name}
                    onChange={(e) => onUpdateMedicine(item.id, { name: e.target.value })}
                    placeholder={t('customer.patientCreate.section3.medicineNamePlaceholder')}
                    className='h-8 w-60 rounded-md bg-surface-container-lowest px-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary focus:outline-none'
                  />
                  {item.category && (
                    <span className='rounded bg-surface-container-highest px-2 py-0.5 text-[11px] font-medium text-on-surface'>
                      {item.category}
                    </span>
                  )}
                </div>

                <button
                  type='button'
                  onClick={() => onDeleteMedicine(item.id)}
                  aria-label={t('customer.patientCreate.section3.deleteMedicine')}
                  className='p-1 text-on-surface-variant transition-colors hover:text-error'
                >
                  <Icon name='delete' className='text-lg' />
                </button>
              </div>

              <div className='grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3'>
                <div>
                  <label className='text-[11px] font-medium text-on-surface-variant'>
                    {t('customer.patientCreate.section3.dosageLabel')}
                  </label>
                  <input
                    type='text'
                    value={item.dosage}
                    onChange={(e) => onUpdateMedicine(item.id, { dosage: e.target.value })}
                    placeholder={t('customer.patientCreate.section3.dosagePlaceholder')}
                    className='mt-1 h-9 w-full rounded-md bg-surface-container-lowest px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none'
                  />
                </div>

                <div>
                  <label className='text-[11px] font-medium text-on-surface-variant'>
                    {t('customer.patientCreate.section3.timeLabel')}
                  </label>
                  <input
                    type='text'
                    value={item.time}
                    onChange={(e) => onUpdateMedicine(item.id, { time: e.target.value })}
                    placeholder={t('customer.patientCreate.section3.timePlaceholder')}
                    className='mt-1 h-9 w-full rounded-md bg-surface-container-lowest px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none'
                  />
                </div>

                <div>
                  <label className='text-[11px] font-medium text-on-surface-variant'>
                    {t('customer.patientCreate.section3.instructionsLabel')}
                  </label>
                  <input
                    type='text'
                    value={item.instructions}
                    onChange={(e) =>
                      onUpdateMedicine(item.id, {
                        instructions: e.target.value
                      })
                    }
                    placeholder={t('customer.patientCreate.section3.instructionsPlaceholder')}
                    className='mt-1 h-9 w-full rounded-md bg-surface-container-lowest px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none'
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Prescription Banner */}
        <div className='flex cursor-pointer flex-col items-center justify-center rounded-xl bg-surface-container-low p-6 text-center transition-colors hover:bg-surface-container'>
          <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-xs'>
            <Icon name='document_scanner' className='text-2xl' />
          </div>
          <h3 className='text-sm font-bold text-on-surface'>{t('customer.patientCreate.section3.uploadZoneTitle')}</h3>
          <p className='mt-1 max-w-lg text-xs text-on-surface-variant leading-relaxed'>
            {t('customer.patientCreate.section3.uploadZoneDesc')}
          </p>
          <button
            type='button'
            className='mt-4 rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-semibold text-primary shadow-xs transition-colors hover:bg-surface-container-high'
          >
            {t('customer.patientCreate.section3.chooseFileBtn')}
          </button>
        </div>
      </section>

      {/* Bottom Sticky Action Bar */}
      <div className='flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-md sm:flex-row'>
        <div className='flex items-center gap-2 text-xs font-medium text-on-surface-variant'>
          <Icon name='verified' className='text-lg text-primary' />
          <span>{t('customer.patientCreate.bottomBar.securityNotice')}</span>
        </div>

        <div className='flex w-full items-center justify-end gap-3 sm:w-auto'>
          <button
            type='button'
            onClick={onCancel}
            className='w-1/2 rounded-lg bg-surface-container-high px-5 py-2.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-variant sm:w-auto'
          >
            {t('customer.patientCreate.bottomBar.cancel')}
          </button>
          <button
            type='button'
            onClick={onSaveDraft}
            className='hidden rounded-lg bg-surface-container-low px-5 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container sm:inline-block'
          >
            {t('customer.patientCreate.bottomBar.saveDraft')}
          </button>
          <button
            type='button'
            onClick={onSubmit}
            className='inline-flex w-1/2 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow sm:w-auto'
          >
            <Icon name='check_circle' className='text-lg' />
            <span>{t('customer.patientCreate.bottomBar.complete')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
