import { Navigate } from 'react-router'

/** Security now lives in the profile's Security tab, inside the caregiver shell. */
export default function CaregiverSecurityRoute() {
  return <Navigate replace to='/caregiver/profile?tab=security' />
}
