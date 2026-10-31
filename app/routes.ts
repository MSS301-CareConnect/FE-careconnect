import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('forgot-password', 'routes/forgot-password.tsx'),
  route('account/security', 'routes/account/security.tsx'),
  ...prefix('admin', [
    layout('routes/admin/layout.tsx', [
      index('routes/admin/index.tsx'),
      route('dashboard', 'routes/admin/dashboard.tsx'),
      route('revenue', 'routes/admin/revenue.tsx'),
      route('services', 'routes/admin/services.tsx'),
      route('centers', 'routes/admin/centers.tsx'),
      route('centers/:id', 'routes/admin/center-detail.tsx'),
      route('centers/:id/caregivers', 'routes/admin/center-caregivers.tsx'),
      route('policies', 'routes/admin/policies.tsx'),
      route('quality', 'routes/admin/quality.tsx'),
      route('reviews-complaints', 'routes/admin/reviews-complaints.tsx'),
      route('customers', 'routes/admin/customers.tsx'),
      route('customers/:id', 'routes/admin/customer-detail.tsx'),
      route('accounts', 'routes/admin/accounts.tsx'),
      route('accounts/:id', 'routes/admin/account-detail.tsx'),
      route('roles', 'routes/admin/roles.tsx'),
      route('incidents', 'routes/admin/incidents.tsx'),
      route('bookings', 'routes/admin/bookings.tsx'),
      route('bookings/:id', 'routes/admin/booking-detail.tsx'),
      route('caregivers', 'routes/admin/caregivers.tsx')
    ])
  ]),
  ...prefix('center-manager', [
    layout('routes/center-manager/layout.tsx', [
      index('routes/center-manager/index.tsx'),
      route('statistics', 'routes/center-manager/statistics.tsx'),
      route('caregivers', 'routes/center-manager/caregivers.tsx'),
      route('caregivers/:id', 'routes/center-manager/caregiver-detail.tsx'),
      route('work-shifts', 'routes/center-manager/work-shifts.tsx'),
      route('schedules', 'routes/center-manager/schedules.tsx'),
      route('services', 'routes/center-manager/services.tsx'),
      route('work-shifts/:id', 'routes/center-manager/work-shift-detail.tsx'),
      route('bookings', 'routes/center-manager/bookings.tsx'),
      route('bookings/:id', 'routes/center-manager/booking-detail.tsx'),
      route('complaints', 'routes/center-manager/complaints.tsx')
    ])
  ]),
  ...prefix('caregiver', [
    layout('routes/caregiver/layout.tsx', [
      index('routes/caregiver/index.tsx'),
      route('schedule', 'routes/caregiver/schedule.tsx'),
      route('work-shifts', 'routes/caregiver/work-shifts.tsx'),
      route('visits', 'routes/caregiver/visits.tsx'),
      route('visits/:id', 'routes/caregiver/visit-detail.tsx'),
      route('profile', 'routes/caregiver/profile.tsx')
    ])
  ]),
  ...prefix('customer', [
    layout('routes/customer/browse-layout.tsx', [
      route('caregivers', 'routes/customer/caregivers.tsx'),
      route('services', 'routes/customer/services.tsx'),
      route('services/:offeringId', 'routes/customer/service-detail.tsx'),
      route('caregivers/:caregiverId', 'routes/customer/caregiver-profile.tsx')
    ]),
    layout('routes/customer/layout.tsx', [
      index('routes/customer/index.tsx'),
      route('booking', 'routes/customer/booking.tsx'),
      route('bookings', 'routes/customer/bookings.tsx'),
      route('bookings/:id', 'routes/customer/booking-detail.tsx'),
      route('bookings/:id/deposit', 'routes/customer/booking-payment.tsx'),
      route('payments', 'routes/customer/payments.tsx'),
      route('invitations', 'routes/customer/invitations.tsx'),
      route('payments/vnpay-return', 'routes/customer/payment-return.tsx'),
      route('payments/:paymentId/success', 'routes/customer/payment-success.tsx'),
      route('payments/:paymentId/failure', 'routes/customer/payment-failure.tsx'),
      route('my-profile', 'routes/customer/my-profile.tsx'),
      route('patient-profiles', 'routes/customer/patient-profiles.tsx'),
      route('patient-profiles/new', 'routes/customer/patient-create.tsx'),
      route('patient-profiles/:id', 'routes/customer/patient-detail.tsx')
    ])
  ]),
  route('*', 'routes/not-found.tsx')
] satisfies RouteConfig
