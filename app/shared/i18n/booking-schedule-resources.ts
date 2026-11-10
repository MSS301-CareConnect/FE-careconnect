// Lịch các buổi (bảng / lịch tháng), ngày giờ dễ đọc và đồng hồ giữ chỗ 5 phút — dùng chung các portal (2026-11-09).
export const bookingScheduleVi = {
  weekdaysLong: {
    '1': 'Thứ Hai',
    '2': 'Thứ Ba',
    '3': 'Thứ Tư',
    '4': 'Thứ Năm',
    '5': 'Thứ Sáu',
    '6': 'Thứ Bảy',
    '7': 'Chủ nhật'
  },
  relative: {
    today: 'Hôm nay',
    tomorrow: 'Ngày mai'
  },
  timeRange: '{{start}} – {{end}}',
  hold: {
    title: 'Đang giữ chỗ cho bạn',
    until: 'Giữ chỗ đến {{time}}',
    left: 'Còn lại',
    leftLabel: 'Thời gian giữ chỗ còn {{time}}',
    expiredTitle: 'Hết thời gian giữ chỗ',
    expiredBody:
      'Lịch đã được nhả cho người khác đặt. Nếu bạn vừa thanh toán, hệ thống sẽ xác nhận hoặc hoàn tiền tự động trong ít phút.',
    hint: 'Thanh toán khoản đầu trong thời gian này để giữ lịch. Hết giờ, lịch sẽ tự hủy để người khác đặt được.'
  },
  view: {
    legend: 'Cách xem lịch các buổi',
    table: 'Bảng',
    calendar: 'Lịch tháng'
  },
  table: {
    caption: 'Lịch {{count}} buổi chăm sóc',
    number: '#',
    date: 'Ngày',
    time: 'Giờ',
    duration: 'Thời lượng',
    service: 'Dịch vụ',
    caregiver: 'Người chăm sóc',
    status: 'Trạng thái',
    price: 'Giá',
    actions: 'Chi tiết',
    view: 'Xem buổi {{number}}',
    allServices: 'Tất cả dịch vụ đã chọn',
    unassigned: 'Đang phân người',
    assigned: 'Đã phân công',
    needsReassignment: 'Đang thay người',
    otherAddress: 'Tại {{address}}',
    monthVisits: '{{count}} buổi'
  },
  calendar: {
    previous: 'Tháng trước',
    next: 'Tháng sau',
    month: 'Tháng {{month}}/{{year}}',
    more: '+{{count}} buổi',
    empty: 'Tháng này không có buổi nào.',
    visit: 'Buổi {{number}}, {{time}}, {{status}}'
  }
}

export const bookingScheduleEn: typeof bookingScheduleVi = {
  weekdaysLong: {
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    '7': 'Sunday'
  },
  relative: {
    today: 'Today',
    tomorrow: 'Tomorrow'
  },
  timeRange: '{{start}} – {{end}}',
  hold: {
    title: 'Your booking is on hold',
    until: 'Held until {{time}}',
    left: 'Time left',
    leftLabel: '{{time}} left on the hold',
    expiredTitle: 'The hold has ended',
    expiredBody:
      'The time was released for others to book. If you have just paid, the payment is confirmed or refunded automatically within a few minutes.',
    hint: 'Pay the first part within this time to keep the booking. When it runs out, the booking is cancelled so others can book.'
  },
  view: {
    legend: 'How to show the visits',
    table: 'Table',
    calendar: 'Month'
  },
  table: {
    caption: 'Schedule of {{count}} visits',
    number: '#',
    date: 'Date',
    time: 'Time',
    duration: 'Length',
    service: 'Service',
    caregiver: 'Caregiver',
    status: 'Status',
    price: 'Price',
    actions: 'Details',
    view: 'View visit {{number}}',
    allServices: 'All chosen services',
    unassigned: 'Being assigned',
    assigned: 'Assigned',
    needsReassignment: 'Being replaced',
    otherAddress: 'At {{address}}',
    monthVisits: '{{count}} visits'
  },
  calendar: {
    previous: 'Previous month',
    next: 'Next month',
    month: '{{month}}/{{year}}',
    more: '+{{count}} visits',
    empty: 'No visits this month.',
    visit: 'Visit {{number}}, {{time}}, {{status}}'
  }
}
