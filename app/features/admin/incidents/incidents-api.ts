import {
  listBookingOutboxEvents,
  requeueBookingOutboxEvents,
  skipBookingOutboxEvents
} from '~/shared/api/generated/api/booking-outbox/booking-outbox'
import {
  listProviderOutboxEvents,
  requeueProviderOutboxEvents,
  skipProviderOutboxEvents
} from '~/shared/api/generated/api/provider-outbox/provider-outbox'
import type { OutboxStatus } from '~/shared/api/generated/contracts'
import { readOptions, serviceResponse, writeOptions } from '~/shared/api/request'

const PAGE_SIZE = 50

export type IncidentSource = 'booking' | 'provider'

/** One cross-service delivery from BookingService or ProviderService, reduced to what the admin screen shows. */
export interface IncidentRow {
  id: string
  eventType: string
  /** Booking / complaint id for BookingService rows, center id for ProviderService rows. */
  subjectId: string
  status: OutboxStatus
  attempts: number
  lastError?: string | null
  updatedAt?: string
}

const { result } = serviceResponse('Outbox')

export const incidentKeys = {
  all: ['admin', 'incidents'] as const,
  list: (source: IncidentSource, status: OutboxStatus | 'ALL') => ['admin', 'incidents', source, status] as const
}

export async function fetchIncidents(source: IncidentSource, status: OutboxStatus | 'ALL'): Promise<IncidentRow[]> {
  const params = { status: status === 'ALL' ? undefined : status, page: 0, size: PAGE_SIZE }
  if (source === 'booking') {
    return result(await listBookingOutboxEvents(params, readOptions)).items.map((item) => ({
      id: item.id,
      eventType: item.eventType,
      subjectId: item.aggregateId,
      status: item.status,
      attempts: item.attempts,
      lastError: item.lastError,
      updatedAt: item.updatedAt
    }))
  }
  return result(await listProviderOutboxEvents(params, readOptions)).items.map((item) => ({
    id: item.id,
    eventType: item.eventType,
    subjectId: item.centerId,
    status: item.status,
    attempts: item.attempts,
    lastError: item.lastError,
    updatedAt: item.updatedAt
  }))
}

/** FAILED → PENDING with a fresh retry budget; the service's scheduler sends it on its next scan. */
export async function requeueIncident(source: IncidentSource, id: string) {
  return source === 'booking'
    ? result(await requeueBookingOutboxEvents(id, await writeOptions()))
    : result(await requeueProviderOutboxEvents(id, await writeOptions()))
}

/** FAILED → SKIPPED after the admin handled the work by hand; later ProviderService events of the center unblock. */
export async function skipIncident(source: IncidentSource, id: string, note: string) {
  return source === 'booking'
    ? result(await skipBookingOutboxEvents(id, { note }, await writeOptions()))
    : result(await skipProviderOutboxEvents(id, { note }, await writeOptions()))
}
