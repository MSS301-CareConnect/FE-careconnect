import type { BookingForm } from '../hooks/use-booking-form'

/** The longest minimum duration among the chosen plans, used to suggest an end time; one hour otherwise. */
export function minimumVisitMinutes(form: BookingForm) {
  let minutes = 60
  for (const [offeringId, selection] of Object.entries(form.services)) {
    const plan = form.plansByOffering[offeringId]?.plans.find((item) => item.id === selection.pricePlanId)
    if (plan?.pricingUnit === 'HOUR' && plan.durationMinutes) minutes = Math.max(minutes, plan.durationMinutes)
  }
  return minutes
}
