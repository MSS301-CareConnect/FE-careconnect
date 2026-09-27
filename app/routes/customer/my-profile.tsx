import type { Route } from './+types/my-profile'
import { MyProfilePage } from '~/features/customer/my-profile/my-profile-page'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Hồ sơ cá nhân | CareConnect' },
    {
      name: 'description',
      content: 'Quản lý thông tin cá nhân và bảo mật tài khoản khách hàng CareConnect.'
    }
  ]
}

export default function CustomerMyProfileRoute() {
  return <MyProfilePage />
}
