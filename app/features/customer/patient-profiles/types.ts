import { ListCareRecipientsStatus } from '~/shared/api/generated/contracts'

export type StatusFilter = 'ALL' | ListCareRecipientsStatus

export const STATUS_OPTIONS = Object.values(ListCareRecipientsStatus)
