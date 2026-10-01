export const complaintsPreview = [
  {
    id: 'KN-2026-089',
    booking: 'BK-8821',
    customer: 'Lê Hoàng Nam',
    caregiver: 'Trần Thị Mỹ Duyên',
    level: 'critical',
    status: 'new',
    kind: 'delay',
    initials: 'LN'
  },
  {
    id: 'KN-2026-092',
    booking: 'BK-9104',
    customer: 'Phạm Thu Trang',
    caregiver: 'Lê Thanh Bình',
    level: 'clinical',
    status: 'review',
    kind: 'clinical',
    initials: 'PT'
  },
  {
    id: 'KN-2026-074',
    booking: 'BK-9006',
    customer: 'Nguyễn Văn Tuấn',
    caregiver: '—',
    level: 'low',
    status: 'resolved',
    kind: 'fee',
    initials: 'NT'
  }
] as const

export type ComplaintPreview = (typeof complaintsPreview)[number]
