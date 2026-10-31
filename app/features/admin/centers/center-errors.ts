/** ProviderService center codes (4100–4122, 4500–4503) as business sentences shown at the end of a form or dialog. */
export const CENTER_BUSINESS_ERRORS = {
  4114: 'admin.centersPage.detail.business.stale',
  4115: 'admin.centersPage.detail.business.archived',
  4121: 'admin.centersPage.detail.business.hasBookings',
  4122: 'admin.centersPage.detail.business.transition',
  4120: 'admin.centersPage.detail.business.managerRequired',
  4118: 'admin.centersPage.detail.business.managerTaken',
  4501: 'admin.centersPage.detail.business.managerNotFound',
  4502: 'admin.centersPage.detail.business.managerInvalid',
  4503: 'admin.centersPage.detail.business.managerMismatch'
} as const

export type CenterBusinessKey = (typeof CENTER_BUSINESS_ERRORS)[keyof typeof CENTER_BUSINESS_ERRORS]
