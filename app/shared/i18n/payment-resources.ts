export const paymentSharedVi = {
  status: {
    PENDING: 'Đang chờ thanh toán',
    SUCCESS: 'Thanh toán thành công',
    FAILED: 'Thanh toán thất bại',
    CANCELLED: 'Đã hủy phiên thanh toán',
    EXPIRED: 'Hết thời gian thanh toán'
  },
  type: {
    DEPOSIT: 'Khoản thanh toán đầu',
    REMAINING: 'Phần còn lại'
  },
  refundStatus: {
    REFUND_PENDING: 'Đang hoàn tiền',
    REFUNDED: 'Đã hoàn tiền',
    FAILED: 'Hoàn tiền lỗi, đang xử lý'
  },
  invoiceStatus: {
    PENDING: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    OVERDUE: 'Quá hạn',
    WAIVED: 'Đã miễn',
    EXPIRED: 'Hết hạn, lịch đặt đã kết thúc',
    CANCELLED: 'Không còn phải trả'
  },
  refundReason: {
    CUSTOMER_CANCEL: 'Bạn hủy buổi chăm sóc',
    CENTER_REJECT: 'Trung tâm từ chối lịch đặt',
    CENTER_CANCEL: 'Trung tâm hủy buổi chăm sóc',
    CENTER_LOCKED: 'Trung tâm tạm ngừng hoạt động',
    CAREGIVER_MISSED: 'Người chăm sóc vắng buổi',
    EXPIRED: 'Lịch đặt hết hạn',
    COMPLAINT_ACCEPTED: 'Khiếu nại được chấp nhận',
    LATE_PAYMENT: 'Thanh toán sau khi phiên đã hết hạn',
    BOOKING_NOT_CONFIRMABLE: 'Lịch đặt không còn xác nhận được',
    DUPLICATE: 'Thanh toán trùng',
    PAYMENT_OVERDUE: 'Quá hạn thanh toán phần còn lại',
    OTHER: 'Lý do khác'
  },
  refundRule: {
    NOT_PAID: 'Chưa thanh toán nên hủy miễn phí',
    NOT_CANCELLABLE: 'Buổi đã bắt đầu, không hủy được',
    BEFORE_THRESHOLD: 'Hủy sớm, hoàn theo mức trước mốc của trung tâm',
    AFTER_THRESHOLD: 'Hủy sát giờ, trung tâm giữ lại một phần',
    LATE_NO_REFUND: 'Hủy sát giờ, không được hoàn tiền',
    FULL_REFUND_CENTER: 'Trung tâm hủy, hoàn toàn bộ',
    FULL_REFUND_MISSED: 'Người chăm sóc vắng mặt, hoàn toàn bộ',
    FULL_REFUND_SYSTEM: 'Hệ thống hủy, hoàn toàn bộ',
    PAYMENT_OVERDUE: 'Quá hạn thanh toán phần còn lại',
    other: 'Theo chính sách hoàn tiền'
  },
  refundPolicy: {
    title: 'Hoàn tiền khi bạn hủy',
    intro:
      'Áp dụng cho từng buổi bị hủy, theo thời gian còn lại trước giờ bắt đầu buổi đó. Đây là chính sách của trung tâm bạn đặt.',
    lead: 'Thời gian còn lại',
    refund: 'Được hoàn',
    from: 'Từ {{hours}} giờ trở lên',
    under: 'Dưới {{hours}} giờ',
    between: 'Từ {{from}} đến dưới {{to}} giờ',
    none: 'Không hoàn',
    paidBase: 'Phần trăm tính trên số tiền bạn đã trả cho buổi đó.',
    fullRefund: 'Trung tâm hủy hoặc người chăm sóc vắng mặt: hoàn toàn bộ số tiền đã trả.',
    overdue: 'Không trả đủ phần còn lại trước hạn: lịch đặt hết hạn và trung tâm giữ {{percent}} số tiền đã trả.',
    loading: 'Đang tải chính sách hoàn tiền…',
    unavailable: 'Chưa tải được chính sách hoàn tiền. Bạn vẫn xem được số tiền hoàn trước khi xác nhận hủy.'
  },
  errors: {
    e6004: 'Không tìm thấy giao dịch thanh toán.',
    e6005: 'Lịch đặt này không còn ở trạng thái chờ đặt cọc hoặc đã quá hạn đặt cọc.',
    e6006: 'Lịch đặt này đã được thanh toán.',
    e6007: 'Cổng thanh toán chưa được cấu hình.',
    e6008: 'Chữ ký kết quả thanh toán không hợp lệ.',
    e6012: 'Không mở được trang thanh toán VNPay, vui lòng thử lại.',
    e6017: 'Không tìm thấy lịch đặt.',
    e6018: 'Lịch đặt này còn buổi chưa có giá nên chưa tính được tiền cọc.',
    e6019: 'Chưa có chính sách thanh toán đang áp dụng.',
    e6024: 'Không tìm thấy hóa đơn.',
    e6025: 'Hóa đơn này không còn chờ thanh toán hoặc đã quá hạn.',
    e6027: 'Tài khoản quản lý chưa được gán trung tâm.',
    unavailable: 'Hệ thống thanh toán đang tạm gián đoạn, vui lòng thử lại sau ít phút.',
    generic: 'Không thực hiện được thanh toán, vui lòng thử lại.'
  }
}

