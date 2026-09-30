export interface CareTask {
  id: string
  key?: 'task1' | 'task2' | 'task3' | 'task4' | 'task5'
  customTitle?: string
  customDesc?: string
  status: 'completed' | 'in_progress' | 'pending'
  completedTime?: string
  hasPhoto?: boolean
  medCount?: number
  expectedTime?: string
}

export interface ActiveSessionData {
  code: string
  orderCode: string
  patient: {
    name: string
    age: number
    gender: string
    code: string
    avatar: string
    address: string
    guardian: {
      name: string
      relation: string
      phone: string
    }
  }
  schedule: {
    timeSlot: string
    checkInTime: string
    isGpsVerified: boolean
    isIdVerified: boolean
  }
  tasks: CareTask[]
  vitals: {
    bloodPressure: string
    spo2: number
    heartRate: number
    temperature: number
    lastMeasured: string
  }
}

export const defaultActiveSessionData: ActiveSessionData = {
  code: 'BK-8821',
  orderCode: 'CC-BK-882194',
  patient: {
    name: 'Cụ Nguyễn Văn A',
    age: 78,
    gender: 'Nam',
    code: '882',
    avatar:
      'https://lh3.googleusercontent.com/aida/AEtjO1Wo9RHCxhwbdzDMpwAexot8HlDsbapPxEsDKlLaOx-FiWsDYzeLTaLbXWjxrfSRveutMIKe9zZ8brT0gFbhXcoW4KCxz1MtR-oOJv3FddfDpv6LbgUG1K7027QR3pbeUFjrhke8y2iAKSrLVgEkF7AY1QvD9FoUKrzSTGvOopZGSXInNDN2SGyQyPvBqFMj0j5HnNXUl3nyCUgJm3oKZUyzik5ivh_A3sSYU0R4hRIAPI2bK3AhHKaxPPA',
    address: 'Phòng 804, Tháp C, Chung cư Sunrise City, Nguyễn Hữu Thọ, P. Tân Hưng, Q.7, TP.HCM',
    guardian: {
      name: 'Anh Nguyễn Bình',
      relation: 'Con trai ruột',
      phone: '0903000456'
    }
  },
  schedule: {
    timeSlot: '08:00 - 12:00',
    checkInTime: '08:30',
    isGpsVerified: true,
    isIdVerified: true
  },
  tasks: [
    {
      id: 'task-1',
      key: 'task1',
      status: 'completed',
      completedTime: '08:50',
      hasPhoto: true
    },
    {
      id: 'task-2',
      key: 'task2',
      status: 'completed',
      completedTime: '09:15',
      medCount: 3
    },
    {
      id: 'task-3',
      key: 'task3',
      status: 'in_progress'
    },
    {
      id: 'task-4',
      key: 'task4',
      status: 'pending',
      expectedTime: '10:15'
    },
    {
      id: 'task-5',
      key: 'task5',
      status: 'pending',
      expectedTime: '11:45'
    }
  ],
  vitals: {
    bloodPressure: '128/82',
    spo2: 98,
    heartRate: 76,
    temperature: 36.8,
    lastMeasured: '08:45'
  }
}
