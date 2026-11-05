import { Navigate } from 'react-router'

/** Booking requests moved into the visits tab "Needs your answer" (2026-11-05); old links and bookmarks land there. */
export default function CaregiverRequestsRoute() {
  return <Navigate replace to='/caregiver/visits?tab=respond' />
}
