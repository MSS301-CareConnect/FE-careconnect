// Admin "Tổng quan" (2026-11-10): live platform numbers only — BookingService operations, PaymentService money,
// Identity accounts and ProviderService partners. The September 2026 sample charts were removed (A-15).
export const adminDashboardVi = {
  documentTitle: 'Tổng quan nền tảng | Quản trị CareConnect',
  title: 'Tổng quan nền tảng',
  subtitle: 'Hoạt động chăm sóc, dòng tiền và đối tác trên toàn nền tảng — số liệu thực tế theo kỳ bạn chọn.',
  kpis: {
    collected: 'Khách đã thanh toán',
    collectedHint: '{{count}} giao dịch thành công',
    commission: 'Hoa hồng nền tảng',
    commissionHint: 'Thu trên {{count}} lịch đặt',
    customers: 'Khách hàng mới',
    customersHint: '{{count}} khách hàng trên nền tảng'
  },
  attention: {
    title: 'Việc cần xử lý',
    hint: 'Những hàng đợi đang chờ quản trị viên.',
    pendingCenters: 'Trung tâm chờ duyệt',
    pendingCaregivers: 'Người chăm sóc chờ thẩm định',
    pendingWithdrawals: 'Yêu cầu rút tiền chờ xử lý',
    escalatedComplaints: 'Khiếu nại chuyển lên admin',
    open: 'Mở {{name}}',
    clear: 'Không có việc nào đang chờ'
  },
  finance: {
    title: 'Doanh thu nền tảng',
    hint: 'Tiền khách thanh toán, hoàn tiền và hoa hồng nền tảng trong kỳ (PaymentService).',
    chartTitle: 'Hoa hồng theo thời gian',
    chartHint: 'Hoa hồng ghi nhận khi buổi chăm sóc được đối soát.',
    commission: 'Hoa hồng',
    breakdownTitle: 'Cơ cấu dòng tiền trong kỳ',
    breakdownHint: 'Từ tiền khách trả tới phần trung tâm thực nhận.',
    gross: 'Khách đã thanh toán',
    refunded: 'Đã hoàn cho khách',
    caregiverForfeit: 'Cọc bị giữ — người chăm sóc hưởng',
    centerNet: 'Doanh thu thuần các trung tâm (trước hoa hồng)',
    commissionShare: 'Hoa hồng nền tảng',
    liabilities: 'Số dư ví khách hàng và người chăm sóc',
    viewRevenue: 'Xem doanh thu nền tảng'
  },
  operations: {
    title: 'Vận hành chăm sóc',
    hint: 'Lịch đặt, buổi chăm sóc và chất lượng dịch vụ toàn nền tảng.'
  },
  partners: {
    title: 'Người dùng & đối tác',
    hint: 'Tài khoản theo vai trò, trạng thái trung tâm và hồ sơ người chăm sóc.',
    accounts: 'Tài khoản theo vai trò',
    accountsCenter: 'tài khoản',
    centers: 'Trung tâm theo trạng thái',
    centersCenter: 'trung tâm',
    verification: 'Hồ sơ người chăm sóc',
    verificationCenter: 'hồ sơ'
  }
}

export const adminDashboardEn: typeof adminDashboardVi = {
  documentTitle: 'Platform overview | CareConnect Admin',
  title: 'Platform overview',
  subtitle: 'Care activity, money flow and partners across the platform — live numbers for the period you choose.',
  kpis: {
    collected: 'Paid by customers',
    collectedHint: '{{count}} successful payments',
    commission: 'Platform commission',
    commissionHint: 'From {{count}} bookings',
    customers: 'New customers',
    customersHint: '{{count}} customers on the platform'
  },
  attention: {
    title: 'Needs attention',
    hint: 'Queues waiting for an administrator.',
    pendingCenters: 'Centers awaiting approval',
    pendingCaregivers: 'Caregivers awaiting verification',
    pendingWithdrawals: 'Withdrawal requests waiting',
    escalatedComplaints: 'Complaints escalated to admin',
    open: 'Open {{name}}',
    clear: 'Nothing is waiting'
  },
  finance: {
    title: 'Platform revenue',
    hint: 'What customers paid, refunds and the platform commission in this period (PaymentService).',
    chartTitle: 'Commission over time',
    chartHint: 'Commission is recorded when a care visit is settled.',
    commission: 'Commission',
    breakdownTitle: 'Money flow in this period',
    breakdownHint: 'From what customers paid to what centers keep.',
    gross: 'Paid by customers',
    refunded: 'Refunded to customers',
    caregiverForfeit: 'Kept deposits — caregivers',
    centerNet: 'Net revenue of all centers (before commission)',
    commissionShare: 'Platform commission',
    liabilities: 'Customer and caregiver wallet balances',
    viewRevenue: 'Open platform revenue'
  },
  operations: {
    title: 'Care operations',
    hint: 'Bookings, care visits and service quality across the platform.'
  },
  partners: {
    title: 'Users & partners',
    hint: 'Accounts by role, center status and caregiver profiles.',
    accounts: 'Accounts by role',
    accountsCenter: 'accounts',
    centers: 'Centers by status',
    centersCenter: 'centers',
    verification: 'Caregiver profiles',
    verificationCenter: 'profiles'
  }
}
