export const customerPaymentVi = {
  breadcrumb: 'Đường dẫn',
  bookings: 'Lịch đặt của tôi',
  backToBooking: 'Về lịch đặt',
  loading: 'Đang tải thông tin thanh toán…',
  deposit: {
    documentTitle: 'Đặt cọc {{code}} | CareConnect',
    crumb: 'Đặt cọc',
    title: 'Đặt cọc giữ lịch',
    subtitle: 'Thanh toán khoản cọc trước hạn để trung tâm xác nhận lịch chăm sóc cho người thân của bạn.',
    amountLabel: 'Số tiền cọc',
    amountEstimatedLabel: 'Số tiền cọc dự kiến',
    dueAt: 'Hạn đặt cọc: {{time}}',
    summary: 'Lịch đặt',
    patient: 'Người được chăm sóc',
    schedule: 'Lịch chăm sóc',
    visits: 'Số buổi',
    total: 'Tổng giá trị lịch đặt',
    remaining: 'Còn lại thanh toán sau khi hoàn tất',
    method: 'Phương thức thanh toán',
    methods: {
      VNPAYQR: 'Quét mã QR',
      VNBANK: 'Thẻ ATM / tài khoản ngân hàng nội địa',
      INTCARD: 'Thẻ quốc tế Visa, Mastercard, JCB'
    },
    methodHint: 'Bạn sẽ được chuyển sang trang thanh toán và có 15 phút để hoàn tất.',
    pay: 'Thanh toán {{amount}}',
    payNoAmount: 'Thanh toán',
    paying: 'Đang mở trang thanh toán…',
    policy: 'Khoản cọc được hoàn theo chính sách hủy của trung tâm. Phần còn lại được lập hóa đơn khi lịch hoàn tất.',
    notAwaiting: 'Lịch đặt này không cần đặt cọc lúc này.',
    notAwaitingHint: 'Trạng thái hiện tại: {{status}}.'
  },
  gateway: {
    documentTitle: 'Thanh toán thử nghiệm | CareConnect',
    title: 'Thanh toán thử nghiệm',
    subtitle:
      'Đây là trang thanh toán thử nghiệm, không có khoản tiền thật nào bị trừ. Chọn một kết quả bên dưới để thử.',
    merchant: 'Đơn vị nhận',
    merchantName: 'CareConnect',
    orderInfo: 'Nội dung',
    orderValue: 'Cọc lịch đặt {{code}}',
    amount: 'Số tiền',
    expiresAt: 'Hết hạn thanh toán lúc {{time}}',
    succeed: 'Thanh toán thành công',
    fail: 'Thanh toán thất bại',
    processing: 'Đang xử lý…',
    ended: 'Giao dịch thanh toán này đã kết thúc.',
    viewResult: 'Xem kết quả'
  },
  success: {
    documentTitle: 'Thanh toán thành công | CareConnect',
    title: 'Đặt cọc thành công',
    subtitle: 'Lịch chăm sóc đã được xác nhận. Người chăm sóc sẽ nhận các buổi và đến đúng giờ.',
    pending: 'Đang chờ xác nhận thanh toán…',
    paidAt: 'Thanh toán lúc {{time}}',
    bookingStatus: 'Trạng thái lịch đặt',
    next: 'Tiếp theo',
    nextSteps: 'Theo dõi từng buổi trong lịch đặt. Bạn có thể xem trước tiền hoàn trước khi hủy một buổi.',
    view: 'Xem lịch đặt'
  },
  failure: {
    documentTitle: 'Thanh toán thất bại | CareConnect',
    title: 'Thanh toán chưa thành công',
    subtitle: 'Khoản cọc chưa được ghi nhận nên lịch đặt vẫn đang chờ đặt cọc.',
    reasons: {
      CUSTOMER_DECLINED: 'Bạn đã hủy giao dịch ở trang thanh toán.',
      BOOKING_NOT_CONFIRMABLE: 'Trung tâm không thể xác nhận lịch đặt này nữa.',
      EXPIRED: 'Đã hết thời gian thanh toán trước khi bạn hoàn tất.',
      UNKNOWN: 'Ngân hàng hoặc ví điện tử chưa xác nhận giao dịch.'
    },
    retry: 'Thử thanh toán lại',
    retryHint: 'Bạn có thể thanh toán lại trước hạn đặt cọc.'
  },
  reference: 'Mã giao dịch',
  amount: 'Số tiền',
  booking: 'Lịch đặt'
}

