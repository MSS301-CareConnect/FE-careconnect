export const adminQualityVi = {
  documentTitle: 'Kiểm soát chất lượng caregiver | CareConnect Admin',
  breadcrumb: 'Kiểm soát chất lượng & an toàn y tế',
  title: 'Xác minh & Kiểm soát chất lượng hồ sơ Điều dưỡng',
  subtitle: 'Xem trước hồ sơ năng lực, chứng chỉ và các bước kiểm định trước khi mở quyền nhận ca.',
  sample: 'Dữ liệu minh họa tháng 10/2025 · Chưa liên thông Bộ Y tế hoặc dữ liệu xác minh trực tiếp.',
  tier: 'Cổng thẩm định cuối · bản xem trước',
  standards: 'Quy chuẩn thẩm định',
  export: 'Xuất CSV mẫu',
  history: 'Lịch sử duyệt',
  unavailable: 'Cần dữ liệu kiểm định, API và quyền Admin để thực hiện',
  metrics: {
    urgent: 'Cần xử lý',
    approved: 'Đạt chuẩn tháng này',
    review: 'Yêu cầu phúc tra CCHN',
    rejected: 'Từ chối / Blacklist'
  },
  metricHints: {
    urgent: '14 hồ sơ trong mẫu thiết kế',
    approved: 'Tỷ lệ thông qua mẫu: 89,4%',
    review: '6 hồ sơ cần đối chiếu',
    rejected: '2 hồ sơ bị đánh dấu trong mẫu'
  },
  process: 'Quy trình thẩm định y tế ba lớp',
  processHint: 'Luồng tham chiếu từ bản thiết kế; chưa phải kết quả xác minh tự động.',
  steps: {
    center: 'Trung tâm đối tác sơ tuyển',
    license: 'Đối chiếu CCHN và giấy tờ',
    admin: 'Hội đồng y khoa & Admin chốt'
  },
  search: 'Tìm tên điều dưỡng, mã hồ sơ, số CCHN hoặc trung tâm',
  center: 'Trung tâm đề xuất',
  specialty: 'Chuyên môn',
  risk: 'Mức rủi ro',
  status: 'Trạng thái',
  all: 'Tất cả',
  specialties: { general: 'Điều dưỡng đa khoa', rehab: 'Phục hồi chức năng', elderly: 'Lão khoa & giảm nhẹ' },
  risks: { low: 'Rủi ro thấp', medium: 'Rủi ro trung bình', high: 'Cần lưu ý' },
  tabs: {
    all: 'Tất cả chờ duyệt',
    license: 'Chờ kiểm tra CCHN',
    center: 'Trung tâm sơ duyệt',
    interview: 'Cần phỏng vấn lâm sàng'
  },
  columns: {
    caregiver: 'Điều dưỡng & thông tin',
    center: 'Đơn vị đề xuất',
    license: 'Chứng chỉ CCHN',
    background: 'Lý lịch & sức khỏe',
    assessment: 'Đánh giá chuyên môn',
    status: 'Trạng thái Audit',
    actions: 'Quyết định quản trị'
  },
  age: '{{count}} tuổi',
  licenseId: 'CCHN',
  centerSignoff: 'Sơ duyệt trung tâm',
  backgroundSample: 'Hồ sơ lý lịch trong mẫu',
  clinicalScore: '{{score}} / 100',
  reviewProgress: 'Mức hoàn thiện mẫu: {{value}}%',
  statuses: { ready: 'Chờ Admin phê duyệt', discrepancy: 'Cần đối chiếu phôi bằng', clinical: 'Chờ chốt thẩm định' },
  licenseStates: { match: 'Khớp dữ liệu trong mẫu', mismatch: 'Cần đối chiếu lại số phôi', valid: 'Hợp lệ trong mẫu' },
  actions: {
    approve: 'Phê duyệt & cấp Verified',
    review: 'Yêu cầu phúc tra',
    details: 'Xem hồ sơ mẫu',
    reject: 'Từ chối hồ sơ'
  },
  results: '{{count}} hồ sơ trong mẫu',
  empty: 'Không có hồ sơ phù hợp.',
  previous: 'Trang trước',
  next: 'Trang sau',
  page: 'Trang {{page}} / {{pages}}',
  diagnostics: 'Đối chiếu OCR & CCHN',
  diagnosticsHint: 'Chưa kết nối cổng dữ liệu Bộ Y tế. Các trạng thái trong bảng chỉ là mẫu thiết kế.',
  diagnosticsRows: { identity: 'Họ tên & giấy tờ', license: 'Hiệu lực chứng chỉ', revoke: 'Lịch sử thu hồi' },
  diagnosticsValue: 'Chưa xác minh trực tiếp',
  clinical: 'Trạm phỏng vấn lâm sàng',
  clinicalHint: 'Cuộc gọi và bài kiểm tra thực tế cần tích hợp dịch vụ và quy trình kiểm định.',
  call: 'Bắt đầu cuộc gọi kiểm tra',
  guarantor: 'Bảo lãnh trách nhiệm dân sự',
  guarantorHint: 'Thông tin ký quỹ và bảo hiểm trong mẫu cần đối chiếu với hợp đồng đối tác.',
  previewTitle: 'Hồ sơ điều dưỡng mẫu',
  previewHint: 'Thông tin này chưa được kiểm chứng từ hệ thống thẩm định.',
  close: 'Đóng',
  candidateNotes: {
    huong: 'Bài kiểm tra chuyên môn mẫu đạt 96/100; chờ quyết định cuối.',
    khanh: 'Mẫu ghi nhận số phôi chứng chỉ cần đối chiếu lại.',
    loan: 'Bài kiểm tra chuyên môn mẫu đạt 98/100; chờ chốt thẩm định.'
  }
} as const

