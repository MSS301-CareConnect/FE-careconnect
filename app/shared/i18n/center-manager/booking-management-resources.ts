export const managerBookingManagementVi = {
  documentTitle: 'Quản lý lịch đặt | CareConnect',
  title: 'Lịch đặt và phân công',
  subtitle: 'Duyệt yêu cầu mới, phân công người chăm sóc và theo dõi từng buổi chăm sóc.',
  pendingSubtitle: '{{count}} việc cần trung tâm xử lý. Xử lý trước hạn để khách kịp thanh toán.',
  updatedAt: 'Cập nhật {{time}} · tự làm mới mỗi 30 giây',
  refresh: 'Làm mới',
  reviewQueue: 'Xem yêu cầu chờ duyệt',
  loading: 'Đang tải lịch đặt…',
  error: 'Không tải được danh sách lịch đặt.',
  empty: 'Không có lịch đặt nào phù hợp.',
  emptyGroup: {
    action: 'Không còn việc nào cần xử lý',
    actionHint: 'Trung tâm đã xử lý hết yêu cầu. Lịch mới sẽ hiện ở đây kèm hạn xử lý.',
    waiting: 'Không có lịch nào đang chờ bên khác',
    active: 'Chưa có lịch nào đang hoạt động',
    closed: 'Chưa có lịch nào đã đóng',
    all: 'Trung tâm chưa có lịch đặt nào'
  },
  noCaregiver: 'Chưa phân công',
  progress: 'Đã xong {{done}} / {{total}} buổi',
  sessions: '{{count}} buổi',
  moreServices: '+{{count}} dịch vụ',
  noDeadline: 'Không có hạn',
  queue: {
    label: 'Hàng đợi xử lý',
    PENDING_CENTER_CONFIRMATION: 'Cần xác nhận',
    PENDING_CAREGIVER_ASSIGNMENT: 'Cần phân công',
    PENDING_CAREGIVER_CONFIRMATION: 'Chờ người chăm sóc nhận',
    AWAITING_INITIAL_PAYMENT: 'Chờ khách thanh toán',
    dueSoon: '{{count}} sắp quá hạn',
    overdue: '{{count}} quá hạn, đang đóng',
    nearest: 'Hạn gần nhất {{time}}',
    none: 'Không có lịch nào',
    noAction: 'Không cần trung tâm thao tác'
  },
  groups: {
    label: 'Nhóm lịch đặt',
    action: 'Cần xử lý',
    waiting: 'Chờ bên khác',
    active: 'Đang hoạt động',
    closed: 'Đã đóng',
    all: 'Tất cả'
  },
  columns: {
    booking: 'Lịch đặt',
    customer: 'Khách hàng',
    schedule: 'Lịch chăm sóc',
    deadline: 'Hạn xử lý',
    next: 'Buổi kế tiếp',
    total: 'Tổng tiền',
    status: 'Trạng thái',
    actions: 'Thao tác'
  },
  actions: {
    accept: 'Xác nhận',
    reject: 'Từ chối',
    assign: 'Phân công',
    open: 'Xem chi tiết',
    more: 'Thao tác khác với {{code}}',
    call: 'Gọi khách hàng',
    closing: 'Đang đóng'
  },
  filters: {
    label: 'Lọc lịch đặt',
    status: 'Trạng thái',
    allInGroup: 'Tất cả trong nhóm',
    all: 'Tất cả',
    search: 'Mã lịch đặt',
    searchPlaceholder: 'Nhập mã hoặc 6 ký tự cuối',
    from: 'Từ ngày',
    to: 'Đến ngày',
    sort: 'Sắp xếp',
    reset: 'Xóa bộ lọc'
  },
  sorts: {
    deadline: 'Hạn xử lý gần nhất',
    newest: 'Yêu cầu mới nhất',
    startSoonest: 'Bắt đầu sớm nhất'
  },
  pagination: {
    label: 'Trang lịch đặt',
    previous: 'Trước',
    next: 'Sau',
    pageOf: 'Trang {{page}} / {{total}}'
  },
  dialogLoading: 'Đang tải lịch đặt…'
}

export const managerBookingManagementEn = {
  documentTitle: 'Booking management | CareConnect',
  title: 'Bookings and assignments',
  subtitle: 'Review new requests, assign caregivers and follow every care visit.',
  pendingSubtitle: '{{count}} items need the center. Handle them before the due time so customers can pay.',
  updatedAt: 'Updated {{time}} · refreshes every 30 seconds',
  refresh: 'Refresh',
  reviewQueue: 'Review pending requests',
  loading: 'Loading bookings…',
  error: 'Bookings could not be loaded.',
  empty: 'No booking matches.',
  emptyGroup: {
    action: 'Nothing left to handle',
    actionHint: 'Every request has been handled. New ones appear here with their deadline.',
    waiting: 'No booking is waiting on someone else',
    active: 'No booking is active yet',
    closed: 'No closed booking yet',
    all: 'The center has no bookings yet'
  },
  noCaregiver: 'Not assigned',
  progress: '{{done}} / {{total}} visits done',
  sessions: '{{count}} visits',
  moreServices: '+{{count}} services',
  noDeadline: 'No deadline',
  queue: {
    label: 'Work queue',
    PENDING_CENTER_CONFIRMATION: 'To confirm',
    PENDING_CAREGIVER_ASSIGNMENT: 'To assign',
    PENDING_CAREGIVER_CONFIRMATION: 'Waiting for caregiver',
    AWAITING_INITIAL_PAYMENT: 'Waiting for payment',
    dueSoon: '{{count}} due soon',
    overdue: '{{count}} past due, closing',
    nearest: 'Nearest due {{time}}',
    none: 'None',
    noAction: 'No action for the center'
  },
  groups: {
    label: 'Booking groups',
    action: 'To handle',
    waiting: 'Waiting on others',
    active: 'Active',
    closed: 'Closed',
    all: 'All'
  },
  columns: {
    booking: 'Booking',
    customer: 'Customer',
    schedule: 'Schedule',
    deadline: 'Due',
    next: 'Next visit',
    total: 'Total',
    status: 'Status',
    actions: 'Actions'
  },
  actions: {
    accept: 'Confirm',
    reject: 'Reject',
    assign: 'Assign',
    open: 'View details',
    more: 'More actions for {{code}}',
    call: 'Call the customer',
    closing: 'Closing'
  },
  filters: {
    label: 'Filter bookings',
    status: 'Status',
    allInGroup: 'All in group',
    all: 'All',
    search: 'Booking code',
    searchPlaceholder: 'Code or its last 6 characters',
    from: 'From',
    to: 'To',
    sort: 'Sort',
    reset: 'Clear filters'
  },
  sorts: {
    deadline: 'Nearest deadline',
    newest: 'Newest request first',
    startSoonest: 'Starting soonest'
  },
  pagination: {
    label: 'Booking pages',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {{page}} of {{total}}'
  },
  dialogLoading: 'Loading booking…'
}
