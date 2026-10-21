import type { Route } from './+types/caregivers'
import { CustomerProviderCatalogPage } from '~/features/customer/caregivers/customer-provider-pages'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Tìm kiếm & Đặt lịch Người chăm sóc uy tín | CareConnect' },
    {
      name: 'description',
      content: 'Tìm kiếm và đặt lịch điều dưỡng viên, chuyên viên chăm sóc sức khỏe gia đình uy tín tại CareConnect.'
    }
  ]
}

export default function CustomerCaregiversRoute() {
  return <CustomerProviderCatalogPage />
}
