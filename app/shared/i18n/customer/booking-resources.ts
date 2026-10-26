export const bookingEn = {
  documentTitle: 'Book home care | CareConnect',
  breadcrumb: {
    label: 'Breadcrumb',
    home: 'Home',
    bookings: 'My bookings',
    current: 'New booking'
  },
  header: {
    title: 'Book home care',
    subtitle:
      'Choose the patient, services and schedule. The center reviews the request, then you pay the deposit to confirm it.'
  },
  stepper: {
    label: 'Booking progress',
    patient: 'Patient',
    provider: 'Center & caregiver',
    services: 'Services',
    schedule: 'Schedule',
    confirm: 'Send request',
    complete: '(done)',
    incomplete: '(not done)'
  },
  start: {
    title: 'Start from a caregiver or a service',
    description:
      'A booking belongs to one care center. Pick a caregiver you trust, or a service a center offers, then come back here to choose the schedule.',
    caregivers: 'Find a caregiver',
    services: 'Browse services'
  },
  patient: {
    title: 'Who needs care',
    add: 'Add patient profile',
    loading: 'Loading patient profiles…',
    error: 'Could not load your patient profiles.',
    empty: 'You have no active patient profile yet. Add one before booking.'
  },
  provider: {
    title: 'Center & caregiver',
    change: 'Choose another caregiver',
    loading: 'Loading the caregiver…',
    error: 'Could not load this caregiver. Choose another one.',
    centerFallback: 'Care center',
    letCenterAssign: 'Let the center assign a caregiver',
    letCenterAssignHint: 'Use this when the caregiver has no free shift at your time.',
    centerAssigns: 'The center will assign a caregiver when it accepts your request.'
  },
  services: {
    title: 'Services',
    limit: 'Up to {{count}} services',
    loading: 'Loading the center’s services…',
    error: 'Could not load the center’s services.',
    empty: 'This center has no bookable service right now.',
    fromServices: 'You picked this',
    plan: 'Price plan',
    choosePlan: 'Choose a price plan',
    planOption: '{{name}} · {{price}} {{unit}} · {{minutes}} min',
    plansLoading: 'Loading price plans…',
    plansError: 'Could not load price plans.',
    plansEmpty: 'No active price plan for this service.',
    planRequired: 'Choose a price plan for every selected service.'
  },
  schedule: {
    title: 'Schedule',
    type: 'How often',
    date: 'Date',
    startDate: 'First day',
    endDate: 'Last day',
    startTime: 'Start time',
    endTime: 'End time',
    weekdays: 'On these days',
    invalidRange: 'The last day must be on or after the first day.',
    invalidTime: 'The end time must be after the start time.',
    leadTime: 'The first visit must start at least 12 hours from now. Times are in Vietnam time.',
    note: 'Note for the caregiver',
    notePlaceholder: 'Medication reminders, mobility help, how to reach the door…'
  },
  summary: {
    title: 'Price estimate',
    incomplete: 'Choose the patient, at least one service with its price plan and a valid schedule to see the price.',
    quoting: 'Calculating the price…',
    lineDetail: '{{price}} {{unit}} × {{units}} per visit × {{count}} visits',
    occurrences: 'Visits: {{count, number}}',
    moreOccurrences: '+{{count, number}} more',
    total: 'Total',
    deposit: 'Estimated deposit ({{percent}}%)',
    submit: 'Send booking request',
    submitting: 'Sending…',
    nextSteps: 'Nothing is charged now. After the center accepts, pay the deposit before the due time to confirm.'
  }
}

