export const centerPickerVi = {
  label: 'Trung tâm',
  none: 'Tất cả trung tâm',
  choose: 'Chọn trung tâm',
  change: 'Đổi trung tâm',
  menu: 'Danh sách trung tâm chăm sóc',
  search: 'Tìm trung tâm',
  searchPlaceholder: 'Tên hoặc địa chỉ trung tâm…',
  count: '{{count, number}} trung tâm đang nhận đặt lịch',
  current: 'Đang chọn',
  facts: {
    fromPrice: 'Giá từ {{price}}',
    services: '{{count, number}} dịch vụ'
  },
  general: {
    name: 'Xem tất cả trung tâm',
    description: 'Xem dịch vụ và người chăm sóc của mọi trung tâm, chọn sau cũng được'
  },
  dialog: {
    title: 'Bạn muốn đặt chăm sóc tại trung tâm nào?',
    description:
      'Dịch vụ, bảng giá và người chăm sóc sẽ hiển thị theo trung tâm bạn chọn. Bạn có thể đổi trung tâm bất cứ lúc nào ở đầu trang.',
    close: 'Đóng',
    skip: 'Để sau, xem tất cả trước'
  },
  states: {
    loading: 'Đang tải danh sách trung tâm…',
    empty: 'Chưa có trung tâm nào đang nhận đặt lịch.',
    noMatch: 'Không có trung tâm khớp với tên này.',
    error: 'Chưa tải được danh sách trung tâm.',
    retry: 'Thử lại',
    signInTitle: 'Đăng nhập để chọn trung tâm',
    signInText: 'Danh sách trung tâm, bảng giá và đội ngũ chăm sóc hiển thị sau khi bạn đăng nhập.',
    signIn: 'Đăng nhập'
  },
  scope: { showing: 'Đang hiển thị theo' }
} as const

export const centerPickerEn = {
  label: 'Center',
  none: 'All centers',
  choose: 'Choose a center',
  change: 'Change center',
  menu: 'Care centers',
  search: 'Search centers',
  searchPlaceholder: 'Center name or address…',
  count: '{{count, number}} centers taking bookings',
  current: 'Selected',
  facts: {
    fromPrice: 'From {{price}}',
    services: '{{count, number}} services'
  },
  general: {
    name: 'See all centers',
    description: 'Browse services and caregivers from every center, and choose one later'
  },
  dialog: {
    title: 'Which center would you like care from?',
    description:
      'Services, prices and caregivers follow the center you choose. You can change it at any time from the top of the page.',
    close: 'Close',
    skip: 'Maybe later, show me everything'
  },
  states: {
    loading: 'Loading care centers…',
    empty: 'No center is taking bookings yet.',
    noMatch: 'No center matches that name.',
    error: 'The center list could not be loaded.',
    retry: 'Try again',
    signInTitle: 'Sign in to choose a center',
    signInText: 'Centers, their prices and their care teams appear once you sign in.',
    signIn: 'Sign in'
  },
  scope: { showing: 'Showing' }
} as const
