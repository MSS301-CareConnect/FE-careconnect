export const bookingsEn = {
  documentTitle: 'My bookings | CareConnect',
  title: 'My bookings',
  subtitle: 'Track every care request from center review to the last visit.',
  subtitleCount: '{{count}} bookings. Track each request from center review to the last visit.',
  filters: {
    label: 'Filter bookings',
    status: 'Booking status',
    all: 'All',
    search: 'Search by booking code',
    searchPlaceholder: 'Booking code, e.g. the last 6 characters',
    sort: 'Sort bookings',
    reset: 'Clear filters'
  },
  sorts: {
    newest: 'Newest request first',
    startSoonest: 'Starting soonest',
    startLatest: 'Starting latest'
  },
  card: {
    code: 'Booking #{{code}}',
    patientFallback: 'Patient',
    total: 'Total',
    schedule: 'Schedule',
    dateRange: '{{from}} – {{to}}',
    next: 'Next visit',
    noNext: 'No upcoming visit',
    progress: 'Visits done',
    progressValue: '{{done}} / {{total}}',
    view: 'View booking'
  },
  states: {
    loading: 'Loading your bookings…'
  },
  empty: {
    title: 'No bookings yet',
    description: 'Bookings you send appear here so you can follow each one.',
    filteredTitle: 'No booking matches',
    filteredDescription: 'Try another status or booking code.'
  },
  pagination: {
    label: 'Booking pages',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {{page}} of {{total}}'
  },
  items: {
    ongoing: {
      status: 'In progress',
      patient: 'Mr. Nguyen Van An',
      relation: '78 years old · Father (high blood pressure)',
      caregiverRole: 'Emergency care specialist',
      service: 'Advanced elderly care',
      location: 'Apartment 18.04, Landmark 2, Vinhomes Central Park, Binh Thanh',
      note: 'Started at 07:55 · 4 h 15 min of 9 h done',
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
  }
}

export const bookingsVi = {
  documentTitle: 'Lịch đặt của tôi | CareConnect',
  title: 'Lịch đặt của tôi',
  subtitle: 'Theo dõi từng yêu cầu chăm sóc từ lúc trung tâm duyệt tới buổi cuối cùng.',
  subtitleCount: '{{count}} lịch đặt. Theo dõi từng yêu cầu từ lúc trung tâm duyệt tới buổi cuối cùng.',
  filters: {
    label: 'Lọc lịch đặt',
    status: 'Trạng thái lịch đặt',
    all: 'Tất cả',
    search: 'Tìm theo mã lịch đặt',
    searchPlaceholder: 'Mã lịch đặt (có thể nhập 6 ký tự cuối)',
    sort: 'Sắp xếp lịch đặt',
    reset: 'Xóa bộ lọc'
  },
  sorts: {
    newest: 'Yêu cầu mới nhất',
    startSoonest: 'Bắt đầu sớm nhất',
    startLatest: 'Bắt đầu muộn nhất'
  },
  card: {
    code: 'Booking #{{code}}',
    patientFallback: 'Người bệnh',
    total: 'Tổng tiền',
    schedule: 'Lịch chăm sóc',
    dateRange: '{{from}} – {{to}}',
    next: 'Buổi kế tiếp',
    noNext: 'Không còn buổi sắp tới',
    progress: 'Buổi đã xong',
    progressValue: '{{done}} / {{total}}',
    view: 'Xem lịch đặt'
  },
  states: {
    loading: 'Đang tải lịch đặt…'
  },
  empty: {
    title: 'Chưa có lịch đặt nào',
    description: 'Các lịch đặt bạn gửi sẽ hiện ở đây để bạn theo dõi từng lịch.',
    filteredTitle: 'Không có lịch đặt phù hợp',
    filteredDescription: 'Thử trạng thái hoặc mã lịch đặt khác.'
  },
  pagination: {
    label: 'Trang lịch đặt',
    previous: 'Trước',
    next: 'Sau',
    pageOf: 'Trang {{page}} / {{total}}'
  },
  items: {
    ongoing: {
      status: 'Đang được chăm sóc',
      patient: 'Cụ Nguyễn Văn An',
      relation: '78 tuổi · Bố ruột (cao huyết áp)',
      caregiverRole: 'Chuyên khoa Hồi sức cấp cứu',
      service: 'Chăm sóc người cao tuổi chuyên sâu',
      location: 'Phòng 18.04, Tòa Landmark 2, Vinhomes Central Park, Bình Thạnh',
      note: 'Bắt đầu lúc 07:55 · Đã chăm sóc 4 giờ 15 phút / 9 giờ',
      payment: 'Đã thanh toán cọc 50% · Còn lại 800.000 ₫'
    },
    upcoming: {
      status: 'Đã xác nhận & đã cọc',
      patient: 'Nguyễn Thị A',
      relation: '76 tuổi · Mẹ ruột (hậu phẫu chỉnh hình)',
      caregiverRole: 'Cử nhân Điều dưỡng · Đánh giá 4,9',
      service: 'Chăm sóc phục hồi & hỗ trợ vận động',
      location: 'Biệt thự 42, Đường số 12, Thảo Điền, TP. Thủ Đức',
      note: 'Lịch đã chốt · Điều dưỡng đã nhận lịch',
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
  }
}
