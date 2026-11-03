export const bookingsEn = {
  documentTitle: 'My bookings | CareConnect',
  title: 'My bookings',
  subtitle: 'Follow every care request, from center confirmation to the last visit.',
  book: 'Book care',
  count_one: '{{count}} booking',
  count_other: '{{count}} bookings',
  truncated: 'Showing your {{count}} most recent bookings.',
  tabs: {
    all: 'All',
    action: 'Needs action',
    upcoming: 'Upcoming',
    ongoing: 'In care',
    done: 'Completed',
    closed: 'Cancelled'
  },
  filters: {
    status: 'Booking status',
    search: 'Search by booking code or name',
    searchPlaceholder: 'Booking code or name of your relative',
    sort: 'Sort',
    reset: 'Clear filters',
    filtering: 'Filtering by',
    removeFilter: 'Remove filter {{label}}'
  },
  sorts: {
    newest: 'Newest request',
    startSoonest: 'Starting soonest',
    startLatest: 'Starting latest'
  },
  card: {
    patientFallback: 'Your relative',
    total: 'Total',
    dateRange: '{{from}} – {{to}}',
    next: 'Next visit',
    noNext: 'No upcoming visit',
    progress: 'Visits done',
    progressValue: '{{done}} / {{total}}',
    view: 'View details',
    payDeposit: 'Pay deposit',
    payRemaining: 'Pay the rest',
    hint: {
      payDeposit: 'The center has confirmed. Pay the deposit to keep your booking.',
      payRemaining: 'Pay the remaining balance before the first visit.',
      PENDING_CENTER_CONFIRMATION: 'The center is reviewing your request.',
      PENDING_CAREGIVER_CONFIRMATION: 'The caregiver you chose is answering your request.',
      PENDING_CAREGIVER_ASSIGNMENT: 'The center is choosing a caregiver for you.',
      AWAITING_INITIAL_PAYMENT: 'Waiting for your deposit.',
      CONFIRMED: 'All set. The caregiver will come as scheduled.',
      IN_PROGRESS: 'Care is under way.',
      COMPLETED: 'All visits are done. You can rate the caregiver.',
      REJECTED: 'The center could not take this request.',
      CANCELLED: 'This booking was cancelled.',
      EXPIRED: 'This booking expired before it was confirmed or paid.'
    }
  },
  states: {
    loading: 'Loading your bookings…'
  },
  empty: {
    title: 'No bookings yet',
    description: 'Book a caregiver for your relative; every request appears here so you can follow it.',
    filteredTitle: 'No booking matches',
    filteredDescription: 'Try another booking code or name.',
    tabTitle: 'Nothing here',
    tab: {
      all: 'You have no bookings yet.',
      action: 'Nothing needs your action right now.',
      upcoming: 'You have no upcoming bookings.',
      ongoing: 'No booking is in care right now.',
      done: 'No booking has been completed yet.',
      closed: 'No cancelled, rejected or expired booking.'
    }
  },
  pagination: {
    label: 'Booking pages'
  }
}

export const bookingsVi = {
  documentTitle: 'Lịch đặt của tôi | CareConnect',
  title: 'Lịch đặt của tôi',
  subtitle: 'Theo dõi từng yêu cầu chăm sóc, từ lúc trung tâm xác nhận tới buổi cuối cùng.',
  book: 'Đặt lịch',
  count_one: '{{count}} lịch đặt',
  count_other: '{{count}} lịch đặt',
  truncated: 'Đang hiện {{count}} lịch đặt gần nhất của bạn.',
  tabs: {
    all: 'Tất cả',
    action: 'Cần xử lý',
    upcoming: 'Sắp tới',
    ongoing: 'Đang diễn ra',
    done: 'Đã xong',
    closed: 'Đã hủy'
  },
  filters: {
    status: 'Trạng thái lịch đặt',
    search: 'Tìm theo mã lịch đặt hoặc tên',
    searchPlaceholder: 'Mã lịch đặt hoặc tên người thân',
    sort: 'Sắp xếp',
    reset: 'Xóa bộ lọc',
    filtering: 'Đang lọc',
    removeFilter: 'Bỏ lọc {{label}}'
  },
  sorts: {
    newest: 'Yêu cầu mới nhất',
    startSoonest: 'Bắt đầu sớm nhất',
    startLatest: 'Bắt đầu muộn nhất'
  },
  card: {
    patientFallback: 'Người thân',
    total: 'Tổng tiền',
    dateRange: '{{from}} – {{to}}',
    next: 'Buổi kế tiếp',
    noNext: 'Không còn buổi sắp tới',
    progress: 'Buổi đã xong',
    progressValue: '{{done}} / {{total}}',
    view: 'Xem chi tiết',
    payDeposit: 'Thanh toán cọc',
    payRemaining: 'Thanh toán phần còn lại',
    hint: {
      payDeposit: 'Trung tâm đã xác nhận. Thanh toán cọc để giữ lịch.',
      payRemaining: 'Thanh toán phần còn lại trước buổi đầu tiên.',
      PENDING_CENTER_CONFIRMATION: 'Trung tâm đang xem yêu cầu của bạn.',
      PENDING_CAREGIVER_CONFIRMATION: 'Người chăm sóc bạn chọn đang xem yêu cầu.',
      PENDING_CAREGIVER_ASSIGNMENT: 'Trung tâm đang chọn người chăm sóc cho bạn.',
      AWAITING_INITIAL_PAYMENT: 'Đang chờ bạn thanh toán cọc.',
      CONFIRMED: 'Đã sẵn sàng. Người chăm sóc sẽ đến đúng lịch.',
      IN_PROGRESS: 'Đang trong thời gian chăm sóc.',
      COMPLETED: 'Đã xong mọi buổi. Bạn có thể đánh giá người chăm sóc.',
      REJECTED: 'Trung tâm không nhận được yêu cầu này.',
      CANCELLED: 'Lịch đặt này đã bị hủy.',
      EXPIRED: 'Lịch đặt đã hết hạn trước khi được xác nhận hoặc thanh toán.'
    }
  },
  states: {
    loading: 'Đang tải lịch đặt…'
  },
  empty: {
    title: 'Chưa có lịch đặt nào',
    description: 'Đặt người chăm sóc cho người thân; mỗi yêu cầu sẽ hiện ở đây để bạn theo dõi.',
    filteredTitle: 'Không có lịch đặt phù hợp',
    filteredDescription: 'Thử mã lịch đặt hoặc tên khác.',
    tabTitle: 'Chưa có gì ở đây',
    tab: {
      all: 'Bạn chưa có lịch đặt nào.',
      action: 'Hiện không có việc gì cần bạn xử lý.',
      upcoming: 'Bạn chưa có lịch đặt sắp tới.',
      ongoing: 'Hiện không có lịch đặt nào đang diễn ra.',
      done: 'Chưa có lịch đặt nào hoàn tất.',
      closed: 'Không có lịch đặt nào bị hủy, từ chối hay hết hạn.'
    }
  },
  pagination: {
    label: 'Trang lịch đặt'
  }
}
