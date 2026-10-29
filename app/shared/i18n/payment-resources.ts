export const paymentSharedVi = {
  status: {
    PENDING: 'Đang chờ thanh toán',
    SUCCESS: 'Thanh toán thành công',
    FAILED: 'Thanh toán thất bại',
    CANCELLED: 'Đã hủy phiên thanh toán',
    EXPIRED: 'Hết thời gian thanh toán'
  },
  type: {
    DEPOSIT: 'Tiền cọc',
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
    WAIVED: 'Đã miễn'
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
    OTHER: 'Lý do khác'
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
    e6025: 'Hóa đơn này không còn chờ thanh toán.',
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
    DEPOSIT: 'Deposit',
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
    WAIVED: 'Waived'
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
    OTHER: 'Other reason'
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
    e6025: 'This invoice is no longer awaiting payment.',
    unavailable: 'Payment is temporarily unavailable. Please try again in a few minutes.',
    generic: 'The payment could not be completed. Please try again.'
  }
}
