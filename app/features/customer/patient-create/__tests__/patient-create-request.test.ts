import { describe, expect, it } from 'vitest'

import { INITIAL_FORM_DATA } from '../hooks/use-patient-create'
import {
  fieldErrorsFromServerCode,
  medicationField,
  toCareRecipientCreateRequest,
  validatePatientCreate,
  type ChronicKey
} from '../patient-create-request'
import type { PatientCreateFormData } from '../types'

const label = (key: ChronicKey) => `label:${key}`
const today = '2026-10-22'

const validForm: PatientCreateFormData = {
  ...INITIAL_FORM_DATA,
  fullName: '  Nguyen Van An  ',
  relationship: 'father',
  birthDate: '1956-08-14',
  gender: 'MALE',
  height: 168,
  weight: 65,
  bloodType: 'O+',
  chronicIllnesses: ['diabetes', 'hypertension'],
  otherChronic: 'Gout',
  allergies: ['Penicillin', 'Shrimp'],
  surgeryHistory: 'Knee replacement 2021',
  medications: [
    {
      id: 'med-1',
      name: 'Amlodipine 5mg',
      dosage: '1 tablet',
      time: 'Morning',
      instructions: 'After breakfast',
      startDate: '2026-10-01'
    },
    { id: 'med-2', name: '', dosage: '', time: '', instructions: '', startDate: '2026-10-22' }
  ]
}

describe('toCareRecipientCreateRequest', () => {
  it('maps the form to the backend create contract', () => {
    expect(validatePatientCreate(validForm, label, today)).toEqual({})

    expect(toCareRecipientCreateRequest(validForm, label)).toEqual({
      fullName: 'Nguyen Van An',
      relationshipType: 'CHILD',
      dateOfBirth: '1956-08-14',
      gender: 'MALE',
      heightCm: 168,
      weightKg: 65,
      bloodType: 'O+',
      chronicConditions: 'label:hypertension, label:diabetes, Gout',
      allergies: 'Penicillin, Shrimp',
      medicalHistory: 'Knee replacement 2021',
      medications: [
        {
          medicationName: 'Amlodipine 5mg',
          startDate: '2026-10-01',
          dosage: '1 tablet',
          frequency: 'Morning',
          usageNotes: 'After breakfast',
          active: true
        }
      ],
      emergencyContacts: []
    })
  })

  it('stores the customer relationship to the patient, not the patient relationship to the customer', () => {
    const relationshipType = (relationship: PatientCreateFormData['relationship']) =>
      toCareRecipientCreateRequest({ ...validForm, relationship }, label).relationshipType

    expect(relationshipType('mother')).toBe('CHILD')
    expect(relationshipType('child')).toBe('PARENT')
    expect(relationshipType('grandparent')).toBe('GRANDCHILD')
    expect(relationshipType('other')).toBe('RELATIVE')
  })

  it('sends one primary emergency contact with a normalized phone number', () => {
    const form = {
      ...validForm,
      emergencyContact: { fullName: ' Mai Anh ', relationship: 'Daughter', phoneNumber: '090 123 4567' }
    }

    expect(validatePatientCreate(form, label, today)).toEqual({})
    expect(toCareRecipientCreateRequest(form, label).emergencyContacts).toEqual([
      { fullName: 'Mai Anh', relationship: 'Daughter', phoneNumber: '0901234567', primary: true }
    ])
  })
})

describe('validatePatientCreate', () => {
  it.each([
    [{ fullName: ' ' }, { fullName: 'fullNameRequired' }],
    [{ relationship: '' as const }, { relationship: 'relationshipRequired' }],
    [{ birthDate: '' }, { birthDate: 'birthDateRequired' }],
    [{ birthDate: '2026-10-23' }, { birthDate: 'birthDateFuture' }],
    [{ gender: '' as const }, { gender: 'genderRequired' }],
    [{ height: 301 }, { height: 'heightRange' }],
    [{ weight: 0 }, { weight: 'weightRange' }],
    [{ surgeryHistory: 'x'.repeat(5001) }, { surgeryHistory: 'textTooLong' }]
  ])('marks only the invalid field for %o', (change, errors) => {
    expect(validatePatientCreate({ ...validForm, ...change }, label, today)).toEqual(errors)
  })

  it('reports every invalid field at once so each input can show its own message', () => {
    expect(validatePatientCreate(INITIAL_FORM_DATA, label, today)).toEqual({
      fullName: 'fullNameRequired',
      relationship: 'relationshipRequired',
      birthDate: 'birthDateRequired',
      gender: 'genderRequired'
    })
  })

  it('marks the name and start date of each medication row that has any detail', () => {
    const unnamed = { ...validForm.medications[0], id: 'med-a', name: '' }
    const undated = { ...validForm.medications[0], id: 'med-b', startDate: '' }

    expect(validatePatientCreate({ ...validForm, medications: [unnamed, undated] }, label, today)).toEqual({
      [medicationField('med-a', 'name')]: 'medicationNameRequired',
      [medicationField('med-b', 'startDate')]: 'medicationStartDateRequired'
    })
  })

  it('marks each missing emergency contact field once any of them is filled', () => {
    const partial = { ...validForm, emergencyContact: { fullName: 'Mai Anh', relationship: '', phoneNumber: '' } }
    expect(validatePatientCreate(partial, label, today)).toEqual({
      emergencyRelationship: 'emergencyRelationshipRequired',
      emergencyPhone: 'emergencyPhoneRequired'
    })

    const badPhone = {
      ...validForm,
      emergencyContact: { fullName: 'Mai Anh', relationship: 'Daughter', phoneNumber: '12345' }
    }
    expect(validatePatientCreate(badPhone, label, today)).toEqual({ emergencyPhone: 'emergencyPhoneInvalid' })
  })
})

describe('fieldErrorsFromServerCode', () => {
  it('maps backend validation codes to the matching field', () => {
    expect(fieldErrorsFromServerCode(2104)).toEqual({ fullName: 'fullNameRequired' })
    expect(fieldErrorsFromServerCode(2107)).toEqual({ birthDate: 'birthDateFuture' })
    expect(fieldErrorsFromServerCode(2302)).toEqual({ emergencyPhone: 'emergencyPhoneRequired' })
  })

  it('leaves codes without a single matching field to the form-level message', () => {
    expect(fieldErrorsFromServerCode(2110)).toBeNull()
    expect(fieldErrorsFromServerCode(undefined)).toBeNull()
  })
})
