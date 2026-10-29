export const bookingEn = {
  documentTitle: 'Book home care | CareConnect',
  breadcrumb: {
    label: 'Breadcrumb',
    home: 'Home',
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
  patient: {
    title: 'Who needs care',
    description: 'Choose one of your family members’ patient profiles.',
    add: 'Add patient profile',
    loading: 'Loading patient profiles…',
    error: 'Could not load your patient profiles.',
    empty: 'You have no active patient profile yet. Add one before booking.'
  },
  provider: {
    title: 'Center & caregiver',
    description: 'Pick a care center, then a caregiver you trust or let the center assign one.',
    loading: 'Loading care centers and caregivers…',
    error: 'Could not load care centers. Try again later.',
    empty: 'No care center is taking bookings right now.',
    center: 'Care center',
    chooseCenter: 'Choose a care center',
    caregiver: 'Caregiver',
    experience: '{{years}} yrs experience',
    centerFallback: 'Care center',
    letCenterAssign: 'Let the center assign a caregiver',
    letCenterAssignHint: 'The center picks a suitable caregiver when it accepts your request.'
  },
  services: {
    title: 'Services',
    description: 'Tick the services you need and choose a price plan for each.',
    chooseCenter: 'Choose a care center first to see its services.',
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
  },
  debt: {
    message: 'You have an overdue invoice. New bookings open again once it is paid.',
    pay: 'Pay the invoice'
  }
}

export const bookingVi = {
  documentTitle: 'Đặt lịch chăm sóc tại nhà | CareConnect',
  breadcrumb: {
    label: 'Đường dẫn',
    home: 'Trang chủ',
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
  patient: {
    title: 'Người cần chăm sóc',
    description: 'Chọn một hồ sơ người thân cần được chăm sóc.',
    add: 'Thêm hồ sơ người bệnh',
    loading: 'Đang tải hồ sơ người bệnh…',
    error: 'Không tải được hồ sơ người bệnh.',
    empty: 'Bạn chưa có hồ sơ người bệnh đang hoạt động. Hãy thêm hồ sơ trước khi đặt lịch.'
  },
  provider: {
    title: 'Trung tâm & người chăm sóc',
    description: 'Chọn trung tâm chăm sóc, rồi chọn người chăm sóc bạn tin tưởng hoặc để trung tâm phân công.',
    loading: 'Đang tải trung tâm và người chăm sóc…',
    error: 'Không tải được danh sách trung tâm. Vui lòng thử lại sau.',
    empty: 'Hiện chưa có trung tâm nào nhận đặt lịch.',
    center: 'Trung tâm chăm sóc',
    chooseCenter: 'Chọn trung tâm chăm sóc',
    caregiver: 'Người chăm sóc',
    experience: '{{years}} năm kinh nghiệm',
    centerFallback: 'Trung tâm chăm sóc',
    letCenterAssign: 'Để trung tâm phân công người chăm sóc',
    letCenterAssignHint: 'Trung tâm chọn người phù hợp khi duyệt yêu cầu của bạn.'
  },
  services: {
    title: 'Dịch vụ',
    description: 'Đánh dấu dịch vụ cần dùng và chọn gói giá cho từng dịch vụ.',
    chooseCenter: 'Chọn trung tâm chăm sóc trước để xem dịch vụ.',
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
  },
  debt: {
    message: 'Bạn có hóa đơn quá hạn. Thanh toán xong mới đặt lịch mới được.',
    pay: 'Thanh toán hóa đơn'
  }
}
