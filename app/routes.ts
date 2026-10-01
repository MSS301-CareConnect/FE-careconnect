import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  ...prefix('admin', [
    layout('routes/admin/layout.tsx', [
      index('routes/admin/index.tsx'),
      route('dashboard', 'routes/admin/dashboard.tsx'),
      route('revenue', 'routes/admin/revenue.tsx'),
      route('services', 'routes/admin/services.tsx'),
      route('centers', 'routes/admin/centers.tsx'),
      route('policies', 'routes/admin/policies.tsx'),
      route('quality', 'routes/admin/quality.tsx'),
      route('reviews-complaints', 'routes/admin/reviews-complaints.tsx'),
      route('customers', 'routes/admin/customers.tsx'),
      route('customers/:id', 'routes/admin/customer-detail.tsx')
    ])
  ]),
  ...prefix('center-manager', [
    layout('routes/center-manager/layout.tsx', [
      index('routes/center-manager/index.tsx'),
      route('caregivers', 'routes/center-manager/caregivers.tsx'),
      route('caregivers/:id', 'routes/center-manager/caregiver-detail.tsx'),
      route('bookings', 'routes/center-manager/bookings.tsx'),
      route('bookings/:id', 'routes/center-manager/booking-detail.tsx')
    ])
  ]),
  ...prefix('caregiver', [
    layout('routes/caregiver/layout.tsx', [
      index('routes/caregiver/index.tsx'),
      route('dashboard', 'routes/caregiver/dashboard.tsx'),
      route('schedule', 'routes/caregiver/schedule.tsx'),
      route('history', 'routes/caregiver/history.tsx'),
      route('profile', 'routes/caregiver/profile.tsx'),
      route('shifts/:id/report', 'routes/caregiver/care-report.tsx'),
      route('shifts/:id?', 'routes/caregiver/shift-detail.tsx'),
      route('shifts/:id/active', 'routes/caregiver/shift-active.tsx'),
      route('active-session', 'routes/caregiver/active-session.tsx')
    ])
  ]),
  ...prefix('customer', [
    layout('routes/customer/layout.tsx', [
      route('caregivers', 'routes/customer/caregivers.tsx'),
      route('booking', 'routes/customer/booking.tsx'),
      route('bookings', 'routes/customer/bookings.tsx'),
      route('bookings/:code', 'routes/customer/booking-detail.tsx'),
      route('bookings/:code/report', 'routes/customer/care-report.tsx'),
      route('booking/deposit', 'routes/customer/booking-deposit.tsx'),
      route('my-profile', 'routes/customer/my-profile.tsx'),
      route('patient-profiles', 'routes/customer/patient-profiles.tsx'),
      route('patient-profiles/new', 'routes/customer/patient-create.tsx'),
      route('patient-profiles/:id', 'routes/customer/patient-detail.tsx')
    ])
  ]),
  route('*', 'routes/not-found.tsx')
] satisfies RouteConfig
