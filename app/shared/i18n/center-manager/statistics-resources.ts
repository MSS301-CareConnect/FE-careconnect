export const managerStatisticsVi = {
  menu: 'Thống kê trung tâm',
  documentTitle: 'Thống kê trung tâm | CareConnect',
  title: 'Thống kê trung tâm',
  subtitle: 'Lịch đặt, buổi chăm sóc, chất lượng và doanh thu của trung tâm bạn quản lý — theo kỳ bạn chọn.',
  operations: {
    title: 'Vận hành chăm sóc',
    hint: 'Lịch đặt tạo trong kỳ và các buổi chăm sóc bắt đầu trong kỳ.'
  },
  quality: {
    title: 'Chất lượng & đội ngũ',
    hint: 'Đánh giá của khách, khiếu nại và người chăm sóc nổi bật.'
  },
  revenue: {
    title: 'Doanh thu của trung tâm',
    hint: 'Tiền khách đã thanh toán trừ tiền đã hoàn và phần cọc bị giữ thuộc người chăm sóc, theo PaymentService.',
    period: 'Khoảng thời gian',
    periods: { month: 'Tháng này', last30: '30 ngày qua', year: 'Năm nay' },
    loading: 'Đang tải doanh thu…',
    metrics: {
      net: 'Doanh thu thuần',
      gross: 'Đã thu',
      refunded: 'Đã hoàn',
      payments: 'Số giao dịch thành công',
      centerForfeit: 'Cọc bị giữ — trung tâm hưởng',
      caregiverForfeit: 'Cọc bị giữ — người chăm sóc hưởng'
    },
    hints: {
      net: 'TB {{amount}} / giao dịch',
      gross: '{{count}} giao dịch thành công',
      refunded: '{{percent}} số đã thu',
      wallet: 'Ví trung tâm có {{amount}}'
    },
    walletIncome: 'Thực nhận vào ví',
    chartTitle: 'Tiền vào ví trung tâm theo thời gian',
    chartHint: 'Tiền buổi đã phục vụ (sau hoa hồng) và cọc giữ lại, cùng số đã rút.',
    income: 'Thực nhận',
    withdrawn: 'Đã rút',
    breakdownTitle: 'Cơ cấu thu nhập của ví',
    breakdownHint: 'Các khoản cộng / trừ vào ví trung tâm trong kỳ.',
    breakdown: {
      serviceIncome: 'Tiền buổi đã phục vụ',
      forfeitIncome: 'Cọc giữ lại (buổi chưa phân công)',
      commissionDeducted: 'Hoa hồng nền tảng đã trừ',
      complaintDebits: 'Trừ do hoàn khiếu nại'
    },
    viewWallet: 'Xem ví trung tâm'
  }
}

export const managerStatisticsEn: typeof managerStatisticsVi = {
  menu: 'Center statistics',
  documentTitle: 'Center statistics | CareConnect',
  title: 'Center statistics',
  subtitle: 'Bookings, care visits, quality and revenue of the center you manage — for the period you choose.',
  operations: {
    title: 'Care operations',
    hint: 'Bookings created and care visits starting in this period.'
  },
  quality: {
    title: 'Quality & team',
    hint: 'Customer ratings, complaints and the most active caregivers.'
  },
  revenue: {
    title: 'Center revenue',
    hint: 'What customers paid minus refunds and the kept deposits that belong to caregivers, from PaymentService.',
    period: 'Period',
    periods: { month: 'This month', last30: 'Last 30 days', year: 'This year' },
    loading: 'Loading revenue…',
    metrics: {
      net: 'Net revenue',
      gross: 'Collected',
      refunded: 'Refunded',
      payments: 'Successful payments',
      centerForfeit: 'Kept deposits — center',
      caregiverForfeit: 'Kept deposits — caregivers'
    },
    hints: {
      net: 'Average {{amount}} per payment',
      gross: '{{count}} successful payments',
      refunded: '{{percent}} of what was collected',
      wallet: 'The center wallet holds {{amount}}'
    },
    walletIncome: 'Received in the wallet',
    chartTitle: 'Money into the center wallet over time',
    chartHint: 'Served visits (after commission) and kept deposits, with what was withdrawn.',
    income: 'Received',
    withdrawn: 'Withdrawn',
    breakdownTitle: 'Wallet income breakdown',
    breakdownHint: 'What was added to and taken from the center wallet in this period.',
    breakdown: {
      serviceIncome: 'Served visits',
      forfeitIncome: 'Kept deposits (unassigned visits)',
      commissionDeducted: 'Platform commission deducted',
      complaintDebits: 'Complaint refunds deducted'
    },
    viewWallet: 'Open the center wallet'
  }
}
