export const customerHomeEn = {
  documentTitle: 'Customer Home | CareConnect',
  book: 'Book home care',
  findCaregivers: 'Find a caregiver',
  greeting: 'Hello, {{name}}',
  upcoming: {
    title: 'Upcoming care',
    loading: 'Loading your bookings…',
    error: 'Your bookings could not be loaded.',
    emptyTitle: 'No upcoming visit',
    empty: 'Book care in four short steps — nothing is charged until the center confirms.',
    nextVisit: 'Next visit',
    noVisitYet: 'Visit times are set once the center confirms.',
    progress: '{{done, number}}/{{total, number}} visits done',
    code: 'Code {{code}}',
    view: 'View details',
    payDeposit: 'Pay the deposit',
    all: 'All bookings'
  },
  shortcuts: {
    title: 'Shortcuts',
    book: { title: 'Book care', description: 'Choose who, what and when' },
    relatives: { title: 'Family profiles', description: 'Health notes and care address' },
    payments: { title: 'Payments', description: 'Invoices and refunds', due: '{{count, number}} awaiting payment' }
  },
  featuredServices: { title: 'Popular services', all: 'All services', from: 'From {{price}} / {{unit}}' },
  featuredCaregivers: { title: 'Caregivers at your center', all: 'All caregivers' },
  trust: {
    title: 'Why families choose CareConnect',
    verified: {
      title: 'Verified caregivers',
      description: 'Every caregiver and certificate is checked by the center.'
    },
    prices: { title: 'Clear prices', description: 'See the full quote before you send a request.' },
    support: { title: 'Help when you need it', description: 'Call our support line every day, 7:00–22:00.' }
  },
  priceUnit: { HOUR: 'hour', DAY: 'day', SHIFT: 'shift' }
} as const

export const customerHomeVi = {
  documentTitle: 'Trang chủ khách hàng | CareConnect',
  book: 'Đặt lịch chăm sóc',
  findCaregivers: 'Tìm người chăm sóc',
  greeting: 'Xin chào, {{name}}',
  upcoming: {
    title: 'Lịch sắp tới',
    loading: 'Đang tải lịch đặt…',
    error: 'Không tải được lịch đặt của bạn.',
    emptyTitle: 'Chưa có buổi chăm sóc sắp tới',
    empty: 'Đặt lịch chỉ với bốn bước ngắn — chưa thu tiền cho đến khi trung tâm xác nhận.',
    nextVisit: 'Buổi kế tiếp',
    noVisitYet: 'Giờ các buổi được chốt sau khi trung tâm xác nhận.',
    progress: 'Đã xong {{done, number}}/{{total, number}} buổi',
    code: 'Mã {{code}}',
    view: 'Xem chi tiết',
    payDeposit: 'Thanh toán cọc',
    all: 'Tất cả lịch đặt'
  },
  shortcuts: {
    title: 'Lối tắt',
    book: { title: 'Đặt lịch', description: 'Chọn người, dịch vụ và thời gian' },
    relatives: { title: 'Hồ sơ người thân', description: 'Ghi chú sức khỏe và địa chỉ chăm sóc' },
    payments: { title: 'Thanh toán', description: 'Hóa đơn và hoàn tiền', due: '{{count, number}} lịch chờ thanh toán' }
  },
  featuredServices: { title: 'Dịch vụ nổi bật', all: 'Tất cả dịch vụ', from: 'Từ {{price}} / {{unit}}' },
  featuredCaregivers: { title: 'Người chăm sóc tại trung tâm', all: 'Tất cả người chăm sóc' },
  trust: {
    title: 'Vì sao các gia đình chọn CareConnect',
    verified: {
      title: 'Người chăm sóc đã xác minh',
      description: 'Mọi người chăm sóc và chứng chỉ đều được trung tâm kiểm tra.'
    },
    prices: { title: 'Giá rõ ràng', description: 'Xem báo giá đầy đủ trước khi gửi yêu cầu.' },
    support: { title: 'Luôn có người hỗ trợ', description: 'Gọi tổng đài mỗi ngày, 07:00–22:00.' }
  },
  priceUnit: { HOUR: 'giờ', DAY: 'ngày', SHIFT: 'ca' }
} as const
