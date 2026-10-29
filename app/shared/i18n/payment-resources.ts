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
  refundRule: {
    NOT_PAID: 'Chưa thanh toán nên hủy miễn phí',
    NOT_CANCELLABLE: 'Buổi đã bắt đầu, không hủy được',
    COOLING_OFF: 'Trong thời gian cân nhắc, hoàn toàn bộ',
    FULL_REFUND_CENTER: 'Trung tâm hủy, hoàn toàn bộ',
    FULL_REFUND_MISSED: 'Người chăm sóc vắng mặt, hoàn toàn bộ',
    FULL_REFUND_SYSTEM: 'Hệ thống hủy, hoàn toàn bộ',
    tierRange: 'Còn {{min}}–{{max}} giờ trước buổi',
    tierFrom: 'Còn từ {{min}} giờ trở lên trước buổi',
    tierUnder: 'Còn dưới {{max}} giờ trước buổi',
    other: 'Theo chính sách hoàn cọc'
  },
  refundPolicy: {
    title: 'Hoàn cọc khi bạn hủy',
    intro:
      'Áp dụng cho từng buổi bị hủy, tính theo thời gian còn lại trước giờ bắt đầu buổi đó. Đây là chính sách chung của CareConnect.',
    lead: 'Thời gian còn lại',
    keep: 'Phí giữ lại',
    fee: '{{percent}} giá buổi',
    noFee: 'Không giữ phí',
    feeCap: 'Phí không bao giờ vượt quá tiền cọc của buổi đó.',
    coolingOff: 'Hủy trong {{minutes}} phút sau khi đặt cọc, khi buổi đầu còn ít nhất {{hours}} giờ: hoàn toàn bộ cọc.',
    fullRefund: 'Trung tâm hủy hoặc người chăm sóc vắng mặt: hoàn toàn bộ số tiền đã trả.',
    loading: 'Đang tải chính sách hoàn cọc…',
    unavailable: 'Chưa tải được chính sách hoàn cọc. Bạn vẫn xem được số tiền hoàn trước khi xác nhận hủy.'
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
  refundRule: {
    NOT_PAID: 'Not paid yet, so free to cancel',
    NOT_CANCELLABLE: 'The visit has started and cannot be cancelled',
    COOLING_OFF: 'Within the cooling-off period, refunded in full',
    FULL_REFUND_CENTER: 'Cancelled by the center, refunded in full',
    FULL_REFUND_MISSED: 'The caregiver missed the visit, refunded in full',
    FULL_REFUND_SYSTEM: 'Cancelled by the system, refunded in full',
    tierRange: '{{min}}–{{max}} hours before the visit',
    tierFrom: '{{min}} hours or more before the visit',
    tierUnder: 'Less than {{max}} hours before the visit',
    other: 'Under the deposit refund policy'
  },
  refundPolicy: {
    title: 'Deposit refunds when you cancel',
    intro:
      'Applies to each cancelled visit, by the time left before that visit starts. This is the CareConnect platform policy.',
    lead: 'Time left',
    keep: 'Fee kept',
    fee: '{{percent}} of the visit price',
    noFee: 'No fee',
    feeCap: 'The fee never exceeds the deposit paid for that visit.',
    coolingOff:
      'Cancel within {{minutes}} minutes of paying the deposit, while the first visit is at least {{hours}} hours away: full deposit refund.',
    fullRefund: 'If the center cancels or the caregiver misses a visit, everything paid is refunded.',
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
    e6025: 'This invoice is no longer awaiting payment.',
    unavailable: 'Payment is temporarily unavailable. Please try again in a few minutes.',
    generic: 'The payment could not be completed. Please try again.'
  }
}