export const paymentSharedEn = {
  status: {
    PENDING: 'Awaiting payment',
    SUCCESS: 'Payment successful',
    FAILED: 'Payment failed',
    CANCELLED: 'Payment session cancelled',
    EXPIRED: 'Payment time expired'
  },
  type: {
    DEPOSIT: 'Initial payment',
    REMAINING: 'Remaining balance'
  },
  refundStatus: {
    REFUND_PENDING: 'Refund in progress',
    REFUNDED: 'Refunded',
    FAILED: 'Refund failed, being handled'
  },
  invoiceStatus: {
    PENDING: 'Awaiting payment',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
    WAIVED: 'Waived',
    EXPIRED: 'Expired, the booking ended',
    CANCELLED: 'Nothing left to pay'
  },
  refundReason: {
    CUSTOMER_CANCEL: 'You cancelled a visit',
    CENTER_REJECT: 'The center rejected the booking',
    CENTER_CANCEL: 'The center cancelled a visit',
    CENTER_LOCKED: 'The center was suspended',
    CAREGIVER_MISSED: 'The caregiver missed a visit',
    EXPIRED: 'The booking expired',
    COMPLAINT_ACCEPTED: 'Complaint accepted',
    LATE_PAYMENT: 'Paid after the session expired',
    BOOKING_NOT_CONFIRMABLE: 'The booking could no longer be confirmed',
    DUPLICATE: 'Duplicate payment',
    PAYMENT_OVERDUE: 'Remaining balance not paid in time',
    OTHER: 'Other reason'
  },
  refundRule: {
    NOT_PAID: 'Not paid yet, so free to cancel',
    NOT_CANCELLABLE: 'The visit has started and cannot be cancelled',
    BEFORE_THRESHOLD: 'Cancelled early, refunded at the center rate before the cut-off',
    AFTER_THRESHOLD: 'Cancelled close to the visit, the center keeps a part',
    LATE_NO_REFUND: 'Cancelled at the last minute, no refund',
    FULL_REFUND_CENTER: 'Cancelled by the center, refunded in full',
    FULL_REFUND_MISSED: 'The caregiver missed the visit, refunded in full',
    FULL_REFUND_SYSTEM: 'Cancelled by the system, refunded in full',
    PAYMENT_OVERDUE: 'Remaining balance not paid in time',
    other: 'Under the refund policy'
  },
  refundPolicy: {
    title: 'Refunds when you cancel',
    intro:
      'Applies to each cancelled visit, by the time left before that visit starts. This is the policy of the center you booked.',
    lead: 'Time left',
    refund: 'Refunded',
    from: '{{hours}} hours or more',
    under: 'Less than {{hours}} hours',
    between: '{{from}} to less than {{to}} hours',
    none: 'No refund',
    paidBase: 'The percentage applies to what you paid for that visit.',
    fullRefund: 'If the center cancels or the caregiver misses a visit, everything paid is refunded.',
    overdue:
      'If the remaining balance is not paid in time, the booking expires and the center keeps {{percent}} of what was paid.',
    loading: 'Loading the refund policy…',
    unavailable:
      'The refund policy could not be loaded. You can still preview the refund before confirming a cancellation.'
  },
  errors: {
    e6004: 'Payment not found.',
    e6005: 'This booking is no longer awaiting a deposit or its deposit is overdue.',
    e6006: 'This booking has already been paid.',
    e6007: 'The payment gateway is not configured.',
    e6008: 'The payment result signature is invalid.',
    e6012: 'The VNPay page could not be opened. Please try again.',
    e6017: 'Booking not found.',
    e6018: 'This booking has visits without a price, so its deposit cannot be calculated.',
    e6019: 'No payment policy is in effect.',
    e6024: 'Invoice not found.',
    e6025: 'This invoice is no longer awaiting payment or is past its due time.',
    e6027: 'This manager account is not assigned to a center.',
    unavailable: 'Payment is temporarily unavailable. Please try again in a few minutes.',
    generic: 'The payment could not be completed. Please try again.'
  }
}
