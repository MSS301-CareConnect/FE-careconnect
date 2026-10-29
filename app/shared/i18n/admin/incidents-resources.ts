export const adminIncidentsVi = {
  title: 'Sự cố đồng bộ',
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
  subject: 'Đối tượng',
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
  title: 'Sync incidents',
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
  subject: 'Subject',
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
