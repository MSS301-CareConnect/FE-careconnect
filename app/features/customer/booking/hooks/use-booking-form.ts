import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'

import { bookingKeys, fetchBookingQuote, placeBooking } from '~/entities/booking/booking-api'
import { bookingDay } from '~/entities/booking/booking-format'
import { careCatalogKeys, fetchCenterOfferings } from '~/entities/care-catalog/care-catalog-api'
import { careRecipientKeys, fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { fetchCaregiverByUser } from '~/entities/provider/provider-api'
import type {
  BookingCreateRequest,
  BookingScheduleType,
  BookingServiceRequest,
  ListCareRecipientsParams
} from '~/shared/api/generated/contracts'

import { useBookingProviders } from './use-booking-providers'

const recipientRequest: ListCareRecipientsParams = { status: 'ACTIVE', page: 0, size: 50 }
const DAY_MS = 24 * 60 * 60 * 1000

export interface BookingSchedule {
  scheduleType: BookingScheduleType
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
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
    daysOfWeek: []
  }
}

function scheduleComplete(schedule: BookingSchedule) {
  if (!schedule.startDate || !schedule.startTime || !schedule.endTime) return false
  if (schedule.endTime <= schedule.startTime) return false
  if (schedule.scheduleType === 'ONE_TIME') return true
  if (!schedule.endDate || schedule.endDate < schedule.startDate) return false
  return schedule.scheduleType === 'DAILY' || schedule.daysOfWeek.length > 0
}

export function useBookingForm() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const caregiverUserId = params.get('caregiver') ?? ''
  const centerParam = params.get('center') ?? ''
  const preselectedService = params.get('service') ?? ''

  const [recipientId, setRecipientId] = useState(params.get('patientId') ?? '')
  // null keeps the center and caregiver the URL pointed at; a choice in the form replaces them.
  const [centerChoice, setCenterChoice] = useState<string | null>(null)
  const [caregiverChoice, setCaregiverChoice] = useState<string | null>(null)
  const [services, setServices] = useState<SelectedServices>({})
  const [schedule, setSchedule] = useState<BookingSchedule>(initialSchedule)
  const [customerNote, setCustomerNote] = useState('')
  const idempotency = useRef<{ request: string; key: string } | null>(null)

  const caregiver = useQuery({
    queryKey: ['provider', 'by-user', caregiverUserId],
    queryFn: () => fetchCaregiverByUser(caregiverUserId),
    enabled: Boolean(caregiverUserId),
    retry: false
  })
  const providers = useBookingProviders()
  const centerId = centerChoice ?? caregiver.data?.centerId ?? centerParam
  const center = providers.centers.find((item) => item.id === centerId)
  const urlCaregiverId = caregiver.data ? (caregiver.data.caregiverId ?? caregiver.data.id) : undefined
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
  const request = useMemo<BookingCreateRequest | null>(() => {
    const chosen = Object.values(services)
    const complete = chosen.length > 0 && chosen.every((service) => service.pricePlanId)
    if (!recipientId || !centerId || !complete || !scheduleComplete(schedule)) return null
    const repeating = schedule.scheduleType !== 'ONE_TIME'
    return {
      recipientId,
      centerId,
      caregiverId,
      scheduleType: schedule.scheduleType,
      startDate: schedule.startDate,
      endDate: repeating ? schedule.endDate : schedule.startDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      daysOfWeek: schedule.scheduleType === 'WEEKLY' ? [...schedule.daysOfWeek].sort() : undefined,
      services: chosen
    }
  }, [recipientId, centerId, caregiverId, schedule, services])

  const quote = useQuery({
    queryKey: bookingKeys.quote(request),
    queryFn: () => fetchBookingQuote(request!),
    enabled: request !== null,
    retry: false,
    staleTime: 60_000
  })

  const create = useMutation({
    mutationFn: (body: BookingCreateRequest) => {
      const fingerprint = JSON.stringify(body)
      // Retrying the same request reuses its key so the backend returns the booking it already created.
      if (idempotency.current?.request !== fingerprint) {
        idempotency.current = { request: fingerprint, key: crypto.randomUUID() }
      }
      return placeBooking(body, idempotency.current.key)
    },
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.lists })
      navigate(`/customer/bookings/${booking.id}`)
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
  const centerCaregivers = [...(center?.caregivers ?? [])]
  if (caregiver.data && caregiver.data.centerId === centerId) {
    if (!centerCaregivers.some((item) => (item.caregiverId ?? item.id) === urlCaregiverId)) {
      centerCaregivers.unshift(caregiver.data)
    }
  }

  return {
    caregiverUserId,
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
    customerNote,
    setCustomerNote,
    // A service without a chosen plan cannot be priced yet.
    plansChosen,
    request,
    quote,
    create,
    submit: () => {
      if (request) create.mutate({ ...request, customerNote: customerNote.trim() || undefined })
    }
  }
}
