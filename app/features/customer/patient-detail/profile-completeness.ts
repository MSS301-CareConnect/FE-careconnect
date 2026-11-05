import type { CareRecipientDetailRecord } from '~/shared/api/generated/contracts'

import type { EditSection } from './hooks/use-profile-editor'

export type DetailTab = 'overview' | 'medical' | 'daily' | 'contacts' | 'addresses' | 'managers'

/** A piece of the profile that helps the caregiver, where to fill it in, and whether it is there. */
export interface CompletenessItem {
  id:
    'birth' | 'bloodType' | 'body' | 'address' | 'conditions' | 'allergies' | 'mobility' | 'diet' | 'needs' | 'contact'
  tab: DetailTab
  /** The dialog that edits it; the emergency contact is added from its own tab. */
  section?: EditSection
  done: boolean
}

/**
 * "Profile 60% complete": ten things a caregiver reads before the first visit. Medications are left out because many
 * people take none, so an empty list is a valid answer.
 */
export function profileCompleteness(detail: CareRecipientDetailRecord) {
  const profile = detail.profile
  const items: CompletenessItem[] = [
    { id: 'birth', tab: 'overview', section: 'basic', done: Boolean(profile.dateOfBirth && profile.gender) },
    { id: 'bloodType', tab: 'overview', section: 'basic', done: Boolean(profile.bloodType) },
    { id: 'body', tab: 'overview', section: 'basic', done: Boolean(profile.heightCm && profile.weightKg) },
    {
      id: 'address',
      tab: 'overview',
      section: 'address',
      done: Boolean(profile.addressLine && profile.district && profile.province)
    },
    { id: 'conditions', tab: 'medical', section: 'medical', done: Boolean(profile.chronicConditions) },
    { id: 'allergies', tab: 'medical', section: 'medical', done: Boolean(profile.allergies) },
    {
      id: 'mobility',
      tab: 'daily',
      section: 'daily',
      done: Boolean(profile.mobilityLevel && profile.independenceLevel)
    },
    { id: 'diet', tab: 'daily', section: 'daily', done: Boolean(profile.dietaryNotes) },
    { id: 'needs', tab: 'daily', section: 'daily', done: Boolean(profile.careRequirements) },
    { id: 'contact', tab: 'contacts', done: (detail.emergencyContacts ?? []).length > 0 }
  ]
  const done = items.filter((item) => item.done).length
  return { percent: Math.round((done / items.length) * 100), missing: items.filter((item) => !item.done) }
}
