export type ServicePlanId = 'stroke' | 'surgery' | 'dementia' | 'palliative'
export type ShiftType = 'day8h' | 'morning4h' | 'afternoon4h' | 'night12h' | 'full24h'
export type FrequencyType = 'days5' | 'days7' | 'days3' | 'custom'
export type PaymentMethodId = 'napas' | 'card' | 'wallet' | 'deposit30'
export type SelectedPatientId = 'father' | 'mother'

export interface WeekDayItem {
  key: string
  dayName: string
  dateStr: string
  active: boolean
}

export interface BookingFormState {
  patientId: SelectedPatientId
  servicePlanId: ServicePlanId
  smartMatchEnabled: boolean
  scheduleMode: 'weekly' | 'single'
  startDate: string
  shiftType: ShiftType
  frequency: FrequencyType
  notes: string
  promoCode: string
  promoApplied: boolean
  paymentMethod: PaymentMethodId
  isSuccessModalOpen: boolean
}
