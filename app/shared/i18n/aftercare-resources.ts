export const aftercareVi = {
  conditions: { STABLE: 'Ổn định', IMPROVED: 'Cải thiện', DECLINED: 'Kém đi', NEEDS_ATTENTION: 'Cần chú ý' },
  categories: {
    QUALITY: 'Chất lượng chăm sóc',
    ATTITUDE: 'Thái độ',
    LATE: 'Đến muộn',
    SAFETY: 'An toàn',
    BILLING: 'Thanh toán',
    OTHER: 'Khác'
  },
  complaintStatus: {
    OPEN: 'Mới',
    IN_PROGRESS: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    ESCALATED: 'Đã chuyển cấp cao',
    RESOLVED_BY_ADMIN: 'Admin đã quyết định',
    WITHDRAWN: 'Đã rút'
  },
  notes: {
    title: 'Ghi chú phiên chăm sóc',
    empty: 'Chưa có ghi chú.',
    label: 'Ghi chú mới',
    add: 'Thêm ghi chú'
  },
  report: {
    title: 'Báo cáo chăm sóc',
    listTitle: 'Báo cáo chăm sóc',
    loading: 'Đang tải báo cáo…',
    none: 'Chưa có báo cáo nào được nộp.',
    draftHint: 'Lưu nháp bao nhiêu lần cũng được; nộp rồi thì không sửa được nữa. Khách chỉ thấy báo cáo đã nộp.',
    submitted: 'Báo cáo đã nộp.',
    condition: 'Tình trạng chung',
    summary: 'Tóm tắt buổi chăm sóc',
    recommendations: 'Khuyến nghị',
    saveDraft: 'Lưu nháp',
    submit: 'Nộp báo cáo'
  },
  review: {
    title: 'Đánh giá người chăm sóc',
    rating: 'Số sao',
    stars: '{{count}} sao',
    comment: 'Nhận xét',
    submit: 'Gửi đánh giá',
    thanks: 'Cảm ơn bạn đã đánh giá.'
  },
  complaint: {
    title: 'Khiếu nại',
    new: 'Gửi khiếu nại',
    target: 'Về',
    targets: { CAREGIVER_SERVICE: 'Người chăm sóc / dịch vụ', CENTER: 'Trung tâm' },
    category: 'Loại',
    subject: 'Tiêu đề',
    content: 'Nội dung',
    send: 'Gửi',
    escalateReason: 'Lý do chuyển cấp cao',
    escalate: 'Chuyển admin xử lý',
    escalateHint: 'Trung tâm chưa xử lý sau 48 giờ thì bạn chuyển được cho admin.',
    windowHint: 'Chỉ khiếu nại được buổi đã diễn ra, trong 7 ngày sau khi buổi kết thúc.',
    withdraw: 'Rút khiếu nại'
  },
  queue: {
    managerTitle: 'Khiếu nại của trung tâm',
    adminTitle: 'Khiếu nại cấp cao',
    filter: 'Lọc theo trạng thái',
    loading: 'Đang tải khiếu nại…',
    empty: 'Không có khiếu nại nào.',
    accept: 'Nhận xử lý',
    resolution: 'Hướng giải quyết',
    refund: 'Số tiền hoàn (đồng, để trống nếu không hoàn)',
    resolve: 'Giải quyết',
    escalateReason: 'Lý do chuyển cấp'
  },
  errors: {
    forbidden: 'Bạn không có quyền thực hiện thao tác này.',
    conflict: 'Dữ liệu vừa thay đổi hoặc không còn hợp lệ, vui lòng tải lại.',
    invalid: 'Thông tin chưa hợp lệ.',
    generic: 'Không thực hiện được, vui lòng thử lại.',
    e5923: 'Số tiền hoàn vượt số còn được hoàn (đã trừ các khoản hoàn đang chờ).',
    e5926: 'Chỉ khiếu nại được buổi đã diễn ra, trong 7 ngày sau khi buổi kết thúc.',
    e5927: 'Buổi chăm sóc này đã có khiếu nại đang được xử lý.',
    e5928: 'Chỉ chuyển admin được khi trung tâm chưa xử lý sau 48 giờ.'
  }
}

export const aftercareEn = {
  conditions: { STABLE: 'Stable', IMPROVED: 'Improved', DECLINED: 'Declined', NEEDS_ATTENTION: 'Needs attention' },
  categories: {
    QUALITY: 'Care quality',
    ATTITUDE: 'Attitude',
    LATE: 'Late arrival',
    SAFETY: 'Safety',
    BILLING: 'Billing',
    OTHER: 'Other'
  },
  complaintStatus: {
    OPEN: 'New',
    IN_PROGRESS: 'In progress',
    RESOLVED: 'Resolved',
    ESCALATED: 'Escalated',
    RESOLVED_BY_ADMIN: 'Decided by admin',
    WITHDRAWN: 'Withdrawn'
  },
  notes: {
    title: 'Care session notes',
    empty: 'No notes yet.',
    label: 'New note',
    add: 'Add note'
  },
  report: {
    title: 'Care report',
    listTitle: 'Care reports',
    loading: 'Loading reports…',
    none: 'No report has been submitted yet.',
    draftHint:
      'Save drafts as often as you like; a submitted report cannot be edited. Customers see submitted reports only.',
    submitted: 'Report submitted.',
    condition: 'Overall condition',
    summary: 'Session summary',
    recommendations: 'Recommendations',
    saveDraft: 'Save draft',
    submit: 'Submit report'
  },
  review: {
    title: 'Rate the caregiver',
    rating: 'Rating',
    stars: '{{count}} stars',
    comment: 'Comment',
    submit: 'Send review',
    thanks: 'Thank you for your review.'
  },
  complaint: {
    title: 'Complaints',
    new: 'File a complaint',
    target: 'About',
    targets: { CAREGIVER_SERVICE: 'Caregiver / service', CENTER: 'Center' },
    category: 'Category',
    subject: 'Subject',
    content: 'Details',
    send: 'Send',
    escalateReason: 'Reason to escalate',
    escalate: 'Escalate to admin',
    escalateHint: 'If the center has not handled it within 48 hours, you can escalate it to an admin.',
    windowHint: 'You can complain about a visit that has taken place, up to 7 days after it ends.',
    withdraw: 'Withdraw complaint'
  },
  queue: {
    managerTitle: 'Center complaints',
    adminTitle: 'Escalated complaints',
    filter: 'Filter by status',
    loading: 'Loading complaints…',
    empty: 'No complaints.',
    accept: 'Take the case',
    resolution: 'Resolution',
    refund: 'Refund amount (VND, leave empty for none)',
    resolve: 'Resolve',
    escalateReason: 'Escalation reason'
  },
  errors: {
    forbidden: 'You are not allowed to do this.',
    conflict: 'The data just changed or is no longer valid. Please reload.',
    invalid: 'Some information is invalid.',
    generic: 'Something went wrong. Please try again.',
    e5923: 'The refund exceeds what can still be refunded (pending refunds included).',
    e5926: 'You can only complain about a visit that has taken place, up to 7 days after it ends.',
    e5927: 'This visit already has a complaint being handled.',
    e5928: 'You can escalate only when the center has not handled it for 48 hours.'
  }
}
