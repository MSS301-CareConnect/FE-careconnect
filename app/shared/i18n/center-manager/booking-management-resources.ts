export const managerBookingManagementVi = {
  documentTitle: 'Quản lý lịch đặt | CareConnect',
  title: 'Lịch đặt của trung tâm',
  subtitle: 'Duyệt yêu cầu mới, phân công người chăm sóc và theo dõi từng buổi chăm sóc.',
  pendingSubtitle: '{{count}} yêu cầu đang chờ duyệt. Duyệt trước hạn để khách kịp đặt cọc.',
  reviewQueue: 'Xem yêu cầu chờ duyệt',
  loading: 'Đang tải lịch đặt…',
  empty: 'Không có lịch đặt nào phù hợp.',
  noCaregiver: 'Chưa phân công',
  progress: 'Đã xong {{done}} / {{total}} buổi',
  columns: {
    booking: 'Lịch đặt',
    customer: 'Khách hàng',
    schedule: 'Lịch chăm sóc',
    next: 'Buổi kế tiếp',
    total: 'Tổng tiền',
    status: 'Trạng thái'
  },
  filters: {
    label: 'Lọc lịch đặt',
    status: 'Trạng thái',
    all: 'Tất cả',
    search: 'Mã booking',
    searchPlaceholder: 'Nhập mã hoặc 6 ký tự cuối',
    from: 'Từ ngày',
    to: 'Đến ngày',
    sort: 'Sắp xếp',
    reset: 'Xóa bộ lọc'
  },
  sorts: {
    newest: 'Yêu cầu mới nhất',
    startSoonest: 'Bắt đầu sớm nhất'
  },
  pagination: {
    label: 'Trang lịch đặt',
    previous: 'Trước',
    next: 'Sau',
    pageOf: 'Trang {{page}} / {{total}}'
  }
}

export const managerBookingManagementEn = {
  documentTitle: 'Booking management | CareConnect',
  title: 'Center bookings',
  subtitle: 'Review new requests, assign caregivers and follow every care visit.',
  pendingSubtitle: '{{count}} requests await review. Answer before the due time so customers can pay the deposit.',
  reviewQueue: 'Review pending requests',
  loading: 'Loading bookings…',
  empty: 'No booking matches.',
  noCaregiver: 'Not assigned',
  progress: '{{done}} / {{total}} visits done',
  columns: {
    booking: 'Booking',
    customer: 'Customer',
    schedule: 'Schedule',
    next: 'Next visit',
    total: 'Total',
    status: 'Status'
  },
  filters: {
    label: 'Filter bookings',
    status: 'Status',
    all: 'All',
    search: 'Booking code',
    searchPlaceholder: 'Code or its last 6 characters',
    from: 'From',
    to: 'To',
    sort: 'Sort',
    reset: 'Clear filters'
  },
  sorts: {
    newest: 'Newest request first',
    startSoonest: 'Starting soonest'
  },
  pagination: {
    label: 'Booking pages',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {{page}} of {{total}}'
  }
}