export const adminQualityEn = {
  documentTitle: 'Caregiver quality control | CareConnect Admin',
  breadcrumb: 'Quality control & clinical safety',
  title: 'Caregiver verification & quality control',
  subtitle: 'Preview credentials, licenses and review steps before caregivers can accept care shifts.',
  sample: 'Illustrative October 2025 data · No live Ministry of Health or verification connection.',
  tier: 'Final review gate · preview',
  standards: 'Review standards',
  export: 'Export sample CSV',
  history: 'Approval history',
  unavailable: 'Requires verified records, backend APIs and Admin authorization',
  metrics: {
    urgent: 'Needs review',
    approved: 'Approved this month',
    review: 'License rechecks',
    rejected: 'Rejected / blacklisted'
  },
  metricHints: {
    urgent: '14 files in the design',
    approved: 'Sample pass rate: 89.4%',
    review: '6 files need comparison',
    rejected: '2 flagged files in the design'
  },
  process: 'Three-layer clinical review',
  processHint: 'Reference flow from the design; not automated verification results.',
  steps: {
    center: 'Partner center prescreening',
    license: 'License and document comparison',
    admin: 'Medical panel & Admin decision'
  },
  search: 'Search caregiver, record ID, license or center',
  center: 'Nominating center',
  specialty: 'Specialty',
  risk: 'Risk level',
  status: 'Status',
  all: 'All',
  specialties: { general: 'General nursing', rehab: 'Rehabilitation', elderly: 'Geriatric & palliative care' },
  risks: { low: 'Low risk', medium: 'Medium risk', high: 'Needs attention' },
  tabs: { all: 'All pending', license: 'License check', center: 'Center prescreened', interview: 'Clinical interview' },
  columns: {
    caregiver: 'Caregiver & identity',
    center: 'Nominating center',
    license: 'Practice license',
    background: 'Background & health',
    assessment: 'Clinical assessment',
    status: 'Audit status',
    actions: 'Admin decision'
  },
  age: '{{count}} years old',
  licenseId: 'Practice license',
  centerSignoff: 'Center prescreening',
  backgroundSample: 'Sample background record',
  clinicalScore: '{{score}} / 100',
  reviewProgress: 'Sample completion: {{value}}%',
  statuses: {
    ready: 'Awaiting Admin approval',
    discrepancy: 'License number needs checking',
    clinical: 'Awaiting final review'
  },
  licenseStates: {
    match: 'Matched in design sample',
    mismatch: 'License number requires comparison',
    valid: 'Valid in design sample'
  },
  actions: {
    approve: 'Approve & mark verified',
    review: 'Request recheck',
    details: 'View sample record',
    reject: 'Reject application'
  },
  results: '{{count}} sample records',
  empty: 'No matching records.',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page {{page}} / {{pages}}',
  diagnostics: 'OCR & license comparison',
  diagnosticsHint: 'No live Ministry of Health data connection. Table statuses are design samples only.',
  diagnosticsRows: { identity: 'Name & identity', license: 'License validity', revoke: 'Revocation history' },
  diagnosticsValue: 'Not verified live',
  clinical: 'Clinical interview station',
  clinicalHint: 'Live calls and practical tests require an integrated service and review process.',
  call: 'Start assessment call',
  guarantor: 'Civil liability guarantee',
  guarantorHint: 'Deposit and insurance details in the design require partner contract verification.',
  previewTitle: 'Sample caregiver record',
  previewHint: 'This information has not been verified against a live review system.',
  close: 'Close',
  candidateNotes: {
    huong: 'Sample clinical score is 96/100; awaiting final decision.',
    khanh: 'The design flags a license number for rechecking.',
    loan: 'Sample clinical score is 98/100; awaiting final review.'
  }
} as const
