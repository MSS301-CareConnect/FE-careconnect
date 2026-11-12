export const customerCentersVi = {
  documentTitle: 'Trung tâm chăm sóc | CareConnect',
  title: 'Trung tâm chăm sóc',
  subtitle: 'So sánh các trung tâm đang nhận đặt lịch rồi chọn nơi phù hợp với gia đình.',
  breadcrumb: { label: 'Đường dẫn', home: 'Trang chủ', current: 'Trung tâm' },
  search: 'Tìm theo tên hoặc địa chỉ',
  count: '{{count, number}} trung tâm',
  view: 'Xem trung tâm',
  viewNamed: 'Xem trung tâm {{name}}',
  choose: 'Chọn trung tâm này',
  chooseNamed: 'Chọn trung tâm {{name}}',
  selected: 'Đang chọn',
  book: 'Đặt lịch',
  photoAlt: 'Ảnh trung tâm {{name}}',
  facts: {
    hours: 'Giờ hoạt động',
    phone: 'Điện thoại',
    fromPrice: 'Giá từ {{price}}',
    services: '{{count, number}} dịch vụ'
  },
  states: {
    loading: 'Đang tải danh sách trung tâm…',
    error: 'Chưa tải được danh sách trung tâm.',
    empty: 'Chưa có trung tâm nào đang nhận đặt lịch.',
    noMatch: 'Không có trung tâm khớp với từ khóa này.',
    clearSearch: 'Xóa tìm kiếm'
  },
  detail: {
    documentTitle: '{{name}} | CareConnect',
    loading: 'Đang tải thông tin trung tâm…',
    error: 'Chưa tải được thông tin trung tâm.',
    notFoundTitle: 'Không tìm thấy trung tâm',
    notFoundText: 'Trung tâm này không còn nhận đặt lịch hoặc đường dẫn không đúng.',
    back: 'Về danh sách trung tâm',
    services: {
      title: 'Dịch vụ & bảng giá',
      empty: 'Trung tâm chưa công bố dịch vụ nào.',
      error: 'Chưa tải được dịch vụ của trung tâm.',
      signIn: 'Đăng nhập để xem dịch vụ và bảng giá của trung tâm.'
    },
    caregivers: {
      title: 'Người chăm sóc',
      empty: 'Trung tâm chưa có người chăm sóc đang nhận lịch.',
      error: 'Chưa tải được người chăm sóc của trung tâm.',
      signIn: 'Đăng nhập để xem đội ngũ chăm sóc của trung tâm.',
      shown: 'Đang hiển thị {{shown, number}}/{{total, number}} người chăm sóc',
      all: 'Xem tất cả người chăm sóc'
    },
    policy: {
      title: 'Đặt cọc & hoàn tiền',
      deposit:
        'Mọi lịch đặt (theo ca, định kỳ, tùy chọn) đặt cọc {{percent}}, phần còn lại trả trước buổi đầu {{hours}} giờ; buổi đầu sát hơn mốc này thì trả đủ một lần.',
      before: 'Hủy trước {{hours}} giờ so với buổi chăm sóc: hoàn {{percent}}.',
      after: 'Hủy trong vòng {{hours}} giờ: hoàn {{percent}}.',
      late: 'Hủy khi còn dưới {{hours}} giờ: không hoàn tiền.',
      centerCancel: 'Trung tâm hủy lịch: hoàn toàn bộ số đã thanh toán.',
      error: 'Chưa tải được quy định đặt cọc và hoàn tiền.',
      signIn: 'Đăng nhập để xem quy định đặt cọc và hoàn tiền của trung tâm.'
    }
  }
} as const

export const customerCentersEn = {
  documentTitle: 'Care centers | CareConnect',
  title: 'Care centers',
  subtitle: 'Compare the centers taking bookings, then choose the one that suits your family.',
  breadcrumb: { label: 'Breadcrumb', home: 'Home', current: 'Centers' },
  search: 'Search by name or address',
  count: '{{count, number}} centers',
  view: 'View center',
  viewNamed: 'View {{name}}',
  choose: 'Choose this center',
  chooseNamed: 'Choose {{name}}',
  selected: 'Selected',
  book: 'Book care',
  photoAlt: 'Photo of {{name}}',
  facts: {
    hours: 'Opening hours',
    phone: 'Phone',
    fromPrice: 'From {{price}}',
    services: '{{count, number}} services'
  },
  states: {
    loading: 'Loading care centers…',
    error: 'The center list could not be loaded.',
    empty: 'No center is taking bookings yet.',
    noMatch: 'No center matches that search.',
    clearSearch: 'Clear search'
  },
  detail: {
    documentTitle: '{{name}} | CareConnect',
    loading: 'Loading the center…',
    error: 'The center could not be loaded.',
    notFoundTitle: 'Center not found',
    notFoundText: 'This center no longer takes bookings, or the link is wrong.',
    back: 'Back to all centers',
    services: {
      title: 'Services & prices',
      empty: 'This center has not published any service yet.',
      error: 'The center’s services could not be loaded.',
      signIn: 'Sign in to see this center’s services and prices.'
    },
    caregivers: {
      title: 'Caregivers',
      empty: 'This center has no caregiver taking bookings yet.',
      error: 'The center’s caregivers could not be loaded.',
      signIn: 'Sign in to see this center’s care team.',
      shown: 'Showing {{shown, number}} of {{total, number}} caregivers',
      all: 'See all caregivers'
    },
    policy: {
      title: 'Deposit & refunds',
      deposit:
        'Every booking (shift, recurring or custom) takes a {{percent}} deposit and the rest {{hours}} hours before the first visit; a first visit closer than that is paid in full at once.',
      before: 'Cancel {{hours}} hours or more before a visit: {{percent}} refunded.',
      after: 'Cancel within {{hours}} hours: {{percent}} refunded.',
      late: 'Cancel less than {{hours}} hours before: no refund.',
      centerCancel: 'If the center cancels, everything you paid is refunded.',
      error: 'The deposit and refund rules could not be loaded.',
      signIn: 'Sign in to see this center’s deposit and refund rules.'
    }
  }
} as const
