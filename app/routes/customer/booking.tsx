import type { Route } from './+types/booking'
import { CustomerBookingPage } from '~/features/customer/booking/booking-page'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Tạo lịch hẹn chăm sóc y tế tại nhà | CareConnect' },
    {
      name: 'description',
      content: 'Tạo lịch hẹn chăm sóc y tế tại nhà với điều dưỡng viên chuyên nghiệp trên nền tảng CareConnect.'
    }
  ]
}

export default function CustomerBookingRoute() {
  return <CustomerBookingPage />
}
