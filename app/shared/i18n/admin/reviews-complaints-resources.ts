export const adminReviewsComplaintsVi = {
  documentTitle: 'Đánh giá & Khiếu nại | CareConnect',
  breadcrumb: 'Đánh giá & Chăm sóc khách hàng',
  title: 'Quản lý Đánh giá & Xử lý Khiếu nại Khách hàng',
  subtitle: 'Trung tâm Tiếp nhận & Phân giải Tranh chấp Y tế 24/7',
  sample: 'Số liệu minh họa. Chưa có dữ liệu hồ sơ, vị trí, ký quỹ thực tế và chưa thể xử lý trực tiếp tại đây.',
  unavailable: 'Chức năng này sắp ra mắt.',
  actions: {
    policies: 'Chính sách đền bù & sự cố',
    export: 'Xuất báo cáo mức độ hài lòng (mẫu)',
    sos: 'Quy trình chuyển cấp sự cố khẩn cấp',
    archive: 'Lịch sử giải quyết tranh chấp',
    create: 'Tạo hồ sơ xử lý sự cố đặc biệt'
  },
  metrics: {
    csat: 'Điểm hài lòng trung bình',
    csatHint: '94,2% đánh giá 5 sao · 2.450 lượt',
    urgent: 'Khiếu nại khẩn cấp',
    urgentHint: 'Thời gian phản hồi mục tiêu: dưới 2 giờ',
    resolved: 'Đã giải quyết thỏa đáng',
    resolvedHint: 'Hoàn tiền đúng hạn: 100%',
    satisfaction: 'Hài lòng sau giải quyết',
    satisfactionHint: 'Khách hàng tiếp tục sử dụng dịch vụ'
  },
  tabs: {
    reviews: 'Tất cả Đánh giá & Nhận xét',
    complaints: 'Quản lý Khiếu nại & Tranh chấp',
    violations: 'Báo cáo Vi phạm Tác phong & Kỷ luật'
  },
  filters: {
    search: 'Tìm mã khiếu nại, mã ca, khách hàng hoặc điều dưỡng',
    severity: 'Mức độ',
    status: 'Trạng thái',
    all: 'Tất cả',
    reset: 'Thiết lập lại bộ lọc'
  },
  levels: { critical: 'Cấp 1 · Khẩn cấp', clinical: 'Cấp 2 · Thẩm định y khoa', low: 'Cấp 3 · Thủ tục & hóa đơn' },
  statuses: { new: 'Mới tiếp nhận', review: 'Đang thu thập chứng cứ', resolved: 'Đã giải quyết' },
  casesTitle: 'Hồ sơ Khiếu nại Cần Can thiệp',
  results: '{{count}} hồ sơ trong mẫu',
  empty: 'Không tìm thấy hồ sơ phù hợp.',
  selectCase: 'Xem hồ sơ mẫu',
  close: 'Đóng',
  detailTitle: 'Chi tiết hồ sơ khiếu nại mẫu',
  booking: 'Ca trực',
  customer: 'Khách hàng',
  caregiver: 'Điều dưỡng',
  caseDetails: {
    delay: {
      context: 'Người nhà bệnh nhân 82 tuổi · Quận 7, TP.HCM',
      center: 'TT Chăm sóc Y tế Gia đình An Nhiên',
      statement:
        'Điều dưỡng đến trễ 45 phút không báo trước. Gia đình yêu cầu đổi điều dưỡng và hoàn lại 50% tiền cọc.',
      evidence: 'Định vị lúc đến: 08:45 (trễ 45 phút) · Ký quỹ mẫu: 1.250.000 ₫ · Giải trình: sự cố ngập đường.',
      outcome: 'Hồ sơ cần xác minh y khoa và đối chiếu thời gian phản hồi cam kết trước khi đưa ra quyết định.'
    },
    clinical: {
      context: 'Chăm sóc hậu phẫu tại gia',
      center: 'TT Y Khoa Medic',
      statement: 'Gia đình phản ánh vết bầm sau tiêm truyền và yêu cầu bác sĩ chuyên khoa kiểm tra.',
      evidence: 'Mẫu tham khảo: bác sĩ trực đã tư vấn từ xa, ghi nhận vết tụ máu mao mạch và hướng dẫn theo dõi.',
      outcome: 'Cần hồ sơ y khoa thực tế và sự đồng ý của người bệnh trước khi xử lý.'
    },
    fee: {
      context: 'Khiếu nại phụ phí ca đêm',
      center: 'Ca chăm sóc tại gia',
      statement: 'Khách hàng phản ánh khoản phụ phí ca đêm 150.000 ₫ chưa được giải thích rõ.',
      evidence: 'Mẫu tham khảo: đối soát hóa đơn và quy định giá.',
      outcome: 'Mẫu kết quả: giải quyết trong 18 phút, khách hàng cập nhật đánh giá 5 sao.'
    }
  },
  evidence: 'Dữ liệu đối soát trong mẫu',
  outcome: 'Tình trạng xử lý trong mẫu',
  caseActions: {
    replace: 'Đổi điều dưỡng ca mai',
    refund: 'Duyệt hoàn 50% ký quỹ & voucher',
    discipline: 'Kỷ luật điều dưỡng',
    medical: 'Xem hồ sơ bệnh án',
    resolve: 'Ghi nhận hòa giải & đóng hồ sơ',
    record: 'Xem biên bản lưu trữ'
  },
  protocol: {
    title: 'Quy trình tạm giữ tiền CareProtect 4 bước',
    hint: 'Quy trình minh họa; điều kiện thanh toán thực tế do hệ thống thanh toán quyết định.',
    steps: {
      receive: 'Tiếp nhận phản ánh 24/7',
      hold: 'Tạm giữ ký quỹ',
      verify: 'Thẩm định y khoa & vị trí',
      decide: 'Phán quyết & bồi hoàn'
    }
  },
  feedback: {
    title: 'Phản hồi tích cực & tri ân',
    rating: 'Đánh giá 5 trên 5 sao',
    firstName: 'Trần Minh Khang',
    firstBooking: 'BK-9320',
    firstQuote: 'Điều dưỡng chăm sóc mẹ tôi rất ân cần, biết động viên tinh thần cụ. Gia đình thực sự biết ơn.',
    secondName: 'Hoàng Yến',
    secondBooking: 'BK-9288',
    secondQuote: 'Điều dưỡng có chuyên môn, chăm sóc vết thương cẩn thận và tác phong chu đáo.',
    more: 'Xem tất cả đánh giá mẫu'
  },
  reviewsHint: 'Bộ lọc đang hiển thị các đánh giá minh họa.',
  violationsHint: 'Chức năng báo cáo vi phạm sắp ra mắt.',
  support: 'Hội đồng Đạo đức Y tế & Giám sát Ca trực',
  supportHint: 'Kênh trao đổi ba bên và quyết định xử lý sắp ra mắt.'
} as const

