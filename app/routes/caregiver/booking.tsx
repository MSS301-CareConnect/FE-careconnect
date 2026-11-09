import { useParams } from 'react-router'

import { CaregiverBookingPage } from '~/features/caregiver/visits/caregiver-booking-page'

// Reads the param with useParams like routes/admin/account-detail (no generated +types needed).
export default function CaregiverBookingRoute() {
  const { bookingId = '' } = useParams()
  return <CaregiverBookingPage bookingId={bookingId} key={bookingId} />
}
