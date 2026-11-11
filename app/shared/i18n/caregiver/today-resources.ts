export const caregiverTodayEn = {
  documentTitle: 'Today | CareConnect',
  greeting: {
    morning: 'Good morning, <accent>{{name}}</accent>',
    afternoon: 'Good afternoon, <accent>{{name}}</accent>',
    evening: 'Good evening, <accent>{{name}}</accent>'
  },
  dateLine: '{{weekday}}, {{date}}',
  next: {
    label: 'Next visit',
    now: 'Happening now',
    laterDay: 'Next visit · {{day}}',
    services: 'Services',
    allergyAlert: 'Allergy: {{value}}',
    noAddress: 'No address on this booking'
  },
  timeline: {
    title: 'Today’s visits',
    count: '{{count}} visits',
    empty: 'No other visit today.'
  },
  attention: {
    title: 'Needs your attention',
    toAccept: '{{count}} visits waiting for you to accept',
    toAcceptAction: 'Review',
    requests_one: '{{count}} family is waiting for your answer',
    requests_other: '{{count}} families are waiting for your answer',
    requestsAction: 'Answer',
    shiftClosing: 'Shift sign-up for {{day}} closes soon',
    shiftAction: 'Sign up',
    noCertificates: 'Your profile has no certificate yet',
    expiredCertificate: '{{count}} certificates expired or expiring',
    certificateAction: 'Add certificate',
    allClear: 'All caught up — nothing needs your attention.',
    absences: '{{count}} missed visits to explain',
    absencesAction: 'Explain'
  },
  glance: {
    label: 'Today at a glance',
    today: 'Today {{count}} visits · {{duration}}',
    left: '{{count}} left',
    waiting: '{{count}} waiting for your answer'
  },
  week: {
    title: 'This week',
    otherWeek: 'Selected week',
    range: '{{from}} → {{to}}',
    previous: 'Previous week',
    next: 'Next week',
    backToThisWeek: 'This week',
    visits: 'Visits',
    hours: 'Care hours',
    done: 'Done',
    chart: 'Care hours per day this week — hover or tap a column for its numbers',
    dayCount: '{{day}}: {{count}} visits, {{hours}} hours',
    tooltip: {
      visits: 'Visits',
      hours: 'Care hours',
      done: 'Done',
      upcoming: 'Not done yet',
      missed: 'Missed',
      workHours: 'Working hours'
    },
    legend: {
      done: 'Done',
      upcoming: 'Not done yet',
      missed: 'Missed',
      workHours: 'Working hours'
    },
    fill: 'Working hours filled',
    fillDetail: '{{booked}} / {{registered}} h',
    fillLabel: '{{percent}}% of this week’s working hours are booked'
  },
  empty: {
    title: 'You have no visit today',
    hint: 'Sign up for open shifts so families can book you.',
    action: 'Sign up for shifts',
    upcoming: 'See upcoming visits',
    openShifts: 'Open shifts you can sign up for',
    allShifts: 'See all open shifts'
  },
  loadError: 'Could not load today’s visits.'
}

export const caregiverTodayVi = {
  documentTitle: 'Hôm nay | CareConnect',
  greeting: {
    morning: 'Chào buổi sáng, <accent>{{name}}</accent>',
    afternoon: 'Chào buổi chiều, <accent>{{name}}</accent>',
    evening: 'Chào buổi tối, <accent>{{name}}</accent>'
  },
  dateLine: '{{weekday}}, {{date}}',
  next: {
    label: 'Buổi kế tiếp',
    now: 'Đang diễn ra',
    laterDay: 'Buổi kế tiếp · {{day}}',
    services: 'Dịch vụ',
    allergyAlert: 'Dị ứng: {{value}}',
    noAddress: 'Lịch đặt chưa có địa chỉ'
  },
  timeline: {
    title: 'Các buổi hôm nay',
    count: '{{count}} buổi',
    empty: 'Hôm nay không còn buổi nào khác.'
  },
  attention: {
    title: 'Cần bạn xử lý',
    toAccept: '{{count}} buổi đang chờ bạn nhận',
    toAcceptAction: 'Xem',
    requests_one: '{{count}} yêu cầu đặt lịch đang chờ bạn trả lời',
    requests_other: '{{count}} yêu cầu đặt lịch đang chờ bạn trả lời',
    requestsAction: 'Trả lời',
    shiftClosing: 'Ca ngày {{day}} sắp hết hạn đăng ký',
    shiftAction: 'Đăng ký',
    noCertificates: 'Hồ sơ của bạn chưa có chứng chỉ nào',
    expiredCertificate: '{{count}} chứng chỉ đã hoặc sắp hết hạn',
    certificateAction: 'Thêm chứng chỉ',
    allClear: 'Mọi việc đã ổn — không có gì cần xử lý.',
    absences: '{{count}} buổi vắng ca chưa giải trình',
    absencesAction: 'Giải trình'
  },
  glance: {
    label: 'Tóm tắt hôm nay',
    today: 'Hôm nay {{count}} buổi · {{duration}}',
    left: 'Còn {{count}} buổi',
    waiting: '{{count}} việc chờ bạn trả lời'
  },
  week: {
    title: 'Tuần này',
    otherWeek: 'Tuần đang xem',
    range: '{{from}} → {{to}}',
    previous: 'Tuần trước',
    next: 'Tuần sau',
    backToThisWeek: 'Về tuần này',
    visits: 'Số buổi',
    hours: 'Giờ chăm sóc',
    done: 'Đã xong',
    chart: 'Giờ chăm sóc theo ngày trong tuần — rê chuột hoặc chạm vào cột để xem số liệu',
    dayCount: '{{day}}: {{count}} buổi, {{hours}} giờ',
    tooltip: {
      visits: 'Số buổi',
      hours: 'Giờ chăm sóc',
      done: 'Đã xong',
      upcoming: 'Chưa làm',
      missed: 'Vắng ca',
      workHours: 'Khung giờ làm việc'
    },
    legend: {
      done: 'Đã xong',
      upcoming: 'Chưa làm',
      missed: 'Vắng ca',
      workHours: 'Khung giờ làm việc'
    },
    fill: 'Mức kín khung giờ làm việc',
    fillDetail: '{{booked}} / {{registered}} giờ',
    fillLabel: 'Đã kín {{percent}}% khung giờ làm việc trong tuần'
  },
  empty: {
    title: 'Hôm nay bạn chưa có buổi nào',
    hint: 'Đăng ký các ca đang mở để khách đặt được bạn.',
    action: 'Đăng ký ca',
    upcoming: 'Xem buổi sắp tới',
    openShifts: 'Ca đang mở bạn có thể đăng ký',
    allShifts: 'Xem tất cả ca mở'
  },
  loadError: 'Không tải được các buổi hôm nay.'
}