export const adminReviewsComplaintsEn = {
  documentTitle: 'Reviews & complaints | CareConnect',
  breadcrumb: 'Reviews & customer care',
  title: 'Customer reviews & complaint management',
  subtitle: '24/7 medical dispute intake and resolution center',
  sample: 'Sample data. Case files, locations and held funds are not live, and cases cannot be handled here yet.',
  unavailable: 'This feature is coming soon.',
  actions: {
    policies: 'Compensation & incident policy',
    export: 'Export sample satisfaction report',
    sos: 'Emergency escalation process',
    archive: 'Dispute resolution archive',
    create: 'Create special incident case'
  },
  metrics: {
    csat: 'Average satisfaction score',
    csatHint: '94.2% five-star ratings · 2,450 reviews',
    urgent: 'Urgent complaints',
    urgentHint: 'Target response time: under 2 hours',
    resolved: 'Resolved satisfactorily',
    resolvedHint: 'On-time refunds: 100%',
    satisfaction: 'Post-resolution satisfaction',
    satisfactionHint: 'Customers continue using the service'
  },
  tabs: {
    reviews: 'All reviews & comments',
    complaints: 'Complaints & disputes',
    violations: 'Conduct & discipline reports'
  },
  filters: {
    search: 'Search case ID, booking, customer, or caregiver',
    severity: 'Severity',
    status: 'Status',
    all: 'All',
    reset: 'Reset filters'
  },
  levels: { critical: 'Level 1 · Urgent', clinical: 'Level 2 · Clinical review', low: 'Level 3 · Billing & procedure' },
  statuses: { new: 'Newly received', review: 'Collecting evidence', resolved: 'Resolved' },
  casesTitle: 'Complaint cases requiring attention',
  results: '{{count}} sample cases',
  empty: 'No matching cases found.',
  selectCase: 'View sample case',
  close: 'Close',
  detailTitle: 'Sample complaint case details',
  booking: 'Booking',
  customer: 'Customer',
  caregiver: 'Caregiver',
  caseDetails: {
    delay: {
      context: 'Relative of an 82-year-old patient · District 7, Ho Chi Minh City',
      center: 'An Nhien Family Care Center',
      statement:
        'The caregiver arrived 45 minutes late without notice. The family requested a replacement and a refund of 50% of the deposit.',
      evidence:
        'Sample arrival time: 08:45 (45 minutes late) · Sample held deposit: VND 1,250,000 · Explanation: flooded roads.',
      outcome: 'Clinical verification and a response-time check are needed before any decision.'
    },
    clinical: {
      context: 'Post-surgery care at home',
      center: 'Medic Medical Center',
      statement: 'The family reported bruising after an infusion and requested a specialist review.',
      evidence:
        'Sample reference: an on-call physician consulted remotely, noted a capillary bruise, and advised monitoring.',
      outcome: 'Actual medical records and patient consent are needed before action.'
    },
    fee: {
      context: 'Night shift surcharge complaint',
      center: 'Home care session',
      statement: 'The customer reported that a VND 150,000 night surcharge was unclear.',
      evidence: 'Sample reference: invoice and pricing policy review.',
      outcome: 'Sample outcome: resolved in 18 minutes; customer updated the rating to five stars.'
    }
  },
  evidence: 'Sample reconciliation data',
  outcome: 'Sample case status',
  caseActions: {
    replace: 'Replace tomorrow’s caregiver',
    refund: 'Approve 50% deposit refund & voucher',
    discipline: 'Discipline caregiver',
    medical: 'View medical record',
    resolve: 'Record settlement & close case',
    record: 'View archived record'
  },
  protocol: {
    title: 'Four-step CareProtect fund holding process',
    hint: 'Sample process; the payment system determines the actual rules.',
    steps: {
      receive: 'Receive reports 24/7',
      hold: 'Hold funds',
      verify: 'Clinical & location review',
      decide: 'Decision & refund'
    }
  },
  feedback: {
    title: 'Positive feedback & gratitude',
    rating: 'Rated 5 out of 5 stars',
    firstName: 'Tran Minh Khang',
    firstBooking: 'BK-9320',
    firstQuote:
      'The caregiver looked after my mother thoughtfully and lifted her spirits. Our family is truly grateful.',
    secondName: 'Hoang Yen',
    secondBooking: 'BK-9288',
    secondQuote: 'The caregiver was skilled, dressed the wound carefully, and acted with care.',
    more: 'View all sample reviews'
  },
  reviewsHint: 'This tab shows sample reviews.',
  violationsHint: 'Conduct reports are coming soon.',
  support: 'Medical Ethics Council & Shift Oversight',
  supportHint: 'Three-party conversations and decisions are coming soon.'
} as const
