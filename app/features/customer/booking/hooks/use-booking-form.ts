import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'

import { bookingKeys, fetchBookingQuote, placeBooking } from '~/entities/booking/booking-api'
import { bookingDay } from '~/entities/booking/booking-format'
import { careCatalogKeys, fetchCenterOfferings } from '~/entities/care-catalog/care-catalog-api'
import { useSelectedCenter } from '~/entities/care-center/selected-center'
import { careRecipientKeys, fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { fetchOutstandingDebt, paymentKeys } from '~/entities/payment/payment-api'
import { fetchPublicCaregiver, providerKeys } from '~/entities/provider/provider-api'
import type {
  BookingCreateRequest,
  BookingScheduleType,
  BookingServiceRequest,
  ListCareRecipientsParams
} from '~/shared/api/generated/contracts'

import { useBookingProviders } from './use-booking-providers'

const recipientRequest: ListCareRecipientsParams = { status: 'ACTIVE', page: 0, size: 50 }
const DAY_MS = 24 * 60 * 60 * 1000

/** A caregiver the customer can pick, from the center catalog or the profile the URL pointed at. */
export interface BookingCaregiverOption {
  id: string
  fullName: string
  experienceYears?: number
  ratingAverage?: number
}

export interface BookingSchedule {
  scheduleType: BookingScheduleType
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
  oneTimeDates: string[]
}

/** Selected services keyed by center offering ID, each with the chosen price plan. */
export type SelectedServices = Record<string, BookingServiceRequest>

function initialSchedule(): BookingSchedule {
  // The backend requires the first visit to start at least 12 hours ahead, so tomorrow is the earliest default.
  const tomorrow = bookingDay(new Date(Date.now() + DAY_MS))
  return {
    scheduleType: 'ONE_TIME',
    startDate: tomorrow,
    endDate: tomorrow,
    startTime: '08:00',
    endTime: '10:00',
    daysOfWeek: [],
    oneTimeDates: [tomorrow]
  }
}

function scheduleComplete(schedule: BookingSchedule) {
  if (!schedule.startTime || !schedule.endTime) return false
  if (schedule.endTime <= schedule.startTime) return false
  if (schedule.scheduleType === 'ONE_TIME') {
    const dates = schedule.oneTimeDates
    return dates.length > 0 && dates.length <= 4 && dates.every(Boolean) && new Set(dates).size === dates.length
  }
  if (!schedule.startDate) return false
  if (!schedule.endDate || schedule.endDate < schedule.startDate) return false
  return schedule.scheduleType === 'DAILY' || schedule.daysOfWeek.length > 0
}

export function useBookingForm() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Caregiver profile ID from the public profile page's "book" link.
  const caregiverParam = params.get('caregiver') ?? ''
  const { center: headerCenter } = useSelectedCenter()
  // The URL's center or caregiver wins; otherwise the center chosen in the header is the starting point.
  const centerParam = params.get('center') || (caregiverParam ? '' : (headerCenter?.id ?? ''))
  const preselectedService = params.get('service') ?? ''

  const [recipientId, setRecipientId] = useState(params.get('patientId') ?? '')
  // null keeps the center and caregiver the URL pointed at; a choice in the form replaces them.
  const [centerChoice, setCenterChoice] = useState<string | null>(null)
  const [caregiverChoice, setCaregiverChoice] = useState<string | null>(null)
  const [services, setServices] = useState<SelectedServices>({})
  const [schedule, setSchedule] = useState<BookingSchedule>(initialSchedule)
  const [customerNote, setCustomerNote] = useState('')
  const [completedCount, setCompletedCount] = useState(0)
  const idempotency = useRef(new Map<string, { key: string; bookingId?: string }>())

  // An overdue remaining-balance invoice blocks new bookings, so the form says so before the customer fills it in.
  const debt = useQuery({ queryKey: paymentKeys.outstanding, queryFn: fetchOutstandingDebt, retry: false })
  const caregiver = useQuery({
    queryKey: providerKeys.publicCaregiver(caregiverParam),
    queryFn: () => fetchPublicCaregiver(caregiverParam),
    enabled: Boolean(caregiverParam),
    retry: false
  })
  const centerId = centerChoice ?? caregiver.data?.centerId ?? centerParam
  const providers = useBookingProviders(centerId)
  const center = providers.centers.data?.find((item) => item.id === centerId)
  const urlCaregiverId = caregiver.data?.caregiverId
  // Empty means the center assigns the caregiver when it accepts the booking.
  const selectedCaregiverId =
    caregiverChoice ?? (caregiver.data && caregiver.data.centerId === centerId ? urlCaregiverId : '') ?? ''
  const recipients = useQuery({
    queryKey: careRecipientKeys.list(recipientRequest),
    queryFn: () => fetchCareRecipients(recipientRequest),
    retry: false
  })
  const offerings = useQuery({
    queryKey: careCatalogKeys.centerOfferings(centerId),
    queryFn: () => fetchCenterOfferings(centerId),
    enabled: Boolean(centerId),
    retry: false,
    select: (items) => items.filter((item) => item.status === 'ACTIVE' && item.catalogItem.status === 'ACTIVE')
  })

  const caregiverId = selectedCaregiverId || undefined
  const selected = Object.values(services)
  const plansChosen = selected.every((service) => service.pricePlanId)

  // The note is not part of this request: it does not change the price, so typing it never re-runs the quote.
  const requests = useMemo<BookingCreateRequest[]>(() => {
    const chosen = Object.values(services)
    const complete = chosen.length > 0 && chosen.every((service) => service.pricePlanId)
    if (!recipientId || !centerId || !complete || !scheduleComplete(schedule)) return []
    const repeating = schedule.scheduleType !== 'ONE_TIME'
    const base = {
      recipientId,
      centerId,
      caregiverId,
      scheduleType: schedule.scheduleType,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      daysOfWeek: schedule.scheduleType === 'WEEKLY' ? [...schedule.daysOfWeek].sort() : undefined,
      services: chosen
    }
    return (repeating ? [schedule.startDate] : [...schedule.oneTimeDates].sort()).map((date) => ({
      ...base,
      startDate: date,
      endDate: repeating ? schedule.endDate : date
    }))
  }, [recipientId, centerId, caregiverId, schedule, services])
  const request = requests[0] ?? null

  const quote = useQuery({
    queryKey: ['booking', 'quote-batch', requests],
    queryFn: () => Promise.all(requests.map((body) => fetchBookingQuote(body))),
    enabled: requests.length > 0,
    retry: false,
    staleTime: 60_000
  })

  const create = useMutation({
    mutationFn: async (bodies: BookingCreateRequest[]) => {
      const ids: string[] = []
      setCompletedCount(0)
      for (const body of bodies) {
        const fingerprint = JSON.stringify(body)
        let entry = idempotency.current.get(fingerprint)
        if (!entry) {
          entry = { key: crypto.randomUUID() }
          idempotency.current.set(fingerprint, entry)
        }
        if (!entry.bookingId) {
          const booking = await placeBooking(body, entry.key)
          entry.bookingId = booking.id
        }
        ids.push(entry.bookingId)
        setCompletedCount(ids.length)
      }
      return ids
    },
    onSuccess: (ids) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.lists })
      navigate(ids.length === 1 ? `/customer/bookings/${ids[0]}` : '/customer/bookings')
    }
  })

  function toggleService(offeringId: string, careServiceId: string) {
    setServices((current) => {
      const next = { ...current }
      if (next[offeringId]) delete next[offeringId]
      else next[offeringId] = { careServiceId, centerServiceId: offeringId, pricePlanId: '' }
      return next
    })
  }

  function choosePlan(offeringId: string, careServiceId: string, pricePlanId: string) {
    setServices((current) => ({
      ...current,
      [offeringId]: { careServiceId, centerServiceId: offeringId, pricePlanId }
    }))
  }

  function selectCenter(id: string) {
    if (id === centerId) return
    setCenterChoice(id)
    setCaregiverChoice('')
    // Offerings and price plans belong to one center, so a new center starts with no service selected.
    setServices({})
  }

  // The URL caregiver stays selectable even when the catalog pages do not include them.
  const centerCaregivers: BookingCaregiverOption[] = (providers.caregivers.data ?? []).map((item) => ({
    id: item.caregiverId,
    fullName: item.fullName,
    experienceYears: item.experienceYears,
    ratingAverage: item.ratingAverage
  }))
  if (caregiver.data && caregiver.data.centerId === centerId) {
    if (!centerCaregivers.some((item) => item.id === urlCaregiverId)) {
      const { caregiverId, fullName, experienceYears, ratingAverage } = caregiver.data
      centerCaregivers.unshift({ id: caregiverId, fullName, experienceYears, ratingAverage })
    }
  }

  return {
    caregiverParam,
    caregiver,
    providers,
    centerId,
    centerName: center?.name ?? caregiver.data?.centerName,
    centerCaregivers,
    selectCenter,
    selectedCaregiverId,
    selectCaregiver: (id: string) => setCaregiverChoice(id),
    preselectedService,
    recipients,
    offerings,
    recipientId,
    setRecipientId,
    services,
    toggleService,
    choosePlan,
    schedule,
    updateSchedule: (patch: Partial<BookingSchedule>) => setSchedule((current) => ({ ...current, ...patch })),
    updateOneTimeDate: (index: number, date: string) =>
      setSchedule((current) => ({
        ...current,
        oneTimeDates: current.oneTimeDates.map((value, position) => (position === index ? date : value))
      })),
    addOneTimeDate: () =>
      setSchedule((current) =>
        current.oneTimeDates.length >= 4 ? current : { ...current, oneTimeDates: [...current.oneTimeDates, ''] }
      ),
    removeOneTimeDate: (index: number) =>
      setSchedule((current) => ({
        ...current,
        oneTimeDates: current.oneTimeDates.filter((_, position) => position !== index)
      })),
    customerNote,
    setCustomerNote,
    // A service without a chosen plan cannot be priced yet.
    plansChosen,
    request,
    requests,
    quote,
    create,
    completedCount,
    depositPolicyMismatch:
      quote.data?.some((item) => item.depositPercent != null && item.depositPercent !== 30) ?? false,
    hasDebt: debt.data?.hasDebt === true,
    submit: () => {
      if (requests.length)
        create.mutate(requests.map((body) => ({ ...body, customerNote: customerNote.trim() || undefined })))
    }
  }
}