export const bookingVi = {
  documentTitle: 'Đặt lịch chăm sóc tại nhà | CareConnect',
  breadcrumb: {
    label: 'Đường dẫn',
    home: 'Trang chủ',
    bookings: 'Lịch đặt của tôi',
    current: 'Đặt lịch mới'
  },
  header: {
    title: 'Đặt lịch chăm sóc tại nhà',
    subtitle: 'Chọn người bệnh, dịch vụ và lịch chăm sóc. Trung tâm duyệt yêu cầu, sau đó bạn đặt cọc để xác nhận.'
  },
  stepper: {
    label: 'Tiến độ đặt lịch',
    patient: 'Người bệnh',
    provider: 'Trung tâm & người chăm sóc',
    services: 'Dịch vụ',
    schedule: 'Lịch chăm sóc',
    confirm: 'Gửi yêu cầu',
    complete: '(đã xong)',
    incomplete: '(chưa xong)'
  },
  start: {
    title: 'Bắt đầu từ người chăm sóc hoặc dịch vụ',
    description:
      'Mỗi lịch đặt thuộc về một trung tâm chăm sóc. Hãy chọn người chăm sóc bạn tin tưởng, hoặc một dịch vụ của trung tâm, rồi quay lại đây để chọn lịch.',
    caregivers: 'Tìm người chăm sóc',
    services: 'Xem dịch vụ'
  },
  patient: {
    title: 'Người cần chăm sóc',
    add: 'Thêm hồ sơ người bệnh',
    loading: 'Đang tải hồ sơ người bệnh…',
    error: 'Không tải được hồ sơ người bệnh.',
    empty: 'Bạn chưa có hồ sơ người bệnh đang hoạt động. Hãy thêm hồ sơ trước khi đặt lịch.'
  },
  provider: {
    title: 'Trung tâm & người chăm sóc',
    change: 'Chọn người chăm sóc khác',
    loading: 'Đang tải người chăm sóc…',
    error: 'Không tải được người chăm sóc này. Hãy chọn người khác.',
    centerFallback: 'Trung tâm chăm sóc',
    letCenterAssign: 'Để trung tâm phân công người chăm sóc',
    letCenterAssignHint: 'Chọn khi người chăm sóc không có ca trống vào giờ bạn muốn.',
    centerAssigns: 'Trung tâm sẽ phân công người chăm sóc khi duyệt yêu cầu của bạn.'
  },
  services: {
    title: 'Dịch vụ',
    limit: 'Tối đa {{count}} dịch vụ',
    loading: 'Đang tải dịch vụ của trung tâm…',
    error: 'Không tải được dịch vụ của trung tâm.',
    empty: 'Trung tâm hiện chưa có dịch vụ nào nhận đặt lịch.',
    fromServices: 'Bạn đã chọn',
    plan: 'Gói giá',
    choosePlan: 'Chọn gói giá',
    planOption: '{{name}} · {{price}} {{unit}} · {{minutes}} phút',
    plansLoading: 'Đang tải gói giá…',
    plansError: 'Không tải được gói giá.',
    plansEmpty: 'Dịch vụ chưa có gói giá đang áp dụng.',
    planRequired: 'Hãy chọn gói giá cho mỗi dịch vụ đã chọn.'
  },
  schedule: {
    title: 'Lịch chăm sóc',
    type: 'Tần suất',
    date: 'Ngày',
    startDate: 'Ngày đầu',
    endDate: 'Ngày cuối',
    startTime: 'Giờ bắt đầu',
    endTime: 'Giờ kết thúc',
    weekdays: 'Vào các thứ',
    invalidRange: 'Ngày cuối phải bằng hoặc sau ngày đầu.',
    invalidTime: 'Giờ kết thúc phải sau giờ bắt đầu.',
    leadTime: 'Buổi đầu tiên phải bắt đầu sau ít nhất 12 giờ kể từ bây giờ. Giờ tính theo giờ Việt Nam.',
    note: 'Ghi chú cho người chăm sóc',
    notePlaceholder: 'Nhắc uống thuốc, hỗ trợ đi lại, cách vào nhà…'
  },
  summary: {
    title: 'Báo giá dự kiến',
    incomplete: 'Chọn người bệnh, ít nhất một dịch vụ kèm gói giá và lịch hợp lệ để xem giá.',
    quoting: 'Đang tính giá…',
    lineDetail: '{{price}} {{unit}} × {{units}} mỗi buổi × {{count}} buổi',
    occurrences: 'Số buổi chăm sóc: {{count, number}}',
    moreOccurrences: 'và {{count, number}} buổi nữa',
    total: 'Tổng cộng',
    deposit: 'Tiền cọc dự kiến ({{percent}}%)',
    submit: 'Gửi yêu cầu đặt lịch',
    submitting: 'Đang gửi…',
    nextSteps: 'Chưa thu tiền lúc này. Sau khi trung tâm duyệt, hãy đặt cọc trước hạn để xác nhận lịch.'
  }
}
