import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { bookingKeys, fetchBookingQuote, fetchCenterBookingPolicy, placeBooking } from '~/entities/booking/booking-api'
import { bookingDay, vietnamInstant } from '~/entities/booking/booking-format'
import { careCatalogKeys, fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { useSelectedCenter } from '~/entities/care-center/selected-center'
import { careRecipientKeys, fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { fetchOutstandingDebt, paymentKeys } from '~/entities/payment/payment-api'
import { fetchPublicCaregiver, providerKeys } from '~/entities/provider/provider-api'
import type {
  BookingCreateRequest,
  BookingRecurrenceFrequency,
  BookingServiceRequest,
  BookingType,
  ListCareRecipientsParams,
  PricePlanRecord
} from '~/shared/api/generated/contracts'
import { addDays, calendarDayOf, isoWeekday } from '~/shared/lib/format'

import { useBookingProviders } from './use-booking-providers'

export const recipientRequest: ListCareRecipientsParams = { status: 'ACTIVE', page: 0, size: 50 }
const DAY_MS = 24 * 60 * 60 * 1000
/** BookingService limit on the occurrences of one booking. */
export const MAX_CUSTOM_SLOTS = 60
export const MAX_SERVICES = 10
/** Platform defaults (spec §8) used until the center policy has loaded. */
const DEFAULT_NOTICE_MINUTES: Record<BookingType, number> = { SHIFT: 120, RECURRING: 2880, CUSTOM: 2880 }
const DRAFT_KEY = 'careconnect.booking-draft.v1'
const PREFILL_PARAMS = ['center', 'service', 'caregiver', 'patient', 'patientId'] as const

export type WizardStep = 1 | 2 | 3 | 4

/** A caregiver the customer can pick, from the center catalog or the profile the URL pointed at. */
export interface BookingCaregiverOption {
  id: string
  fullName: string
  experienceYears?: number
  ratingAverage?: number
  ratingCount?: number
  avatarUrl?: string
  bio?: string
  verifiedCertificateCount?: number
  centerName?: string
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

export type SlotIssue = 'missingDate' | 'invalidTime' | 'overlap' | 'tooEarly'
export type MissingReason =
  | 'recipient'
  | 'center'
  | 'services'
  | 'plans'
  | 'caregiverUnavailable'
  | 'schedule'
  | 'scheduleInvalid'
  | 'shift'
  | 'quote'
  | 'quoteError'
  | 'agree'
  | 'debt'

interface Draft {
  recipientId: string
  centerChoice: string | null
  caregiverChoice: string | null
  services: SelectedServices
  schedule: BookingSchedule
  step: WizardStep
}

function initialSchedule(now: number): BookingSchedule {
  // RECURRING / CUSTOM need 48 hours of notice by default, so the first default visit is three days ahead.
  const firstDay = bookingDay(new Date(now + 3 * DAY_MS))
  return {
    bookingType: 'CUSTOM',
    scheduleId: '',
    frequency: 'DAILY',
    startDate: firstDay,
    endDate: addDays(firstDay, 6),
    startTime: '08:00',
    endTime: '10:00',
    daysOfWeek: [],
    slots: [{ date: firstDay, startTime: '08:00', endTime: '10:00' }]
  }
}

/** The draft is kept per tab so a reload does not lose the choices. The free-text note is never stored (health data). */
function readDraft(): Draft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

function writeDraft(draft: Draft | null) {
  try {
    if (draft) window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    else window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Storage may be unavailable (private mode); the form still works without a draft.
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

/** Calendar days of a RECURRING schedule (Vietnam time), capped at a year to keep the preview cheap. */
export function recurringDays(schedule: BookingSchedule) {
  const days: string[] = []
  if (!schedule.startDate || !schedule.endDate || schedule.endDate < schedule.startDate) return days
  let day = schedule.startDate
  for (let guard = 0; day <= schedule.endDate && guard < 370; guard++) {
    if (schedule.frequency === 'DAILY' || schedule.daysOfWeek.includes(isoWeekday(day))) days.push(day)
    day = addDays(day, 1)
  }
  return days
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
  const [params] = useSearchParams()
  // "Now" is fixed when the form opens: render must stay pure (react-hooks/purity).
  const [now] = useState(() => Date.now())
  const hasPrefill = PREFILL_PARAMS.some((name) => params.get(name))
  const [draft] = useState(() => (hasPrefill ? null : readDraft()))
  // Caregiver profile ID from the public profile page's "book" link.
  const caregiverParam = params.get('caregiver') ?? ''
  const { center: headerCenter } = useSelectedCenter()
  // The URL's center or caregiver wins; otherwise the center chosen in the header is the starting point.
  const centerParam = params.get('center') || (caregiverParam ? '' : (headerCenter?.id ?? ''))
  const preselectedService = params.get('service') ?? ''
  const urlRecipient = params.get('patient') || params.get('patientId') || ''

  const [recipientChoice, setRecipientChoice] = useState(draft?.recipientId ?? urlRecipient)
  // null keeps the center and caregiver the URL pointed at; a choice in the form replaces them.
  const [centerChoice, setCenterChoice] = useState<string | null>(draft?.centerChoice ?? null)
  const [caregiverChoice, setCaregiverChoice] = useState<string | null>(draft?.caregiverChoice ?? null)
  const [rawServices, setServices] = useState<SelectedServices>(draft?.services ?? {})
  const [schedule, setSchedule] = useState<BookingSchedule>(() => draft?.schedule ?? initialSchedule(now))
  const [customerNote, setCustomerNote] = useState('')
  const [step, setStep] = useState<WizardStep>(draft?.step ?? 1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [agreed, setAgreed] = useState(false)
  const [prefillDone, setPrefillDone] = useState(!preselectedService || Boolean(draft))
  const [stepResolved, setStepResolved] = useState(!hasPrefill)
  const idempotency = useRef(new Map<string, string>())
  // Blocks a second click before the mutation state re-renders the button as busy.
  const submitting = useRef(false)

  // An overdue remaining-balance invoice blocks new bookings, so the form says so before the customer fills it in.
  const debt = useQuery({ queryKey: paymentKeys.outstanding, queryFn: fetchOutstandingDebt, retry: false })
  const caregiver = useQuery({
    queryKey: providerKeys.publicCaregiver(caregiverParam),
    queryFn: () => fetchPublicCaregiver(caregiverParam),
    enabled: Boolean(caregiverParam),
    retry: false
  })
  const centerId = centerChoice ?? caregiver.data?.centerId ?? centerParam
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
  // Every offering shows its price in the card, so all price plans load with the list.
  const planQueries = useQueries({
    queries: (offerings.data ?? []).map((offering) => ({
      queryKey: careCatalogKeys.pricePlans(offering.id),
      queryFn: () => fetchPricePlans(offering.id),
      retry: false,
      select: (items: PricePlanRecord[]) => items.filter((plan) => plan.isActive !== false)
    }))
  })
  const plansByOffering: Record<string, { pending: boolean; error: boolean; plans: PricePlanRecord[] }> = {}
  ;(offerings.data ?? []).forEach((offering, index) => {
    const query = planQueries[index]
    plansByOffering[offering.id] = {
      pending: query?.isPending ?? true,
      error: query?.isError ?? false,
      plans: query?.data ?? []
    }
  })

  // A service with a single active plan uses it without asking.
  const services: SelectedServices = {}
  for (const [offeringId, selection] of Object.entries(rawServices)) {
    const plans = plansByOffering[offeringId]?.plans ?? []
    services[offeringId] =
      !selection.pricePlanId && plans.length === 1 ? { ...selection, pricePlanId: plans[0].id } : selection
  }

  // ?service= is a catalog item; it is ticked as soon as the center's offerings are known.
  if (!prefillDone && offerings.isSuccess) {
    const offering = offerings.data.find((item) => item.catalogItem.id === preselectedService)
    setPrefillDone(true)
    if (offering && !rawServices[offering.id]) {
      setServices((current) => ({
        ...current,
        [offering.id]: { careServiceId: offering.catalogItem.id, centerServiceId: offering.id, pricePlanId: '' }
      }))
    }
  } else if (!prefillDone && (offerings.isError || (!centerId && !caregiver.isPending))) {
    setPrefillDone(true)
  }

  const policy = useQuery({
    queryKey: bookingKeys.centerPolicy(centerId),
    queryFn: () => fetchCenterBookingPolicy(centerId),
    enabled: Boolean(centerId),
    retry: false
  })

  const selected = Object.values(services)
  // Q10: caregivers are filtered by the chosen services; BookingService checks the skills again on save.
  const careServiceIds = selected.map((service) => service.careServiceId)
  const providers = useBookingProviders(centerId, careServiceIds)
  const centerList = providers.centers.data ?? []
  const center = centerList.find((item) => item.id === centerId)
  const urlCaregiverId = caregiver.data?.caregiverId
  // Empty means the center assigns the caregiver after confirming (RECURRING / CUSTOM only).
  const selectedCaregiverId =
    caregiverChoice ?? (caregiver.data && caregiver.data.centerId === centerId ? urlCaregiverId : '') ?? ''
  const caregiverId = selectedCaregiverId || undefined

  const recipientItems = recipients.data?.items ?? []
  // A single profile is chosen for the customer; a URL profile that is not theirs is ignored.
  const recipientId =
    recipientChoice && (!recipients.isSuccess || recipientItems.some((item) => item.id === recipientChoice))
      ? recipientChoice
      : recipientItems.length === 1
        ? recipientItems[0].id
        : ''
  const recipient = recipientItems.find((item) => item.id === recipientId)

  // The URL caregiver stays selectable even when the catalog pages do not include them.
  const centerCaregivers: BookingCaregiverOption[] = (providers.caregivers.data ?? []).map((item) => ({
    id: item.caregiverId,
    fullName: item.fullName,
    experienceYears: item.experienceYears,
    ratingAverage: item.ratingAverage,
    ratingCount: item.ratingCount,
    avatarUrl: item.avatarUrl,
    bio: item.bio,
    verifiedCertificateCount: item.verifiedCertificateCount,
    centerName: item.centerName
  }))
  if (caregiver.data && caregiver.data.centerId === centerId && careServiceIds.length === 0) {
    if (!centerCaregivers.some((item) => item.id === urlCaregiverId)) {
      const { caregiverId: id, fullName, experienceYears, ratingAverage } = caregiver.data
      centerCaregivers.unshift({ id, fullName, experienceYears, ratingAverage, centerName: caregiver.data.centerName })
    }
  }
  const chosenCaregiver = centerCaregivers.find((item) => item.id === selectedCaregiverId)
  const caregiverUnavailable =
    Boolean(selectedCaregiverId) && careServiceIds.length > 0 && providers.caregivers.isSuccess && !chosenCaregiver

  // Advance notice (spec §8) decides the first bookable instant of the chosen type.
  const policyData = policy.data
  const noticeMinutes: Record<BookingType, number> = {
    SHIFT: policyData?.shiftMinAdvanceMinutes ?? DEFAULT_NOTICE_MINUTES.SHIFT,
    RECURRING: policyData?.recurringMinAdvanceMinutes ?? DEFAULT_NOTICE_MINUTES.RECURRING,
    CUSTOM: policyData?.customMinAdvanceMinutes ?? DEFAULT_NOTICE_MINUTES.CUSTOM
  }
  const earliest = now + noticeMinutes[schedule.bookingType] * 60_000
  const earliestDay = calendarDayOf(new Date(earliest))
  const tooEarly = (day: string, time: string) => Date.parse(vietnamInstant(day, time)) < earliest

  const overlapping = findOverlappingSlot(schedule.slots)
  const slotIssues: (SlotIssue | null)[] = schedule.slots.map((slot, index) => {
    if (!slot.date) return 'missingDate'
    if (!slot.startTime || !slot.endTime || slot.endTime <= slot.startTime) return 'invalidTime'
    if (tooEarly(slot.date, slot.startTime)) return 'tooEarly'
    if (index === overlapping) return 'overlap'
    return null
  })
  const visitDays = schedule.bookingType === 'RECURRING' ? recurringDays(schedule) : []
  const recurringIssues = {
    invalidRange: Boolean(schedule.endDate && schedule.startDate && schedule.endDate < schedule.startDate),
    invalidTime: Boolean(schedule.startTime && schedule.endTime && schedule.endTime <= schedule.startTime),
    noWeekday: schedule.frequency === 'WEEKLY' && schedule.daysOfWeek.length === 0,
    tooEarly: Boolean(visitDays[0] && tooEarly(visitDays[0], schedule.startTime)),
    noVisits: visitDays.length === 0
  }

  function scheduleIssue(): MissingReason | null {
    if (schedule.bookingType === 'SHIFT') return caregiverId && schedule.scheduleId ? null : 'shift'
    if (schedule.bookingType === 'CUSTOM') {
      if (schedule.slots.length === 0) return 'schedule'
      return slotIssues.some(Boolean) ? 'scheduleInvalid' : null
    }
    if (!schedule.startDate || !schedule.endDate) return 'schedule'
    return Object.values(recurringIssues).some(Boolean) ? 'scheduleInvalid' : null
  }

  const plansChosen = selected.every((service) => service.pricePlanId)
  const issues: Record<1 | 2 | 3, MissingReason | null> = {
    1: recipientId ? null : 'recipient',
    2: !centerId
      ? 'center'
      : selected.length === 0
        ? 'services'
        : !plansChosen
          ? 'plans'
          : caregiverUnavailable
            ? 'caregiverUnavailable'
            : null,
    3: scheduleIssue()
  }
  const readyForQuote = !issues[1] && !issues[2] && !issues[3]

  // The note is not part of this request: it does not change the price, so typing it never re-runs the quote.
  const scheduleKey = JSON.stringify(schedule)
  const servicesKey = JSON.stringify(services)
  const request = useMemo<BookingCreateRequest | null>(() => {
    if (!readyForQuote) return null
    const chosen = Object.values(JSON.parse(servicesKey) as SelectedServices)
    const current = JSON.parse(scheduleKey) as BookingSchedule
    return { recipientId, centerId, ...scheduleFields(current, caregiverId), services: chosen }
  }, [readyForQuote, recipientId, centerId, caregiverId, scheduleKey, servicesKey])

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
    onSuccess: () => {
      writeDraft(null)
      void queryClient.invalidateQueries({ queryKey: bookingKeys.lists })
    }
  })

  const hasDebt = debt.data?.hasDebt === true
  const reviewIssue: MissingReason | null = hasDebt
    ? 'debt'
    : !request || quote.isPending
      ? 'quote'
      : quote.isError
        ? 'quoteError'
        : !agreed
          ? 'agree'
          : null
  const stepIssue = step === 4 ? (issues[1] ?? issues[2] ?? issues[3] ?? reviewIssue) : issues[step]
  const furthest: WizardStep = issues[1] ? 1 : issues[2] ? 2 : issues[3] ? 3 : 4

  // A prefilled URL opens the first step that still needs input, once the data it depends on has arrived.
  const plansSettled = Object.keys(rawServices).every((id) => !plansByOffering[id]?.pending)
  if (
    !stepResolved &&
    prefillDone &&
    plansSettled &&
    recipients.isFetched &&
    (!caregiverParam || caregiver.isFetched)
  ) {
    setStepResolved(true)
    const target: WizardStep = !urlRecipient || issues[1] ? 1 : issues[2] ? 2 : 3
    if (target !== step) setStep(target)
  }

  const dirty = Boolean(recipientChoice) || Object.keys(rawServices).length > 0 || customerNote.trim() !== ''

  useEffect(() => {
    if (create.isSuccess) return
    if (!dirty && step === 1) return
    writeDraft({ recipientId: recipientChoice, centerChoice, caregiverChoice, services: rawServices, schedule, step })
  }, [recipientChoice, centerChoice, caregiverChoice, rawServices, schedule, step, dirty, create.isSuccess])

  function goTo(target: WizardStep) {
    if (target > furthest) return
    setDirection(target >= step ? 'forward' : 'back')
    setStep(target)
  }

  function toggleService(offeringId: string, careServiceId: string) {
    setServices((current) => {
      const next = { ...current }
      if (next[offeringId]) delete next[offeringId]
      else if (Object.keys(next).length < MAX_SERVICES)
        next[offeringId] = { careServiceId, centerServiceId: offeringId, pricePlanId: '' }
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
    // A SHIFT schedule belongs to one caregiver; without a caregiver a shift cannot be booked.
    setSchedule((current) => ({
      ...current,
      scheduleId: '',
      bookingType: !id && current.bookingType === 'SHIFT' ? 'CUSTOM' : current.bookingType
    }))
  }

  function updateSlot(index: number, patch: Partial<CustomSlot>) {
    setSchedule((current) => ({
      ...current,
      slots: current.slots.map((slot, position) => (position === index ? { ...slot, ...patch } : slot))
    }))
  }

  return {
    now,
    step,
    direction,
    goTo,
    next: () => goTo(Math.min(4, step + 1) as WizardStep),
    back: () => goTo(Math.max(1, step - 1) as WizardStep),
    furthest,
    issues,
    stepIssue,
    dirty,
    caregiverParam,
    caregiver,
    providers,
    centers: centerList,
    centerId,
    centerName: center?.name ?? caregiver.data?.centerName,
    centerCaregivers,
    chosenCaregiver,
    caregiversFiltered: careServiceIds.length > 0,
    selectCenter,
    selectedCaregiverId,
    selectCaregiver,
    recipients,
    recipient,
    recipientId,
    setRecipientId: setRecipientChoice,
    offerings,
    plansByOffering,
    policy,
    noticeMinutes,
    earliestDay,
    services,
    toggleService,
    choosePlan,
    schedule,
    slotIssues,
    visitDays,
    recurringIssues,
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
            {
              date: last?.date ? addDays(last.date, 1) : '',
              startTime: last?.startTime ?? '08:00',
              endTime: last?.endTime ?? '10:00'
            }
          ]
        }
      }),
    duplicateSlot: (index: number) =>
      setSchedule((current) => {
        if (current.slots.length >= MAX_CUSTOM_SLOTS) return current
        const source = current.slots[index]
        const copy = { ...source, date: source.date ? addDays(source.date, 1) : '' }
        return { ...current, slots: [...current.slots.slice(0, index + 1), copy, ...current.slots.slice(index + 1)] }
      }),
    removeSlot: (index: number) =>
      setSchedule((current) => ({ ...current, slots: current.slots.filter((_, position) => position !== index) })),
    customerNote,
    setCustomerNote,
    agreed,
    setAgreed,
    plansChosen,
    request,
    quote,
    create,
    hasDebt,
    submit: () => {
      if (!request || reviewIssue || create.isPending || submitting.current) return
      submitting.current = true
      create.mutate(
        { ...request, customerNote: customerNote.trim() || undefined },
        {
          onError: () => {
            submitting.current = false
          }
        }
      )
    }
  }
}

export type BookingForm = ReturnType<typeof useBookingForm>
