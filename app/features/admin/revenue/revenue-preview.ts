export type RevenueType = 'deposit' | 'settlement' | 'payout' | 'refund' | 'fee'
export type RevenueStatus = 'escrow' | 'settled' | 'pending' | 'refunded' | 'reconciled' | 'failed'
export type RevenueGateway = 'visa' | 'vietqr' | 'bank' | 'system'
export type RevenueService = 'night' | 'infusion' | 'postop' | 'stroke' | 'therapy'

export interface RevenueTransaction {
  id: string
  createdAt: string
  bookingId: string | null
  service: RevenueService | null
  type: RevenueType
  gateway: RevenueGateway
  method: string
  party: string
  counterparty: string | null
  amount: number
  status: RevenueStatus
}

// Independent illustrative September 2026 snapshot; none of these entries verifies a payment.
export const revenuePreview = {
  period: '2026-09',
  gmv: 148250,
  platformRate: 0.15,
  escrow: 34680,
  payoutPending: 12450,
  averageDaily: 741.25,
  refundRate: 0.008,
  averageReconciliationHours: 1.8,
  split: [
    { key: 'caregiver', share: 0.7, color: 'bg-emerald-400' },
    { key: 'platform', share: 0.15, color: 'bg-primary' },
    { key: 'insurance', share: 0.1, color: 'bg-teal-600' },
    { key: 'gateway', share: 0.05, color: 'bg-outline' }
  ],
  transactions: [
    {
      id: 'TXN-904128',
      createdAt: '2026-09-20T18:30:00+07:00',
      bookingId: 'BK-8821',
      service: 'night',
      type: 'deposit',
      gateway: 'visa',
      method: 'Visa ****4589',
      party: 'Chị Nguyễn Mai Anh',
      counterparty: null,
      amount: 32.4,
      status: 'escrow'
    },
    {
      id: 'TXN-904115',
      createdAt: '2026-09-20T17:15:00+07:00',
      bookingId: 'BK-8820',
      service: 'infusion',
      type: 'settlement',
      gateway: 'vietqr',
      method: 'VietQR',
      party: 'Chị Phạm Thanh Hà',
      counterparty: 'ĐD. Vũ Mai Linh',
      amount: -42,
      status: 'settled'
    },
    {
      id: 'TXN-904098',
      createdAt: '2026-09-20T15:40:00+07:00',
      bookingId: null,
      service: null,
      type: 'payout',
      gateway: 'bank',
      method: 'MB Bank',
      party: 'ĐD. Trần Thùy Dương',
      counterparty: null,
      amount: -350,
      status: 'pending'
    },
    {
      id: 'TXN-903980',
      createdAt: '2026-09-20T11:20:00+07:00',
      bookingId: 'BK-8815',
      service: 'postop',
      type: 'refund',
      gateway: 'visa',
      method: 'Mastercard',
      party: 'Chị Lê Thu Trang',
      counterparty: null,
      amount: -32.4,
      status: 'refunded'
    },
    {
      id: 'TXN-903872',
      createdAt: '2026-09-19T21:05:00+07:00',
      bookingId: 'BK-8812',
      service: 'stroke',
      type: 'fee',
      gateway: 'system',
      method: 'CareConnect',
      party: 'CareConnect',
      counterparty: null,
      amount: 63,
      status: 'reconciled'
    },
    {
      id: 'TXN-903741',
      createdAt: '2026-09-19T14:00:00+07:00',
      bookingId: 'BK-8809',
      service: 'therapy',
      type: 'settlement',
      gateway: 'vietqr',
      method: 'VietQR',
      party: 'Bác Vũ Đình Trọng',
      counterparty: 'KTV. Hoàng Minh Tuấn',
      amount: -68,
      status: 'settled'
    }
  ] satisfies RevenueTransaction[]
} as const
