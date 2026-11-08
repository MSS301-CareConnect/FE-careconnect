import type {
  CareRecipientCreateRequestBloodType,
  CareRecipientCreateRequestGender
} from '~/shared/api/generated/contracts'

export type BloodType = CareRecipientCreateRequestBloodType

export type Gender = CareRecipientCreateRequestGender

/** How the care recipient relates to the signed-in customer, as worded on the form. */
export type Relationship = 'father' | 'mother' | 'spouse' | 'child' | 'grandparent' | 'sibling' | 'other'

export interface MedicationItem {
  id: string
  name: string
  dosage: string
  time: string
  instructions: string
  startDate: string
}

export interface EmergencyContactDraft {
  fullName: string
  relationship: string
  phoneNumber: string
}

export interface PatientCreateFormData {
  fullName: string
  relationship: Relationship | ''
  birthDate: string
  gender: Gender | ''
  height: number | ''
  weight: number | ''
  bloodType: BloodType | ''
  chronicIllnesses: string[]
  otherChronic: string
  allergies: string[]
  surgeryHistory: string
  emergencyContact: EmergencyContactDraft
  medications: MedicationItem[]
}

export type BmiStatus = 'underweight' | 'normal' | 'overweight' | 'obese'

export interface BmiResult {
  value: string
  status: BmiStatus
}
