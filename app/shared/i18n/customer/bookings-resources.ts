export const bookingsEn = {
  documentTitle: 'My Bookings | CareConnect',
  breadcrumb: 'My Bookings',
  title: 'Manage care bookings',
  subtitle: 'Track confirmed sessions, care updates, and schedules for your family.',
  newBooking: 'Book a new care session',
  sampleNotice: 'Preview bookings while live booking history is being connected.',
  stats: {
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled / Refunded'
  },
  tabs: {
    all: 'All bookings',
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled'
  },
  filters: {
    month: 'Month',
    allMonths: 'All dates',
    patient: 'Family member',
    allPatients: 'All family members',
    search: 'Search by booking code, family member, or caregiver',
    reset: 'Reset filters'
  },
  patients: {
    father: 'Mr. Nguyen Van An',
    mother: 'Ms. Nguyen Thi A'
  },
  items: {
    ongoing: {
      status: 'In progress',
      patient: 'Mr. Nguyen Van An',
      relation: '78 years old · Father (high blood pressure)',
      caregiverRole: 'Emergency care specialist',
      service: 'Advanced elderly care',
      location: 'Apartment 18.04, Landmark 2, Vinhomes Central Park, Binh Thanh',
      note: 'Checked in at 07:55 · 4h 15m of 9h completed',
      payment: '50% deposit paid · 800,000 ₫ remaining'
    },
    upcoming: {
      status: 'Confirmed and deposit paid',
      patient: 'Ms. Nguyen Thi A',
      relation: '76 years old · Mother (postoperative care)',
      caregiverRole: 'Nursing graduate · 4.9 rating',
      service: 'Recovery and mobility support',
      location: 'Villa 42, Street 12, Thao Dien, Thu Duc City',
      note: 'Session confirmed · Caregiver assigned',
      payment: '750,000 ₫ deposit paid · 700,000 ₫ remaining'
    },
    completed: {
      status: 'Completed',
      patient: 'Ms. Nguyen Thi A',
      relation: '76 years old · Mother',
      caregiverRole: '10 years of elderly care experience',
      service: 'Routine nursing and blood sugar monitoring',
      location: 'Thao Dien, Thu Duc City',
      note: 'Your rating: 5/5 · Attentive care and timely reports',
      payment: 'Paid in full via Visa · Invoice #VAT-9750'
    },
    cancelled: {
      status: 'Cancelled and fully refunded',
      patient: 'Mr. Nguyen Van An',
      relation: '78 years old · Father',
      caregiverRole: 'Cardiology specialist',
      service: 'Home nursing care',
      location: 'Binh Thanh, Ho Chi Minh City',
      note: 'Cancelled more than 24 hours before the session',
      payment: '100% deposit refunded · 450,000 ₫'
    }
  },
  labels: {
    patient: 'Care recipient',
    caregiver: 'Assigned caregiver',
    service: 'Service package',
    total: 'Total cost',
    schedule: 'Schedule',
    location: 'Care location',
    payment: 'Payment status'
  },
  actions: {
    details: 'View details',
    close: 'Close details',
    bookAgain: 'Book again',
    findCaregiver: 'Find another caregiver'
  },
  empty: {
    title: 'No matching bookings',
    description: 'Try another search term or change the filters to view your care history.'
  }
} as const

