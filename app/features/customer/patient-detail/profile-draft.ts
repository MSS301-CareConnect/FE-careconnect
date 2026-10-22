import type {
  CareRecipientRecord,
  CareRecipientUpdateRequest,
  CareRecipientUpdateRequestBloodType,
  CareRecipientUpdateRequestGender,
  CareRecipientUpdateRequestIndependenceLevel,
  CareRecipientUpdateRequestMobilityLevel
} from '~/shared/api/generated/contracts'

export const PHONE_PATTERN = /^[0-9]{10,11}$/

// Form state keeps every editable profile field as text; an empty string clears the value on save.
export interface ProfileDraft {
  fullName: string
  dateOfBirth: string
  gender: '' | CareRecipientUpdateRequestGender
  phoneNumber: string
  bloodType: '' | CareRecipientUpdateRequestBloodType
  heightCm: string
  weightKg: string
  addressLine: string
  ward: string
  district: string
  province: string
  medicalHistory: string
  chronicConditions: string
  allergies: string
  mobilityLevel: '' | CareRecipientUpdateRequestMobilityLevel
  independenceLevel: '' | CareRecipientUpdateRequestIndependenceLevel
  dietaryNotes: string
  sleepHabits: string
  behaviorNotes: string
  careRequirements: string
}

export type ProfileDraftError = 'nameRequired' | 'phoneInvalid'

export function toProfileDraft(profile: CareRecipientRecord): ProfileDraft {
  return {
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth ?? '',
    gender: profile.gender ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    bloodType: profile.bloodType ?? '',
    heightCm: profile.heightCm?.toString() ?? '',
    weightKg: profile.weightKg?.toString() ?? '',
    addressLine: profile.addressLine ?? '',
    ward: profile.ward ?? '',
    district: profile.district ?? '',
    province: profile.province ?? '',
    medicalHistory: profile.medicalHistory ?? '',
    chronicConditions: profile.chronicConditions ?? '',
    allergies: profile.allergies ?? '',
    mobilityLevel: profile.mobilityLevel ?? '',
    independenceLevel: profile.independenceLevel ?? '',
    dietaryNotes: profile.dietaryNotes ?? '',
    sleepHabits: profile.sleepHabits ?? '',
    behaviorNotes: profile.behaviorNotes ?? '',
    careRequirements: profile.careRequirements ?? ''
  }
}

export function validateProfileDraft(draft: ProfileDraft): ProfileDraftError | undefined {
  if (!draft.fullName.trim()) return 'nameRequired'
  if (draft.phoneNumber.trim() && !PHONE_PATTERN.test(draft.phoneNumber.trim())) return 'phoneInvalid'
  return undefined
}

const text = (value: string) => value.trim() || undefined
const number = (value: string) => (value.trim() ? Number(value) : undefined)
const option = <T extends string>(value: '' | T) => value || undefined

// The backend PUT replaces the whole profile, so fields the form does not edit are sent back unchanged.
export function toUpdateRequest(profile: CareRecipientRecord, draft: ProfileDraft): CareRecipientUpdateRequest {
  return {
    fullName: draft.fullName.trim(),
    dateOfBirth: text(draft.dateOfBirth),
    gender: option(draft.gender),
    phoneNumber: text(draft.phoneNumber),
    avatarUrl: profile.avatarUrl,
    addressLine: text(draft.addressLine),
    ward: text(draft.ward),
    district: text(draft.district),
    province: text(draft.province),
    latitude: profile.latitude,
    longitude: profile.longitude,
    bloodType: option(draft.bloodType),
    heightCm: number(draft.heightCm),
    weightKg: number(draft.weightKg),
    medicalHistory: text(draft.medicalHistory),
    chronicConditions: text(draft.chronicConditions),
    allergies: text(draft.allergies),
    mobilityLevel: option(draft.mobilityLevel),
    independenceLevel: option(draft.independenceLevel),
    dietaryNotes: text(draft.dietaryNotes),
    sleepHabits: text(draft.sleepHabits),
    behaviorNotes: text(draft.behaviorNotes),
    careRequirements: text(draft.careRequirements),
    version: profile.version
  }
}
