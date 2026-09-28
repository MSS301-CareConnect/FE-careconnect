export type BookingStatus = 'ongoing' | 'upcoming' | 'completed' | 'cancelled'
export type PatientId = 'father' | 'mother'

export interface BookingPreview {
  code: string
  status: BookingStatus
  patientId: PatientId
  date: string
  start: string
  end: string
  caregiver: string
  price: number
  depositPaid: number
}

// Presentation fixtures until the backend publishes a bookings contract.
export const bookingPreviews: BookingPreview[] = [
  {
    code: 'CC-BK-9810',
    status: 'ongoing',
    patientId: 'father',
    date: '2026-09-20',
    start: '08:00',
    end: '17:00',
    caregiver: 'ĐĐ. Nguyễn Thị Bích Loan',
    price: 1600000,
    depositPaid: 800000
  },
  {
    code: 'CC-BK-9824',
    status: 'upcoming',
    patientId: 'mother',
    date: '2026-09-20',
    start: '08:00',
    end: '16:00',
    caregiver: 'ĐD. Trần B',
    price: 1450000,
    depositPaid: 750000
  },
  {
    code: 'CC-BK-9750',
    status: 'completed',
    patientId: 'mother',
    date: '2026-09-15',
    start: '08:00',
    end: '12:00',
    caregiver: 'ĐD. Lê Thị Thanh Mai',
    price: 750000,
    depositPaid: 750000
  },
  {
    code: 'CC-BK-9640',
    status: 'cancelled',
    patientId: 'father',
    date: '2026-09-10',
    start: '13:00',
    end: '17:00',
    caregiver: 'ĐĐ. Trần Hữu Nam',
    price: 450000,
    depositPaid: 450000
  }
]
