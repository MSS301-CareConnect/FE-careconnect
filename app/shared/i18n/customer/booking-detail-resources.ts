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
      requestHeld: 'Booked & held',
      confirm: 'Center confirms',
      confirmCaregiver: 'Caregiver accepts',
      assign: 'Caregiver assigned',
      pay: 'Payment',
      upcoming: 'Awaiting first visit',
      care: 'In care',
      done: 'Completed'
    },
    due: 'Due {{time}}',
    firstVisit: 'First visit {{time}}',
    visitsDone: '{{done}} of {{total}} visits done',
    completedAt: 'Finished {{time}}',
    leftDays: '{{days}} d {{hours}} h left',
    leftHours: '{{hours}} h {{minutes}} min left',
    leftMinutes: '{{minutes}} min left',
    overdue: 'past due'
  },
  occurrences: 'Care visits',
  history: 'History',
  refunded: 'Refund: {{refund}}',
  keptDeposit: {
    badge: 'Deposit lost',
    title: 'You lost {{amount}} of your deposit',
    overdue:
      'Reason: the remaining balance was not paid in time, so the center kept the deposit under its booking policy.',
    lateCancel:
      'Reason: the booking was cancelled after the center’s refund cut-off, so this part of the payment was not refunded.'
  },
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
      body: 'Your booking is on hold. Pay the initial payment of {{deposit}} by {{depositDue}}; after that it is cancelled so others can book.',
      bodyNoAmount:
        'Your booking is on hold. Pay the initial payment by {{depositDue}}; after that it is cancelled so others can book.'
    },
    CONFIRMED: {
      title: 'Confirmed',
      body: 'Your payment is received and the caregiver will arrive for each visit below.',
      bodyAssigning:
        'Your payment is received. A caregiver is being found for the visits that have none yet — you will be told when one is assigned. A visit still without one shortly before it starts is cancelled and fully refunded.',
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
    allUpcoming: 'All {{count}} visits not started yet',
    chosenCount: '{{count}} visits selected',
    pickVisits: 'Pick visits one by one',
    upcomingList: 'Upcoming visits ({{count}})',
    selectAll: 'Select all',
    selectNone: 'Clear selection',
    recalculate: 'Recalculate',
    breakdown: 'Refund per visit ({{count}}):',
    previewTitle: 'Preview the exact refund',
    previewHint: 'We calculate the refund and any amount kept for each visit you want to cancel.',
    pickFirst: 'Select at least one visit on the left to calculate the refund.',
    needVisits: 'Select at least 1 visit to cancel',
    needPreview: 'Press “{{action}}” to check the refund',
    tiers: {
      title: 'Center refund policy',
      more: 'Details',
      refund: 'Refund {{percent}}',
      none: 'No refund',
      from: '{{hours}} h or more before',
      between: '{{from}} h to under {{to}} h',
      under: 'Under {{hours}} h before'
    },
    reason: 'Reason for cancelling',
    confirm: 'Cancel booking'
  },
  reschedule: {
    title: 'Reschedule visit #{{number}}',
    quota: 'Rescheduled {{count}}/{{limit}} free times.',
    back: 'Back',
    confirm: 'Confirm new time',
    current: 'Current time:',
    date: 'New date',
    time: 'Start time',
    newSlot: 'New time:',
    pickSlot: 'Choose a new date and time',
    check: 'Check availability',
    available: 'This time is free',
    busy: 'The caregiver is busy at that time',
    reason: 'Reason (optional)',
    reasonPlaceholder: 'E.g. the family has an urgent matter…'
  },
  occurrenceDetail: {
    customerReport: {
      notArrived: {
        action: 'Chưa thấy người chăm sóc đến',
        label: 'Ghi chú cho trung tâm (không bắt buộc)',
        description: 'Trung tâm sẽ được báo ngay để liên hệ người chăm sóc hoặc sắp xếp người khác.'
      },
      notDelivered: {
        action: 'Buổi không được thực hiện đúng',
        label: 'Điều gì đã xảy ra?',
        description:
          'Trung tâm sẽ xem lại buổi này. Nếu buổi không được thực hiện, tiền buổi được hoàn vào ví của bạn. Chỉ gửi được trong 24 giờ sau khi buổi kết thúc.'
      },
      confirm: 'Gửi phản ánh',
      sent: 'Đã gửi phản ánh lúc {{time}}'
    },
    rescheduled: 'Rescheduled {{count}} times',
    rescheduleAction: 'Move this visit to another time',
    age: '({{count}} years old)',
    reviews: '({{count}} reviews)',
    emergency: {
      title: 'The center arranged an emergency replacement caregiver',
      reason: 'Reason from the center: {{reason}}',
      accept: 'Accept the new caregiver',
      reschedule: 'Move to another time',
      reject: 'Decline and cancel the visit (100% refund)',
      status: {
        NONE: 'No answer needed',
        PENDING_CUSTOMER: 'Waiting for your answer',
        ACCEPTED: 'You accepted the new caregiver',
        REJECTED_RESCHEDULE: 'You moved the visit to another time',
        REJECTED_CANCEL: 'You declined and the visit was cancelled'
      }
    },
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
  },
  center: {
    title: 'Care center',
    subtitle: 'The center that confirms, assigns and is responsible for this booking',
    photoAlt: 'Photo of {{name}}',
    address: 'Address',
    hours: 'Opening hours',
    phone: 'Hotline',
    call: 'Call {{phone}}',
    view: 'View center',
    loading: 'Loading center details…',
    unavailable: 'This center no longer takes new bookings. Your booking stays with it.',
    error: 'Could not load the center details.',
    retry: 'Try again'
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
      requestHeld: 'Đặt & giữ chỗ',
      confirm: 'Trung tâm xác nhận',
      confirmCaregiver: 'Người chăm sóc nhận lịch',
      assign: 'Phân công',
      pay: 'Thanh toán',
      upcoming: 'Chờ buổi đầu',
      care: 'Đang chăm sóc',
      done: 'Hoàn tất'
    },
    due: 'Hạn {{time}}',
    firstVisit: 'Buổi đầu {{time}}',
    visitsDone: 'Đã xong {{done}}/{{total}} buổi',
    completedAt: 'Hoàn tất lúc {{time}}',
    leftDays: 'còn {{days}} ngày {{hours}} giờ',
    leftHours: 'còn {{hours}} giờ {{minutes}} phút',
    leftMinutes: 'còn {{minutes}} phút',
    overdue: 'đã quá hạn'
  },
  occurrences: 'Các buổi chăm sóc',
  history: 'Lịch sử',
  refunded: 'Tiền hoàn: {{refund}}',
  keptDeposit: {
    badge: 'Mất cọc',
    title: 'Bạn bị mất {{amount}} tiền cọc',
    overdue: 'Lý do: chưa thanh toán phần còn lại đúng hạn nên trung tâm giữ cọc theo chính sách đặt lịch.',
    lateCancel: 'Lý do: lịch đặt bị hủy sau mốc hoàn tiền của trung tâm nên phần tiền này không được hoàn.'
  },
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
      body: 'Lịch đang được giữ cho bạn. Hãy thanh toán khoản đầu {{deposit}} trước {{depositDue}}, quá hạn lịch sẽ tự hủy để người khác đặt.',
      bodyNoAmount:
        'Lịch đang được giữ cho bạn. Hãy thanh toán khoản đầu trước {{depositDue}}, quá hạn lịch sẽ tự hủy để người khác đặt.'
    },
    CONFIRMED: {
      title: 'Đã xác nhận',
      body: 'Đã nhận thanh toán. Người chăm sóc sẽ đến theo từng buổi bên dưới.',
      bodyAssigning:
        'Đã nhận thanh toán. Hệ thống đang tìm người chăm sóc cho các buổi chưa có người — bạn sẽ được báo khi có. Nếu tới sát giờ vẫn chưa có người, buổi đó được hủy và hoàn tiền đầy đủ.',
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
    allUpcoming: 'Tất cả {{count}} buổi chưa bắt đầu',
    chosenCount: 'Đã chọn {{count}} buổi',
    pickVisits: 'Tùy chọn từng buổi',
    upcomingList: 'Danh sách buổi sắp tới ({{count}})',
    selectAll: 'Chọn tất cả',
    selectNone: 'Bỏ chọn tất cả',
    recalculate: 'Tính lại',
    breakdown: 'Chi tiết hoàn tiền từng buổi ({{count}}):',
    previewTitle: 'Xem trước số tiền hoàn chính xác',
    previewHint: 'Hệ thống tính số tiền hoàn và khoản giữ lại (nếu có) cho từng buổi bạn muốn hủy.',
    pickFirst: 'Chọn ít nhất một buổi bên trái để tính tiền hoàn.',
    needVisits: 'Chọn ít nhất 1 buổi chăm sóc cần hủy',
    needPreview: 'Nhấn “{{action}}” để kiểm tra số tiền hoàn',
    tiers: {
      title: 'Chính sách hoàn tiền trung tâm',
      more: 'Xem chi tiết',
      refund: 'Hoàn {{percent}}',
      none: 'Không hoàn',
      from: 'Trước ≥ {{hours}} giờ',
      between: 'Từ {{from}} đến < {{to}} giờ',
      under: 'Sát giờ < {{hours}} giờ'
    },
    reason: 'Lý do hủy',
    confirm: 'Hủy lịch đặt'
  },
  reschedule: {
    title: 'Dời lịch buổi chăm sóc #{{number}}',
    quota: 'Đã dời {{count}}/{{limit}} lần miễn phí.',
    back: 'Quay lại',
    confirm: 'Xác nhận dời lịch',
    current: 'Lịch hiện tại:',
    date: 'Chọn ngày mới',
    time: 'Giờ bắt đầu',
    newSlot: 'Khung giờ mới:',
    pickSlot: 'Chọn ngày và giờ mới',
    check: 'Kiểm tra lịch rảnh',
    available: 'Khung giờ này còn trống',
    busy: 'Người chăm sóc bận lịch khác',
    reason: 'Lý do dời lịch (tùy chọn)',
    reasonPlaceholder: 'Ví dụ: Gia đình có việc bận đột xuất…'
  },
  occurrenceDetail: {
    customerReport: {
      notArrived: {
        action: 'The caregiver has not arrived',
        label: 'Note for the center (optional)',
        description: 'The center is told at once so it can reach the caregiver or send someone else.'
      },
      notDelivered: {
        action: 'This visit was not delivered properly',
        label: 'What happened?',
        description:
          'The center will review this visit. If it was not delivered, the visit is refunded to your wallet. You can report within 24 hours after the visit ends.'
      },
      confirm: 'Send report',
      sent: 'Report sent at {{time}}'
    },
    rescheduled: 'Đã dời {{count}} lần',
    rescheduleAction: 'Dời buổi này sang giờ khác',
    age: '({{count}} tuổi)',
    reviews: '({{count}} đánh giá)',
    emergency: {
      title: 'Trung tâm bố trí người chăm sóc thay thế khẩn cấp',
      reason: 'Lý do từ trung tâm: {{reason}}',
      accept: 'Đồng ý người mới',
      reschedule: 'Dời sang giờ khác',
      reject: 'Từ chối và hủy buổi (hoàn 100%)',
      status: {
        NONE: 'Không cần trả lời',
        PENDING_CUSTOMER: 'Chờ bạn trả lời',
        ACCEPTED: 'Bạn đã đồng ý người mới',
        REJECTED_RESCHEDULE: 'Bạn đã dời buổi sang giờ khác',
        REJECTED_CANCEL: 'Bạn đã từ chối, buổi đã hủy'
      }
    },
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
  },
  center: {
    title: 'Trung tâm phụ trách',
    subtitle: 'Trung tâm xác nhận, phân công và chịu trách nhiệm cho lịch đặt này',
    photoAlt: 'Ảnh {{name}}',
    address: 'Địa chỉ',
    hours: 'Giờ hoạt động',
    phone: 'Hotline',
    call: 'Gọi {{phone}}',
    view: 'Xem trung tâm',
    loading: 'Đang tải thông tin trung tâm…',
    unavailable: 'Trung tâm hiện không nhận lịch mới. Lịch đặt này vẫn do trung tâm phụ trách.',
    error: 'Không tải được thông tin trung tâm.',
    retry: 'Thử lại'
  }
}
