export const paymentSharedVi = {
  status: {
    PENDING: 'Đang chờ thanh toán',
    SUCCESS: 'Thanh toán thành công',
    FAILED: 'Thanh toán thất bại',
    EXPIRED: 'Hết thời gian thanh toán',
    PARTIALLY_REFUNDED: 'Đã hoàn một phần',
    REFUNDED: 'Đã hoàn tiền'
  },
  errors: {
    e6200: 'Không tìm thấy giao dịch thanh toán.',
    e6201: 'Lịch đặt này không còn ở trạng thái chờ đặt cọc.',
    e6202: 'Đã quá hạn đặt cọc của lịch đặt này.',
    e6203: 'Giao dịch thanh toán này đã kết thúc.',
    e6204: 'Cổng thanh toán thử nghiệm chưa sẵn sàng.',
    e6205: 'Trung tâm không thể xác nhận khoản cọc cho lịch đặt này.',
    unavailable: 'Hệ thống thanh toán đang tạm gián đoạn, vui lòng thử lại sau ít phút.',
    generic: 'Không thực hiện được thanh toán, vui lòng thử lại.'
  }
}

export const paymentSharedEn = {
  status: {
    PENDING: 'Awaiting payment',
    SUCCESS: 'Payment successful',
    FAILED: 'Payment failed',
    EXPIRED: 'Payment time expired',
    PARTIALLY_REFUNDED: 'Partially refunded',
    REFUNDED: 'Refunded'
  },
  errors: {
    e6200: 'Payment not found.',
    e6201: 'This booking is no longer awaiting a deposit.',
    e6202: 'The deposit for this booking is overdue.',
    e6203: 'This payment has already ended.',
    e6204: 'The test payment page is not ready yet.',
    e6205: 'The center could not confirm the deposit for this booking.',
    unavailable: 'Payment is temporarily unavailable. Please try again in a few minutes.',
    generic: 'The payment could not be completed. Please try again.'
  }
}
