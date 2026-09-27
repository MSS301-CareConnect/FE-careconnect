import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  ...prefix('customer', [
    layout('routes/customer/layout.tsx', [
      route('caregivers', 'routes/customer/caregivers.tsx'),
      route('booking', 'routes/customer/booking.tsx'),
      route('booking/deposit', 'routes/customer/booking-deposit.tsx'),
      route('my-profile', 'routes/customer/my-profile.tsx'),
      route('patient-profiles', 'routes/customer/patient-profiles.tsx'),
      route('patient-profiles/new', 'routes/customer/patient-create.tsx'),
      route('patient-profiles/:id', 'routes/customer/patient-detail.tsx')
    ])
  ]),
  route('*', 'routes/not-found.tsx')
] satisfies RouteConfig
