import { useState } from 'react'
import { useNavigate } from 'react-router'
import type {
  BookingFormState,
  FrequencyType,
  PaymentMethodId,
  SelectedPatientId,
  ServicePlanId,
  ShiftType,
  WeekDayItem
} from '../types'

const DEFAULT_NOTES =
  'Bố tôi bị yếu nửa người bên trái sau di chứng tai biến nhẹ, nhờ điều dưỡng Loan hỗ trợ tập vật lý trị liệu cánh tay và cổ chân 30-45 phút vào buổi chiều. Bố hay quên uống thuốc, nhờ điều dưỡng kiểm tra huyết áp trước khi cho cụ uống viên hạ áp Amlodipine 5mg sau ăn sáng lúc 09:00.'

export const WEEK_DAYS: WeekDayItem[] = [
  { key: 'mon', dayName: 'T2', dateStr: '21/10', active: true },
  { key: 'tue', dayName: 'T3', dateStr: '22/10', active: true },
  { key: 'wed', dayName: 'T4', dateStr: '23/10', active: true },
  { key: 'thu', dayName: 'T5', dateStr: '24/10', active: true },
  { key: 'fri', dayName: 'T6', dateStr: '25/10', active: true },
  { key: 'sat', dayName: 'T7', dateStr: '26/10', active: false },
  { key: 'sun', dayName: 'CN', dateStr: '27/10', active: false }
]

export function useBookingForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<BookingFormState>({
    patientId: 'father',
    servicePlanId: 'stroke',
    smartMatchEnabled: true,
    scheduleMode: 'weekly',
    startDate: '2024-10-21',
    shiftType: 'day8h',
    frequency: 'days5',
    notes: DEFAULT_NOTES,
    promoCode: 'FIRSTCARE-200K',
    promoApplied: true,
    paymentMethod: 'napas',
    isSuccessModalOpen: false
  })

  const setPatientId = (patientId: SelectedPatientId) => {
    setForm((prev) => ({ ...prev, patientId }))
  }

  const setServicePlanId = (servicePlanId: ServicePlanId) => {
    setForm((prev) => ({ ...prev, servicePlanId }))
  }

  const toggleSmartMatch = () => {
    setForm((prev) => ({ ...prev, smartMatchEnabled: !prev.smartMatchEnabled }))
  }

  const setScheduleMode = (scheduleMode: 'weekly' | 'single') => {
    setForm((prev) => ({ ...prev, scheduleMode }))
  }

  const setStartDate = (startDate: string) => {
    setForm((prev) => ({ ...prev, startDate }))
  }

  const setShiftType = (shiftType: ShiftType) => {
    setForm((prev) => ({ ...prev, shiftType }))
  }

  const setFrequency = (frequency: FrequencyType) => {
    setForm((prev) => ({ ...prev, frequency }))
  }

  const setNotes = (notes: string) => {
    setForm((prev) => ({ ...prev, notes }))
  }

  const setPromoCode = (promoCode: string) => {
    setForm((prev) => ({ ...prev, promoCode }))
  }

  const applyPromoCode = () => {
    if (form.promoCode.trim().length > 0) {
      setForm((prev) => ({ ...prev, promoApplied: true }))
    }
  }

  const setPaymentMethod = (paymentMethod: PaymentMethodId) => {
    setForm((prev) => ({ ...prev, paymentMethod }))
  }

  const submitBooking = () => {
    navigate('/customer/booking/deposit')
  }

  const closeSuccessModal = () => {
    setForm((prev) => ({ ...prev, isSuccessModalOpen: false }))
  }

  return {
    form,
    weekDays: WEEK_DAYS,
    setPatientId,
    setServicePlanId,
    toggleSmartMatch,
    setScheduleMode,
    setStartDate,
    setShiftType,
    setFrequency,
    setNotes,
    setPromoCode,
    applyPromoCode,
    setPaymentMethod,
    submitBooking,
    closeSuccessModal
  }
}
