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
    method: 'Thanh toán qua VNPay',
    methodHint:
      'Bạn sẽ được chuyển sang trang VNPay để chọn quét mã QR, thẻ ATM nội địa hoặc thẻ quốc tế, và có 15 phút để hoàn tất.',
    exactAmount: 'Số tiền chính xác được tính theo từng buổi và hiển thị trên trang VNPay.',
    pay: 'Thanh toán {{amount}}',
    payNoAmount: 'Thanh toán',
    paying: 'Đang mở trang thanh toán…',
    policy: 'Khoản cọc được hoàn theo chính sách hủy của trung tâm. Phần còn lại được lập hóa đơn khi lịch hoàn tất.',
    notAwaiting: 'Lịch đặt này không cần đặt cọc lúc này.',
    notAwaitingHint: 'Trạng thái hiện tại: {{status}}.'
  },
  return: {
    documentTitle: 'Đang kiểm tra kết quả thanh toán | CareConnect',
    title: 'Kết quả thanh toán',
    subtitle: 'Chúng tôi đang kiểm tra kết quả VNPay gửi về.',
    verifying: 'Đang kiểm tra chữ ký kết quả thanh toán…',
    missing: 'Không có kết quả thanh toán để kiểm tra.',
    toPayments: 'Xem thanh toán của tôi'
  },
  pending: {
    documentTitle: 'Đang xác nhận thanh toán | CareConnect',
    title: 'Đang xác nhận thanh toán',
    subtitle: 'VNPay đã chuyển bạn về. Lịch đặt chỉ được cập nhật khi ngân hàng báo đã nhận tiền.',
    waiting: 'Đang chờ ngân hàng xác nhận…',
    hint: 'Thường chỉ mất vài giây. Vui lòng giữ trang này mở.',
    timedOut: 'Chưa nhận được xác nhận từ ngân hàng',
    timedOutHint:
      'Bạn có thể kiểm tra lại hoặc đóng trang này. Kết quả sẽ hiện trong Thanh toán & hoàn tiền khi ngân hàng báo về.',
    checkAgain: 'Kiểm tra lại',
    toPayments: 'Xem thanh toán của tôi'
  },
  success: {
    documentTitle: 'Thanh toán thành công | CareConnect',
    title: 'Đặt cọc thành công',
    subtitle: 'Lịch chăm sóc đã được xác nhận. Người chăm sóc sẽ nhận các buổi và đến đúng giờ.',
    invoiceTitle: 'Đã thanh toán hóa đơn',
    invoiceSubtitle: 'Phần còn lại của lịch đặt đã được thanh toán. Bạn có thể tiếp tục đặt lịch mới.',
    paidAt: 'Thanh toán lúc {{time}}',
    bookingStatus: 'Trạng thái lịch đặt',
    next: 'Tiếp theo',
    nextSteps: 'Theo dõi từng buổi trong lịch đặt. Bạn có thể xem trước tiền hoàn trước khi hủy một buổi.',
    invoicePaid: 'Hóa đơn phần còn lại đã được thanh toán.',
    view: 'Xem lịch đặt'
  },
  failure: {
    documentTitle: 'Thanh toán thất bại | CareConnect',
    title: 'Thanh toán chưa thành công',
    subtitle: 'Khoản cọc chưa được ghi nhận nên lịch đặt vẫn đang chờ đặt cọc.',
    invoiceSubtitle: 'Hóa đơn phần còn lại chưa được ghi nhận thanh toán.',
    reasons: {
      DECLINED: 'Giao dịch đã bị hủy ở trang thanh toán hoặc bị ngân hàng từ chối.',
      BOOKING_NOT_CONFIRMABLE: 'Trung tâm không thể xác nhận lịch đặt này nữa.',
      EXPIRED: 'Đã hết thời gian thanh toán trước khi bạn hoàn tất.',
      UNKNOWN: 'Ngân hàng hoặc ví điện tử chưa xác nhận giao dịch.'
    },
    retry: 'Thử thanh toán lại',
    retryHint: 'Bạn có thể thanh toán lại trước hạn đặt cọc.',
    invoiceRetryHint: 'Bạn có thể thanh toán lại hóa đơn trong trang Thanh toán & hoàn tiền.',
    payInvoiceAgain: 'Thanh toán lại hóa đơn'
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
    method: 'Pay with VNPay',
    methodHint:
      'You will be taken to VNPay to choose a QR code, a domestic ATM card or an international card, with 15 minutes to finish.',
    exactAmount: 'The exact amount is calculated per visit and shown on the VNPay page.',
    pay: 'Pay {{amount}}',
    payNoAmount: 'Pay',
    paying: 'Opening the payment gateway…',
    policy: 'The deposit is refunded under the center’s cancellation policy. The rest is invoiced when care ends.',
    notAwaiting: 'This booking does not need a deposit right now.',
    notAwaitingHint: 'Current status: {{status}}.'
  },
  return: {
    documentTitle: 'Checking the payment result | CareConnect',
    title: 'Payment result',
    subtitle: 'We are checking the result VNPay sent back.',
    verifying: 'Checking the payment result signature…',
    missing: 'There is no payment result to check.',
    toPayments: 'See my payments'
  },
  pending: {
    documentTitle: 'Confirming the payment | CareConnect',
    title: 'Confirming the payment',
    subtitle: 'VNPay sent you back. The booking changes only once the bank reports the money received.',
    waiting: 'Waiting for the bank to confirm…',
    hint: 'This usually takes a few seconds. Please keep this page open.',
    timedOut: 'The bank has not confirmed yet',
    timedOutHint:
      'You can check again or close this page. The result appears in Payments & refunds once the bank reports it.',
    checkAgain: 'Check again',
    toPayments: 'See my payments'
  },
  success: {
    documentTitle: 'Payment successful | CareConnect',
    title: 'Deposit paid',
    subtitle: 'The care schedule is confirmed. The caregiver will acknowledge each visit and arrive on time.',
    invoiceTitle: 'Invoice paid',
    invoiceSubtitle: 'The rest of the booking is paid. You can make new bookings again.',
    paidAt: 'Paid at {{time}}',
    bookingStatus: 'Booking status',
    next: 'Next',
    nextSteps: 'Follow every visit in the booking. You can preview the refund before cancelling a visit.',
    invoicePaid: 'The remaining-balance invoice is paid.',
    view: 'View the booking'
  },
  failure: {
    documentTitle: 'Payment failed | CareConnect',
    title: 'Payment did not go through',
    subtitle: 'The deposit was not recorded, so the booking is still awaiting its deposit.',
    invoiceSubtitle: 'The remaining-balance invoice was not recorded as paid.',
    reasons: {
      DECLINED: 'The transaction was cancelled at the payment page or declined by the bank.',
      BOOKING_NOT_CONFIRMABLE: 'The center can no longer confirm this booking.',
      EXPIRED: 'Time ran out before the payment was completed.',
      UNKNOWN: 'The payment gateway did not confirm the transaction.'
    },
    retry: 'Try paying again',
    retryHint: 'You can pay again before the deposit is due.',
    invoiceRetryHint: 'You can pay the invoice again from Payments & refunds.',
    payInvoiceAgain: 'Pay the invoice again'
  },
  reference: 'Payment reference',
  amount: 'Amount',
  booking: 'Booking'
}

