import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { PatientCreateErrors, PatientCreateField } from '../patient-create-request'

/** Red outline for controls marked aria-invalid, appended to each control's own classes. */
export const invalidClassName = 'aria-invalid:ring-2 aria-invalid:ring-error'

function fieldErrorId(field: PatientCreateField): string {
  return `patient-create-error-${field.replace(/[^a-zA-Z0-9-]/g, '-')}`
}

/** Links a control to its message so assistive technology reads the error with the field. */
export function fieldErrorProps(field: PatientCreateField, errors: PatientCreateErrors) {
  return errors[field] ? { 'aria-invalid': true, 'aria-describedby': fieldErrorId(field) } : {}
}

export interface FieldErrorProps {
  field: PatientCreateField
  errors: PatientCreateErrors
}

export function FieldError({ field, errors }: FieldErrorProps) {
  const { t } = useTranslation()
  const error = errors[field]
  if (!error) return null

  return (
    <p id={fieldErrorId(field)} className='flex items-center gap-1 text-[11px] font-medium text-error'>
      <Icon name='error' className='text-sm' />
      <span>{t(`customer.patientCreate.validation.${error}`)}</span>
    </p>
  )
}
