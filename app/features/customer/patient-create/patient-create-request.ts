import type {
  CareRecipientCreateRequest,
  CareRecipientCreateRequestRelationshipType,
  EmergencyContactRequest,
  MedicationRequest
} from '~/shared/api/generated/contracts'

import type { MedicationItem, PatientCreateFormData, Relationship } from './types'

export const CHRONIC_KEYS = [
  'hypertension',
  'diabetes',
  'strokeHistory',
  'heartDisease',
  'dementia',
  'osteoarthritis',
  'kidneyDisease',
  'copd'
] as const

export type ChronicKey = (typeof CHRONIC_KEYS)[number]

export type PatientCreateValidationError =
  | 'fullNameRequired'
  | 'fullNameTooLong'
  | 'relationshipRequired'
  | 'birthDateRequired'
  | 'birthDateFuture'
  | 'genderRequired'
  | 'heightRange'
  | 'weightRange'
  | 'textTooLong'
  | 'medicationNameRequired'
  | 'medicationStartDateRequired'
  | 'emergencyNameRequired'
  | 'emergencyRelationshipRequired'
  | 'emergencyPhoneRequired'
  | 'emergencyPhoneInvalid'

/** Form controls that can show their own error, keyed so the UI can find each control. */
export type PatientCreateField =
  | 'fullName'
  | 'relationship'
  | 'birthDate'
  | 'gender'
  | 'height'
  | 'weight'
  | 'otherChronic'
  | 'allergies'
  | 'surgeryHistory'
  | 'emergencyName'
  | 'emergencyRelationship'
  | 'emergencyPhone'
  | `medication.${string}.name`
  | `medication.${string}.startDate`

export type PatientCreateErrors = Partial<Record<PatientCreateField, PatientCreateValidationError>>

export const medicationField = (id: string, part: 'name' | 'startDate'): PatientCreateField =>
  `medication.${id}.${part}`

/** Backend error codes that point at one control; other codes stay a form-level message. */
const SERVER_FIELD_ERRORS: Record<number, PatientCreateErrors> = {
  2104: { fullName: 'fullNameRequired' },
  2105: { fullName: 'fullNameTooLong' },
  2107: { birthDate: 'birthDateFuture' },
  2113: { relationship: 'relationshipRequired' },
  2106: { emergencyPhone: 'emergencyPhoneInvalid' },
  2301: { emergencyName: 'emergencyNameRequired' },
  2302: { emergencyPhone: 'emergencyPhoneRequired' },
  2303: { emergencyRelationship: 'emergencyRelationshipRequired' }
}

export function fieldErrorsFromServerCode(code: number | undefined): PatientCreateErrors | null {
  return code === undefined ? null : (SERVER_FIELD_ERRORS[code] ?? null)
}

/**
 * The form asks who the patient is to the customer ("father"), while the backend stores
 * the customer's relationship to the patient ("CHILD").
 */
const RELATIONSHIP_TYPES: Record<Relationship, CareRecipientCreateRequestRelationshipType> = {
  father: 'CHILD',
  mother: 'CHILD',
  spouse: 'SPOUSE',
  child: 'PARENT',
  grandparent: 'GRANDCHILD',
  sibling: 'SIBLING',
  other: 'RELATIVE'
}

const MAX_TEXT = 5000
export const MAX_MEDICATIONS = 50
const PHONE_PATTERN = /^[0-9]{10,11}$/

/** Today's date in the browser's time zone, in the backend LocalDate format. */
export function localIsoDate(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function optional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed || undefined
}

function normalizePhone(value: string): string {
  return value.replace(/[\s.-]/g, '')
}

function isBlankMedication(item: MedicationItem): boolean {
  return ![item.name, item.dosage, item.time, item.instructions].some((value) => value.trim())
}

function chronicConditions(form: PatientCreateFormData, chronicLabel: (key: ChronicKey) => string) {
  const selected = CHRONIC_KEYS.filter((key) => form.chronicIllnesses.includes(key)).map(chronicLabel)
  return [...selected, form.otherChronic.trim()].filter(Boolean).join(', ')
}

