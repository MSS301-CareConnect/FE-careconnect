export const managerScheduleVi = {
  title: 'Lịch làm việc & ngày nghỉ',
  subtitle:
    'Ai làm ca nào và ai nghỉ trong từng tuần. Ca được tạo và duyệt ở "Ca làm việc"; ngày nghỉ thêm ngay tại đây hoặc trong hồ sơ người chăm sóc.',
  toolbar: 'Chế độ xem và bộ lọc',
  retry: 'Thử lại',
  loading: 'Đang tải lịch làm việc…',
  error: 'Không thể tải lịch làm việc của trung tâm.',
  empty: 'Trung tâm chưa có người chăm sóc đang hoạt động.',
  emptyWeek: 'Tuần này chưa có ca làm việc nào.',
  emptyHint: 'Ca xuất hiện khi bạn duyệt đăng ký ca của người chăm sóc trong "Ca làm việc".',
  noCenter: 'Tài khoản chưa được gán trung tâm.',
  unknown: 'Không rõ',
  truncated: 'Tuần này có hơn 100 ca, chỉ hiện 100 ca đầu. Hãy lọc theo người chăm sóc để xem đủ.',
  allCaregivers: 'Tất cả người chăm sóc',
  caregiverFilter: 'Lọc theo người chăm sóc',
  onlyBusy: 'Chỉ người có lịch tuần này',
  scheduled: 'Đã xếp ca',
  cancelled: 'Đã hủy',
  past: 'Đã qua',
  view: { label: 'Chế độ xem', team: 'Theo đội', list: 'Danh sách ca', timeOff: 'Ngày nghỉ' },
  week: {
    previous: 'Tuần trước',
    next: 'Tuần sau',
    thisWeek: 'Tuần này',
    range: '{{from}} – {{to}}'
  },
  scope: { label: 'Khoảng thời gian', current: 'Đang & sắp nghỉ', week: 'Trong tuần đang xem', past: 'Đã qua' },
  stats: {
    label: 'Số liệu tuần đang xem',
    shifts: 'Ca trong tuần',
    hours: 'Tổng {{hours}} làm việc',
    noHours: 'Chưa có giờ làm',
    staffed: 'Người có ca',
    staffedHint: 'Số người chăm sóc đang hoạt động có ít nhất một ca',
    onLeave: 'Đang nghỉ hôm nay',
    weekLeaves: '{{count}} lượt nghỉ trong tuần · bấm để xem',
    attention: 'Ca trùng ngày nghỉ',
    clashHint: 'Ca rơi vào ngày nghỉ — hãy đổi người hoặc hủy ca',
    cancelledHint: 'Không có ca trùng · {{count}} ca đã hủy'
  },
  grid: {
    caption: 'Lịch làm việc theo người chăm sóc và ngày trong tuần',
    caregiver: 'Người chăm sóc',
    today: 'Hôm nay',
    weekHours: '{{hours}} trong tuần',
    noShift: 'Chưa có ca',
    leaveAllDay: 'Nghỉ cả ngày',
    leaveHours: 'Nghỉ {{start}}–{{end}}',
    clash: 'Ca này trùng ngày nghỉ của người chăm sóc',
    shiftLabel: 'Ca {{type}} {{start}}–{{end}}, {{status}}. Mở ca'
  },
  legend: {
    label: 'Chú thích',
    shift: 'Ca làm việc',
    leave: 'Ngày nghỉ',
    clash: 'Ca trùng ngày nghỉ',
    cancelled: 'Ca đã hủy'
  },
  list: {
    caption: 'Danh sách ca làm việc trong tuần',
    columns: {
      day: 'Ngày',
      time: 'Giờ',
      caregiver: 'Người chăm sóc',
      type: 'Loại ca',
      status: 'Trạng thái',
      actions: 'Thao tác'
    },
    clash: 'Trùng ngày nghỉ',
    cancelReason: 'Lý do hủy: {{reason}}',
    openShift: 'Mở ca'
  },
  timeOffs: {
    caption: 'Ngày nghỉ của người chăm sóc trong trung tâm',
    columns: {
      caregiver: 'Người chăm sóc',
      period: 'Thời gian',
      length: 'Thời lượng',
      reason: 'Lý do',
      status: 'Trạng thái',
      actions: 'Thao tác'
    },
    empty: {
      current: 'Không ai đang nghỉ hoặc sắp nghỉ.',
      week: 'Không có ngày nghỉ trong tuần này.',
      past: 'Chưa có ngày nghỉ nào đã qua.'
    },
    emptyHint: 'Ngày nghỉ do bạn hoặc người chăm sóc thêm sẽ hiện ở đây.'
  }
} as const

