import { useMemo, useState } from 'react'

import type { HealthStatusFilter, PatientProfile, RelationshipFilter } from '../types'

export const MOCK_PATIENT_PROFILES: PatientProfile[] = [
  {
    id: 'P-001',
    name: 'Nguyễn Văn A',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBE0Odu1YAflwU7MoqzS1I94dNJGVJHfHBS0Auw65MC1LOy5qIh6j11dGblU_7xxjIyF24-NXpB8wHVyWA36sIUJululF5N-A0kSEYoGX4T1eXAHxTz52E8Wz5k3bcZioubrCclt2TE3OKVWZloUMpDp8wa-b4KGb2X1F_Nymo9iRYvsMVpGrSak7MW2APsI0hF3GPC87nU5xU9L9ht_eb0eyzAgRkKZ2d8Eys55ULPuDeyaEubK0VpQw',
    relationship: 'parents',
    relationshipLabel: 'Bố ruột',
    age: 78,
    gender: 'male',
    bloodType: 'O+',
    weight: '62kg',
    height: '1m68',
    status: 'in-care',
    statusCategory: 'special',
    diagnosesTitleType: 'diagnoses',
    diagnoses: 'Tăng huyết áp độ 2, Đái tháo đường Type 2, Di chứng sau tai biến nhẹ (yếu nhẹ nửa người trái).',
    instructionsTitleType: 'special',
    instructions:
      'Cần hỗ trợ dìu khi đi lại, đo huyết áp & đường huyết 2 lần/ngày (sáng 7h, chiều 17h), ăn nhạt giảm muối.',
    attendingDoctor: {
      name: 'BS.CKII Lê Hoàng Nam',
      hospital: 'BV ĐHYD TP.HCM'
    }
  },
  {
    id: 'P-002',
    name: 'Trần Thị Lan',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmGBVj61twfeA5kicre7UkD5_RuS2__iT2IOIyy6Ne3MwnaL8aHkWvFN1jmDZ2R63_VF3vDlsvZhmMKKqgb6BwL26tUgHnpxx1SKMgbyT4iv03Hc45CGuu2nNz0TjRf7C00S5RX2JuM-QipD0rqDvLIT_A1HXZBsvsSDkCC5Rn8vuKaunY2CIyxof8NhPVAxnCC9I8KN-lsuSv3RArMFGH9aIz6zxgbKKKP9TSBhesBlmSytE0w2CTrA',
    relationship: 'parents',
    relationshipLabel: 'Mẹ ruột',
    age: 75,
    gender: 'female',
    bloodType: 'A+',
    weight: '54kg',
    height: '1m55',
    status: 'stable',
    statusCategory: 'monitoring',
    diagnosesTitleType: 'primary',
    diagnoses: 'Thoái hóa khớp gối nặng, Loãng xương, Rối loạn giấc ngủ người cao tuổi.',
    instructionsTitleType: 'rehab',
    instructions:
      'Hỗ trợ xoa bóp vật lý trị liệu, tập vận động nhẹ tại giường, nhắc uống canxi sau ăn sáng, tránh sàn trơn ướt.'
  },
  {
    id: 'P-003',
    name: 'Nguyễn Minh Khang',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCH5RaX9uYtZZD_Ths0mAWziU2QjuFdnj5A9r9IJisP8TJW7AtKYHWo8gHHFYmwhVXGdMn1bwTOjA808u94PeAiSDB8pFzH1qnDRdi5SrF_uEc5tYdYMxQTUAtviMcn8eMh15rC_HfCkPxjtcjzbcHDyCHGQ2zjDUg5aZupOHVCPW1UJhX8tFtZxcyT0OxlNDiDfsWvR0IEfQdHYNLu70H6vWskZkKCzC69dhmFUgIxKzK40FpTRyNHJw',
    relationship: 'children',
    relationshipLabel: 'Con trai',
    age: 8,
    gender: 'male',
    bloodType: 'B+',
    weight: '26kg',
    height: '1m25',
    status: 'post-op',
    statusCategory: 'rehab',
    diagnosesTitleType: 'current',
    diagnoses: 'Chăm sóc sau phẫu thuật cắt Amidan (ngày thứ 4 hậu phẫu).',
    instructionsTitleType: 'diet',
    instructions:
      'Thức ăn nguội, lỏng (cháo súp xay nhuyễn), uống nhiều nước mát, không súc họng mạnh, theo dõi dấu hiệu chảy máu vòm họng.'
  }
]

export function usePatientProfiles() {
  const [patients, setPatients] = useState<PatientProfile[]>(MOCK_PATIENT_PROFILES)
  const [searchQuery, setSearchQuery] = useState('')
  const [relationshipFilter, setRelationshipFilter] = useState<RelationshipFilter>('all')
  const [statusFilter, setStatusFilter] = useState<HealthStatusFilter>('all')

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.diagnoses.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRelationship = relationshipFilter === 'all' || patient.relationship === relationshipFilter

      const matchesStatus = statusFilter === 'all' || patient.statusCategory === statusFilter

      return matchesSearch && matchesRelationship && matchesStatus
    })
  }, [patients, searchQuery, relationshipFilter, statusFilter])

  const handleDelete = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }

  return {
    patients: filteredPatients,
    totalCount: patients.length,
    searchQuery,
    setSearchQuery,
    relationshipFilter,
    setRelationshipFilter,
    statusFilter,
    setStatusFilter,
    handleDelete
  }
}
