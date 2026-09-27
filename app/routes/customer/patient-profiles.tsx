import type { Route } from './+types/patient-profiles'
import { PatientProfilesPage } from '~/features/customer/patient-profiles/patient-profiles-page'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Hồ sơ người thân cần chăm sóc | CareConnect' },
    {
      name: 'description',
      content: 'Quản lý thông tin y tế và bệnh nền của người thân cần chăm sóc trên CareConnect.'
    }
  ]
}

export default function CustomerPatientProfilesRoute() {
  return <PatientProfilesPage />
}
