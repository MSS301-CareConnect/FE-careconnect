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
    description: 'Pick the care center first; its caregivers are listed after you choose services.',
    loading: 'Loading care centers and caregivers…',
    error: 'Could not load care centers. Try again later.',
    empty: 'No care center is taking bookings right now.',
    center: 'Care center',
    chooseCenter: 'Choose a care center',
    caregiver: 'Caregiver',
    experience: '{{years}} yrs experience',
    centerFallback: 'Care center',
    letCenterAssign: 'Let the center assign a caregiver',
    letCenterAssignHint: 'The center picks a suitable caregiver after confirming your request.'
  },
  caregiver: {
    chooseServicesFirst: 'Choose services first to see only the caregivers who provide all of them.',
    filtered: 'Only caregivers who provide every service you chose.',
    error: 'Could not load the center’s caregivers.',
    empty: 'No caregiver of this center provides all the chosen services right now.',
    shiftRequired: 'A shift booking needs a caregiver: choose one to see their shifts below.'
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
    type: 'Booking type',
    typeHint: {
      SHIFT: 'One published shift of the caregiver you choose. Pay 100% once the center confirms.',
      RECURRING:
        'Repeats daily or on chosen weekdays. Pay a deposit once a caregiver is assigned, the rest before the first visit.',
      CUSTOM:
        'Pick each visit with its own time. Pay a deposit once a caregiver is assigned, the rest before the first visit.'
    },
    frequency: 'How often',
    date: 'Date',
    customSlots: 'Visits',
    customHint: 'Each visit has its own date and time; visits must not overlap.',
    slotCount: '{{count}} of {{max}} visits',
    slotLabel: 'Visit {{number}}',
    addSlot: 'Add a visit',
    removeSlot: 'Remove visit {{number}}',
    overlap: 'Visit {{number}} overlaps another visit.',
    shiftNeedsCaregiver: 'Choose a caregiver above to see the shifts you can book.',
    shiftLoading: 'Loading the caregiver’s shifts…',
    shiftError: 'Could not load the caregiver’s shifts.',
    shiftEmpty: 'This caregiver has no open shift in the next 31 days.',
    shiftChoose: 'Choose a shift',
    shiftOption: '{{date}} · {{start}}–{{end}}',
    shiftHeld: 'Already booked',
    startDate: 'First day',
    endDate: 'Last day',
    startTime: 'Start time',
    endTime: 'End time',
    weekdays: 'On these days',
    invalidRange: 'The last day must be on or after the first day.',
    invalidTime: 'The end time must be after the start time.',
    leadTime:
      'Book at least {{shift}} h ahead for a shift, {{recurring}} h for recurring and {{custom}} h for custom visits. Times are in Vietnam time.',
    leadTimeGeneric: 'The center’s policy sets how far ahead you must book. Times are in Vietnam time.',
    note: 'Note for the caregiver',
    notePlaceholder: 'Medication reminders, mobility help, how to reach the door…'
  },
  summary: {
    title: 'Price estimate',
    perVisit: 'Per visit',
    incomplete: 'Choose the patient, at least one service with its price plan and a valid schedule to see the price.',
    quoting: 'Calculating the price…',
    lineDetail: '{{price}} {{unit}} × {{units}} per visit × {{count}} visits',
    occurrences: 'Visits: {{count, number}}',
    moreOccurrences: '+{{count, number}} more',
    total: 'Total',
    deposit: 'Estimated first payment · {{percent}}%',
    depositHint: 'Pay only after the center confirms and a caregiver is assigned.',
    remainingDue: 'The remaining {{amount}} is due by {{time}}, before the first visit.',
    submit: 'Send booking request',
    submitting: 'Sending…',
    nextSteps:
      'Nothing is charged now. Once the center confirms and a caregiver is assigned, pay before the due time to keep the booking.'
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
    description: 'Chọn trung tâm chăm sóc trước; người chăm sóc được liệt kê sau khi bạn chọn dịch vụ.',
    loading: 'Đang tải trung tâm và người chăm sóc…',
    error: 'Không tải được danh sách trung tâm. Vui lòng thử lại sau.',
    empty: 'Hiện chưa có trung tâm nào nhận đặt lịch.',
    center: 'Trung tâm chăm sóc',
    chooseCenter: 'Chọn trung tâm chăm sóc',
    caregiver: 'Người chăm sóc',
    experience: '{{years}} năm kinh nghiệm',
    centerFallback: 'Trung tâm chăm sóc',
    letCenterAssign: 'Để trung tâm phân công người chăm sóc',
    letCenterAssignHint: 'Trung tâm chọn người phù hợp sau khi xác nhận yêu cầu của bạn.'
  },
  caregiver: {
    chooseServicesFirst: 'Chọn dịch vụ trước để chỉ thấy người chăm sóc làm được tất cả dịch vụ đó.',
    filtered: 'Chỉ hiện người chăm sóc làm được mọi dịch vụ bạn đã chọn.',
    error: 'Không tải được người chăm sóc của trung tâm.',
    empty: 'Hiện chưa có người chăm sóc nào của trung tâm làm được tất cả dịch vụ đã chọn.',
    shiftRequired: 'Đặt theo ca cần chọn người chăm sóc: hãy chọn một người để xem các ca bên dưới.'
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
    type: 'Loại lịch đặt',
    typeHint: {
      SHIFT:
        'Đặt đúng một ca làm việc đã công bố của người chăm sóc bạn chọn. Thanh toán 100% sau khi trung tâm xác nhận.',
      RECURRING:
        'Lặp lại hằng ngày hoặc vào các thứ đã chọn. Đặt cọc khi đã có người chăm sóc, trả phần còn lại trước buổi đầu.',
      CUSTOM:
        'Tự chọn từng buổi với khung giờ riêng. Đặt cọc khi đã có người chăm sóc, trả phần còn lại trước buổi đầu.'
    },
    frequency: 'Tần suất',
    date: 'Ngày',
    customSlots: 'Các buổi chăm sóc',
    customHint: 'Mỗi buổi có ngày và khung giờ riêng; các buổi không được trùng giờ nhau.',
    slotCount: '{{count}}/{{max}} buổi',
    slotLabel: 'Buổi {{number}}',
    addSlot: 'Thêm buổi',
    removeSlot: 'Bỏ buổi {{number}}',
    overlap: 'Buổi {{number}} trùng giờ với một buổi khác.',
    shiftNeedsCaregiver: 'Chọn người chăm sóc ở mục phía trên để xem các ca có thể đặt.',
    shiftLoading: 'Đang tải các ca của người chăm sóc…',
    shiftError: 'Không tải được các ca của người chăm sóc.',
    shiftEmpty: 'Người chăm sóc chưa có ca trống trong 31 ngày tới.',
    shiftChoose: 'Chọn ca',
    shiftOption: '{{date}} · {{start}}–{{end}}',
    shiftHeld: 'Đã có người đặt',
    startDate: 'Ngày đầu',
    endDate: 'Ngày cuối',
    startTime: 'Giờ bắt đầu',
    endTime: 'Giờ kết thúc',
    weekdays: 'Vào các thứ',
    invalidRange: 'Ngày cuối phải bằng hoặc sau ngày đầu.',
    invalidTime: 'Giờ kết thúc phải sau giờ bắt đầu.',
    leadTime:
      'Đặt trước tối thiểu: theo ca {{shift}} giờ, định kỳ {{recurring}} giờ, tự chọn buổi {{custom}} giờ. Giờ tính theo giờ Việt Nam.',
    leadTimeGeneric: 'Thời gian đặt trước tối thiểu theo chính sách của trung tâm. Giờ tính theo giờ Việt Nam.',
    note: 'Ghi chú cho người chăm sóc',
    notePlaceholder: 'Nhắc uống thuốc, hỗ trợ đi lại, cách vào nhà…'
  },
  summary: {
    title: 'Báo giá dự kiến',
    perVisit: 'Giá mỗi buổi',
    incomplete: 'Chọn người bệnh, ít nhất một dịch vụ kèm gói giá và lịch hợp lệ để xem giá.',
    quoting: 'Đang tính giá…',
    lineDetail: '{{price}} {{unit}} × {{units}} mỗi buổi × {{count}} buổi',
    occurrences: 'Số buổi chăm sóc: {{count, number}}',
    moreOccurrences: 'và {{count, number}} buổi nữa',
    total: 'Tổng cộng',
    deposit: 'Thanh toán đầu dự kiến · {{percent}}%',
    depositHint: 'Chỉ thanh toán sau khi trung tâm xác nhận và đã có người chăm sóc.',
    remainingDue: 'Phần còn lại {{amount}} trả trước {{time}}, trước buổi đầu tiên.',
    submit: 'Gửi yêu cầu đặt lịch',
    submitting: 'Đang gửi…',
    nextSteps:
      'Chưa thu tiền lúc này. Khi trung tâm xác nhận và có người chăm sóc, hãy thanh toán trước hạn để giữ lịch.'
  },
  debt: {
    message: 'Bạn có hóa đơn quá hạn. Thanh toán xong mới đặt lịch mới được.',
    pay: 'Thanh toán hóa đơn'
  }
}
