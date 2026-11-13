export const statisticsVi = {
  title: 'Thống kê vận hành',
  period: 'Từ đầu tháng đến hôm nay',
  loading: 'Đang tải thống kê...',
  error: 'Không thể tải thống kê. Vui lòng thử lại.',
  retry: 'Thử lại',
  noData: 'Chưa có hoạt động trong kỳ này.',
  bookings: 'Tổng lịch đặt',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  missed: 'Bỏ lỡ',
  noShow: 'Khách không đến',
  completionRate: 'Tỷ lệ hoàn thành',
  occurrences: 'Kết quả các buổi chăm sóc',
  rating: 'Đánh giá trung bình',
  complaints: 'Khiếu nại đang mở',
  responsiveness: {
    title: 'Phản hồi lịch đặt',
    hint: 'Booking tạo trong kỳ: trung tâm xác nhận / từ chối nhanh đến đâu và bao nhiêu lịch hết hạn vì chưa xử lý kịp.',
    answered: 'Đã trả lời',
    average: 'Thời gian trả lời trung bình',
    expired: 'Hết hạn do trung tâm',
    minutes: '{{count}} phút',
    hours: '{{hours}} giờ {{minutes}} phút',
    none: 'Chưa có'
  },
  providerTitle: 'Trung tâm và người chăm sóc',
  centers: 'Trung tâm',
  caregivers: 'Người chăm sóc',
  verification: 'Thẩm định hồ sơ',
  statuses: {
    PENDING: 'Chờ duyệt',
    ACTIVE: 'Đang hoạt động',
    INACTIVE: 'Ngừng hoạt động',
    SUSPENDED: 'Tạm khóa',
    REJECTED: 'Từ chối',
    ARCHIVED: 'Đã lưu trữ',
    VERIFIED: 'Đã xác minh'
  },
  caregiverWork: {
    title: 'Thành tích làm việc',
    hint: 'Tính từ trước tới nay, các buổi được giao tại trung tâm.',
    loading: 'Đang tải thành tích…',
    error: 'Không tải được thành tích làm việc.',
    completed: 'Buổi đã hoàn thành',
    hours: 'Giờ đã làm',
    hoursValue: '{{value}} giờ',
    upcoming: 'Buổi sắp tới',
    missed: 'Vắng mặt',
    cancelled: 'Đã hủy',
    noShow: 'Khách không có mặt',
    rating: 'Đánh giá',
    ratingValue: '{{score}} ★ · {{count, number}} đánh giá',
    noRating: 'Chưa có đánh giá',
    lastCompleted: 'Buổi hoàn thành gần nhất: {{date}}',
    services: 'Theo dịch vụ (buổi đã hoàn thành)',
    servicesEmpty: 'Chưa hoàn thành buổi nào.',
    unknownService: 'Dịch vụ không rõ tên',
    serviceVisits: '{{count, number}} buổi'
  },
  insights: {
    periodLegend: 'Kỳ thống kê',
    periods: { month: 'Tháng này', last30: '30 ngày qua', year: 'Năm nay', custom: 'Tùy chỉnh' },
    customRange: 'Khoảng thời gian tùy chỉnh',
    customFrom: 'Từ ngày',
    customTo: 'Đến ngày',
    customInvalid: 'Ngày kết thúc phải từ ngày bắt đầu trở đi. Số liệu đang hiển thị theo tháng này.',
    periodHints: {
      custom: '{{from}} – {{to}}',
      month: 'Từ đầu tháng đến hôm nay',
      last30: '30 ngày gần nhất',
      year: 'Từ đầu năm đến hôm nay (theo tháng)'
    },
    kpis: {
      bookings: 'Lịch đặt mới',
      bookingsHint: '{{count}} lịch đang chờ xử lý',
      completedVisits: 'Buổi đã hoàn thành',
      completedVisitsHint: 'Trên {{count}} buổi đã kết thúc',
      completionRate: 'Tỷ lệ hoàn thành',
      completionRateHint: 'Hoàn thành / buổi đã kết thúc',
      rating: 'Đánh giá trung bình',
      ratingHint: '{{count}} đánh giá hiển thị',
      complaints: 'Khiếu nại đang mở',
      complaintsHint: '{{count}} đã chuyển admin',
      responseTime: 'Thời gian trả lời lịch',
      responseTimeHint: '{{count}} lịch hết hạn do chưa xử lý'
    },
    trend: {
      title: 'Xu hướng lịch đặt & buổi chăm sóc',
      hint: 'Lịch đặt theo ngày tạo; buổi chăm sóc theo giờ bắt đầu.',
      bookings: 'Lịch đặt mới',
      completed: 'Buổi hoàn thành',
      cancelled: 'Buổi hủy / vắng',
      view: 'Dạng biểu đồ',
      views: { column: 'Cột', line: 'Đường' }
    },
    outcomes: {
      title: 'Kết quả buổi chăm sóc',
      hint: 'Các buổi đã kết thúc trong kỳ.',
      center: 'buổi đã kết thúc'
    },
    pipeline: {
      title: 'Trạng thái lịch đặt',
      hint: 'Lịch tạo trong kỳ, theo trạng thái hiện tại.'
    },
    types: {
      title: 'Loại lịch đặt',
      hint: 'Khách chọn đặt theo ca, định kỳ hay tự chọn buổi.',
      center: 'lịch đặt'
    },
    ratings: {
      title: 'Phân bố đánh giá',
      hint: 'Đánh giá hiển thị trong kỳ.',
      star: '{{count}} sao',
      average: 'Trung bình {{value}} / 5'
    },
    topCaregivers: {
      title: 'Người chăm sóc nổi bật',
      hint: 'Nhiều buổi hoàn thành nhất trong kỳ.',
      sessions: '{{count}} buổi',
      rating: 'Đánh giá {{value}}',
      noRating: 'Chưa có đánh giá'
    },
    complaintsCard: {
      title: 'Khiếu nại',
      hint: 'Khiếu nại tạo trong kỳ theo trạng thái.',
      open: 'Đang mở',
      inProgress: 'Đang xử lý',
      escalated: 'Đã chuyển admin',
      resolved: 'Đã giải quyết'
    },
    topCenters: {
      title: 'Trung tâm hoạt động nhiều nhất',
      hint: 'Theo số lịch đặt tạo trong kỳ.',
      bookings: '{{count}} lịch',
      completion: 'Hoàn thành {{rate}}'
    },
    count: '{{count}}'
  }
} as const

