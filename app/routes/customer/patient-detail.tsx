import type { Route } from './+types/patient-detail'
import { PatientDetailPage } from '~/features/customer/patient-detail/patient-detail-page'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Chi tiết hồ sơ bệnh án | CareConnect' },
    {
      name: 'description',
      content: 'Chi tiết tình trạng y tế, tiền sử bệnh nền và kế hoạch chăm sóc người thân trên CareConnect.'
    }
  ]
}

export default function CustomerPatientDetailRoute() {
  return <PatientDetailPage />
}
