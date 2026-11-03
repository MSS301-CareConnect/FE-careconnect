export const managerStatisticsVi = {
  menu: 'Thống kê trung tâm',
  documentTitle: 'Thống kê trung tâm | CareConnect',
  title: 'Thống kê trung tâm',
  subtitle: 'Số liệu vận hành thực tế của trung tâm bạn quản lý.',
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
    }
  }
} as const

export const managerStatisticsEn = {
  menu: 'Center statistics',
  documentTitle: 'Center statistics | CareConnect',
  title: 'Center statistics',
  subtitle: 'Live operational data for the center you manage.',
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
    }
  }
} as const
