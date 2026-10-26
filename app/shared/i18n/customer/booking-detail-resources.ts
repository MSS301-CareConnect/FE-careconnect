export const bookingDetailEn = {
  documentTitle: 'Booking {{code}} | CareConnect',
  breadcrumb: 'Breadcrumb',
  title: 'Booking',
  loading: 'Loading the booking…',
  error: 'Could not load the booking',
  back: 'Back to my bookings',
  notFound: {
    title: 'Booking not found',
    description: 'This booking does not exist or belongs to another account.'
  },
  occurrences: 'Care visits',
  history: 'History',
  refunded: 'Refund: {{refund}}',
  summary: {
    schedule: 'Schedule',
    services: 'Services',
    deposit: 'Deposit',
    total: 'Total'
  },
  next: {
    PENDING: {
      title: 'Waiting for the center to review',
      body: 'The center reviews your request and assigns a caregiver. It must answer by {{acceptanceDue}}.'
    },
    AWAITING_DEPOSIT: {
      title: 'Pay the deposit to confirm',
      body: 'The center accepted. Pay the deposit of {{deposit}} by {{depositDue}}, or the booking expires.'
    },
    CONFIRMED: {
      title: 'Confirmed',
      body: 'Your deposit is received and the caregiver will arrive for each visit below.'
    },
    IN_PROGRESS: {
      title: 'Care is under way',
      body: 'Visits are being carried out. Each one updates below as the caregiver checks in and out.'
    },
    COMPLETED: {
      title: 'All visits are done',
      body: 'Thank you for using CareConnect. The remaining invoice is sent to you separately.'
    },
    REJECTED: {
      title: 'The center declined this request',
      body: 'Reason: {{reason}}'
    },
    CANCELLED: {
      title: 'Booking cancelled',
      body: 'Reason: {{reason}}'
    },
    EXPIRED: {
      title: 'Booking expired',
      body: 'The center did not answer in time or the deposit was not paid by the due time.'
    }
  },
  cancel: {
    open: 'Cancel booking',
    title: 'Cancel booking #{{code}}',
    unpaidHint: 'No deposit has been paid, so the whole booking is cancelled and nothing is refunded.',
    paidHint: 'Choose what to cancel and preview the refund before confirming. The preview is valid for 10 minutes.',
    scope: 'What to cancel',
    scopeAll: 'Every remaining visit',
    scopeSelected: 'Only some visits',
    preview: 'Preview refund',
    refund: 'Refund',
    previewExpires: 'Preview valid until {{time}}',
    reason: 'Reason for cancelling',
    confirm: 'Cancel booking'
  }
}

export const bookingDetailVi = {
  documentTitle: 'Booking {{code}} | CareConnect',
  breadcrumb: 'Đường dẫn',
  title: 'Lịch đặt',
  loading: 'Đang tải lịch đặt…',
  error: 'Không tải được lịch đặt',
  back: 'Về lịch đặt của tôi',
  notFound: {
    title: 'Không tìm thấy lịch đặt',
    description: 'Lịch đặt không tồn tại hoặc thuộc tài khoản khác.'
  },
  occurrences: 'Các buổi chăm sóc',
  history: 'Lịch sử',
  refunded: 'Tiền hoàn: {{refund}}',
  summary: {
    schedule: 'Lịch chăm sóc',
    services: 'Dịch vụ',
    deposit: 'Tiền cọc',
    total: 'Tổng cộng'
  },
  next: {
    PENDING: {
      title: 'Đang chờ trung tâm duyệt',
      body: 'Trung tâm xem yêu cầu và phân công người chăm sóc. Hạn trả lời: {{acceptanceDue}}.'
    },
    AWAITING_DEPOSIT: {
      title: 'Đặt cọc để xác nhận lịch',
      body: 'Trung tâm đã duyệt. Hãy đặt cọc {{deposit}} trước {{depositDue}}, nếu không lịch sẽ hết hạn.'
    },
    CONFIRMED: {
      title: 'Đã xác nhận',
      body: 'Đã nhận tiền cọc. Người chăm sóc sẽ đến theo từng buổi bên dưới.'
    },
    IN_PROGRESS: {
      title: 'Đang trong thời gian chăm sóc',
      body: 'Các buổi đang được thực hiện và cập nhật bên dưới khi người chăm sóc check-in, check-out.'
    },
    COMPLETED: {
      title: 'Đã hoàn tất mọi buổi',
      body: 'Cảm ơn bạn đã dùng CareConnect. Hóa đơn phần còn lại sẽ được gửi riêng.'
    },
    REJECTED: {
      title: 'Trung tâm đã từ chối yêu cầu',
      body: 'Lý do: {{reason}}'
    },
    CANCELLED: {
      title: 'Lịch đặt đã hủy',
      body: 'Lý do: {{reason}}'
    },
    EXPIRED: {
      title: 'Lịch đặt đã hết hạn',
      body: 'Trung tâm không trả lời kịp hoặc chưa đặt cọc trước hạn.'
    }
  },
  cancel: {
    open: 'Hủy lịch đặt',
    title: 'Hủy lịch đặt #{{code}}',
    unpaidHint: 'Bạn chưa đặt cọc nên toàn bộ lịch đặt sẽ bị hủy và không phát sinh hoàn tiền.',
    paidHint: 'Chọn phần muốn hủy và xem trước số tiền hoàn trước khi xác nhận. Bản xem trước có hiệu lực 10 phút.',
    scope: 'Phần muốn hủy',
    scopeAll: 'Mọi buổi còn lại',
    scopeSelected: 'Chỉ một số buổi',
    preview: 'Xem trước tiền hoàn',
    refund: 'Tiền hoàn',
    previewExpires: 'Hiệu lực tới {{time}}',
    reason: 'Lý do hủy',
    confirm: 'Hủy lịch đặt'
  }
}
