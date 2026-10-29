import { adminFinancialPreview } from '../financial-preview'

// September 2026 design snapshot; these values are not live platform metrics.
export const adminDashboardPreview = {
  customers: 1240,
  caregivers: 210,
  verifiedCaregivers: 198,
  activeBookings: 86,
  monthlyGmv: adminFinancialPreview.gmv,
  platformFeeRate: adminFinancialPreview.platformFeeRate,
  completedBookings: 642,
  ongoingBookings: 86,
  cancelledBookings: 18,
  completionRate: 0.973,
  returningCustomers: 843,
  newCustomers: 397,
  returningRate: 0.68,
  caregiverGroups: [
    { key: 'general', count: 122, share: 0.58, color: 'bg-primary' },
    { key: 'rehab', count: 55, share: 0.26, color: 'bg-tertiary-fixed-dim' },
    { key: 'doctor', count: 33, share: 0.16, color: 'bg-tertiary' }
  ],
  services: [
    { key: 'recovery', share: 0.45, color: 'bg-primary' },
    { key: 'elderly', share: 0.35, color: 'bg-tertiary-fixed-dim' },
    { key: 'motherBaby', share: 0.2, color: 'bg-tertiary' }
  ],
  pendingLicenses: 32,
  rating: 4.92,
  reviews: 1850,
  quality: [
    { key: 'punctuality', value: 0.991 },
    { key: 'skill', value: 0.984 },
    { key: 'communication', value: 0.997 }
  ]
} as const
