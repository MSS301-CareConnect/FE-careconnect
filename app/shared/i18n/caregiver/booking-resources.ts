// Caregiver: buổi gom theo booking, trang chi tiết booking, nhận nhanh, xin hủy buổi / cả ngày (2026-11-09, 2026-11-10).
export const caregiverBookingVi = {
  groups: {
    openLabel: 'Mở lịch {{code}} của {{name}}',
    visits: '{{count}} buổi',
    next: 'Buổi kế tiếp: {{time}}',
    range: '{{from}} → {{to}}',
    toAnswer: '{{count}} buổi cần xác nhận',
    replacing: '{{count}} buổi chờ thay người',
    missed: '{{count}} buổi vắng ca',
    acceptAll: 'Nhận tất cả ({{count}})',
    open: 'Xem các buổi',
    pagination: 'Trang danh sách lịch'
  },
  page: {
    documentTitle: 'Lịch {{code}}',
    crumb: 'Lịch {{code}}',
    title: 'Lịch chăm sóc {{name}}',
    loading: 'Đang tải các buổi…',
    error: 'Chưa tải được các buổi của lịch này.',
    notFound: 'Lịch này không còn buổi nào được giao cho bạn.',
    back: 'Về danh sách buổi',
    summaryLabel: 'Tóm tắt lịch chăm sóc',
    period: '{{from}} → {{to}}',
    services: 'Dịch vụ của lịch',
    stats: {
      total: 'Tổng buổi',
      upcoming: 'Sắp tới',
      toAccept: 'Chờ bạn nhận',
      done: 'Đã xong'
    },
    views: {
      legend: 'Cách xem các buổi',
      days: 'Theo ngày',
      calendar: 'Lịch tháng'
    },
    scope: {
      legend: 'Buổi sắp tới hay đã qua',
      upcoming: 'Sắp tới ({{count}})',
      past: 'Đã qua ({{count}})'
    },
    noUpcoming: 'Không còn buổi nào sắp tới.',
    noPast: 'Chưa có buổi nào đã qua.',
    acceptAll: 'Nhận tất cả ({{count}} buổi)',
    withdrawAll: 'Xin hủy các buổi còn lại',
    withdrawAllHint: 'Chỉ hủy được ngày có mọi buổi còn hơn 24 giờ; ngày có nhiều buổi phải hủy cả ngày.'
  },
  day: {
    summary: '{{count}} buổi · {{span}} · {{duration}}',
    services: 'Dịch vụ trong ngày',
    acceptDay: 'Nhận cả ngày ({{count}})',
    withdrawDay: 'Xin hủy cả ngày',
    withdrawOne: 'Xin hủy buổi',
    pagination: 'Trang các ngày chăm sóc'
  },
  row: {
    visitNo: 'Buổi {{number}}',
    open: 'Mở buổi {{number}}: {{services}}',
    noService: 'Chăm sóc theo lịch'
  },
  calendar: {
    previous: 'Tháng trước',
    next: 'Tháng sau',
    monthSummary: '{{days}} ngày có buổi · {{count}} buổi trong tháng',
    count: '{{count}} buổi',
    dayLabel: '{{day}}: {{count}} buổi, {{state}}',
    pick: 'Chọn một ngày có buổi trên lịch để xem chi tiết.',
    legend: 'Chú thích màu',
    states: {
      toAccept: 'Chờ bạn nhận',
      replacing: 'Chờ thay người',
      inProgress: 'Đang làm',
      upcoming: 'Đã nhận',
      missed: 'Vắng ca',
      done: 'Đã xong',
      cancelled: 'Đã hủy'
    }
  },
  accept: {
    title: 'Nhận {{count}} buổi',
    intro:
      'Bạn xác nhận sẽ đến làm các buổi dưới đây. Nếu có buổi vừa được đổi người, cả lệnh sẽ không áp dụng để bạn xem lại.',
    confirm: 'Nhận {{count}} buổi',
    cancel: 'Để sau',
    done: 'Đã nhận {{count}} buổi'
  },
  badge: {
    replacing: 'Đã xin hủy — chờ thay người'
  },
  withdraw: {
    sectionTitle: 'Không làm được buổi này?',
    singleHint: 'Bạn có thể xin hủy buổi này nếu còn hơn 24 giờ mới bắt đầu.',
    wholeDayHint:
      'Ngày {{day}} có {{count}} buổi của lịch này nên chỉ xin hủy được cả ngày, không hủy lẻ từng buổi — khách không phải gặp hai người khác nhau trong một ngày.',
    open: 'Xin hủy buổi này',
    openDay: 'Xin hủy cả ngày ({{count}} buổi)',
    title: 'Xin hủy buổi chăm sóc',
    titleDay: 'Xin hủy cả ngày {{day}}',
    titleRemaining: 'Xin hủy các buổi còn lại',
    intro:
      'Trung tâm (hoặc hệ thống) sẽ phân người khác cho các buổi này. Bạn vẫn đứng tên buổi cho tới khi có người thay, nhưng không bắt đầu được ca.',
    wholeDayRule: 'Ngày có nhiều buổi được hủy cùng nhau, không tách lẻ.',
    visits: 'Các buổi sẽ xin hủy',
    count: '{{count}} buổi',
    kept: '{{count}} buổi bạn vẫn phụ trách',
    keptHint: 'Các ngày có buổi còn dưới 24 giờ không hủy được — liên hệ trung tâm nếu có việc gấp.',
    none: 'Không còn buổi nào đủ điều kiện (phải còn hơn 24 giờ mới bắt đầu).',
    tooLate: 'Chỉ hủy được buổi còn hơn 24 giờ mới bắt đầu. Liên hệ trung tâm nếu có việc gấp.',
    tooLateDay: 'Ngày này có buổi còn chưa tới 24 giờ nên không hủy được cả ngày. Liên hệ trung tâm nếu có việc gấp.',
    alreadyRequested: 'Bạn đã xin hủy buổi này, đang chờ trung tâm thay người.',
    reasonTitle: 'Lý do',
    reasons: {
      PERSONAL: 'Việc cá nhân',
      OTHER: 'Lý do khác'
    },
    reasonHints: {
      PERSONAL: 'Ốm, việc gia đình, việc đột xuất',
      OTHER: 'Ghi rõ để trung tâm nắm được'
    },
    detail: 'Ghi chú cho trung tâm',
    detailOptional: 'Ghi chú cho trung tâm (không bắt buộc)',
    detailPlaceholder: 'Ví dụ: con nhỏ bị ốm, cần ở nhà chăm.',
    detailRequired: 'Vui lòng ghi rõ lý do.',
    cancel: 'Quay lại',
    submit: 'Gửi yêu cầu hủy ({{count}} buổi)',
    sent: 'Đã gửi yêu cầu hủy {{count}} buổi, trung tâm sẽ phân người khác.',
    errors: {
      e5260: 'Có buổi còn chưa tới 24 giờ nữa là bắt đầu nên không hủy được.',
      e5261: 'Bạn đã xin hủy buổi này rồi.',
      e5262: 'Buổi này không còn hủy được.',
      e5263: 'Vui lòng ghi rõ lý do.',
      e5265: 'Ngày này có nhiều buổi nên phải xin hủy cả ngày. Tải lại trang rồi thử lại.',
      generic: 'Chưa gửi được yêu cầu hủy. Vui lòng thử lại.'
    }
  }
}