export const bookingsVi = {
  documentTitle: 'Lịch đặt của tôi | CareConnect',
  breadcrumb: 'Lịch đặt của tôi',
  title: 'Quản lý lịch chăm sóc',
  subtitle: 'Theo dõi trạng thái xác nhận, cập nhật ca trực và lịch chăm sóc cho người thân.',
  newBooking: 'Đặt lịch chăm sóc mới',
  sampleNotice: 'Dữ liệu lịch đặt mẫu trong khi hệ thống đang kết nối lịch sử đặt lịch.',
  stats: {
    ongoing: 'Đang diễn ra',
    upcoming: 'Sắp diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy / Hoàn cọc'
  },
  tabs: {
    all: 'Tất cả lịch đặt',
    ongoing: 'Đang diễn ra',
    upcoming: 'Sắp diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  },
  filters: {
    month: 'Tháng',
    allMonths: 'Tất cả thời gian',
    patient: 'Người thân',
    allPatients: 'Tất cả người thân',
    search: 'Tìm theo mã lịch, người thân hoặc điều dưỡng',
    reset: 'Đặt lại bộ lọc'
  },
  patients: {
    father: 'Nguyễn Văn An (Bố ruột)',
    mother: 'Nguyễn Thị A (Mẹ ruột)'
  },
  items: {
    ongoing: {
      status: 'Đang trong ca trực',
      patient: 'Cụ Nguyễn Văn An',
      relation: '78 tuổi · Bố ruột (cao huyết áp)',
      caregiverRole: 'Chuyên khoa Hồi sức cấp cứu',
      service: 'Chăm sóc người cao tuổi chuyên sâu',
      location: 'Phòng 18.04, Tòa Landmark 2, Vinhomes Central Park, Bình Thạnh',
      note: 'Check-in 07:55 · Đã thực hiện 4h 15m / 9h',
      payment: 'Đã thanh toán cọc 50% · Còn lại 800.000 ₫'
    },
    upcoming: {
      status: 'Đã xác nhận & đã cọc',
      patient: 'Nguyễn Thị A',
      relation: '76 tuổi · Mẹ ruột (hậu phẫu chỉnh hình)',
      caregiverRole: 'Cử nhân Điều dưỡng · Đánh giá 4,9',
      service: 'Chăm sóc phục hồi & hỗ trợ vận động',
      location: 'Biệt thự 42, Đường số 12, Thảo Điền, TP. Thủ Đức',
      note: 'Đã khóa lịch · Điều dưỡng đã nhận ca',
      payment: 'Đã cọc 750.000 ₫ · Còn lại 700.000 ₫'
    },
    completed: {
      status: 'Hoàn tất 100%',
      patient: 'Nguyễn Thị A',
      relation: '76 tuổi · Mẹ ruột',
      caregiverRole: '10 năm kinh nghiệm điều dưỡng lão khoa',
      service: 'Chăm sóc y tế định kỳ & theo dõi đường huyết',
      location: 'Thảo Điền, TP. Thủ Đức',
      note: 'Đánh giá của bạn: 5/5 · Chăm sóc chu đáo, báo cáo đúng giờ',
      payment: 'Đã thanh toán đủ qua Visa · Hóa đơn #VAT-9750'
    },
    cancelled: {
      status: 'Đã hủy & hoàn cọc 100%',
      patient: 'Cụ Nguyễn Văn An',
      relation: '78 tuổi · Bố ruột',
      caregiverRole: 'Khoa Tim mạch can thiệp',
      service: 'Chăm sóc điều dưỡng tại nhà',
      location: 'Bình Thạnh, TP. Hồ Chí Minh',
      note: 'Hủy trước 24 giờ · Miễn phí hủy ca',
      payment: 'Đã hoàn cọc 100% · 450.000 ₫'
    }
  },
  labels: {
    patient: 'Người nhận chăm sóc',
    caregiver: 'Điều dưỡng phụ trách',
    service: 'Gói dịch vụ',
    total: 'Tổng chi phí',
    schedule: 'Lịch chăm sóc',
    location: 'Địa điểm chăm sóc',
    payment: 'Tình trạng thanh toán'
  },
  actions: {
    details: 'Xem chi tiết',
    close: 'Đóng chi tiết',
    bookAgain: 'Đặt lại ca này',
    findCaregiver: 'Tìm điều dưỡng khác'
  },
  empty: {
    title: 'Không tìm thấy ca trực phù hợp',
    description: 'Thử từ khóa khác hoặc thay đổi bộ lọc để xem lại lịch sử chăm sóc.'
  }
} as const
