import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'

import { bookingKeys, fetchBookingQuote, fetchCenterBookingPolicy, placeBooking } from '~/entities/booking/booking-api'
import { bookingDay, vietnamInstant } from '~/entities/booking/booking-format'
import { careCatalogKeys, fetchCenterOfferings } from '~/entities/care-catalog/care-catalog-api'
import { useSelectedCenter } from '~/entities/care-center/selected-center'
import { careRecipientKeys, fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { fetchOutstandingDebt, paymentKeys } from '~/entities/payment/payment-api'
import { fetchPublicCaregiver, providerKeys } from '~/entities/provider/provider-api'
import type {
  BookingCreateRequest,
  BookingRecurrenceFrequency,
  BookingServiceRequest,
  BookingType,
  ListCareRecipientsParams
} from '~/shared/api/generated/contracts'

import { useBookingProviders } from './use-booking-providers'

const recipientRequest: ListCareRecipientsParams = { status: 'ACTIVE', page: 0, size: 50 }
const DAY_MS = 24 * 60 * 60 * 1000
/** BookingService limit on the occurrences of one booking. */
export const MAX_CUSTOM_SLOTS = 60

/** A caregiver the customer can pick, from the center catalog or the profile the URL pointed at. */
export interface BookingCaregiverOption {
  id: string
  fullName: string
  experienceYears?: number
  ratingAverage?: number
}

/** One CUSTOM visit in Vietnam time; each visit has its own date and time range (spec §4). */
export interface CustomSlot {
  date: string
  startTime: string
  endTime: string
}

export interface BookingSchedule {
  bookingType: BookingType
  /** SHIFT: the ProviderService caregiver schedule chosen. */
  scheduleId: string
  /** RECURRING. */
  frequency: BookingRecurrenceFrequency
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
  /** CUSTOM. */
  slots: CustomSlot[]
}

/** Selected services keyed by center offering ID, each with the chosen price plan. */
export type SelectedServices = Record<string, BookingServiceRequest>

function initialSchedule(): BookingSchedule {
  // RECURRING / CUSTOM need 48 hours of notice by default, so the first default visit is three days ahead.
  const firstDay = bookingDay(new Date(Date.now() + 3 * DAY_MS))
  return {
    bookingType: 'CUSTOM',
    scheduleId: '',
    frequency: 'DAILY',
    startDate: firstDay,
    endDate: firstDay,
    startTime: '08:00',
    endTime: '10:00',
    daysOfWeek: [],
    slots: [{ date: firstDay, startTime: '08:00', endTime: '10:00' }]
  }
}

/** Index of the first CUSTOM visit that overlaps an earlier one (half-open ranges, as BookingService checks). */
export function findOverlappingSlot(slots: readonly CustomSlot[]) {
  const ranges = slots
    .map((slot, index) => ({ index, start: `${slot.date}T${slot.startTime}`, end: `${slot.date}T${slot.endTime}` }))
    .filter((range) => range.start < range.end)
    .sort((a, b) => a.start.localeCompare(b.start))
  for (let position = 1; position < ranges.length; position++) {
    if (ranges[position].start < ranges[position - 1].end) return ranges[position].index
  }
  return -1
}

function slotComplete(slot: CustomSlot) {
  return Boolean(slot.date && slot.startTime && slot.endTime && slot.endTime > slot.startTime)
}

function scheduleComplete(schedule: BookingSchedule, caregiverId: string | undefined) {
  if (schedule.bookingType === 'SHIFT') return Boolean(caregiverId && schedule.scheduleId)
  if (schedule.bookingType === 'CUSTOM') {
    const { slots } = schedule
    return (
      slots.length > 0 &&
      slots.length <= MAX_CUSTOM_SLOTS &&
      slots.every(slotComplete) &&
      findOverlappingSlot(slots) < 0
    )
  }
  if (!schedule.startTime || !schedule.endTime || schedule.endTime <= schedule.startTime) return false
  if (!schedule.startDate || !schedule.endDate || schedule.endDate < schedule.startDate) return false
  return schedule.frequency === 'DAILY' || schedule.daysOfWeek.length > 0
}

/** The booking body for the chosen type; fields of the other types are left out because BookingService rejects them. */
function scheduleFields(schedule: BookingSchedule, caregiverId: string | undefined) {
  if (schedule.bookingType === 'SHIFT') {
    return { bookingType: schedule.bookingType, caregiverId, caregiverScheduleId: schedule.scheduleId }
  }
  if (schedule.bookingType === 'CUSTOM') {
    return {
      bookingType: schedule.bookingType,
      caregiverId,
      slots: schedule.slots.map((slot) => ({
        startAt: vietnamInstant(slot.date, slot.startTime),
        endAt: vietnamInstant(slot.date, slot.endTime)
      }))
    }
  }
  return {
    bookingType: schedule.bookingType,
    caregiverId,
    frequency: schedule.frequency,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    daysOfWeek: schedule.frequency === 'WEEKLY' ? [...schedule.daysOfWeek].sort() : undefined
  }
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
  const idempotency = useRef(new Map<string, string>())

  // An overdue remaining-balance invoice blocks new bookings, so the form says so before the customer fills it in.
  const debt = useQuery({ queryKey: paymentKeys.outstanding, queryFn: fetchOutstandingDebt, retry: false })
  const caregiver = useQuery({
    queryKey: providerKeys.publicCaregiver(caregiverParam),
    queryFn: () => fetchPublicCaregiver(caregiverParam),
    enabled: Boolean(caregiverParam),
    retry: false
  })
  const centerId = centerChoice ?? caregiver.data?.centerId ?? centerParam
  const selected = Object.values(services)
  // Q10: caregivers are filtered by the chosen services; BookingService checks the skills again on save.
  const careServiceIds = selected.map((service) => service.careServiceId)
  const providers = useBookingProviders(centerId, careServiceIds)
  const center = providers.centers.data?.find((item) => item.id === centerId)
  const urlCaregiverId = caregiver.data?.caregiverId
  // Empty means the center assigns the caregiver after confirming (RECURRING / CUSTOM only).
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
  const policy = useQuery({
    queryKey: bookingKeys.centerPolicy(centerId),
    queryFn: () => fetchCenterBookingPolicy(centerId),
    enabled: Boolean(centerId),
    retry: false
  })

  const caregiverId = selectedCaregiverId || undefined
  const plansChosen = selected.every((service) => service.pricePlanId)

  // The note is not part of this request: it does not change the price, so typing it never re-runs the quote.
  const request = useMemo<BookingCreateRequest | null>(() => {
    const chosen = Object.values(services)
    const complete = chosen.length > 0 && chosen.every((service) => service.pricePlanId)
    if (!recipientId || !centerId || !complete || !scheduleComplete(schedule, caregiverId)) return null
    return { recipientId, centerId, ...scheduleFields(schedule, caregiverId), services: chosen }
  }, [recipientId, centerId, caregiverId, schedule, services])

  const quote = useQuery({
    queryKey: bookingKeys.quote(request),
    queryFn: () => fetchBookingQuote(request!),
    enabled: request !== null,
    retry: false,
    staleTime: 60_000
  })

  const create = useMutation({
    mutationFn: async (body: BookingCreateRequest) => {
      // The same body keeps its Idempotency-Key, so a retried submit returns the booking already created.
      const fingerprint = JSON.stringify(body)
      let key = idempotency.current.get(fingerprint)
      if (!key) {
        key = crypto.randomUUID()
        idempotency.current.set(fingerprint, key)
      }
      return placeBooking(body, key)
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
    // Offerings, price plans and caregiver schedules belong to one center, so a new center starts over.
    setServices({})
    setSchedule((current) => ({ ...current, scheduleId: '' }))
  }

  function selectCaregiver(id: string) {
    setCaregiverChoice(id)
    // A SHIFT schedule belongs to one caregiver.
    setSchedule((current) => ({ ...current, scheduleId: '' }))
  }

  // The URL caregiver stays selectable even when the catalog pages do not include them.
  const centerCaregivers: BookingCaregiverOption[] = (providers.caregivers.data ?? []).map((item) => ({
    id: item.caregiverId,
    fullName: item.fullName,
    experienceYears: item.experienceYears,
    ratingAverage: item.ratingAverage
  }))
  if (caregiver.data && caregiver.data.centerId === centerId && careServiceIds.length === 0) {
    if (!centerCaregivers.some((item) => item.id === urlCaregiverId)) {
      const { caregiverId, fullName, experienceYears, ratingAverage } = caregiver.data
      centerCaregivers.unshift({ id: caregiverId, fullName, experienceYears, ratingAverage })
    }
  }

  function updateSlot(index: number, patch: Partial<CustomSlot>) {
    setSchedule((current) => ({
      ...current,
      slots: current.slots.map((slot, position) => (position === index ? { ...slot, ...patch } : slot))
    }))
  }

  return {
    caregiverParam,
    caregiver,
    providers,
    centerId,
    centerName: center?.name ?? caregiver.data?.centerName,
    centerCaregivers,
    caregiversFiltered: careServiceIds.length > 0,
    selectCenter,
    selectedCaregiverId,
    selectCaregiver,
    preselectedService,
    recipients,
    offerings,
    policy,
    recipientId,
    setRecipientId,
    services,
    toggleService,
    choosePlan,
    schedule,
    updateSchedule: (patch: Partial<BookingSchedule>) => setSchedule((current) => ({ ...current, ...patch })),
    updateSlot,
    addSlot: () =>
      setSchedule((current) => {
        if (current.slots.length >= MAX_CUSTOM_SLOTS) return current
        const last = current.slots.at(-1)
        return {
          ...current,
          slots: [
            ...current.slots,
            { date: '', startTime: last?.startTime ?? '08:00', endTime: last?.endTime ?? '10:00' }
          ]
        }
      }),
    removeSlot: (index: number) =>
      setSchedule((current) => ({ ...current, slots: current.slots.filter((_, position) => position !== index) })),
    customerNote,
    setCustomerNote,
    // A service without a chosen plan cannot be priced yet.
    plansChosen,
    request,
    quote,
    create,
    hasDebt: debt.data?.hasDebt === true,
    submit: () => {
      if (request) create.mutate({ ...request, customerNote: customerNote.trim() || undefined })
    }
  }
}
