export const adminPoliciesVi = {
  documentTitle: 'Cấu hình chính sách | Quản trị CareConnect',
  breadcrumb: 'Thiết lập quy chuẩn',
  title: 'Cấu hình Chính sách & Đối soát Tài chính',
  version: 'Bản minh họa v3.2 · 01/10/2025',
  intro: 'Xem trước tỷ lệ đặt cọc, quy tắc hoàn tiền, phân bổ doanh thu và chu kỳ đối soát.',
  sample: 'Chỉ là cấu hình minh họa; chưa phải chính sách đang áp dụng.',
  simulate: 'Mô phỏng tính toán',
  tabs: {
    deposit: 'Đặt cọc & hoàn tiền',
    commission: 'Hoa hồng & dòng tiền',
    payout: 'Đối soát & thanh toán',
    risk: 'Quỹ rủi ro & tiền tạm giữ'
  },
  depositTitle: 'Chính sách đặt cọc lịch hẹn',
  depositHint: 'Bản nháp mức ứng trước để mô phỏng ca chăm sóc.',
  depositRate: 'Tỷ lệ đặt cọc tiêu chuẩn',
  depositRange: 'Giới hạn minh họa: 20%–50%',
  simulation: 'Ví dụ ca chăm sóc {{amount}}',
  simulationResult: 'Cọc dự kiến: {{amount}}',
  draft: 'Thay đổi chỉ hiển thị trên thiết bị này và không được lưu.',
  shiftTypes: 'Phân cấp theo loại hình chăm sóc',
  shifts: { short: 'Ca ngắn linh hoạt', day: 'Ca ban ngày tiêu chuẩn', liveIn: 'Ca lưu trú / dài ngày' },
  shiftHints: {
    short: '1–4 giờ · thủ thuật ngắn',
    day: '8–12 giờ · chăm sóc ban ngày',
    liveIn: '24/7 · chăm sóc dài ngày'
  },
  escrowTitle: 'Cơ chế ký quỹ (minh họa)',
  escrowHint:
    'Quy trình giữ và giải ngân tiền cọc cần được xác nhận bằng hợp đồng và quy định thanh toán chính thức trước khi áp dụng.',
  refundTitle: 'Ma trận hoàn tiền khi hủy ca',
  refundHint: 'Các mức hoàn tiền dưới đây chỉ mang tính minh họa.',
  refundSteps: {
    early: 'Trước hơn 24 giờ',
    standard: 'Từ 12 đến 24 giờ',
    late: 'Từ 4 đến 12 giờ',
    urgent: 'Dưới 4 giờ hoặc đã di chuyển'
  },
  refundDescriptions: {
    early: 'Hoàn toàn bộ tiền cọc trong ví dụ.',
    standard: 'Giữ lại 30% tiền cọc trong ví dụ.',
    late: 'Giữ lại 50% tiền cọc trong ví dụ.',
    urgent: 'Không hoàn tiền cọc trong ví dụ.'
  },
  refundAmount: 'Hoàn {{value}}%',
  forceMajeure: 'Trường hợp bất khả kháng',
  forceMajeureHint: 'Yêu cầu xử lý ngoại lệ phải được thẩm định bởi người có quyền theo quy trình chính thức.',
  commissionTitle: 'Phân bổ dòng tiền ca trực & hoa hồng',
  commissionHint: 'Tỷ lệ minh họa sau khi hoàn tất ca chăm sóc.',
  split: { caregiver: 'Điều dưỡng trực tiếp', center: 'Trung tâm đối tác', platform: 'Nền tảng CareConnect' },
  tierTitle: 'Chiết khấu theo cấp bậc trung tâm',
  tiers: { gold: 'Hạng Vàng', silver: 'Hạng Bạc', standard: 'Tiêu chuẩn' },
  tierHints: {
    gold: 'Trên 500 ca/tháng · đánh giá trên 4,9',
    silver: '100–499 ca/tháng · đánh giá trên 4,7',
    standard: 'Trung tâm mới hoặc dưới 100 ca/tháng'
  },
  tierFee: 'Phí sàn minh họa',
  payoutTitle: 'Chu kỳ đối soát & giải ngân',
  payoutHint: 'Lựa chọn chu kỳ ở đây chỉ thay đổi bản nháp trên trang.',
  cycle: 'Chu kỳ kết toán',
  cycles: { weekly: 'Hàng tuần', biweekly: 'Hai lần mỗi tháng', monthly: 'Hàng tháng' },
  cycleHints: {
    weekly: 'Chốt Chủ Nhật, dự kiến chi trả Thứ Hai',
    biweekly: 'Dự kiến ngày 01 và 15',
    monthly: 'Dự kiến cuối tháng'
  },
  cutoff: 'Thời gian chốt đối soát',
  cutoffValue: 'Trước kỳ chi trả 24 giờ',
  minimum: 'Hạn mức giải ngân tối thiểu',
  riskTitle: 'Quỹ rủi ro & dự phòng',
  riskHint: 'Đề xuất minh họa: giữ lại 5% trong 7 ngày; chưa phải quy định chính thức.',
  gatewayTitle: 'Cổng thanh toán (minh họa)',
  gatewayHint: 'Chưa có dữ liệu giao dịch thực tế.',
  legalTitle: 'Căn cứ pháp lý & tuân thủ',
  legalHint: 'Các điều khoản và căn cứ pháp lý dưới đây cần được bộ phận pháp chế xác nhận trước khi công bố.'
} as const

