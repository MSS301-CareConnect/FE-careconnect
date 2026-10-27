export const caregiverScheduleVi = {
  navRange: 'Khoảng thời gian hiển thị',
  documentTitle: 'Lịch trực Điều dưỡng | CareConnect',
  title: 'Lịch trực & Phân ca Điều dưỡng',
  breadcrumb: 'Đường dẫn lịch trực',
  demo: 'Bản xem thử • Lịch, tiến độ và thu nhập là dữ liệu mẫu tại ngày {{date}}. Chưa phải lịch phân ca thực tế.',
  list: 'Danh sách',
  calendar: 'Lịch biểu',
  view: 'Chế độ xem lịch trực',
  filters: 'Bộ lọc',
  previous: 'Tháng trước',
  next: 'Tháng sau',
  window: 'Lịch {{start}} – {{end}} • {{count, number}} ca đã xếp',
  overview: 'Sắp tới',
  today: 'Hôm nay ({{date}})',
  tomorrow: 'Ngày mai ({{date}})',
  week: 'Tuần hiển thị',
  month: 'Tháng này',
  day: 'Ngày đã chọn',
  dateChoice: 'Xem lịch ngày {{date}}',
  shifts: '{{count, number}} ca',
  rest: 'Nghỉ',
  filter: {
    status: 'Trạng thái ca trực',
    search: 'Tìm bệnh nhân',
    placeholder: 'Tên bệnh nhân...',
    all: 'Tất cả trạng thái',
    reset: 'Đặt lại bộ lọc',
    close: 'Đóng bộ lọc'
  },
  status: { ongoing: 'Đang diễn ra', confirmed: 'Đã xác nhận', upcoming: 'Sắp diễn ra', completed: 'Đã hoàn thành' },
  progress: {
    target: 'Chỉ tiêu',
    title: 'Tiến độ hôm nay (mẫu)',
    sessions: '{{active}} ca đang trực • {{next}} ca chiều',
    hours: 'Hoàn tất {{done}}/{{total}} giờ tiêu chuẩn hôm nay',
    extra: 'Đăng ký nhận thêm ca trống (+{{amount}}/ca)',
    leave: 'Báo bận / Xin nghỉ'
  },
  group: {
    today: 'Hôm nay – {{date}}',
    tomorrow: 'Ngày mai – {{date}}',
    summary: '{{count, number}} ca trực • {{hours}} tiếng'
  },
  card: {
    age: '{{age}} tuổi',
    duration: '({{hours}} tiếng)',
    insurance: 'Thông tin bảo hiểm chưa được xác nhận',
    distance: 'Khoảng cách mẫu: {{distance}} km',
    recurring: 'Lịch mẫu định kỳ: {{count, number}} buổi / tuần',
    guardian: 'Người giám hộ: {{name}}',
    map: 'Bản đồ chỉ đường',
    checklist: 'Tình trạng mẫu: Đã đo huyết áp & Nhắc uống thuốc sáng',
    checklistCount: 'Đã xong {{done}}/{{total}} mục công việc (mẫu)',
    call: 'Gọi người nhà',
    report: 'Vào ca / Báo cáo',
    note: 'Ghi chú điều dưỡng',
    route: 'Xem lộ trình di chuyển',
    record: 'Xem bệnh án',
    gps: 'Chỉ đường'
  },
  patients: {
    a: {
      name: 'Cụ Nguyễn Văn A',
      tag: 'VIP HomeCare',
      service: 'Chăm sóc phục hồi vận động & Uống thuốc',
      guardian: 'Anh Bình (0912.xxx.xxx)',
      address: 'Căn hộ 804, Tháp Ruby, Sunrise City, Đường Nguyễn Hữu Thọ, P. Tân Hưng, Q.7'
    },
    c: {
      name: 'Bà Trần Thị C',
      tag: 'Hậu phẫu',
      service: 'Chăm sóc vết mổ & Tiêm truyền định kỳ',
      guardian: 'Chị Mai (Con gái)',
      address: '142/5 Nguyễn Thị Thập, P. Bình Thuận, Quận 7, TP. Hồ Chí Minh'
    },
    b: {
      name: 'Bệnh nhân Trần B',
      tag: 'Chăm sóc định kỳ',
      service: 'Y tế cá nhân & Kiểm soát đường huyết',
      guardian: 'Người nhà bệnh nhân',
      address: '56 Đường số 10, KDC Him Lam, P. Tân Hưng, Quận 7'
    }
  },
  summary: {
    title: 'Tổng kết tuần hiển thị',
    sample: 'Thống kê mẫu',
    time: 'Ca trực & Thời gian',
    hours: '{{hours}} giờ tiêu chuẩn',
    income: 'Thu nhập dự kiến (mẫu)',
    allowance: '+ Q.7 Trợ cấp',
    completion: 'Tiến độ hoàn thành tuần',
    completed: '{{done}}/{{total}} ca trực ({{percent}})',
    rating: '{{score}} / {{max}}',
    reviews: '({{count, number}} đánh giá mẫu)',
    excellent: 'Xuất sắc'
  },
  open: {
    title: 'Ca mở chờ tiếp nhận',
    area: 'Khu vực Q.7',
    accept: 'Nhận ca ngay',
    morning: 'Ca sáng – {{date}}',
    evening: 'Ca tối – {{date}}',
    elder: 'Cụ Lê Thị H ({{age}} tuổi) • Sunrise City',
    child: 'Bé Hoàng Long ({{age}} tuổi) • KDC Him Lam'
  },
  support: {
    title: 'Hỗ trợ Điều dưỡng',
    description: 'Thông tin tổng đài và giao thông sẽ sớm được cập nhật.'
  },
  empty: {
    title: 'Không có ca trực phù hợp',
    description: 'Không có ca mẫu trong khoảng thời gian hoặc bộ lọc đã chọn.',
    reset: 'Về lịch mẫu ban đầu'
  },
  calendarLabel: 'Lịch ca trực theo tháng',
  calendarHint: 'Chọn một ngày để xem danh sách ca trực.',
  calendarCount: '{{count, number}} ca trực vào {{date}}'
} as const

