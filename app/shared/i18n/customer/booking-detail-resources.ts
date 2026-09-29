export const bookingDetailEn = {
  documentTitle: 'Booking {{code}} | CareConnect',
  breadcrumb: 'Booking details',
  title: 'Care session details',
  sampleNotice: 'This page shows sample booking data. Live clinical updates and actions are not connected yet.',
  notFound: {
    title: 'Booking not found',
    description: 'This booking code is not in the available booking preview.',
    back: 'Back to my bookings'
  },
  status: {
    ongoing: 'Care in progress',
    upcoming: 'Care scheduled',
    completed: 'Care completed',
    cancelled: 'Booking cancelled'
  },
  timeline: {
    title: 'Care session progress',
    schedule: 'Scheduled session',
    progress: 'Session progress',
    current: 'Current step',
    steps: {
      confirmed: 'Booking confirmed',
      assigned: 'Caregiver assigned',
      checkIn: 'Home check-in',
      care: 'Care in progress',
      complete: 'Session handover'
    },
    note: {
      ongoing: 'The caregiver is carrying out the scheduled care plan.',
      upcoming: 'The session is confirmed and waiting for the scheduled start time.',
      completed: 'The care session has ended.',
      cancelled: 'This booking was cancelled. No care session is in progress.'
    }
  },
  vitals: {
    title: 'Sample vital signs',
    measured: 'Illustrative measurements from the provided design',
    stable: 'Stable',
    bloodPressure: 'Blood pressure',
    oxygen: 'Oxygen saturation',
    pulse: 'Heart rate',
    temperature: 'Body temperature',
    glucose: 'Blood glucose',
    next: 'Next scheduled check',
    normal: 'Normal',
    good: 'Good',
    regular: 'Regular',
    beforeMeal: 'Before meal'
  },
  feed: {
    title: 'Sample care journal',
    subtitle: 'Illustrative entries from the provided design',
    entries: {
      start: { title: 'Session started', description: 'Check-in and initial wellbeing assessment.' },
      medicine: { title: 'Morning medication', description: 'Medication support according to the care plan.' },
      nursing: { title: 'Nursing care', description: 'Personal care and dressing check.' },
      therapy: { title: 'Mobility exercises', description: 'Assisted rehabilitation exercises.' },
      lunch: { title: 'Preparing lunch', description: 'A suitable meal is being prepared.' }
    }
  },
  service: {
    title: 'Care service package',
    description: 'The care plan associated with this booking.',
    included: 'Planned care activities',
    items: {
      monitoring: 'Monitor vital signs during the session',
      movement: 'Support mobility and rehabilitation exercises',
      hygiene: 'Assist with safe personal care',
      medication: 'Support medication according to instructions',
      report: 'Prepare a care summary after the session'
    }
  },
  people: {
    title: 'Care location and recipient',
    address: 'Care location',
    patient: 'Care recipient',
    caregiver: 'Assigned caregiver',
    caregiverNote: 'Caregiver details are shown as a preview.'
  },
  payment: {
    title: 'Cost and payment',
    total: 'Session total',
    paid: 'Deposit paid',
    remaining: 'Remaining balance',
    refunded: 'Deposit refunded',
    status: 'Payment status'
  },
  policy: {
    title: 'Cancellation and support',
    before: 'Cancellation and refund terms depend on the confirmed booking policy.',
    during: 'For urgent care concerns, contact CareConnect support through the official channel.',
    unavailable: 'Calling, messaging, and emergency stop are available after backend integration.',
    call: 'Call caregiver',
    message: 'Message caregiver',
    stop: 'Request emergency stop'
  }
} as const

