export type PreviewCustomer = {
  id: string
  name: string
  phone: string
  email: string
  joinedAt: string
  patients: number
  patientSummary: string
  bookings: number
  spentUsd: number
  recentAt: string
  region: 'hcm' | 'hn' | 'dn' | 'other'
  status: 'active' | 'locked' | 'pending'
}

// A role-local snapshot transcribed from the supplied design. This is never server state.
export const customersPreview: PreviewCustomer[] = [
  {
    id: 'CUST-1024',
    name: 'Nguyễn Mai Anh',
    phone: '0903 123 456',
    email: 'maianh.nguyen@gmail.com',
    joinedAt: '2023-03-12',
    patients: 2,
    patientSummary: 'Cụ Nguyễn V. Hùng, Bà Lê T. Mai',
    bookings: 14,
    spentUsd: 1650,
    recentAt: '2026-10-14T08:30:00+07:00',
    region: 'hcm',
    status: 'active'
  },
  {
    id: 'CUST-1045',
    name: 'Trần Quang Huy',
    phone: '0918 882 312',
    email: 'quanghuy.tran@caremail.vn',
    joinedAt: '2023-06-04',
    patients: 1,
    patientSummary: 'Ông Trần Văn Toàn',
    bookings: 8,
    spentUsd: 920,
    recentAt: '2026-10-13T19:15:00+07:00',
    region: 'hn',
    status: 'active'
  },
  {
    id: 'CUST-0988',
    name: 'Lê Hoàng Nam',
    phone: '0977 445 611',
    email: 'nam.lehoang@yahoo.com',
    joinedAt: '2023-01-19',
    patients: 1,
    patientSummary: 'Bà Vũ Thị Lan',
    bookings: 3,
    spentUsd: 280,
    recentAt: '2026-10-11T10:00:00+07:00',
    region: 'hcm',
    status: 'locked'
  },
  {
    id: 'CUST-1102',
    name: 'Phạm Thu Trang',
    phone: '0932 771 900',
    email: 'thutrang.pham@outlook.com',
    joinedAt: '2023-08-09',
    patients: 3,
    patientSummary: 'Cụ bà, Cụ ông, Bé Gia Hưng',
    bookings: 22,
    spentUsd: 2840,
    recentAt: '2026-10-14T06:30:00+07:00',
    region: 'hcm',
    status: 'active'
  },
  {
    id: 'CUST-1019',
    name: 'Vũ Đình Trọng',
    phone: '0983 552 144',
    email: 'trong.vudinh@gmail.com',
    joinedAt: '2023-02-02',
    patients: 1,
    patientSummary: 'Hồ sơ cá nhân',
    bookings: 5,
    spentUsd: 580,
    recentAt: '2026-10-11T09:00:00+07:00',
    region: 'dn',
    status: 'active'
  },
  {
    id: 'CUST-0912',
    name: 'Hoàng Bảo Ngọc',
    phone: '0908 663 219',
    email: 'baongoc.h@gmail.com',
    joinedAt: '2023-11-01',
    patients: 0,
    patientSummary: '',
    bookings: 0,
    spentUsd: 0,
    recentAt: '2026-10-02T09:00:00+07:00',
    region: 'other',
    status: 'locked'
  },
  {
    id: 'CUST-1150',
    name: 'Đặng Quốc Khánh',
    phone: '0912 334 789',
    email: 'quockhanh.dang@gmail.com',
    joinedAt: '2023-11-18',
    patients: 2,
    patientSummary: 'Cụ Đặng Q. Hùng, Bà Đỗ T. Hương',
    bookings: 6,
    spentUsd: 710,
    recentAt: '2026-10-14T03:30:00+07:00',
    region: 'hn',
    status: 'active'
  }
]

export const featuredCustomer = {
  id: 'CUST-1024',
  address: 'Căn hộ A12.04, Sunrise City, 23 Nguyễn Hữu Thọ, P. Tân Hưng, Quận 7, TP. Hồ Chí Minh',
  patients: [
    {
      name: 'Nguyễn Văn Hùng',
      age: 78,
      relation: 'father',
      bookings: 9,
      history: 'father'
    },
    {
      name: 'Lê Thị Mai',
      age: 74,
      relation: 'mother',
      bookings: 5,
      history: 'mother'
    }
  ],
  bookings: [
    {
      id: 'BK-8821',
      service: 'night',
      patient: 'Nguyễn Văn Hùng',
      caregiver: 'Trần Thuỳ Dương',
      at: '2026-10-14T19:00:00+07:00',
      amount: 95,
      status: 'active'
    },
    {
      id: 'BK-7904',
      service: 'rehab',
      patient: 'Nguyễn Văn Hùng',
      caregiver: 'Hoàng Minh Tuấn',
      at: '2026-10-10T08:30:00+07:00',
      amount: 85,
      status: 'completed'
    },
    {
      id: 'BK-6512',
      service: 'day',
      patient: 'Lê Thị Mai',
      caregiver: 'Đặng Khang',
      at: '2026-10-05T08:00:00+07:00',
      amount: 120,
      status: 'completed'
    }
  ] as const,
  audit: [
    {
      at: '2026-10-14T08:30:00+07:00',
      text: 'booking',
      icon: 'calendar_month'
    },
    { at: '2026-10-10T19:15:00+07:00', text: 'rating', icon: 'star' },
    { at: '2026-10-02T14:00:00+07:00', text: 'payment', icon: 'credit_card' },
    { at: '2023-03-12T10:00:00+07:00', text: 'registration', icon: 'how_to_reg' }
  ]
} as const