function hasEmergencyContact(form: PatientCreateFormData): boolean {
  const { fullName, relationship, phoneNumber } = form.emergencyContact
  return [fullName, relationship, phoneNumber].some((value) => value.trim())
}

/** Returns every invalid control with its message key; an empty object means the form is valid. */
export function validatePatientCreate(
  form: PatientCreateFormData,
  chronicLabel: (key: ChronicKey) => string,
  today: string
): PatientCreateErrors {
  const errors: PatientCreateErrors = {}
  if (!form.fullName.trim()) errors.fullName = 'fullNameRequired'
  if (!form.relationship) errors.relationship = 'relationshipRequired'
  if (!form.birthDate) errors.birthDate = 'birthDateRequired'
  else if (form.birthDate > today) errors.birthDate = 'birthDateFuture'
  if (!form.gender) errors.gender = 'genderRequired'
  if (form.height !== '' && (form.height <= 0 || form.height > 300)) errors.height = 'heightRange'
  if (form.weight !== '' && (form.weight <= 0 || form.weight > 500)) errors.weight = 'weightRange'
  if (chronicConditions(form, chronicLabel).length > MAX_TEXT) errors.otherChronic = 'textTooLong'
  if (form.allergies.join(', ').length > MAX_TEXT) errors.allergies = 'textTooLong'
  if (form.surgeryHistory.length > MAX_TEXT) errors.surgeryHistory = 'textTooLong'

  for (const item of form.medications.filter((medication) => !isBlankMedication(medication))) {
    if (!item.name.trim()) errors[medicationField(item.id, 'name')] = 'medicationNameRequired'
    if (!item.startDate) errors[medicationField(item.id, 'startDate')] = 'medicationStartDateRequired'
  }

  if (hasEmergencyContact(form)) {
    const { fullName, relationship, phoneNumber } = form.emergencyContact
    if (!fullName.trim()) errors.emergencyName = 'emergencyNameRequired'
    if (!relationship.trim()) errors.emergencyRelationship = 'emergencyRelationshipRequired'
    if (!phoneNumber.trim()) errors.emergencyPhone = 'emergencyPhoneRequired'
    else if (!PHONE_PATTERN.test(normalizePhone(phoneNumber))) errors.emergencyPhone = 'emergencyPhoneInvalid'
  }
  return errors
}

/** Call only after {@link validatePatientCreate} returns no errors. */
export function toCareRecipientCreateRequest(
  form: PatientCreateFormData,
  chronicLabel: (key: ChronicKey) => string
): CareRecipientCreateRequest {
  const medications: MedicationRequest[] = form.medications
    .filter((item) => !isBlankMedication(item))
    .map((item) => ({
      medicationName: item.name.trim(),
      startDate: item.startDate,
      dosage: optional(item.dosage),
      frequency: optional(item.time),
      usageNotes: optional(item.instructions),
      active: true
    }))
  const emergencyContacts: EmergencyContactRequest[] = hasEmergencyContact(form)
    ? [
        {
          fullName: form.emergencyContact.fullName.trim(),
          relationship: form.emergencyContact.relationship.trim(),
          phoneNumber: normalizePhone(form.emergencyContact.phoneNumber),
          primary: true
        }
      ]
    : []

  return {
    fullName: form.fullName.trim(),
    relationshipType: RELATIONSHIP_TYPES[form.relationship as Relationship],
    dateOfBirth: form.birthDate,
    gender: form.gender || undefined,
    heightCm: form.height === '' ? undefined : form.height,
    weightKg: form.weight === '' ? undefined : form.weight,
    bloodType: form.bloodType || undefined,
    chronicConditions: optional(chronicConditions(form, chronicLabel)),
    allergies: optional(form.allergies.join(', ')),
    medicalHistory: optional(form.surgeryHistory),
    medications,
    emergencyContacts
  }
}
