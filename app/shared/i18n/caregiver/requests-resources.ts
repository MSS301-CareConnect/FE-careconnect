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
  declineConfirm: 'Decline booking',
  viewDetail: 'View details',
  customer: 'Booked by',
  dateRange: '{{from}} – {{to}}',
  totalTime: '{{time}} in total',
  moreVisits_one: '+{{count}} more visit',
  moreVisits_other: '+{{count}} more visits',
  allServices: 'All booked services',
  allergyAlert: 'Allergy: {{value}}',
  shift: 'Work shift',
  shiftValue: '{{type}} · {{time}}',
  shiftLoading: 'Finding your shift…',
  timeLeft: '{{time}} left to answer',
  timeUp: 'Answer time is over',
  detail: {
    documentTitle: 'Booking request {{code}} | CareConnect',
    back: 'Needs your answer',
    title: 'Care for {{name}}',
    titleFallback: 'Booking request',
    loading: 'Loading the request…',
    error: 'Could not load this request.',
    goneTitle: 'This request no longer waits for you',
    gone: 'You have answered it, the customer cancelled, or the answer time is over.',
    goneAction: 'Back to your requests',
    schedule: {
      title: 'Schedule',
      type: 'Booking type',
      period: 'Dates',
      shift: 'Work shift',
      repeat: 'Repeats',
      repeatValue: '{{days}} · {{time}}',
      visits: 'Visits',
      hours: 'Total time',
      sent: 'Sent'
    },
    visits: {
      title: 'Visits ({{count}})',
      visitNo: 'Visit {{no}}',
      date: 'Date',
      time: 'Time',
      service: 'Service',
      price: 'Price'
    },
    recipient: {
      title: 'Person cared for',
      medications_one: 'Takes {{count}} medicine regularly',
      medications_other: 'Takes {{count}} medicines regularly',
      noMedication: 'No regular medicine',
      noNotes: 'The customer has not described any health condition.',
      locked: 'House number, phone numbers, emergency contact and medicine names open once the customer pays.'
    },
    customer: {
      title: 'Customer',
      name: 'Booked by',
      nameUnknown: 'Name not available',
      area: 'Care area',
      contactLocked: 'Phone number and full address open once the customer pays.'
    },
    pricing: {
      title: 'Services & price',
      plan: 'Plan {{name}}',
      line: '{{price}} × {{quantity}}',
      total: 'Booking value'
    },
    answer: {
      title: 'Your answer',
      deadline: 'Answer by {{time}}',
      acceptHint: 'Accept: the visits are held for you and the customer pays to confirm.',
      declineCenter: 'Decline: your center assigns another caregiver.',
      declineShift: 'Decline: this shift booking is closed.'
    }
  }
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
  declineConfirm: 'Từ chối lịch',
  viewDetail: 'Xem chi tiết',
  customer: 'Khách đặt',
  dateRange: '{{from}} – {{to}}',
  totalTime: 'Tổng {{time}}',
  moreVisits_one: '+{{count}} buổi nữa',
  moreVisits_other: '+{{count}} buổi nữa',
  allServices: 'Tất cả dịch vụ đã đặt',
  allergyAlert: 'Dị ứng: {{value}}',
  shift: 'Ca làm việc',
  shiftValue: '{{type}} · {{time}}',
  shiftLoading: 'Đang tìm ca của bạn…',
  timeLeft: 'Còn {{time}} để trả lời',
  timeUp: 'Đã hết hạn trả lời',
  detail: {
    documentTitle: 'Yêu cầu đặt lịch {{code}} | CareConnect',
    back: 'Cần phản hồi',
    title: 'Chăm sóc {{name}}',
    titleFallback: 'Yêu cầu đặt lịch',
    loading: 'Đang tải yêu cầu…',
    error: 'Không tải được yêu cầu này.',
    goneTitle: 'Yêu cầu này không còn chờ bạn',
    gone: 'Bạn đã trả lời, khách đã hủy hoặc đã quá hạn trả lời.',
    goneAction: 'Về danh sách cần phản hồi',
    schedule: {
      title: 'Lịch làm việc',
      type: 'Hình thức',
      period: 'Thời gian',
      shift: 'Ca làm việc',
      repeat: 'Lặp lại',
      repeatValue: '{{days}} · {{time}}',
      visits: 'Số buổi',
      hours: 'Tổng thời gian',
      sent: 'Gửi lúc'
    },
    visits: {
      title: 'Các buổi ({{count}})',
      visitNo: 'Buổi {{no}}',
      date: 'Ngày',
      time: 'Giờ',
      service: 'Dịch vụ',
      price: 'Giá'
    },
    recipient: {
      title: 'Người được chăm sóc',
      medications_one: 'Đang dùng {{count}} loại thuốc thường xuyên',
      medications_other: 'Đang dùng {{count}} loại thuốc thường xuyên',
      noMedication: 'Không dùng thuốc thường xuyên',
      noNotes: 'Khách chưa ghi tình trạng sức khỏe.',
      locked: 'Số nhà, số điện thoại, liên hệ khẩn cấp và tên thuốc sẽ hiện khi khách thanh toán.'
    },
    customer: {
      title: 'Khách hàng',
      name: 'Người đặt',
      nameUnknown: 'Chưa có tên',
      area: 'Khu vực chăm sóc',
      contactLocked: 'Số điện thoại và địa chỉ đầy đủ hiện sau khi khách thanh toán.'
    },
    pricing: {
      title: 'Dịch vụ & chi phí',
      plan: 'Gói {{name}}',
      line: '{{price}} × {{quantity}}',
      total: 'Giá trị lịch'
    },
    answer: {
      title: 'Trả lời yêu cầu',
      deadline: 'Hạn trả lời {{time}}',
      acceptHint: 'Nhận lịch: các buổi được giữ cho bạn, khách thanh toán để xác nhận.',
      declineCenter: 'Từ chối: trung tâm sẽ phân người chăm sóc khác.',
      declineShift: 'Từ chối: lịch theo ca này sẽ đóng.'
    }
  }
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
