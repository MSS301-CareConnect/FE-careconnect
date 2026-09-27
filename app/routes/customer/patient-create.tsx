import type { Route } from './+types/patient-create'
import { PatientCreatePage } from '~/features/customer/patient-create/patient-create-page'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Thêm hồ sơ người bệnh mới | CareConnect' },
    {
      name: 'description',
      content: 'Tạo mới hồ sơ y tế, bệnh nền và nhu cầu chăm sóc người thân trên CareConnect.'
    }
  ]
}

export default function CustomerPatientCreateRoute() {
  return <PatientCreatePage />
}