export const caregiverBookingEn: typeof caregiverBookingVi = {
  groups: {
    openLabel: 'Open booking {{code}} for {{name}}',
    visits: '{{count}} visits',
    next: 'Next visit: {{time}}',
    range: '{{from}} → {{to}}',
    toAnswer: '{{count}} visits to confirm',
    replacing: '{{count}} visits being replaced',
    missed: '{{count}} missed visits',
    acceptAll: 'Accept all ({{count}})',
    open: 'See visits',
    pagination: 'Booking list pages'
  },
  page: {
    documentTitle: 'Booking {{code}}',
    crumb: 'Booking {{code}}',
    title: 'Care for {{name}}',
    loading: 'Loading the visits…',
    error: 'The visits of this booking could not be loaded.',
    notFound: 'This booking has no visit assigned to you any more.',
    back: 'Back to visits',
    summaryLabel: 'Booking summary',
    period: '{{from}} → {{to}}',
    services: 'Services of the booking',
    stats: {
      total: 'Visits',
      upcoming: 'Upcoming',
      toAccept: 'To accept',
      done: 'Done'
    },
    views: {
      legend: 'How to show the visits',
      days: 'By day',
      calendar: 'Month'
    },
    scope: {
      legend: 'Upcoming or past visits',
      upcoming: 'Upcoming ({{count}})',
      past: 'Past ({{count}})'
    },
    noUpcoming: 'No upcoming visit left.',
    noPast: 'No past visit yet.',
    acceptAll: 'Accept all ({{count}} visits)',
    withdrawAll: 'Withdraw from the remaining visits',
    withdrawAllHint:
      'A day can be withdrawn only when all its visits are more than 24 hours away; a day with several visits goes whole.'
  },
  day: {
    summary: '{{count}} visits · {{span}} · {{duration}}',
    services: 'Services of the day',
    acceptDay: 'Accept the day ({{count}})',
    withdrawDay: 'Withdraw from the day',
    withdrawOne: 'Withdraw from the visit',
    pagination: 'Care day pages'
  },
  row: {
    visitNo: 'Visit {{number}}',
    open: 'Open visit {{number}}: {{services}}',
    noService: 'Scheduled care'
  },
  calendar: {
    previous: 'Previous month',
    next: 'Next month',
    monthSummary: '{{days}} days with visits · {{count}} visits this month',
    count: '{{count}} visits',
    dayLabel: '{{day}}: {{count}} visits, {{state}}',
    pick: 'Pick a day with visits on the calendar to see them.',
    legend: 'Colour key',
    states: {
      toAccept: 'To accept',
      replacing: 'Being replaced',
      inProgress: 'In progress',
      upcoming: 'Accepted',
      missed: 'Missed',
      done: 'Done',
      cancelled: 'Cancelled'
    }
  },
  accept: {
    title: 'Accept {{count}} visits',
    intro:
      'You confirm you will do the visits below. If one of them was just given to someone else, nothing is accepted so you can check again.',
    confirm: 'Accept {{count}} visits',
    cancel: 'Later',
    done: 'Accepted {{count}} visits'
  },
  badge: {
    replacing: 'Withdrawn — being replaced'
  },
  withdraw: {
    sectionTitle: 'Cannot make this visit?',
    singleHint: 'You can withdraw from this visit while it is more than 24 hours away.',
    wholeDayHint:
      '{{day}} has {{count}} visits of this booking, so only the whole day can be withdrawn — the family should not meet two different caregivers on one day.',
    open: 'Withdraw from this visit',
    openDay: 'Withdraw from the whole day ({{count}} visits)',
    title: 'Withdraw from a visit',
    titleDay: 'Withdraw from {{day}}',
    titleRemaining: 'Withdraw from the remaining visits',
    intro:
      'The center (or the system) assigns another caregiver to these visits. They stay in your name until someone takes them, but you cannot start them.',
    wholeDayRule: 'A day with several visits is withdrawn as a whole.',
    visits: 'Visits to withdraw from',
    count: '{{count}} visits',
    kept: '{{count}} visits stay with you',
    keptHint: 'Days with a visit less than 24 hours away cannot be withdrawn — contact the center if it is urgent.',
    none: 'No visit qualifies (it must start more than 24 hours from now).',
    tooLate: 'Only visits starting more than 24 hours from now can be withdrawn. Contact the center if it is urgent.',
    tooLateDay:
      'A visit of this day starts in less than 24 hours, so the day cannot be withdrawn. Contact the center if it is urgent.',
    alreadyRequested: 'You have withdrawn from this visit; the center is finding a replacement.',
    reasonTitle: 'Reason',
    reasons: {
      PERSONAL: 'Personal matter',
      OTHER: 'Other reason'
    },
    reasonHints: {
      PERSONAL: 'Illness, family, something sudden',
      OTHER: 'Describe it for the center'
    },
    detail: 'Note for the center',
    detailOptional: 'Note for the center (optional)',
    detailPlaceholder: 'For example: my child is ill and I need to stay home.',
    detailRequired: 'Please describe the reason.',
    cancel: 'Back',
    submit: 'Send withdrawal ({{count}} visits)',
    sent: 'Withdrawal from {{count}} visits sent; the center will assign someone else.',
    errors: {
      e5260: 'A visit starts in less than 24 hours, so it cannot be withdrawn.',
      e5261: 'You have already withdrawn from this visit.',
      e5262: 'This visit can no longer be withdrawn.',
      e5263: 'Please describe the reason.',
      e5265: 'This day has several visits, so withdraw from the whole day. Reload the page and try again.',
      generic: 'The withdrawal could not be sent. Please try again.'
    }
  }
}
