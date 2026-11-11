// Caregiver vắng ca (2026-11-10): hàng đợi của trung tâm, giải trình của caregiver, danh sách của admin.
export const caregiverAbsenceVi = {
  status: {
    PENDING: 'Chờ kết luận',
    EXCUSED: 'Có lý do chính đáng',
    CONFIRMED: 'Vi phạm'
  },
  source: {
    MISSED_CHECK_IN: 'Không check-in đúng hạn',
    NO_SHOW_REPORT_REJECTED: 'Trung tâm bác báo cáo khách vắng',
    SESSION_NOT_DELIVERED: 'Ca tự đóng, trung tâm kết luận không thực hiện'
  },
  visit: 'Buổi {{number}} · {{time}}',
  caregiver: 'Người chăm sóc: {{name}}',
  unknownCaregiver: 'Không rõ',
  refunded: 'Khách đã được hoàn 100 % tiền buổi này vào ví.',
  explanation: 'Giải trình: {{text}}',
  explainedAt: 'Gửi lúc {{time}}',
  noExplanation: 'Chưa có giải trình',
  conclusion: 'Kết luận của trung tâm: {{text}}',
  concludedAt: 'Kết luận lúc {{time}}',
  openBooking: 'Xem lịch đặt',
  openVisit: 'Xem buổi',
  more: 'Còn {{count}} lần khác',
  pendingCount: '{{count}} chờ kết luận',
  showAll: 'Xem tất cả ({{count}})',
  showLess: 'Thu gọn',
  manager: {
    title: 'Người chăm sóc vắng ca ({{count}})',
    description:
      'Khách đã được hoàn 100 % tiền các buổi này. Hãy xem giải trình, kết luận từng lần và sắp xếp người khác cho các buổi còn lại nếu cần.',
    excuse: 'Có lý do chính đáng',
    confirm: 'Ghi nhận vi phạm',
    excuseTitle: 'Miễn trừ lần vắng buổi {{number}}',
    excuseHint: 'Lần vắng này sẽ không tính là vi phạm của người chăm sóc. Kết luận không sửa lại được.',
    confirmTitle: 'Ghi nhận vi phạm buổi {{number}}',
    confirmHint: 'Lần vắng này sẽ tính một lần vi phạm trong hồ sơ người chăm sóc. Kết luận không sửa lại được.',
    note: 'Ghi chú kết luận'
  },
  caregiverPanel: {
    title: 'Bạn bị ghi nhận vắng ca ({{count}})',
    description: 'Khách đã được hoàn tiền các buổi này. Hãy gửi giải trình để trung tâm xem xét trước khi kết luận.',
    explain: 'Gửi giải trình',
    editExplanation: 'Sửa giải trình',
    explainTitle: 'Giải trình vắng buổi {{number}}',
    explainHint: 'Nêu rõ chuyện gì đã xảy ra. Bạn sửa được giải trình tới khi trung tâm kết luận.',
    explanationLabel: 'Nội dung giải trình'
  },
  admin: {
    title: 'Người chăm sóc vắng ca',
    description:
      'Mọi lần người chăm sóc không đến buổi đã được thanh toán, trên toàn hệ thống. Trung tâm là bên kết luận; khách luôn được hoàn 100 % tiền buổi đó.',
    statusLabel: 'Trạng thái',
    all: 'Tất cả',
    stats: { pending: 'Chờ kết luận', excused: 'Có lý do', confirmed: 'Vi phạm', total: 'Tổng số lần' },
    center: 'Trung tâm: {{name}}',
    unknownCenter: 'Không rõ',
    centerFilter: 'Trung tâm',
    allCenters: 'Tất cả trung tâm',
    reset: 'Xóa bộ lọc',
    visitCount: '{{count}} buổi vắng',
    empty: 'Chưa có lần vắng ca nào',
    emptyHint: 'Khi một buổi quá giờ điểm danh mà không có người đến, lần vắng sẽ hiện ở đây.',
    error: 'Chưa tải được danh sách vắng ca.',
    retry: 'Thử lại',
    loading: 'Đang tải danh sách vắng ca…'
  },
  profile: {
    title: 'Vắng ca',
    hint: 'Số lần người chăm sóc không đến buổi đã thanh toán và kết luận của trung tâm.',
    openQueue: 'Kết luận các lần chờ',
    empty: 'Chưa vắng ca lần nào.',
    error: 'Chưa tải được lịch sử vắng ca.',
    loading: 'Đang tải lịch sử vắng ca…'
  },
  customer: {
    missedTitle: 'Người chăm sóc đã không đến buổi này',
    missedBody:
      'Toàn bộ số tiền bạn đã trả cho buổi này được hoàn vào ví CareConnect. Trung tâm đang xử lý với người chăm sóc; nếu cần hỗ trợ thêm, bạn có thể gửi khiếu nại.',
    openWallet: 'Xem ví'
  }
}

