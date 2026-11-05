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
  moreActions: 'More actions',
  code: 'Booking code',
  lifecycle: {
    label: 'Booking progress',
    steps: {
      request: 'Request sent',
      requestHeld: 'Shift held',
      confirm: 'Center confirms',
      confirmCaregiver: 'Caregiver accepts',
      assign: 'Caregiver assigned',
      pay: 'Payment',
      care: 'In care',
      done: 'Completed'
    },
    due: 'Due {{time}}\n{{left}}',
    firstVisit: 'First visit {{time}}',
    visitsDone: '{{done}} of {{total}} visits done',
    completedAt: 'On {{time}}',
    leftDays: '{{days}} d {{hours}} h left',
    leftHours: '{{hours}} h {{minutes}} min left',
    leftMinutes: '{{minutes}} min left',
    overdue: 'past due'
  },
  occurrences: 'Care visits',
  history: 'History',
  refunded: 'Refund: {{refund}}',
  payDeposit: 'Pay {{deposit}}',
  payDepositNoAmount: 'Pay the initial payment',
  remaining: {
    pay: 'Pay the remaining {{remaining}}',
    paying: 'Opening the payment gateway…',
    toPayments: 'See the invoice in Payments'
  },
  summary: {
    label: 'Booking summary',
    schedule: 'Schedule & address',
    services: 'Services',
    payment: 'Payment',
    unitLine: '{{price}} · {{unit}} × {{quantity}}',
    deposit: 'Initial payment',
    depositEstimated: 'Estimated initial payment ({{percent}}%)',
    remaining: 'Remaining balance',
    remainingDue: 'Due by {{time}}',
    fullyPaid: 'Paid in full',
    total: 'Total'
  },
  next: {
    PENDING_CENTER_CONFIRMATION: {
      title: 'Waiting for the center to confirm',
      body: 'The center reviews your request. It must answer by {{acceptanceDue}}.'
    },
    PENDING_CAREGIVER_CONFIRMATION: {
      title: 'Waiting for your caregiver',
      body: 'The caregiver you chose answers your request directly, by {{acceptanceDue}}. If they cannot take it, the center assigns someone else.'
    },
    PENDING_CAREGIVER_ASSIGNMENT: {
      title: 'The center is assigning a caregiver',
      body: 'The center confirmed and must assign a caregiver by {{assignmentDue}}. You pay only once a caregiver is assigned.'
    },
    AWAITING_INITIAL_PAYMENT: {
      title: 'Pay to confirm',
      body: 'The center accepted. Pay the initial payment of {{deposit}} by {{depositDue}}, or the booking expires.',
      bodyNoAmount: 'The center accepted. Pay the initial payment by {{depositDue}}, or the booking expires.'
    },
    CONFIRMED: {
      title: 'Confirmed',
      body: 'Your payment is received and the caregiver will arrive for each visit below.',
      bodyRemaining:
        'Your initial payment is received. Pay the remaining {{remaining}} by {{remainingDue}}: care starts only once the booking is paid in full, and an unpaid booking expires.'
    },
    IN_PROGRESS: {
      title: 'Care is under way',
      body: 'Visits are in progress. Each one updates below when the caregiver starts and finishes it.'
    },
    COMPLETED: {
      title: 'All visits are done',
      body: 'Thank you for using CareConnect. Any open invoice is listed in Payments & refunds.'
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
      body: 'The center did not confirm or assign a caregiver in time, or the payment was not made by the due time.',
      bodyUnpaid:
        '{{reason}}. You were not charged for this booking and its time is free again, so you can book again right away.',
      bodyPaid: '{{reason}}. What you paid is kept or refunded under the center’s policy (see Payments & refunds).'
    },
    closing: {
      title: 'Confirmation deadline passed',
      body: 'The request was not handled in time, so the booking is being closed. You were not charged; book again or choose another center.'
    },
    rebook: 'Book the same again',
    otherCenter: 'Choose another center'
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
    feeKept: 'Fee kept {{amount}}',
    policyToggle: 'How refunds are calculated',
    reason: 'Reason for cancelling',
    confirm: 'Cancel booking'
  },
  occurrenceDetail: {
    title: 'Visit #{{number}} details',
    service: 'Service details',
    defaultService: 'Care service',
    schedule: 'Schedule & Duration',
    plannedTime: 'Planned schedule',
    actualTime: 'Actual time',
    duration: 'Duration',
    caregiver: 'Assigned caregiver',
    caregiverAssigned: 'Assigned',
    caregiverUnassigned: 'The center is currently assigning a caregiver for this visit.',
    needsReassignment: 'Reassignment needed: the center is arranging a replacement caregiver.',
    recipientAndLocation: 'Patient & Location',
    patient: 'Patient',
    address: 'Service address',
    note: 'Special notes',
    noNote: 'No special notes',
    price: 'Session price',
    cancellation: 'Cancellation information',
    cancelReason: 'Reason: {{reason}}',
    cancelledAt: 'Cancelled at: {{time}}',
    cancelledBy: 'Cancelled by: {{party}}',
    close: 'Close'
  },
  overview: {
    title: 'Booking overview',
    patient: 'Patient',
    age: '({{count}} years old)',
    time: 'Schedule & Time',
    address: 'Service address',
    editAddress: 'Change address',
    note: 'Your notes',
    noNote: 'No special notes'
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
  moreActions: 'Thao tác khác',
  code: 'Mã lịch đặt',
  lifecycle: {
    label: 'Tiến trình lịch đặt',
    steps: {
      request: 'Gửi yêu cầu',
      requestHeld: 'Giữ ca',
      confirm: 'Trung tâm xác nhận',
      confirmCaregiver: 'Người chăm sóc nhận lịch',
      assign: 'Phân công',
      pay: 'Thanh toán',
      care: 'Đang chăm sóc',
      done: 'Hoàn tất'
    },
    due: 'Hạn {{time}}\n{{left}}',
    firstVisit: 'Buổi đầu {{time}}',
    visitsDone: 'Đã xong {{done}}/{{total}} buổi',
    completedAt: 'Lúc {{time}}',
    leftDays: 'còn {{days}} ngày {{hours}} giờ',
    leftHours: 'còn {{hours}} giờ {{minutes}} phút',
    leftMinutes: 'còn {{minutes}} phút',
    overdue: 'đã quá hạn'
  },
  occurrences: 'Các buổi chăm sóc',
  history: 'Lịch sử',
  refunded: 'Tiền hoàn: {{refund}}',
  payDeposit: 'Thanh toán {{deposit}}',
  payDepositNoAmount: 'Thanh toán khoản đầu',
  remaining: {
    pay: 'Thanh toán phần còn lại {{remaining}}',
    paying: 'Đang mở trang thanh toán…',
    toPayments: 'Xem hóa đơn ở trang Thanh toán'
  },
  summary: {
    label: 'Tóm tắt lịch đặt',
    schedule: 'Lịch & địa chỉ',
    services: 'Dịch vụ',
    payment: 'Thanh toán',
    unitLine: '{{price}} · {{unit}} × {{quantity}}',
    deposit: 'Khoản thanh toán đầu',
    depositEstimated: 'Thanh toán đầu dự kiến ({{percent}}%)',
    remaining: 'Phần còn lại',
    remainingDue: 'Trả trước {{time}}',
    fullyPaid: 'Đã thanh toán đủ',
    total: 'Tổng cộng'
  },
  next: {
    PENDING_CENTER_CONFIRMATION: {
      title: 'Đang chờ trung tâm xác nhận',
      body: 'Trung tâm xem yêu cầu của bạn. Hạn trả lời: {{acceptanceDue}}.'
    },
    PENDING_CAREGIVER_CONFIRMATION: {
      title: 'Đang chờ người chăm sóc nhận lịch',
      body: 'Người chăm sóc bạn chọn sẽ trả lời trực tiếp trước {{acceptanceDue}}. Nếu họ không nhận được, trung tâm sẽ phân người khác.'
    },
    PENDING_CAREGIVER_ASSIGNMENT: {
      title: 'Trung tâm đang phân công người chăm sóc',
      body: 'Trung tâm đã xác nhận và cần phân người chăm sóc trước {{assignmentDue}}. Bạn chỉ thanh toán khi đã có người chăm sóc.'
    },
    AWAITING_INITIAL_PAYMENT: {
      title: 'Thanh toán để xác nhận lịch',
      body: 'Trung tâm đã duyệt. Hãy thanh toán khoản đầu {{deposit}} trước {{depositDue}}, nếu không lịch sẽ hết hạn.',
      bodyNoAmount: 'Trung tâm đã duyệt. Hãy thanh toán khoản đầu trước {{depositDue}}, nếu không lịch sẽ hết hạn.'
    },
    CONFIRMED: {
      title: 'Đã xác nhận',
      body: 'Đã nhận thanh toán. Người chăm sóc sẽ đến theo từng buổi bên dưới.',
      bodyRemaining:
        'Đã nhận khoản thanh toán đầu. Hãy thanh toán phần còn lại {{remaining}} trước {{remainingDue}}: chỉ bắt đầu chăm sóc khi đã trả đủ, chưa trả đủ thì lịch đặt sẽ hết hạn.'
    },
    IN_PROGRESS: {
      title: 'Đang trong thời gian chăm sóc',
      body: 'Các buổi bên dưới được cập nhật mỗi khi người chăm sóc bắt đầu và kết thúc buổi chăm sóc.'
    },
    COMPLETED: {
      title: 'Đã hoàn tất mọi buổi',
      body: 'Cảm ơn bạn đã dùng CareConnect. Hóa đơn còn mở (nếu có) nằm ở trang Thanh toán & hoàn tiền.'
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
      body: 'Trung tâm không xác nhận hoặc không phân người chăm sóc kịp, hoặc chưa thanh toán đúng hạn.',
      bodyUnpaid:
        '{{reason}}. Bạn chưa bị trừ tiền cho lịch này và khung giờ đã được giải phóng, bạn có thể đặt lại ngay.',
      bodyPaid:
        '{{reason}}. Khoản đã thanh toán được giữ hoặc hoàn theo chính sách của trung tâm (xem Thanh toán & hoàn tiền).'
    },
    closing: {
      title: 'Đã quá hạn xác nhận',
      body: 'Yêu cầu chưa được xử lý kịp hạn nên hệ thống đang đóng lịch này. Bạn chưa bị trừ tiền; hãy đặt lại hoặc chọn trung tâm khác.'
    },
    rebook: 'Đặt lại lịch tương tự',
    otherCenter: 'Chọn trung tâm khác'
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
    feeKept: 'Giữ lại {{amount}}',
    policyToggle: 'Cách tính tiền hoàn',
    reason: 'Lý do hủy',
    confirm: 'Hủy lịch đặt'
  },
  occurrenceDetail: {
    title: 'Chi tiết buổi chăm sóc #{{number}}',
    service: 'Dịch vụ thực hiện',
    defaultService: 'Dịch vụ chăm sóc',
    schedule: 'Thời gian & Thời lượng',
    plannedTime: 'Kế hoạch',
    actualTime: 'Thời gian thực tế',
    duration: 'Thời lượng',
    caregiver: 'Người chăm sóc phụ trách',
    caregiverAssigned: 'Đã phân công',
    caregiverUnassigned: 'Trung tâm đang phân công người chăm sóc cho buổi này.',
    needsReassignment: 'Cần đổi người chăm sóc: Trung tâm đang tìm người thay thế.',
    recipientAndLocation: 'Người nhận chăm sóc & Địa điểm',
    patient: 'Người được chăm sóc',
    address: 'Địa chỉ chăm sóc',
    note: 'Ghi chú',
    noNote: 'Không có ghi chú thêm',
    price: 'Chi phí buổi này',
    cancellation: 'Thông tin hủy',
    cancelReason: 'Lý do: {{reason}}',
    cancelledAt: 'Thời gian hủy: {{time}}',
    cancelledBy: 'Bên hủy: {{party}}',
    close: 'Đóng'
  },
  overview: {
    title: 'Thông tin lịch chăm sóc',
    patient: 'Người nhận chăm sóc',
    age: '({{count}} tuổi)',
    time: 'Thời gian thực hiện',
    address: 'Địa chỉ chăm sóc',
    editAddress: 'Đổi địa chỉ',
    note: 'Ghi chú của bạn',
    noNote: 'Không có ghi chú thêm'
  }
}
