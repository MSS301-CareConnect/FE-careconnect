import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { MedicationNameInput } from '~/entities/care-recipient/medication-name-input'
import { MedicationRequestRoute, type MedicationRecord, type MedicationRequest } from '~/shared/api/generated/contracts'

import { FormField, inputClassName } from './form-field'

const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/

export interface MedicationFormProps {
  medication?: MedicationRecord
  isSaving: boolean
  onSubmit: (request: MedicationRequest) => void
  onCancel: () => void
}

export function MedicationForm({ medication, isSaving, onSubmit, onCancel }: MedicationFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(medication?.medicationName ?? '')
  const [dosage, setDosage] = useState(medication?.dosage ?? '')
  const [frequency, setFrequency] = useState(medication?.frequency ?? '')
  const [times, setTimes] = useState(medication?.timeOfDay?.join(', ') ?? '')
  const [route, setRoute] = useState<'' | MedicationRequestRoute>(medication?.route ?? '')
  const [startDate, setStartDate] = useState(medication?.startDate ?? '')
  const [endDate, setEndDate] = useState(medication?.endDate ?? '')
  const [prescribedBy, setPrescribedBy] = useState(medication?.prescribedBy ?? '')
  const [usageNotes, setUsageNotes] = useState(medication?.usageNotes ?? '')
  const [error, setError] = useState<'required' | 'timeInvalid'>()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const timeOfDay = times
      .split(',')
      .map((time) => time.trim())
      .filter(Boolean)
    if (!name.trim() || !startDate) return setError('required')
    if (timeOfDay.some((time) => !TIME_PATTERN.test(time))) return setError('timeInvalid')
    setError(undefined)
    onSubmit({
      medicationName: name.trim(),
      dosage: dosage.trim() || undefined,
      frequency: frequency.trim() || undefined,
      timeOfDay,
      route: route || undefined,
      startDate,
      endDate: endDate || undefined,
      prescribedBy: prescribedBy.trim() || undefined,
      usageNotes: usageNotes.trim() || undefined
    })
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className='grid grid-cols-1 gap-3 rounded-lg bg-surface-container-low p-4 sm:grid-cols-2'
    >
      <FormField label={t('customer.patientDetail.prescriptions.nameLabel')} className='sm:col-span-2'>
        <MedicationNameInput
          value={name}
          onChange={setName}
          onSelect={(entry) => setRoute((current) => current || entry.route)}
          aria-label={t('customer.patientDetail.prescriptions.nameLabel')}
          className={inputClassName}
          containerClassName='relative w-full'
        />
      </FormField>
      <FormField label={t('customer.patientDetail.prescriptions.dosageLabel')}>
        <input
          type='text'
          maxLength={255}
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField label={t('customer.patientDetail.prescriptions.frequencyLabel')}>
        <input
          type='text'
          maxLength={255}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField
        label={t('customer.patientDetail.prescriptions.timeOfDayLabel')}
        hint={t('customer.patientDetail.prescriptions.timeOfDayHint')}
      >
        <input type='text' value={times} onChange={(e) => setTimes(e.target.value)} className={inputClassName} />
      </FormField>
      <FormField label={t('customer.patientDetail.prescriptions.routeLabel')}>
        <select
          value={route}
          onChange={(e) => setRoute(e.target.value as '' | MedicationRequestRoute)}
          className={inputClassName}
        >
          <option value=''>{t('customer.patientDetail.prescriptions.selectPlaceholder')}</option>
          {Object.values(MedicationRequestRoute).map((value) => (
            <option key={value} value={value}>
              {t(`customer.careRecipient.route.${value}`)}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label={t('customer.patientDetail.prescriptions.startDateLabel')}>
        <input
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField label={t('customer.patientDetail.prescriptions.endDateLabel')}>
        <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClassName} />
      </FormField>
      <FormField label={t('customer.patientDetail.prescriptions.prescribedByLabel')} className='sm:col-span-2'>
        <input
          type='text'
          maxLength={255}
          value={prescribedBy}
          onChange={(e) => setPrescribedBy(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField label={t('customer.patientDetail.prescriptions.usageNotesLabel')} className='sm:col-span-2'>
        <textarea
          rows={2}
          maxLength={5000}
          value={usageNotes}
          onChange={(e) => setUsageNotes(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      {error ? (
        <p role='alert' className='text-xs text-error sm:col-span-2'>
          {t(`customer.patientDetail.prescriptions.${error}`)}
        </p>
      ) : null}
      <div className='flex gap-2 sm:col-span-2'>
        <button
          type='submit'
          disabled={isSaving}
          className='rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-60'
        >
          {t('customer.patientDetail.prescriptions.save')}
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg bg-surface-container-lowest px-3 py-2 text-xs font-medium text-on-surface'
        >
          {t('customer.patientDetail.prescriptions.cancel')}
        </button>
      </div>
    </form>
  )
}
