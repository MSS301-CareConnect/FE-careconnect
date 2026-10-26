export const bookingSharedVi = {
  status: {
    PENDING: 'Chờ trung tâm duyệt',
    AWAITING_DEPOSIT: 'Chờ đặt cọc',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang chăm sóc',
    COMPLETED: 'Hoàn tất',
    REJECTED: 'Bị từ chối',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn'
  },
  occurrenceStatus: {
    SCHEDULED: 'Đã lên lịch',
    ACKNOWLEDGED: 'Đã nhận ca',
    IN_PROGRESS: 'Đang diễn ra',
    COMPLETED: 'Đã xong',
    CANCELLED: 'Đã hủy',
    MISSED: 'Bỏ lỡ',
    CUSTOMER_NO_SHOW: 'Khách vắng mặt'
  },
  scheduleType: {
    ONE_TIME: 'Một buổi',
    DAILY: 'Hằng ngày',
    WEEKLY: 'Hằng tuần'
  },
  unitType: {
    HOUR: 'Theo giờ',
    DAY: 'Theo ngày',
    SHIFT: 'Theo ca'
  },
  weekdays: {
    '1': 'T2',
    '2': 'T3',
    '3': 'T4',
    '4': 'T5',
    '5': 'T6',
    '6': 'T7',
    '7': 'CN'
  },
  actions: {
    close: 'Đóng',
    back: 'Quay lại',
    working: 'Đang xử lý…',
    retry: 'Thử lại'
  },
  dialog: {
    minLength: 'Tối thiểu {{count}} ký tự.'
  },
  occurrences: {
    title: 'Buổi {{number}}',
    empty: 'Chưa có buổi chăm sóc nào.',
    assigned: 'Đã phân công người chăm sóc',
    unassigned: 'Chưa phân công',
    needsReassignment: 'Cần đổi người chăm sóc',
    cancelReason: 'Lý do hủy: {{reason}}'
  },
  history: {
    loading: 'Đang tải lịch sử…',
    error: 'Không tải được lịch sử booking.',
    empty: 'Chưa có thay đổi nào.',
    transition: '{{from}} → {{to}}',
    events: {
      BOOKING_STATUS_CHANGED: 'Booking đổi trạng thái',
      OCCURRENCE_ACKNOWLEDGED: 'Người chăm sóc đã nhận buổi',
      OCCURRENCE_STATUS_CHANGED: 'Buổi chăm sóc đổi trạng thái',
      CAREGIVER_CHANGED: 'Đổi người chăm sóc',
      NO_SHOW_REPORTED: 'Báo khách vắng mặt'
    }
  },
  recipient: {
    age: '{{age}} tuổi',
    allergies: 'Dị ứng',
    chronicConditions: 'Bệnh nền',
    careRequirements: 'Yêu cầu chăm sóc',
    dietaryNotes: 'Chế độ ăn',
    behaviorNotes: 'Lưu ý hành vi',
    medications: 'Thuốc đang dùng',
    emergencyContact: 'Liên hệ khẩn cấp: {{name}} {{phone}}'
  },
  errors: {
    e5004: 'Dịch vụ đặt lịch tạm thời không khả dụng, vui lòng thử lại.',
    e5006: 'Dữ liệu vừa được người khác thay đổi, vui lòng tải lại rồi thử lại.',
    e5007: 'Tài khoản chưa được gắn với trung tâm chăm sóc.',
    e5100: 'Không tìm thấy booking.',
    e5101: 'Không thể thực hiện thao tác này ở trạng thái hiện tại của booking.',
    e5102: 'Yêu cầu đặt lịch này đã được gửi với nội dung khác, vui lòng tải lại trang.',
    e5107: 'Đã tới giờ buổi chăm sóc đầu tiên, không thể hủy booking.',
    e5110: 'Mỗi dịch vụ chỉ được chọn một lần.',
    e5157: 'Bạn còn hóa đơn quá hạn, vui lòng thanh toán trước khi đặt lịch mới.',
    e5150: 'Có buổi đã bắt đầu, đã kết thúc hoặc đã hủy nên không hủy được.',
    e5151: 'Booking chưa đặt cọc chỉ hủy được toàn bộ.',
    e5153: 'Buổi chăm sóc không thuộc booking này.',
    e5154: 'Dịch vụ thanh toán tạm thời không khả dụng, vui lòng thử lại.',
    e5159: 'Số tiền hoàn đã thay đổi hoặc bản xem trước đã hết hạn, vui lòng xem lại.',
    e5205: 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu (lịch một buổi: cùng ngày).',
    e5206: 'Ngày bắt đầu không được ở quá khứ.',
    e5207: 'Giờ kết thúc phải sau giờ bắt đầu (chưa hỗ trợ ca qua đêm).',
    e5208: 'Lịch hằng tuần cần chọn ít nhất một thứ.',
    e5211: 'Khoảng ngày đã chọn không có buổi chăm sóc nào.',
    e5212: 'Số buổi chăm sóc vượt quá giới hạn cho phép.',
    e5213: 'Khoảng thời gian đặt lịch quá dài.',
    e5214: 'Buổi đầu tiên phải bắt đầu sau ít nhất 12 giờ kể từ bây giờ.',
    e5215: 'Người chăm sóc đã có lịch trùng thời gian.',
    e5216: 'Người bệnh đã có lịch chăm sóc trùng thời gian.',
    e5218: 'Chỉ đổi được buổi chăm sóc chưa bắt đầu.',
    e5221: 'Buổi chăm sóc không ở trạng thái cho phép thao tác này.',
    e5222: 'Chưa tới giờ check-in (sớm nhất 30 phút trước giờ bắt đầu) hoặc buổi đã kết thúc.',
    e5223: 'Booking chưa được xác nhận (chưa đặt cọc) hoặc đã kết thúc.',
    e5225: 'Thời lượng mỗi buổi vượt quá thời lượng của gói giá theo ca.',
    e5226: 'Người chăm sóc không có ca làm việc (hoặc đang nghỉ) vào thời gian đã chọn.',
    e5228: 'Bạn đang có quá nhiều booking chờ xử lý, vui lòng chờ trung tâm duyệt hoặc hủy bớt.',
    e5300: 'Dịch vụ bảng giá tạm thời không khả dụng, vui lòng thử lại.',
    e5301: 'Bảng giá dịch vụ không tồn tại hoặc không còn hiệu lực.',
    e5302: 'Trung tâm không cung cấp dịch vụ đã chọn.',
    e5400: 'Cần phân công người chăm sóc trước khi chấp nhận booking.',
    e5403: 'Người chăm sóc không thuộc trung tâm của booking.',
    e5404: 'Người chăm sóc chưa được xác minh.',
    e5405: 'Người chăm sóc hiện không hoạt động.',
    e5406: 'Người chăm sóc không thực hiện được tất cả dịch vụ đã chọn.',
    e5408: 'Trung tâm hiện không nhận đặt lịch.',
    e5601: 'Không tìm thấy hồ sơ người bệnh.',
    e5602: 'Hồ sơ người bệnh đang tạm ngưng, không thể đặt lịch.',
    e5700: 'Dịch vụ trung tâm / người chăm sóc tạm thời không khả dụng.',
    e5801: 'Buổi chăm sóc này đã được check-in.',
    e5802: 'Ca chăm sóc đã kết thúc.',
    e5804: 'Phải nhập lý do bỏ qua công việc.',
    e5805: 'Còn công việc chưa hoàn thành hoặc chưa ghi lý do bỏ qua.',
    e5812: 'Cần mô tả tình huống khách vắng mặt (10–1000 ký tự).',
    e5813: 'Buổi chăm sóc chưa có báo cáo khách vắng mặt.',
    e5814: 'Buổi chăm sóc này đã được báo khách vắng mặt.',
    e5817: 'Chỉ báo khách vắng mặt từ giờ bắt đầu tới 60 phút sau giờ kết thúc.',
    e5822: 'Chỉ được thêm tối đa 20 công việc.',
    forbidden: 'Bạn không có quyền thực hiện thao tác này.',
    unavailable: 'Dịch vụ tạm thời không khả dụng, vui lòng thử lại.',
    generic: 'Không thực hiện được thao tác, vui lòng thử lại.'
  }
}

