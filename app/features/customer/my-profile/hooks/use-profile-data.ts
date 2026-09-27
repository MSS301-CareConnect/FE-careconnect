import { useState } from 'react'

export interface CustomerProfileData {
  id: string
  fullName: string
  gender: 'female' | 'male' | 'other'
  dob: string
  idNumber: string
  phone: string
  isPhoneVerified: boolean
  email: string
  isEmailVerified: boolean
  city: string
  district: string
  ward: string
  addressDetail: string
  notes: string
  memberSince: string
  avatarUrl: string
  stats: {
    familyCount: number
    completedShifts: number
    ratingGiven: number
  }
}

export const INITIAL_PROFILE_DATA: CustomerProfileData = {
  id: 'CC-KH8842',
  fullName: 'Nguyễn Mai Anh',
  gender: 'female',
  dob: '18/06/1992',
  idNumber: '079192003819',
  phone: '0912 345 678',
  isPhoneVerified: true,
  email: 'maianh.nguyen@gmail.com',
  isEmailVerified: true,
  city: 'TP. Hồ Chí Minh',
  district: 'Quận Bình Thạnh',
  ward: 'Phường 22',
  addressDetail: 'Tòa Landmark 2, Vinhomes Central Park, 208 Nguyễn Hữu Cảnh',
  notes:
    'Bảo vệ sảnh đón tầng G, liên hệ lễ tân hoặc gọi trước 15 phút khi điều dưỡng đến làm thủ tục nhận phòng chăm sóc.',
  memberSince: 'T3/2024',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCOwlf-ropD0XzVPucNjZeyxWfHNYpZLLHO2tA1QIuWfZ33VlxhbzZTIB1YcbZ-rwHFz13i956cRk1gpsZ5cVjIOynvR4Gd4LbdRVa3Ef_NT-ET7V8rZN8V8yMzP5Cg8PfibQW0z9t2RpWlbRfADs2Dkv0NrgxUMMGgnfxRundX7EQUrkPQPXvOi09tDoRqfnJqaCo_VxeS0EBCgou4W0BpxNDZYLe95AOHSs04kmU1O5nEy0vYKnKE8A',
  stats: {
    familyCount: 3,
    completedShifts: 12,
    ratingGiven: 4.9
  }
}

export function useProfileData() {
  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_PROFILE_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const updateProfile = (data: Partial<CustomerProfileData>) => {
    setProfile((prev) => ({ ...prev, ...data }))
  }

  const saveProfile = async () => {
    setIsSaving(true)
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
    }, 3000)
  }

  return {
    profile,
    updateProfile,
    saveProfile,
    isSaving,
    saveSuccess
  }
}
