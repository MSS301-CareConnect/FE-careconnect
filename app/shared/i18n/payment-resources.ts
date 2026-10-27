export const paymentSharedVi = {
  status: {
    PENDING: 'Đang chờ thanh toán',
    SUCCESS: 'Thanh toán thành công',
    FAILED: 'Thanh toán thất bại',
    EXPIRED: 'Phiên thanh toán hết hạn',
    PARTIALLY_REFUNDED: 'Đã hoàn một phần',
    REFUNDED: 'Đã hoàn tiền'
  },
  errors: {
    e6200: 'Không tìm thấy phiên thanh toán.',
    e6201: 'Lịch đặt này không còn ở trạng thái chờ đặt cọc.',
    e6202: 'Đã quá hạn đặt cọc của lịch đặt này.',
    e6203: 'Phiên thanh toán này đã kết thúc.',
    e6204: 'Cổng thanh toán demo chưa được cấu hình.',
    e6205: 'Trung tâm không thể xác nhận khoản cọc cho lịch đặt này.',
    unavailable: 'Dịch vụ thanh toán tạm thời không khả dụng, vui lòng thử lại.',
    generic: 'Không thực hiện được thanh toán, vui lòng thử lại.'
  }
}

export const paymentSharedEn = {
  status: {
    PENDING: 'Awaiting payment',
    SUCCESS: 'Payment successful',
    FAILED: 'Payment failed',
    EXPIRED: 'Payment session expired',
    PARTIALLY_REFUNDED: 'Partially refunded',
    REFUNDED: 'Refunded'
  },
  errors: {
    e6200: 'Payment session not found.',
    e6201: 'This booking is no longer awaiting a deposit.',
    e6202: 'The deposit for this booking is overdue.',
    e6203: 'This payment session has already ended.',
    e6204: 'The demo payment gateway is not configured.',
    e6205: 'The center could not confirm the deposit for this booking.',
    unavailable: 'The payment service is temporarily unavailable. Please try again.',
    generic: 'The payment could not be completed. Please try again.'
  }
}
