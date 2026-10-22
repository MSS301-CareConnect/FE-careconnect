import { useTranslation } from 'react-i18next'

import { MedicationNameInput } from '~/entities/care-recipient/medication-name-input'
import { Icon } from '~/shared/ui/icon'

import { MAX_MEDICATIONS, medicationField, type PatientCreateErrors } from '../patient-create-request'
import type { MedicationItem } from '../types'
import { FieldError, fieldErrorProps, invalidClassName } from './field-error'

export interface MedicationsSectionProps {
  medications: MedicationItem[]
  errors: PatientCreateErrors
  onAddMedicine: () => void
  onUpdateMedicine: (id: string, partial: Partial<MedicationItem>) => void
  onDeleteMedicine: (id: string) => void
  onCancel: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

const SECTION_STEP = '3'
const fieldClass = `mt-1 h-9 w-full rounded-md bg-surface-container-lowest px-3 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none ${invalidClassName}`

export function MedicationsSection({
  medications,
  errors,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
  onCancel,
  onSubmit,
  isSubmitting
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
            disabled={medications.length >= MAX_MEDICATIONS}
            className='inline-flex items-center gap-1.5 rounded-lg bg-secondary-container/40 px-3 py-2 text-xs font-semibold text-on-secondary-container transition-colors hover:bg-secondary-container disabled:opacity-50'
          >
            <Icon name='add' className='text-sm' />
            <span>{t('customer.patientCreate.section3.addMedicineBtn')}</span>
          </button>
        </div>

        {/* Medicine List */}
        <div className='flex flex-col gap-4'>
          {medications.length === 0 ? (
            <p className='rounded-xl bg-surface-container-low/70 p-4 text-center text-xs text-on-surface-variant'>
              {t('customer.patientCreate.section3.empty')}
            </p>
          ) : null}
          {medications.map((item, index) => (
            <div key={item.id} className='flex flex-col gap-3 rounded-xl bg-surface-container-low/70 p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-2'>
                  <span className='mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary'>
                    {index + 1}
                  </span>
                  <div className='flex flex-col gap-1'>
                    <MedicationNameInput
                      value={item.name}
                      onChange={(name) => onUpdateMedicine(item.id, { name })}
                      aria-label={t('customer.patientCreate.section3.medicineNameLabel')}
                      {...fieldErrorProps(medicationField(item.id, 'name'), errors)}
                      placeholder={t('customer.patientCreate.section3.medicineNamePlaceholder')}
                      className={`h-8 w-60 rounded-md bg-surface-container-lowest px-3 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary focus:outline-none ${invalidClassName}`}
                    />
                    <FieldError field={medicationField(item.id, 'name')} errors={errors} />
                  </div>
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

              <div className='grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-4'>
                <div>
                  <label htmlFor={`${item.id}-dosage`} className='text-[11px] font-medium text-on-surface-variant'>
                    {t('customer.patientCreate.section3.dosageLabel')}
                  </label>
                  <input
                    id={`${item.id}-dosage`}
                    type='text'
                    maxLength={255}
                    value={item.dosage}
                    onChange={(e) => onUpdateMedicine(item.id, { dosage: e.target.value })}
                    placeholder={t('customer.patientCreate.section3.dosagePlaceholder')}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor={`${item.id}-time`} className='text-[11px] font-medium text-on-surface-variant'>
                    {t('customer.patientCreate.section3.timeLabel')}
                  </label>
                  <input
                    id={`${item.id}-time`}
                    type='text'
                    maxLength={255}
                    value={item.time}
                    onChange={(e) => onUpdateMedicine(item.id, { time: e.target.value })}
                    placeholder={t('customer.patientCreate.section3.timePlaceholder')}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor={`${item.id}-start`} className='text-[11px] font-medium text-on-surface-variant'>
                    {t('customer.patientCreate.section3.startDateLabel')}
                  </label>
                  <input
                    id={`${item.id}-start`}
                    type='date'
                    value={item.startDate}
                    onChange={(e) => onUpdateMedicine(item.id, { startDate: e.target.value })}
                    {...fieldErrorProps(medicationField(item.id, 'startDate'), errors)}
                    className={fieldClass}
                  />
                  <FieldError field={medicationField(item.id, 'startDate')} errors={errors} />
                </div>

                <div>
                  <label htmlFor={`${item.id}-notes`} className='text-[11px] font-medium text-on-surface-variant'>
                    {t('customer.patientCreate.section3.instructionsLabel')}
                  </label>
                  <input
                    id={`${item.id}-notes`}
                    type='text'
                    maxLength={5000}
                    value={item.instructions}
                    onChange={(e) => onUpdateMedicine(item.id, { instructions: e.target.value })}
                    placeholder={t('customer.patientCreate.section3.instructionsPlaceholder')}
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          ))}
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
            onClick={onSubmit}
            disabled={isSubmitting}
            className='inline-flex w-1/2 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow disabled:opacity-60 sm:w-auto'
          >
            <Icon name='check_circle' className='text-lg' />
            <span>
              {isSubmitting ? t('customer.patientCreate.submitting') : t('customer.patientCreate.bottomBar.complete')}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