export const caregiverScheduleEn = {
  navRange: 'Schedule date range',
  documentTitle: 'Caregiver schedule | CareConnect',
  title: 'Caregiver Schedule & Assignments',
  breadcrumb: 'Schedule breadcrumb',
  demo: 'Preview • Schedules, progress and earnings are sample data as of {{date}}. These are not real shift assignments.',
  list: 'List',
  calendar: 'Calendar',
  view: 'Schedule view',
  filters: 'Filters',
  previous: 'Previous month',
  next: 'Next month',
  window: 'Schedule {{start}} – {{end}} • {{count, number}} assigned sessions',
  overview: 'Upcoming overview',
  today: 'Today ({{date}})',
  tomorrow: 'Tomorrow ({{date}})',
  week: 'Displayed week',
  month: 'This month',
  day: 'Selected day',
  dateChoice: 'View schedule for {{date}}',
  shifts: '{{count, number}} sessions',
  rest: 'Off',
  filter: {
    status: 'Session status',
    search: 'Find patient',
    placeholder: 'Patient name...',
    all: 'All statuses',
    reset: 'Reset filters',
    close: 'Close filters'
  },
  status: { ongoing: 'In progress', confirmed: 'Confirmed', upcoming: 'Upcoming', completed: 'Completed' },
  progress: {
    target: 'Target',
    title: 'Today’s progress (sample)',
    sessions: '{{active}} active session • {{next}} afternoon session',
    hours: '{{done}}/{{total}} standard hours completed today',
    extra: 'Register for open sessions (+{{amount}}/session)',
    leave: 'Unavailable / Request leave'
  },
  group: {
    today: 'Today – {{date}}',
    tomorrow: 'Tomorrow – {{date}}',
    summary: '{{count, number}} sessions • {{hours}} hours'
  },
  card: {
    age: '{{age}} years old',
    duration: '({{hours}} hours)',
    insurance: 'Insurance details are not confirmed yet',
    distance: 'Sample distance: {{distance}} km',
    recurring: 'Sample recurring schedule: {{count, number}} sessions / week',
    guardian: 'Guardian: {{name}}',
    map: 'Directions map',
    checklist: 'Sample status: Blood pressure measured & Morning medication reminder',
    checklistCount: '{{done}}/{{total}} tasks completed (sample)',
    call: 'Call family',
    report: 'Start session / Report',
    note: 'Care notes',
    route: 'View travel route',
    record: 'View medical record',
    gps: 'Directions'
  },
  patients: {
    a: {
      name: 'Mr. Nguyễn Văn A',
      tag: 'VIP HomeCare',
      service: 'Mobility rehabilitation & Medication assistance',
      guardian: 'Mr. Bình (0912.xxx.xxx)',
      address: 'Apartment 804, Ruby Tower, Sunrise City, Nguyễn Hữu Thọ Street, Tân Hưng Ward, District 7'
    },
    c: {
      name: 'Ms. Trần Thị C',
      tag: 'Postoperative',
      service: 'Surgical wound care & Scheduled infusions',
      guardian: 'Ms. Mai (Daughter)',
      address: '142/5 Nguyễn Thị Thập, Bình Thuận Ward, District 7, HCMC'
    },
    b: {
      name: 'Patient Trần B',
      tag: 'Recurring care',
      service: 'Personal care & Blood glucose monitoring',
      guardian: 'Patient’s family',
      address: '56 Street 10, Him Lam Residential Area, Tân Hưng Ward, District 7'
    }
  },
  summary: {
    title: 'Displayed week summary',
    sample: 'Sample statistics',
    time: 'Sessions & Time',
    hours: '{{hours}} standard hours',
    income: 'Estimated earnings (sample)',
    allowance: '+ District 7 allowance',
    completion: 'Weekly completion progress',
    completed: '{{done}}/{{total}} sessions ({{percent}})',
    rating: '{{score}} / {{max}}',
    reviews: '({{count, number}} sample reviews)',
    excellent: 'Excellent'
  },
  open: {
    title: 'Open sessions',
    area: 'District 7',
    accept: 'Accept session',
    morning: 'Morning – {{date}}',
    evening: 'Evening – {{date}}',
    elder: 'Ms. Lê Thị H ({{age}} years old) • Sunrise City',
    child: 'Hoàng Long ({{age}} years old) • Him Lam Residential Area'
  },
  support: {
    title: 'Caregiver support',
    description: 'Support contacts and traffic updates will be added soon.'
  },
  empty: {
    title: 'No matching sessions',
    description: 'No sample sessions match the selected dates or filters.',
    reset: 'Return to sample schedule'
  },
  calendarLabel: 'Monthly care session calendar',
  calendarHint: 'Select a day to view its care sessions.',
  calendarCount: '{{count, number}} care sessions on {{date}}'
} as const
