import { useState } from 'react'

import type { BmiResult, BmiStatus, MedicationItem, PatientCreateFormData } from '../types'

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDFS3GAEtnT_oHmkrBJpi8s81GsKQ2bZ-7iafOegibpMGnTFFPpH0W4DezPQtRYIpzW-_FcLevEWkqCrREXrDtZQ4--hM_qcJMpkpo_BwY9G2B4VWj8mnK4rbxAAkXnIrC4BKObPLFywNhVz1FztJSSo2yR0q4jpEil-0H1cNWrxOJCj04GKH3VHlyWXqRK_rql3smKWiDcQQ3at56KziRs-A1oCnoBOhEF7A3mnqC-UWijpaBZiXBrvQ'

export const INITIAL_FORM_DATA: PatientCreateFormData = {
  avatar: DEFAULT_AVATAR,
  fullName: 'Nguyễn Văn An',
  relationship: 'father',
  birthDate: '1956-08-14',
  gender: 'male',
  idNumber: '079056012499',
  bhytNumber: 'GD4797931405928',
  height: 168,
  weight: 65,
  bloodType: 'O+',
  chronicIllnesses: ['hypertension', 'diabetes', 'osteoarthritis'],
  otherChronic: '',
  allergies: ['Kháng sinh nhóm Penicillin', 'Aspirin & NSAIDs', 'Tôm & Cua biển'],
  surgeryHistory: 'Thay khớp gối nhân tạo chân phải (Năm 2021, Bệnh viện Chợ Rẫy); Mổ sỏi túi mật nội soi (Năm 2018)',
  doctorName: 'BS.CK2 Lê Hoàng Nam - BV Thống Nhất',
  doctorContact: '0912 345 678',
  medications: [
    {
      id: 'med-1',
      name: 'Amlodipine 5mg',
      category: 'Hạ huyết áp',
      dosage: '1 viên / ngày',
      time: 'Sáng (07:00) - Sau ăn',
      instructions: 'Đo huyết áp trước khi cho uống'
    },
    {
      id: 'med-2',
      name: 'Metformin 850mg',
      category: 'Kiểm soát đường huyết',
      dosage: '2 viên / ngày (chia 2 lần)',
      time: 'Sáng - Tối (Cùng bữa ăn)',
      instructions: 'Uống nguyên viên với nhiều nước'
    }
  ]
}

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
  const [formData, setFormData] = useState<PatientCreateFormData>(INITIAL_FORM_DATA)
  const [draftNoticeTime, setDraftNoticeTime] = useState<string | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [newAllergyText, setNewAllergyText] = useState('')

  const bmi = computeBmi(formData.height, formData.weight)

  const updateField = <K extends keyof PatientCreateFormData>(field: K, value: PatientCreateFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleToggleChronic = (illnessKey: string) => {
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
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, trimmed]
      }))
    }
    setNewAllergyText('')
  }

  const handleRemoveAllergy = (allergyToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergyToRemove)
    }))
  }

  const handleAddMedicine = () => {
    const newId = `med-${Date.now()}`
    const newItem: MedicationItem = {
      id: newId,
      name: '',
      dosage: '',
      time: '',
      instructions: ''
    }
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, newItem]
    }))
  }

  const handleUpdateMedicine = (id: string, partial: Partial<MedicationItem>) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((item) => (item.id === id ? { ...item, ...partial } : item))
    }))
  }

  const handleDeleteMedicine = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((item) => item.id !== id)
    }))
  }

  const handleSaveDraft = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    setDraftNoticeTime(`${hours}:${mins}`)
  }

  const handleDismissDraftNotice = () => {
    setDraftNoticeTime(null)
  }

  const handleSubmit = () => {
    setIsSuccessModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false)
  }

  return {
    formData,
    updateField,
    bmi,
    handleToggleChronic,
    newAllergyText,
    setNewAllergyText,
    handleAddAllergy,
    handleRemoveAllergy,
    handleAddMedicine,
    handleUpdateMedicine,
    handleDeleteMedicine,
    draftNoticeTime,
    handleSaveDraft,
    handleDismissDraftNotice,
    isSuccessModalOpen,
    handleSubmit,
    handleCloseModal
  }
}
