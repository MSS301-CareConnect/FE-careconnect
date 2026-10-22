import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  careRecipientErrorCode,
  careRecipientErrorStatus,
  careRecipientKeys,
  createRecipientProfile
} from '~/entities/care-recipient/care-recipient-api'

import {
  fieldErrorsFromServerCode,
  localIsoDate,
  MAX_MEDICATIONS,
  medicationField,
  toCareRecipientCreateRequest,
  validatePatientCreate,
  type ChronicKey,
  type PatientCreateErrors,
  type PatientCreateField
} from '../patient-create-request'
import type { BmiResult, BmiStatus, EmergencyContactDraft, MedicationItem, PatientCreateFormData } from '../types'

export const INITIAL_FORM_DATA: PatientCreateFormData = {
  fullName: '',
  relationship: '',
  birthDate: '',
  gender: '',
  height: '',
  weight: '',
  bloodType: '',
  chronicIllnesses: [],
  otherChronic: '',
  allergies: [],
  surgeryHistory: '',
  emergencyContact: { fullName: '', relationship: '', phoneNumber: '' },
  medications: []
}

/** Form keys edited through updateField that own an error message of the same name. */
const FIELD_KEYS: readonly (keyof PatientCreateFormData & PatientCreateField)[] = [
  'fullName',
  'relationship',
  'birthDate',
  'gender',
  'height',
  'weight',
  'otherChronic',
  'surgeryHistory'
]

const EMERGENCY_FIELDS: Record<keyof EmergencyContactDraft, PatientCreateField> = {
  fullName: 'emergencyName',
  relationship: 'emergencyRelationship',
  phoneNumber: 'emergencyPhone'
}

export type PatientCreateFormError = 'submitInvalid' | 'submitFailed'

export function computeBmi(height: number | '', weight: number | ''): BmiResult {
  if (!height || !weight || height <= 0 || weight <= 0) {
    return { value: '--', status: 'normal' }
  }
  const hMeters = Number(height) / 100
  const wKg = Number(weight)
  const bmiNum = wKg / (hMeters * hMeters)
  const value = bmiNum.toFixed(1)

  let status: BmiStatus
  if (bmiNum < 18.5) {
    status = 'underweight'
  } else if (bmiNum <= 24.9) {
    status = 'normal'
  } else if (bmiNum <= 29.9) {
    status = 'overweight'
  } else {
    status = 'obese'
  }

  return { value, status }
}

export function usePatientCreate() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<PatientCreateFormData>(INITIAL_FORM_DATA)
  const [newAllergyText, setNewAllergyText] = useState('')
  const [errors, setErrors] = useState<PatientCreateErrors>({})
  const [formError, setFormError] = useState<PatientCreateFormError | null>(null)
  // Incremented on every failed submit so the page moves focus to the first invalid control again.
  const [focusRequest, setFocusRequest] = useState(0)

  const bmi = computeBmi(formData.height, formData.weight)
  const chronicLabel = (key: ChronicKey) => t(`customer.patientCreate.section2.chronicOptions.${key}`)

  const create = useMutation({
    mutationFn: createRecipientProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careRecipientKeys.all }),
    onError: (error) => {
      const fieldErrors = fieldErrorsFromServerCode(careRecipientErrorCode(error))
      if (fieldErrors) {
        setErrors(fieldErrors)
        setFocusRequest((count) => count + 1)
      } else {
        setFormError(careRecipientErrorStatus(error) === 400 ? 'submitInvalid' : 'submitFailed')
      }
    }
  })

  const clearErrors = (...fields: PatientCreateField[]) => {
    setErrors((prev) => {
      if (!fields.some((field) => field in prev)) return prev
      const next = { ...prev }
      for (const field of fields) delete next[field]
      return next
    })
  }

  const updateField = <K extends keyof PatientCreateFormData>(field: K, value: PatientCreateFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    const errorField = FIELD_KEYS.find((key) => key === field)
    if (errorField) clearErrors(errorField)
  }

  const updateEmergencyContact = (partial: Partial<EmergencyContactDraft>) => {
    setFormData((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact, ...partial } }))
    clearErrors(...Object.keys(partial).map((key) => EMERGENCY_FIELDS[key as keyof EmergencyContactDraft]))
  }

  const handleToggleChronic = (illnessKey: string) => {
    clearErrors('otherChronic')
    setFormData((prev) => {
      const exists = prev.chronicIllnesses.includes(illnessKey)
      const chronicIllnesses = exists
        ? prev.chronicIllnesses.filter((k) => k !== illnessKey)
        : [...prev.chronicIllnesses, illnessKey]
      return { ...prev, chronicIllnesses }
    })
  }

  const handleAddAllergy = () => {
    const trimmed = newAllergyText.trim()
    if (!trimmed) return
    if (!formData.allergies.includes(trimmed)) {
      clearErrors('allergies')
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, trimmed]
      }))
    }
    setNewAllergyText('')
  }

  const handleRemoveAllergy = (allergyToRemove: string) => {
    clearErrors('allergies')
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergyToRemove)
    }))
  }

  const handleAddMedicine = () => {
    if (formData.medications.length >= MAX_MEDICATIONS) return
    const newItem: MedicationItem = {
      id: `med-${Date.now()}`,
      name: '',
      dosage: '',
      time: '',
      instructions: '',
      startDate: localIsoDate()
    }
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, newItem]
    }))
  }

  const handleUpdateMedicine = (id: string, partial: Partial<MedicationItem>) => {
    if ('name' in partial) clearErrors(medicationField(id, 'name'))
    if ('startDate' in partial) clearErrors(medicationField(id, 'startDate'))
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((item) => (item.id === id ? { ...item, ...partial } : item))
    }))
  }

  const handleDeleteMedicine = (id: string) => {
    clearErrors(medicationField(id, 'name'), medicationField(id, 'startDate'))
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((item) => item.id !== id)
    }))
  }

  const handleSubmit = () => {
    if (create.isPending) return
    const nextErrors = validatePatientCreate(formData, chronicLabel, localIsoDate())
    setErrors(nextErrors)
    setFormError(null)
    if (Object.keys(nextErrors).length > 0) {
      setFocusRequest((count) => count + 1)
      return
    }
    create.mutate(toCareRecipientCreateRequest(formData, chronicLabel))
  }

  return {
    formData,
    updateField,
    updateEmergencyContact,
    bmi,
    handleToggleChronic,
    newAllergyText,
    setNewAllergyText,
    handleAddAllergy,
    handleRemoveAllergy,
    handleAddMedicine,
    handleUpdateMedicine,
    handleDeleteMedicine,
    errors,
    formError,
    focusRequest,
    isSubmitting: create.isPending,
    createdProfile: create.data?.profile,
    handleSubmit,
    handleCloseModal: create.reset
  }
}