export const customerPaymentEn = {
  breadcrumb: 'Breadcrumb',
  bookings: 'My bookings',
  backToBooking: 'Back to the booking',
  loading: 'Loading payment details…',
  deposit: {
    documentTitle: 'Deposit {{code}} | CareConnect',
    crumb: 'Deposit',
    title: 'Pay the deposit',
    subtitle: 'Pay the deposit before the due time so the center confirms the care schedule for your family member.',
    amountLabel: 'Deposit amount',
    amountEstimatedLabel: 'Estimated deposit amount',
    dueAt: 'Deposit due: {{time}}',
    summary: 'Booking',
    patient: 'Patient',
    schedule: 'Schedule',
    visits: 'Visits',
    total: 'Booking total',
    remaining: 'Remaining, invoiced after care ends',
    method: 'Payment method',
    methods: {
      VNPAYQR: 'Scan a QR code',
      VNBANK: 'Domestic ATM card / bank account',
      INTCARD: 'International card: Visa, Mastercard, JCB'
    },
    methodHint: 'You will be taken to the payment page and have 15 minutes to finish.',
    pay: 'Pay {{amount}}',
    payNoAmount: 'Pay',
    paying: 'Opening the payment gateway…',
    policy: 'The deposit is refunded under the center’s cancellation policy. The rest is invoiced when care ends.',
    notAwaiting: 'This booking does not need a deposit right now.',
    notAwaitingHint: 'Current status: {{status}}.'
  },
  gateway: {
    documentTitle: 'Test payment | CareConnect',
    title: 'Test payment',
    subtitle: 'This is a test payment page and no real money is charged. Choose a result below to try it.',
    merchant: 'Merchant',
    merchantName: 'CareConnect',
    orderInfo: 'Description',
    orderValue: 'Deposit for booking {{code}}',
    amount: 'Amount',
    expiresAt: 'Payment expires at {{time}}',
    succeed: 'Payment succeeds',
    fail: 'Payment fails',
    processing: 'Processing…',
    ended: 'This payment has already ended.',
    viewResult: 'See the result'
  },
  success: {
    documentTitle: 'Payment successful | CareConnect',
    title: 'Deposit paid',
    subtitle: 'The care schedule is confirmed. The caregiver will acknowledge each visit and arrive on time.',
    pending: 'Waiting for the payment confirmation…',
    paidAt: 'Paid at {{time}}',
    bookingStatus: 'Booking status',
    next: 'Next',
    nextSteps: 'Follow every visit in the booking. You can preview the refund before cancelling a visit.',
    view: 'View the booking'
  },
  failure: {
    documentTitle: 'Payment failed | CareConnect',
    title: 'Payment did not go through',
    subtitle: 'The deposit was not recorded, so the booking is still awaiting its deposit.',
    reasons: {
      CUSTOMER_DECLINED: 'The transaction was cancelled at the payment gateway.',
      BOOKING_NOT_CONFIRMABLE: 'The center can no longer confirm this booking.',
      EXPIRED: 'Time ran out before the payment was completed.',
      UNKNOWN: 'The payment gateway did not confirm the transaction.'
    },
    retry: 'Try paying again',
    retryHint: 'You can pay again before the deposit is due.'
  },
  reference: 'Payment reference',
  amount: 'Amount',
  booking: 'Booking'
}
