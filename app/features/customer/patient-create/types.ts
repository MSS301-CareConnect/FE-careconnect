export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'unknown'

export type Gender = 'male' | 'female' | 'other'

export type Relationship = 'father' | 'mother' | 'spouse' | 'child' | 'grandparent' | 'sibling' | 'other'

export interface MedicationItem {
  id: string
  name: string
  category?: string
  dosage: string
  time: string
  instructions: string
}

export interface PatientCreateFormData {
  avatar: string
  fullName: string
  relationship: Relationship
  birthDate: string
  gender: Gender
  idNumber: string
  bhytNumber: string
  height: number | ''
  weight: number | ''
  bloodType: BloodType
  chronicIllnesses: string[]
  otherChronic: string
  allergies: string[]
  surgeryHistory: string
  doctorName: string
  doctorContact: string
  medications: MedicationItem[]
}

export type BmiStatus = 'underweight' | 'normal' | 'overweight' | 'obese'

export interface BmiResult {
  value: string
  status: BmiStatus
}
