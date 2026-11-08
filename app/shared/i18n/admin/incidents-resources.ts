export const adminIncidentsVi = {
  title: 'Sự cố',
  description:
    'Việc gửi giữa các dịch vụ (hoàn tiền, hóa đơn, khóa tài khoản trung tâm…) đã hết lượt thử lại. Gửi lại khi dịch vụ bên kia đã ổn, hoặc đánh dấu đã xử lý tay.',
  source: 'Nguồn',
  sources: { booking: 'Đặt lịch', provider: 'Trung tâm & người chăm sóc' },
  filter: 'Trạng thái',
  status: {
    FAILED: 'Thất bại',
    PENDING: 'Đang chờ gửi',
    SKIPPED: 'Đã xử lý tay',
    SENT: 'Đã gửi',
    ALL: 'Tất cả'
  },
  subject: 'Trung tâm',
  technicalDetail: 'Chi tiết kỹ thuật',
  events: {
    REFUND: 'Hoàn tiền cho khách',
    REMAINING_INVOICE: 'Tạo hóa đơn phần còn lại',
    COMPLAINT_REFUND: 'Hoàn tiền theo khiếu nại',
    RATING: 'Cập nhật điểm đánh giá',
    SUSPEND: 'Khóa tài khoản khi tạm khóa trung tâm',
    RESUME: 'Mở lại tài khoản khi mở lại trung tâm',
    ACTIVATE: 'Kích hoạt tài khoản trung tâm',
    CAREGIVER_DEACTIVATED: 'Xử lý lịch khi người chăm sóc ngừng làm',
    other: 'Đồng bộ dữ liệu'
  },
  attempts: 'Số lần thử',
  updatedAt: 'Cập nhật',
  requeue: 'Gửi lại',
  skipNote: 'Ghi chú xử lý tay',
  skip: 'Đã xử lý tay',
  loading: 'Đang tải sự cố…',
  error: 'Không tải được danh sách sự cố.',
  retry: 'Thử lại',
  empty: 'Không có sự cố nào ở trạng thái này.',
  actionError: 'Không thực hiện được — sự cố có thể vừa được người khác xử lý, vui lòng tải lại.'
}

export const adminIncidentsEn = {
  title: 'Incidents',
  description:
    'Deliveries between services (refunds, invoices, center account locks…) that ran out of retries. Requeue once the other service is healthy, or mark them as handled by hand.',
  source: 'Source',
  sources: { booking: 'Bookings', provider: 'Centers & caregivers' },
  filter: 'Status',
  status: {
    FAILED: 'Failed',
    PENDING: 'Waiting to send',
    SKIPPED: 'Handled by hand',
    SENT: 'Sent',
    ALL: 'All'
  },
  subject: 'Center',
  technicalDetail: 'Technical detail',
  events: {
    REFUND: 'Customer refund',
    REMAINING_INVOICE: 'Remaining-balance invoice',
    COMPLAINT_REFUND: 'Complaint refund',
    RATING: 'Rating update',
    SUSPEND: 'Lock accounts of a suspended center',
    RESUME: 'Unlock accounts of a reopened center',
    ACTIVATE: 'Activate center accounts',
    CAREGIVER_DEACTIVATED: 'Reschedule after a caregiver left',
    other: 'Data sync'
  },
  attempts: 'Attempts',
  updatedAt: 'Updated',
  requeue: 'Requeue',
  skipNote: 'Note on manual handling',
  skip: 'Handled by hand',
  loading: 'Loading incidents…',
  error: 'Incidents could not be loaded.',
  retry: 'Retry',
  empty: 'No incidents in this status.',
  actionError: 'Could not complete — someone may have just handled it. Please reload.'
}