export const statisticsEn = {
  title: 'Operational statistics',
  period: 'Month to date',
  loading: 'Loading statistics...',
  error: 'Could not load statistics. Please try again.',
  retry: 'Try again',
  noData: 'No activity in this period yet.',
  bookings: 'Total bookings',
  completed: 'Completed',
  cancelled: 'Cancelled',
  missed: 'Missed',
  noShow: 'Customer no-show',
  completionRate: 'Completion rate',
  occurrences: 'Care session outcomes',
  rating: 'Average rating',
  complaints: 'Open complaints',
  responsiveness: {
    title: 'Booking responsiveness',
    hint: 'Bookings created in this period: how fast the center confirms or rejects and how many expired before it acted.',
    answered: 'Answered',
    average: 'Average response time',
    expired: 'Expired by the center',
    minutes: '{{count}} min',
    hours: '{{hours}} h {{minutes}} min',
    none: 'None yet'
  },
  providerTitle: 'Centers and caregivers',
  centers: 'Centers',
  caregivers: 'Caregivers',
  verification: 'Profile verification',
  statuses: {
    PENDING: 'Pending',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
    REJECTED: 'Rejected',
    ARCHIVED: 'Archived',
    VERIFIED: 'Verified'
  },
  caregiverWork: {
    title: 'Track record',
    hint: 'All time, visits assigned at the center.',
    loading: 'Loading track record…',
    error: 'Could not load the track record.',
    completed: 'Visits completed',
    hours: 'Hours worked',
    hoursValue: '{{value}} h',
    upcoming: 'Upcoming visits',
    missed: 'Missed',
    cancelled: 'Cancelled',
    noShow: 'Customer absent',
    rating: 'Rating',
    ratingValue: '{{score}} ★ · {{count, number}} reviews',
    noRating: 'No reviews yet',
    lastCompleted: 'Latest completed visit: {{date}}',
    services: 'By service (completed visits)',
    servicesEmpty: 'No completed visits yet.',
    unknownService: 'Unnamed service',
    serviceVisits: '{{count, number}} visits'
  },
  insights: {
    periodLegend: 'Period',
    periods: { month: 'This month', last30: 'Last 30 days', year: 'This year', custom: 'Custom' },
    customRange: 'Custom date range',
    customFrom: 'From',
    customTo: 'To',
    customInvalid: 'The end date must be on or after the start date. The numbers shown are for this month.',
    periodHints: {
      custom: '{{from}} – {{to}}',
      month: 'Month to date',
      last30: 'The last 30 days',
      year: 'Year to date (by month)'
    },
    kpis: {
      bookings: 'New bookings',
      bookingsHint: '{{count}} bookings waiting for action',
      completedVisits: 'Completed visits',
      completedVisitsHint: 'Out of {{count}} visits that ended',
      completionRate: 'Completion rate',
      completionRateHint: 'Completed / visits that ended',
      rating: 'Average rating',
      ratingHint: '{{count}} visible reviews',
      complaints: 'Open complaints',
      complaintsHint: '{{count}} escalated to admin',
      responseTime: 'Booking response time',
      responseTimeHint: '{{count}} bookings expired before an answer'
    },
    trend: {
      title: 'Bookings & care visits over time',
      hint: 'Bookings by creation day; visits by start time.',
      bookings: 'New bookings',
      completed: 'Completed visits',
      cancelled: 'Cancelled / missed visits',
      view: 'Chart type',
      views: { column: 'Columns', line: 'Line' }
    },
    outcomes: {
      title: 'Care visit outcomes',
      hint: 'Visits that ended in this period.',
      center: 'visits ended'
    },
    pipeline: {
      title: 'Booking status',
      hint: 'Bookings created in this period, by current status.'
    },
    types: {
      title: 'Booking types',
      hint: 'Whether customers book a shift, a recurring schedule or picked visits.',
      center: 'bookings'
    },
    ratings: {
      title: 'Rating distribution',
      hint: 'Visible reviews in this period.',
      star: '{{count}} stars',
      average: 'Average {{value}} / 5'
    },
    topCaregivers: {
      title: 'Top caregivers',
      hint: 'Most completed visits in this period.',
      sessions: '{{count}} visits',
      rating: 'Rated {{value}}',
      noRating: 'No ratings yet'
    },
    complaintsCard: {
      title: 'Complaints',
      hint: 'Complaints created in this period by status.',
      open: 'Open',
      inProgress: 'In progress',
      escalated: 'Escalated to admin',
      resolved: 'Resolved'
    },
    topCenters: {
      title: 'Most active centers',
      hint: 'By bookings created in this period.',
      bookings: '{{count}} bookings',
      completion: '{{rate}} completed'
    },
    count: '{{count}}'
  }
} as const