export const customerPaymentsVi = {
  documentTitle: 'Thanh toán & hoàn tiền | CareConnect',
  breadcrumb: 'Đường dẫn',
  home: 'Trang chủ',
  title: 'Thanh toán & hoàn tiền',
  subtitle: 'Hóa đơn phần còn lại cần thanh toán, lịch sử giao dịch và các khoản hoàn tiền của bạn.',
  loading: 'Đang tải…',
  previous: 'Trang trước',
  next: 'Trang sau',
  page: 'Trang {{page}} / {{total}}',
  viewBooking: 'Xem lịch đặt',
  columns: {
    booking: 'Lịch đặt',
    amount: 'Số tiền',
    dueAt: 'Hạn thanh toán',
    status: 'Trạng thái',
    action: 'Thao tác',
    createdAt: 'Thời gian',
    type: 'Loại',
    refunded: 'Đã hoàn',
    reason: 'Lý do',
    fee: 'Phí giữ lại'
  },
  invoices: {
    title: 'Hóa đơn phần còn lại',
    empty: 'Bạn không có hóa đơn nào.',
    pay: 'Thanh toán',
    debt: 'Bạn có hóa đơn quá hạn. Vui lòng thanh toán để tiếp tục đặt lịch mới.'
  },
  history: {
    title: 'Lịch sử thanh toán',
    empty: 'Chưa có giao dịch thanh toán nào.'
  },
  refunds: {
    title: 'Hoàn tiền',
    empty: 'Chưa có khoản hoàn tiền nào.'
  }
}

export const customerPaymentsEn = {
  documentTitle: 'Payments & refunds | CareConnect',
  breadcrumb: 'Breadcrumb',
  home: 'Home',
  title: 'Payments & refunds',
  subtitle: 'Remaining-balance invoices to pay, your payment history and your refunds.',
  loading: 'Loading…',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page {{page}} of {{total}}',
  viewBooking: 'View booking',
  columns: {
    booking: 'Booking',
    amount: 'Amount',
    dueAt: 'Due',
    status: 'Status',
    action: 'Action',
    createdAt: 'Time',
    type: 'Type',
    refunded: 'Refunded',
    reason: 'Reason',
    fee: 'Fee kept'
  },
  invoices: {
    title: 'Remaining-balance invoices',
    empty: 'You have no invoices.',
    pay: 'Pay',
    debt: 'You have an overdue invoice. Please pay it to make new bookings.'
  },
  history: {
    title: 'Payment history',
    empty: 'No payments yet.'
  },
  refunds: {
    title: 'Refunds',
    empty: 'No refunds yet.'
  }
}
