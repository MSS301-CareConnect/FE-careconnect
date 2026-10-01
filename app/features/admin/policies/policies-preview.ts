export const refundPreview = [
  { key: 'early', percent: 100 },
  { key: 'standard', percent: 70 },
  { key: 'late', percent: 50 },
  { key: 'urgent', percent: 0 }
] as const

export const allocationPreview = [
  { key: 'caregiver', percent: 70, color: 'bg-primary' },
  { key: 'center', percent: 15, color: 'bg-tertiary-fixed-dim' },
  { key: 'platform', percent: 15, color: 'bg-surface-container-highest' }
] as const

export const tierPreview = [
  { key: 'gold', fee: 12, icon: 'workspace_premium' },
  { key: 'silver', fee: 14, icon: 'military_tech' },
  { key: 'standard', fee: 15, icon: 'store' }
] as const