export const bookingSharedEn = {
  status: {
    PENDING: 'Awaiting center review',
    AWAITING_DEPOSIT: 'Awaiting deposit',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In care',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired'
  },
  occurrenceStatus: {
    SCHEDULED: 'Scheduled',
    ACKNOWLEDGED: 'Acknowledged',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Done',
    CANCELLED: 'Cancelled',
    MISSED: 'Missed',
    CUSTOMER_NO_SHOW: 'Customer no-show'
  },
  scheduleType: {
    ONE_TIME: 'One visit',
    DAILY: 'Daily',
    WEEKLY: 'Weekly'
  },
  unitType: {
    HOUR: 'Per hour',
    DAY: 'Per day',
    SHIFT: 'Per shift'
  },
  weekdays: {
    '1': 'Mon',
    '2': 'Tue',
    '3': 'Wed',
    '4': 'Thu',
    '5': 'Fri',
    '6': 'Sat',
    '7': 'Sun'
  },
  actions: {
    close: 'Close',
    back: 'Back',
    working: 'Working…',
    retry: 'Try again'
  },
  dialog: {
    minLength: 'At least {{count}} characters.'
  },
  occurrences: {
    title: 'Visit {{number}}',
    empty: 'No care visits yet.',
    assigned: 'Caregiver assigned',
    unassigned: 'Not assigned',
    needsReassignment: 'Needs a new caregiver',
    cancelReason: 'Cancellation reason: {{reason}}'
  },
  history: {
    loading: 'Loading history…',
    error: 'Could not load the booking history.',
    empty: 'No changes yet.',
    transition: '{{from}} → {{to}}',
    events: {
      BOOKING_STATUS_CHANGED: 'Booking status changed',
      OCCURRENCE_ACKNOWLEDGED: 'Caregiver acknowledged the visit',
      OCCURRENCE_STATUS_CHANGED: 'Visit status changed',
      CAREGIVER_CHANGED: 'Caregiver changed',
      NO_SHOW_REPORTED: 'No-show reported'
    }
  },
  recipient: {
    age: '{{age}} years old',
    allergies: 'Allergies',
    chronicConditions: 'Chronic conditions',
    careRequirements: 'Care requirements',
    dietaryNotes: 'Diet',
    behaviorNotes: 'Behaviour notes',
    medications: 'Current medications',
    emergencyContact: 'Emergency contact: {{name}} {{phone}}'
  },
  errors: {
    e5004: 'The booking service is temporarily unavailable. Please try again.',
    e5006: 'Someone else just changed this data. Reload and try again.',
    e5007: 'This account is not linked to a care center.',
    e5100: 'Booking not found.',
    e5101: 'This action is not allowed in the booking’s current status.',
    e5102: 'This booking request was already sent with different details. Reload the page.',
    e5107: 'The first visit has already started, so the booking cannot be cancelled.',
    e5110: 'Each service can be selected only once.',
    e5157: 'You have an overdue invoice. Please pay it before booking again.',
    e5150: 'A visit has started, finished or was already cancelled, so it cannot be cancelled.',
    e5151: 'A booking without a deposit can only be cancelled as a whole.',
    e5153: 'That visit does not belong to this booking.',
    e5154: 'The payment service is temporarily unavailable. Please try again.',
    e5159: 'The refund changed or the preview expired. Please review it again.',
    e5205: 'The end date must be on or after the start date (one visit: the same day).',
    e5206: 'The start date cannot be in the past.',
    e5207: 'The end time must be after the start time (overnight visits are not supported).',
    e5208: 'A weekly schedule needs at least one weekday.',
    e5211: 'The selected dates contain no care visit.',
    e5212: 'Too many care visits for one booking.',
    e5213: 'The booking period is too long.',
    e5214: 'The first visit must start at least 12 hours from now.',
    e5215: 'The caregiver already has a visit at that time.',
    e5216: 'The patient already has a visit at that time.',
    e5218: 'Only visits that have not started can be changed.',
    e5221: 'The visit is not in a status that allows this action.',
    e5222: 'Check-in opens 30 minutes before the start, or the visit has already ended.',
    e5223: 'The booking is not confirmed (no deposit yet) or has ended.',
    e5225: 'Each visit is longer than the selected per-shift price plan allows.',
    e5226: 'The caregiver has no approved work shift (or is on leave) at that time.',
    e5228: 'You have too many bookings awaiting review. Wait for the center or cancel one.',
    e5300: 'The price service is temporarily unavailable. Please try again.',
    e5301: 'The price plan does not exist or is no longer active.',
    e5302: 'The center does not offer the selected service.',
    e5400: 'Assign a caregiver before accepting the booking.',
    e5403: 'The caregiver does not belong to the booking’s center.',
    e5404: 'The caregiver is not verified yet.',
    e5405: 'The caregiver is not active.',
    e5406: 'The caregiver cannot provide every selected service.',
    e5408: 'The center is not taking bookings right now.',
    e5601: 'Patient profile not found.',
    e5602: 'The patient profile is paused and cannot be booked.',
    e5700: 'The center / caregiver service is temporarily unavailable.',
    e5801: 'This visit is already checked in.',
    e5802: 'The care session has already ended.',
    e5804: 'Enter a reason for skipping the task.',
    e5805: 'Some tasks are still pending or have no skip reason.',
    e5812: 'Describe the no-show (10–1000 characters).',
    e5813: 'This visit has no no-show report.',
    e5814: 'A no-show was already reported for this visit.',
    e5817: 'A no-show can be reported from the start until 60 minutes after the end.',
    e5822: 'You can add at most 20 tasks.',
    forbidden: 'You are not allowed to do this.',
    unavailable: 'The service is temporarily unavailable. Please try again.',
    generic: 'The action could not be completed. Please try again.'
  }
}