export const bookingDetailVi = {
  documentTitle: 'Chi tiết lịch {{code}} | CareConnect',
  breadcrumb: 'Chi tiết ca trực',
  title: 'Chi tiết ca chăm sóc',
  sampleNotice: 'Trang đang hiển thị dữ liệu lịch đặt mẫu. Cập nhật lâm sàng và thao tác trực tiếp chưa được kết nối.',
  notFound: {
    title: 'Không tìm thấy lịch đặt',
    description: 'Mã lịch đặt này không có trong dữ liệu mẫu hiện tại.',
    back: 'Quay lại lịch đặt của tôi'
  },
  status: {
    ongoing: 'Đang chăm sóc',
    upcoming: 'Sắp diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  },
  timeline: {
    title: 'Tiến trình ca trực',
    schedule: 'Thời gian ca trực',
    progress: 'Tiến độ ca',
    current: 'Giai đoạn hiện tại',
    steps: {
      confirmed: 'Đã xác nhận đặt lịch',
      assigned: 'Đã phân công',
      checkIn: 'Check-in tại nhà',
      care: 'Đang chăm sóc',
      complete: 'Nghiệm thu ca'
    },
    note: {
      ongoing: 'Điều dưỡng đang thực hiện kế hoạch chăm sóc đã đặt.',
      upcoming: 'Ca trực đã được xác nhận và đang chờ đến giờ bắt đầu.',
      completed: 'Ca chăm sóc đã kết thúc.',
      cancelled: 'Lịch đặt đã bị hủy. Hiện không có ca chăm sóc nào đang diễn ra.'
    }
  },
  vitals: {
    title: 'Chỉ số sinh hiệu mẫu',
    measured: 'Số đo minh họa theo giao diện được cung cấp',
    stable: 'Ổn định',
    bloodPressure: 'Huyết áp',
    oxygen: 'Oxy máu',
    pulse: 'Nhịp tim',
    temperature: 'Thân nhiệt',
    glucose: 'Đường huyết',
    next: 'Lần đo kế tiếp theo lịch',
    normal: 'Bình thường',
    good: 'Tốt',
    regular: 'Đều',
    beforeMeal: 'Trước ăn'
  },
  feed: {
    title: 'Nhật ký chăm sóc mẫu',
    subtitle: 'Các mục minh họa theo giao diện được cung cấp',
    entries: {
      start: { title: 'Bắt đầu ca trực', description: 'Check-in và kiểm tra sức khỏe ban đầu.' },
      medicine: { title: 'Dùng thuốc sáng', description: 'Hỗ trợ dùng thuốc theo kế hoạch chăm sóc.' },
      nursing: { title: 'Chăm sóc điều dưỡng', description: 'Vệ sinh cá nhân và kiểm tra băng gạc.' },
      therapy: { title: 'Tập phục hồi vận động', description: 'Hỗ trợ các bài tập phục hồi chức năng.' },
      lunch: { title: 'Chuẩn bị bữa trưa', description: 'Đang chuẩn bị bữa ăn phù hợp.' }
    }
  },
  service: {
    title: 'Thông tin gói dịch vụ y tế',
    description: 'Kế hoạch chăm sóc gắn với lịch đặt này.',
    included: 'Nội dung chăm sóc dự kiến',
    items: {
      monitoring: 'Theo dõi sinh hiệu trong ca trực',
      movement: 'Hỗ trợ tập vận động và phục hồi chức năng',
      hygiene: 'Hỗ trợ vệ sinh cá nhân an toàn',
      medication: 'Hỗ trợ dùng thuốc theo hướng dẫn',
      report: 'Tổng hợp báo cáo chăm sóc sau ca'
    }
  },
  people: {
    title: 'Địa chỉ & người nhận chăm sóc',
    address: 'Địa điểm chăm sóc',
    patient: 'Người nhận chăm sóc',
    caregiver: 'Điều dưỡng phụ trách',
    caregiverNote: 'Thông tin điều dưỡng đang ở chế độ xem mẫu.'
  },
  payment: {
    title: 'Chi phí & thanh toán',
    total: 'Tổng chi phí ca trực',
    paid: 'Tiền cọc đã thanh toán',
    remaining: 'Còn lại cần quyết toán',
    refunded: 'Tiền cọc đã hoàn',
    status: 'Tình trạng thanh toán'
  },
  policy: {
    title: 'Chính sách hủy ca & hỗ trợ',
    before: 'Điều kiện hủy và hoàn cọc áp dụng theo chính sách của lịch đặt đã xác nhận.',
    during: 'Nếu có vấn đề chăm sóc khẩn cấp, hãy liên hệ CareConnect qua kênh hỗ trợ chính thức.',
    unavailable: 'Gọi điện, nhắn tin và dừng ca khẩn cấp sẽ khả dụng sau khi kết nối backend.',
    call: 'Gọi điện cho điều dưỡng',
    message: 'Nhắn tin cho điều dưỡng',
    stop: 'Yêu cầu dừng ca khẩn cấp'
  }
} as const
