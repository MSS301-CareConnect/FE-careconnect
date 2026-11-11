// Admin "Hồ sơ" (2026-11-10): the administrator's own information and security (password, signed-in devices).
export const adminProfileVi = {
  menu: 'Hồ sơ',
  documentTitle: 'Hồ sơ của tôi | Quản trị CareConnect',
  title: 'Hồ sơ của tôi',
  subtitle: 'Thông tin tài khoản quản trị và bảo mật đăng nhập của bạn.',
  tabsLabel: 'Mục hồ sơ',
  tabs: { info: 'Thông tin cá nhân', security: 'Bảo mật' },
  infoTitle: 'Thông tin cá nhân',
  memberSince: 'Tham gia từ {{date}}',
  active: 'Đang hoạt động',
  noPhone: 'Chưa có số điện thoại',
  securityNote: 'Đổi mật khẩu sẽ đăng xuất mọi thiết bị và đưa bạn về trang đăng nhập.'
}

export const adminProfileEn: typeof adminProfileVi = {
  menu: 'Profile',
  documentTitle: 'My profile | CareConnect Admin',
  title: 'My profile',
  subtitle: 'Your administrator account details and sign-in security.',
  tabsLabel: 'Profile sections',
  tabs: { info: 'Personal information', security: 'Security' },
  infoTitle: 'Personal information',
  memberSince: 'Member since {{date}}',
  active: 'Active',
  noPhone: 'No phone number yet',
  securityNote: 'Changing the password signs out every device and takes you back to sign-in.'
}