export const managerScheduleEn = {
  title: 'Work schedule & time off',
  subtitle:
    'Who works which shift and who is off, week by week. Shifts are created and approved in "Work shifts"; add time off here or on the caregiver profile.',
  toolbar: 'View and filters',
  retry: 'Try again',
  loading: 'Loading the work schedule…',
  error: 'Unable to load the center’s work schedule.',
  empty: 'The center has no active caregivers yet.',
  emptyWeek: 'No work shifts this week.',
  emptyHint: 'Shifts appear once you approve caregiver sign-ups in "Work shifts".',
  noCenter: 'Your account has no assigned center.',
  unknown: 'Unknown',
  truncated: 'This week has more than 100 shifts; only the first 100 are shown. Filter by caregiver to see them all.',
  allCaregivers: 'All caregivers',
  caregiverFilter: 'Filter by caregiver',
  onlyBusy: 'Only people with a schedule this week',
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
  past: 'Past',
  view: { label: 'View', team: 'By team', list: 'Shift list', timeOff: 'Time off' },
  week: {
    previous: 'Previous week',
    next: 'Next week',
    thisWeek: 'This week',
    range: '{{from}} – {{to}}'
  },
  scope: { label: 'Period', current: 'Current & upcoming', week: 'In the week shown', past: 'Past' },
  stats: {
    label: 'Numbers of the week shown',
    shifts: 'Shifts this week',
    hours: '{{hours}} of work in total',
    noHours: 'No working hours yet',
    staffed: 'People with shifts',
    staffedHint: 'Active caregivers with at least one shift',
    onLeave: 'On leave today',
    weekLeaves: '{{count}} time off this week · click to view',
    attention: 'Shifts during time off',
    clashHint: 'Shifts fall in time off — reassign or cancel them',
    cancelledHint: 'No clashes · {{count}} cancelled shifts'
  },
  grid: {
    caption: 'Work schedule by caregiver and day of the week',
    caregiver: 'Caregiver',
    today: 'Today',
    weekHours: '{{hours}} this week',
    noShift: 'No shifts',
    leaveAllDay: 'Off all day',
    leaveHours: 'Off {{start}}–{{end}}',
    clash: 'This shift falls in the caregiver’s time off',
    shiftLabel: '{{type}} shift {{start}}–{{end}}, {{status}}. Open the shift'
  },
  legend: {
    label: 'Legend',
    shift: 'Work shift',
    leave: 'Time off',
    clash: 'Shift during time off',
    cancelled: 'Cancelled shift'
  },
  list: {
    caption: 'Work shifts of the week',
    columns: {
      day: 'Day',
      time: 'Time',
      caregiver: 'Caregiver',
      type: 'Shift type',
      status: 'Status',
      actions: 'Actions'
    },
    clash: 'During time off',
    cancelReason: 'Cancel reason: {{reason}}',
    openShift: 'Open shift'
  },
  timeOffs: {
    caption: 'Time off of the center’s caregivers',
    columns: {
      caregiver: 'Caregiver',
      period: 'Period',
      length: 'Length',
      reason: 'Reason',
      status: 'Status',
      actions: 'Actions'
    },
    empty: {
      current: 'Nobody is or will be on leave.',
      week: 'No time off this week.',
      past: 'No past time off yet.'
    },
    emptyHint: 'Time off added by you or a caregiver shows up here.'
  }
} as const
