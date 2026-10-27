export const serviceDetailVi = {
  documentTitle: '{{name}} | CareConnect',
  fallbackTitle: 'Chi tiết dịch vụ | CareConnect',
  back: 'Quay lại danh sách dịch vụ',
  loading: 'Đang tải chi tiết dịch vụ...',
  error: 'Không thể tải chi tiết dịch vụ.',
  errorHelp: 'Dịch vụ có thể đã ngừng cung cấp hoặc bạn cần đăng nhập để xem.',
  retry: 'Thử lại',
  about: 'Mô tả dịch vụ',
  centerNote: 'Ghi chú của trung tâm',
  aboutEmpty: 'Trung tâm chưa cập nhật mô tả cho dịch vụ này.',
  plans: {
    title: 'Bảng giá',
    hint: 'Giá cơ bản của từng gói. Giá cuối cùng được xác nhận khi bạn đặt lịch.',
    loading: 'Đang tải bảng giá...',
    error: 'Không thể tải bảng giá.',
    empty: 'Trung tâm chưa công bố gói giá cho dịch vụ này.',
    duration: '{{minutes, number}} phút'
  },
  pricingUnits: { HOUR: 'Theo giờ', DAY: 'Theo ngày', SHIFT: 'Theo ca' },
  caregivers: {
    title: 'Người chăm sóc thực hiện dịch vụ',
    count: '{{count, number}} người chăm sóc của trung tâm làm được dịch vụ này',
    loading: 'Đang tải người chăm sóc...',
    error: 'Không thể tải người chăm sóc.',
    empty: 'Chưa có người chăm sóc nào đăng ký dịch vụ này. Trung tâm sẽ phân công khi nhận lịch.',
    experience: '{{years, number}} năm kinh nghiệm',
    certificates: '{{count, number}} chứng chỉ',
    viewProfile: 'Xem hồ sơ',
    avatar: 'Ảnh đại diện của {{name}}',
    viewAll: 'Xem toàn bộ đội ngũ'
  },
  center: {
    title: 'Trung tâm cung cấp',
    address: 'Địa chỉ',
    phone: 'Điện thoại',
    hours: 'Giờ hoạt động',
    loading: 'Đang tải thông tin trung tâm...'
  },
  booking: {
    from: 'Giá từ',
    contactPrice: 'Liên hệ để nhận báo giá',
    book: 'Đặt lịch dịch vụ này',
    hint: 'Bạn có thể chọn người chăm sóc hoặc để trung tâm phân công.'
  }
} as const

export const serviceDetailEn = {
  documentTitle: '{{name}} | CareConnect',
  fallbackTitle: 'Service details | CareConnect',
  back: 'Back to services',
  loading: 'Loading service details...',
  error: 'Service details could not be loaded.',
  errorHelp: 'The service may no longer be offered, or you may need to sign in to view it.',
  retry: 'Try again',
  about: 'About this service',
  centerNote: 'Note from the center',
  aboutEmpty: 'The center has not described this service yet.',
  plans: {
    title: 'Price plans',
    hint: 'Base price of each plan. The final price is confirmed when you book.',
    loading: 'Loading price plans...',
    error: 'Price plans could not be loaded.',
    empty: 'The center has not published price plans for this service yet.',
    duration: '{{minutes, number}} min'
  },
  pricingUnits: { HOUR: 'Hourly', DAY: 'Daily', SHIFT: 'Per shift' },
  caregivers: {
    title: 'Caregivers for this service',
    count: '{{count, number}} caregivers at this center provide this service',
    loading: 'Loading caregivers...',
    error: 'Caregivers could not be loaded.',
    empty: 'No caregiver has registered for this service yet. The center assigns one when it accepts the booking.',
    experience: '{{years, number}} years of experience',
    certificates: '{{count, number}} certificates',
    viewProfile: 'View profile',
    avatar: 'Profile photo of {{name}}',
    viewAll: 'See the whole care team'
  },
  center: {
    title: 'Provided by',
    address: 'Address',
    phone: 'Phone',
    hours: 'Opening hours',
    loading: 'Loading center details...'
  },
  booking: {
    from: 'From',
    contactPrice: 'Contact us for a quote',
    book: 'Book this service',
    hint: 'You can choose a caregiver or let the center assign one.'
  }
} as const
