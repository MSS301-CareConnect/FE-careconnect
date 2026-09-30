// Supplemental fields supplied only for the BK-8821 design sample.
export const featuredBookingId = 'BK-8821'
export const featuredBookingDetail = {
  customerEmail: 'maianh.nguyen@gmail.com',
  address: 'Căn hộ A12.04, Tháp Ruby, Sunrise City, 23 Nguyễn Hữu Thọ, P. Tân Hưng, Q.7, TP.HCM',
  patientCode: 'PAT-0082',
  caregiverEmail: 'thuyduong.tran@careconnect.vn',
  caregiverPhone: '0918234567',
  caregiverLicense: '0482/BYT',
  caregiverCompleted: 280,
  caregiverRating: 4.98,
  caregiverReviews: 124,
  serviceFee: 120,
  discount: 12,
  depositRate: 0.3,
  elapsedMinutes: 255,
  scheduledMinutes: 720,
  checkin: '2026-09-20T18:55:00+07:00',
  timeline: [
    { key: 'created', time: '2026-09-20T18:30:00+07:00', state: 'done' },
    { key: 'assigned', time: '2026-09-20T18:35:00+07:00', state: 'done' },
    { key: 'checkin', time: '2026-09-20T18:55:00+07:00', state: 'done' },
    { key: 'active', time: null, state: 'current' },
    { key: 'handover', time: '2026-09-21T07:00:00+07:00', state: 'upcoming' },
    { key: 'settlement', time: '2026-09-21T07:15:00+07:00', state: 'upcoming' }
  ] as const
} as const

const total = featuredBookingDetail.serviceFee - featuredBookingDetail.discount
const deposit = total * featuredBookingDetail.depositRate
export const featuredBookingAmounts = {
  total,
  deposit,
  balance: total - deposit
} as const
