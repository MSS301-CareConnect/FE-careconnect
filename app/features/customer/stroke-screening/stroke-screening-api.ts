import { predictStrokeScreening } from '~/shared/api/generated/api/stroke-screening/stroke-screening'
import type { StrokeScreeningRequest } from '~/shared/api/generated/contracts'
import { apiErrorCode, apiErrorStatus, apiRequestErrorKey } from '~/shared/api/error-details'
import { serviceResponse, writeOptions } from '~/shared/api/request'

const { result } = serviceResponse('AIService')

/**
 * One screening through the gateway (`POST /api/v1/ai/stroke-screening/predict`, CUSTOMER only). AIService forwards
 * the answers to its internal StrokeModelService; the browser never calls the model service itself. The call is a
 * cookie-authenticated POST, so it carries the Identity CSRF header like every other write.
 */
export async function screenStroke(request: StrokeScreeningRequest) {
  return result(await predictStrokeScreening(request, await writeOptions()))
}

/** AIService STROKE_MODEL_UNAVAILABLE: the model service is down, timed out or answered badly. */
const MODEL_UNAVAILABLE = 8613

export type StrokeScreeningErrorKey =
  | 'customer.strokeScreening.errors.unavailable'
  | 'customer.strokeScreening.errors.network'
  | 'customer.strokeScreening.errors.session'
  | 'customer.strokeScreening.errors.forbidden'
  | 'customer.strokeScreening.errors.invalid'
  | 'customer.strokeScreening.errors.generic'

/**
 * A failed screening as a translated sentence plus whether "Try again" makes sense. A 401 has already refreshed the
 * session through the query client, so repeating works; a 403 or a 400 would only fail again. A 404 means the gateway
 * reaches an AIService without the screening endpoint (not deployed yet), which reads as "not available".
 */
export function strokeScreeningError(error: unknown): { key: StrokeScreeningErrorKey; retry: boolean } {
  const status = apiErrorStatus(error)
  if (apiErrorCode(error) === MODEL_UNAVAILABLE || status === 404) {
    return { key: 'customer.strokeScreening.errors.unavailable', retry: true }
  }
  if (status === 401) return { key: 'customer.strokeScreening.errors.session', retry: true }
  if (status === 403) return { key: 'customer.strokeScreening.errors.forbidden', retry: false }
  if (status === 400 || status === 422) return { key: 'customer.strokeScreening.errors.invalid', retry: false }
  const requestKey = apiRequestErrorKey(error, 'generic')
  if (requestKey === 'errors.request.network') return { key: 'customer.strokeScreening.errors.network', retry: true }
  if (requestKey === 'errors.request.unavailable') {
    return { key: 'customer.strokeScreening.errors.unavailable', retry: true }
  }
  return { key: 'customer.strokeScreening.errors.generic', retry: true }
}
