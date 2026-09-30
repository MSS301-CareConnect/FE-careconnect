export interface ShiftChecklistItem {
  id: string
  key: 'item1' | 'item2' | 'item3' | 'item4' | 'item5'
}

export interface ShiftDetailData {
  code: string
  patientCode: string
  patientName: string
  patientAge: number
  patientGender: 'male' | 'female'
  patientBlood: string
  guardianName: string
  guardianRelationship: string
  guardianPhone: string
  guardianMaskedPhone: string
  patientImage: string
  checklistItems: ShiftChecklistItem[]
  earnings: number
  durationMinutes: number
  building: string
  address: string
  coordinates: string
  mapImage: string
}

export const defaultShiftData: ShiftDetailData = {
  code: 'BK-8821',
  patientCode: '882',
  patientName: 'Cụ Nguyễn Văn A',
  patientAge: 78,
  patientGender: 'male',
  patientBlood: 'O+',
  guardianName: 'Anh Nguyễn Bình',
  guardianRelationship: 'Con trai',
  guardianPhone: '0903000456',
  guardianMaskedPhone: '0903 ••• 456',
  patientImage:
    'https://lh3.googleusercontent.com/aida/AEtjO1Wo9RHCxhwbdzDMpwAexot8HlDsbapPxEsDKlLaOx-FiWsDYzeLTaLbXWjxrfSRveutMIKe9zZ8brT0gFbhXcoW4KCxz1MtR-oOJv3FddfDpv6LbgUG1K7027QR3pbeUFjrhke8y2iAKSrLVgEkF7AY1QvD9FoUKrzSTGvOopZGSXInNDN2SGyQyPvBqFMj0j5HnNXUl3nyCUgJm3oKZUyzik5ivh_A3sSYU0R4hRIAPI2bK3AhHKaxPPA',
  checklistItems: [
    { id: 'task-1', key: 'item1' },
    { id: 'task-2', key: 'item2' },
    { id: 'task-3', key: 'item3' },
    { id: 'task-4', key: 'item4' },
    { id: 'task-5', key: 'item5' }
  ],
  earnings: 350000,
  durationMinutes: 240,
  building: 'Căn hộ 804, Tháp Ruby, Chung cư Sunrise City',
  address: '23 Đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh',
  coordinates: '10.7431° N, 106.7009° E',
  mapImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuARNoOQNyo7SjGkDwiDlpe2N9TiWNcDP1NcnnTI_aB2_UJGUtpznnNxZkViZ4jTmGFAPBG97ty7b9FMaaWr1YVtj6scyHgUK_bExfXz50-K1JEGshhknI-6HCl66XJ6xchEsMDIqjgvgoNWS4c2cuzu5cRFNuGJx-yJ4LDmjE4xtcBRg6SUBDZ0j1NW8g0C8HL9ClCYT7s5neVsiBu-A2pU3TBfZcmmBUKimCR1HLW6IQqx7CBrz4O73g'
}