export const caregiverAbsenceEn: typeof caregiverAbsenceVi = {
  status: {
    PENDING: 'Awaiting conclusion',
    EXCUSED: 'Excused',
    CONFIRMED: 'Violation'
  },
  source: {
    MISSED_CHECK_IN: 'No check-in in time',
    NO_SHOW_REPORT_REJECTED: 'The center rejected the customer no-show report',
    SESSION_NOT_DELIVERED: 'Closed by the system; the center found it not delivered'
  },
  visit: 'Visit {{number}} · {{time}}',
  caregiver: 'Caregiver: {{name}}',
  unknownCaregiver: 'Unknown',
  refunded: 'The customer was refunded this visit in full, to their wallet.',
  explanation: 'Explanation: {{text}}',
  explainedAt: 'Sent {{time}}',
  noExplanation: 'No explanation yet',
  conclusion: 'Center conclusion: {{text}}',
  concludedAt: 'Concluded {{time}}',
  openBooking: 'Open booking',
  openVisit: 'Open visit',
  more: '{{count}} more',
  pendingCount: '{{count}} awaiting conclusion',
  showAll: 'Show all ({{count}})',
  showLess: 'Show less',
  manager: {
    title: 'Caregivers missed visits ({{count}})',
    description:
      'Customers were refunded these visits in full. Read each explanation, conclude it and arrange someone else for the remaining visits if needed.',
    excuse: 'Excuse',
    confirm: 'Record a violation',
    excuseTitle: 'Excuse the absence of visit {{number}}',
    excuseHint: 'This absence will not count as a violation. The conclusion cannot be changed.',
    confirmTitle: 'Record a violation for visit {{number}}',
    confirmHint: 'This absence counts as one violation on the caregiver record. The conclusion cannot be changed.',
    note: 'Conclusion note'
  },
  caregiverPanel: {
    title: 'You were recorded absent ({{count}})',
    description: 'The customers were refunded these visits. Send an explanation for the center to consider.',
    explain: 'Send explanation',
    editExplanation: 'Edit explanation',
    explainTitle: 'Explain the absence of visit {{number}}',
    explainHint: 'Say what happened. You can edit the explanation until the center concludes.',
    explanationLabel: 'Explanation'
  },
  admin: {
    title: 'Caregiver absences',
    description:
      'Every time a caregiver did not come to a paid visit, platform-wide. The center concludes each one; the customer is always refunded that visit in full.',
    statusLabel: 'Status',
    all: 'All',
    stats: { pending: 'Awaiting conclusion', excused: 'Excused', confirmed: 'Violations', total: 'Total' },
    center: 'Center: {{name}}',
    unknownCenter: 'Unknown',
    centerFilter: 'Center',
    allCenters: 'All centers',
    reset: 'Clear filters',
    visitCount: '{{count}} missed visits',
    empty: 'No absences yet',
    emptyHint: 'When a visit passes its check-in window with nobody there, the absence shows here.',
    error: 'The absence list could not be loaded.',
    retry: 'Try again',
    loading: 'Loading absences…'
  },
  profile: {
    title: 'Missed visits',
    hint: 'How often this caregiver missed a paid visit, and what the center concluded.',
    openQueue: 'Conclude pending ones',
    empty: 'No missed visits.',
    error: 'The missed-visit history could not be loaded.',
    loading: 'Loading missed visits…'
  },
  customer: {
    missedTitle: 'The caregiver did not come to this visit',
    missedBody:
      'Everything you paid for this visit was refunded to your CareConnect wallet. The center is following up with the caregiver; you can file a complaint if you need more help.',
    openWallet: 'Open wallet'
  }
}