export const adminPoliciesEn = {
  documentTitle: 'Platform policy settings | CareConnect Admin',
  breadcrumb: 'Platform standards',
  title: 'Policy settings & financial reconciliation',
  version: 'Sample v3.2 · October 1, 2025',
  intro: 'Preview deposit rates, refund rules, revenue allocation and payout cycles.',
  sample: 'Illustrative settings only; these are not active platform policies.',
  simulate: 'Run calculation preview',
  tabs: {
    deposit: 'Deposits & refunds',
    commission: 'Commission & cash flow',
    payout: 'Reconciliation & payout',
    risk: 'Risk reserve & held funds'
  },
  depositTitle: 'Booking deposit policy',
  depositHint: 'Draft advance rate for a care shift preview.',
  depositRate: 'Standard deposit rate',
  depositRange: 'Illustrative range: 20%–50%',
  simulation: 'Example care shift: {{amount}}',
  simulationResult: 'Estimated deposit: {{amount}}',
  draft: 'Changes stay on this device and are not saved.',
  shiftTypes: 'Deposit rates by care format',
  shifts: { short: 'Flexible short shift', day: 'Standard daytime shift', liveIn: 'Live-in / extended shift' },
  shiftHints: {
    short: '1–4 hours · short procedures',
    day: '8–12 hours · daytime care',
    liveIn: '24/7 · long-term care'
  },
  escrowTitle: 'Deposit holding model (sample)',
  escrowHint: 'Deposit holding and payouts must be confirmed by contracts and official payment rules before use.',
  refundTitle: 'Cancellation refund matrix',
  refundHint: 'The refund percentages below are examples only.',
  refundSteps: {
    early: 'More than 24 hours before',
    standard: '12 to 24 hours before',
    late: '4 to 12 hours before',
    urgent: 'Under 4 hours or caregiver en route'
  },
  refundDescriptions: {
    early: 'Return the full deposit in this example.',
    standard: 'Retain 30% of the deposit in this example.',
    late: 'Retain 50% of the deposit in this example.',
    urgent: 'No deposit refund in this example.'
  },
  refundAmount: '{{value}}% refunded',
  forceMajeure: 'Exceptional circumstances',
  forceMajeureHint: 'Exceptions require authorized review under the official process.',
  commissionTitle: 'Shift cash flow & commission',
  commissionHint: 'Illustrative allocation after a completed shift.',
  split: { caregiver: 'Direct caregiver', center: 'Partner center', platform: 'CareConnect platform' },
  tierTitle: 'Center tier discounts',
  tiers: { gold: 'Gold partner', silver: 'Silver partner', standard: 'Standard' },
  tierHints: {
    gold: 'Over 500 shifts/month · rating above 4.9',
    silver: '100–499 shifts/month · rating above 4.7',
    standard: 'New center or under 100 shifts/month'
  },
  tierFee: 'Illustrative platform fee',
  payoutTitle: 'Reconciliation & payout cycle',
  payoutHint: 'Choosing a cycle only changes this local draft.',
  cycle: 'Settlement cycle',
  cycles: { weekly: 'Weekly', biweekly: 'Twice monthly', monthly: 'Monthly' },
  cycleHints: {
    weekly: 'Close on Sunday, expected payout Monday',
    biweekly: 'Expected on the 1st and 15th',
    monthly: 'Expected at month end'
  },
  cutoff: 'Reconciliation cutoff',
  cutoffValue: '24 hours before payout',
  minimum: 'Minimum payout',
  riskTitle: 'Risk reserve',
  riskHint: 'Sample proposal: hold 5% for 7 days; not an official rule.',
  gatewayTitle: 'Payment gateways (sample)',
  gatewayHint: 'No live connection or transaction status is available.',
  legalTitle: 'Legal basis & compliance',
  legalHint: 'The legal references and terms below require legal review before publication.'
} as const
