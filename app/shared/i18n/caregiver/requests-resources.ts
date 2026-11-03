export const caregiverRequestsEn = {
  documentTitle: 'Booking requests | CareConnect',
  title: 'Booking requests',
  subtitle:
    'Customers who chose you send their booking here. Accept to hold the visits, or decline so the center can help.',
  loading: 'Loading requests…',
  error: 'Could not load your booking requests.',
  retry: 'Try again',
  emptyTitle: 'No request waiting',
  empty: 'When a customer books you directly, the request shows up here.',
  answerBy: 'Answer by {{time}}',
  visits_one: '{{count}} visit',
  visits_other: '{{count}} visits',
  firstVisit: 'First visit {{date}}',
  area: 'Area',
  recipient: 'Person cared for',
  recipientValue: '{{age}} years old · {{gender}}',
  recipientAge: '{{age}} years old',
  services: 'Services',
  note: 'Customer note',
  schedule: 'Visits',
  showVisits: 'Show the visits',
  hideVisits: 'Hide the visits',
  total: 'Booking value',
  privacy: 'The full care profile opens once the customer has paid.',
  accept: 'Accept',
  decline: 'Decline',
  accepted: 'Accepted. The customer now pays to confirm.',
  declinedToCenter: 'Declined. The center will assign another caregiver.',
  declined: 'Declined. The customer is told.',
  declineTitle: 'Decline this booking?',
  declineDescription:
    'A recurring or custom booking goes to your center, which assigns someone else. A shift booking is closed because it is your own shift.',
  declineReason: 'Reason for the customer and the center',
  declineConfirm: 'Decline booking'
} as const

export const caregiverRequestsVi = {
  documentTitle: 'Yêu cầu đặt lịch | CareConnect',
  title: 'Yêu cầu đặt lịch',
  subtitle: 'Khách chọn bạn sẽ gửi yêu cầu tới đây. Nhận để giữ lịch, hoặc từ chối để trung tâm hỗ trợ.',
  loading: 'Đang tải yêu cầu…',
  error: 'Không tải được yêu cầu đặt lịch.',
  retry: 'Thử lại',
  emptyTitle: 'Chưa có yêu cầu nào',
  empty: 'Khi khách đặt lịch trực tiếp với bạn, yêu cầu sẽ hiện ở đây.',
  answerBy: 'Trả lời trước {{time}}',
  visits_one: '{{count}} buổi',
  visits_other: '{{count}} buổi',
  firstVisit: 'Buổi đầu {{date}}',
  area: 'Khu vực',
  recipient: 'Người được chăm sóc',
  recipientValue: '{{age}} tuổi · {{gender}}',
  recipientAge: '{{age}} tuổi',
  services: 'Dịch vụ',
  note: 'Ghi chú của khách',
  schedule: 'Các buổi',
  showVisits: 'Xem các buổi',
  hideVisits: 'Thu gọn',
  total: 'Giá trị lịch',
  privacy: 'Hồ sơ chăm sóc đầy đủ sẽ mở khi khách đã thanh toán.',
  accept: 'Nhận lịch',
  decline: 'Từ chối',
  accepted: 'Đã nhận lịch. Khách sẽ thanh toán để xác nhận.',
  declinedToCenter: 'Đã từ chối. Trung tâm sẽ phân người khác.',
  declined: 'Đã từ chối. Khách sẽ được thông báo.',
  declineTitle: 'Từ chối lịch này?',
  declineDescription:
    'Lịch định kỳ hoặc tự chọn sẽ chuyển về trung tâm để phân người khác. Lịch theo ca sẽ đóng vì đó là ca của chính bạn.',
  declineReason: 'Lý do gửi khách và trung tâm',
  declineConfirm: 'Từ chối lịch'
} as const

export const caregiverEarningsEn = {
  documentTitle: 'Kept deposits | CareConnect',
  title: 'Kept deposits',
  subtitle:
    'When a customer cancels a visit of yours late, or misses the remaining payment, the deposit kept by the policy is yours.',
  periodLabel: 'Period',
  periods: { month: 'This month', last30: 'Last 30 days', year: 'This year' },
  total: 'Your share',
  count_one: '{{count}} visit',
  count_other: '{{count}} visits',
  loading: 'Loading…',
  error: 'Could not load your kept deposits.',
  retry: 'Try again',
  emptyTitle: 'Nothing in this period',
  empty: 'Kept deposits appear here after a late cancellation of one of your visits.',
  visit: 'Visit {{date}}',
  reasons: {
    CUSTOMER_CANCEL: 'Customer cancelled late',
    PAYMENT_OVERDUE: 'Remaining balance not paid',
    other: 'Kept by the policy'
  },
  recordedAt: 'Recorded {{date}}',
  more: 'Load more'
} as const

export const caregiverEarningsVi = {
  documentTitle: 'Tiền cọc được hưởng | CareConnect',
  title: 'Tiền cọc được hưởng',
  subtitle:
    'Khi khách hủy sát giờ buổi của bạn hoặc không trả phần còn lại, phần cọc bị giữ theo chính sách thuộc về bạn.',
  periodLabel: 'Khoảng thời gian',
  periods: { month: 'Tháng này', last30: '30 ngày qua', year: 'Năm nay' },
  total: 'Bạn được hưởng',
  count_one: '{{count}} buổi',
  count_other: '{{count}} buổi',
  loading: 'Đang tải…',
  error: 'Không tải được tiền cọc được hưởng.',
  retry: 'Thử lại',
  emptyTitle: 'Chưa có khoản nào trong kỳ',
  empty: 'Khoản cọc bị giữ sẽ hiện ở đây khi khách hủy sát giờ một buổi của bạn.',
  visit: 'Buổi {{date}}',
  reasons: {
    CUSTOMER_CANCEL: 'Khách hủy sát giờ',
    PAYMENT_OVERDUE: 'Khách không trả phần còn lại',
    other: 'Giữ theo chính sách'
  },
  recordedAt: 'Ghi nhận {{date}}',
  more: 'Tải thêm'
} as const
