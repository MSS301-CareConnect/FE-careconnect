export const customerServicesVi = {
  documentTitle: 'Dịch vụ chăm sóc | CareConnect',
  breadcrumb: { label: 'Đường dẫn trang', home: 'Trang chủ', current: 'Dịch vụ chăm sóc' },
  badge: 'Dịch vụ y tế tại nhà',
  title: 'Dịch vụ chăm sóc tại các cơ sở y tế',
  subtitle:
    'Xem các dịch vụ chăm sóc đang được cung cấp, cơ sở y tế phụ trách và bảng giá tương ứng để chọn hình thức phù hợp cho người thân.',
  filters: {
    title: 'Bộ lọc',
    reset: 'Đặt lại',
    search: 'Tìm dịch vụ',
    searchPlaceholder: 'Tên dịch vụ hoặc nhóm dịch vụ...',
    category: 'Nhóm dịch vụ',
    allCategories: 'Tất cả nhóm',
    hint: 'Giá hiển thị là giá cơ bản của từng gói. Giá cuối cùng được xác nhận khi bạn đặt lịch.'
  },
  results: 'dịch vụ',
  sort: {
    label: 'Sắp xếp',
    name: 'Theo tên dịch vụ',
    priceAsc: 'Giá thấp đến cao',
    priceDesc: 'Giá cao đến thấp'
  },
  scope: {
    general: 'Bạn đang xem dịch vụ của tất cả trung tâm. Chọn một trung tâm để xem giá và đặt lịch.'
  },
  reminder: {
    title: 'Chọn trung tâm để xem dịch vụ',
    text: 'Mỗi trung tâm có danh mục dịch vụ và bảng giá riêng. Chọn trung tâm gần bạn để bắt đầu.'
  },
  card: {
    plans: 'Bảng giá',
    planMeta: '{{unit}} · {{minutes, number}} phút',
    morePlans: '+{{count, number}} gói khác',
    from: 'Từ',
    contactPrice: 'Liên hệ để nhận báo giá',
    pricePerCenter: 'Giá theo từng trung tâm',
    chooseCenter: 'Chọn trung tâm để xem giá',
    noCenter: 'Chưa chọn trung tâm',
    findCaregivers: 'Tìm người chăm sóc',
    details: 'Xem chi tiết',
    book: 'Đặt lịch dịch vụ này'
  },
  pricingUnits: { HOUR: 'Theo giờ', DAY: 'Theo ngày', SHIFT: 'Theo ca' },
  states: {
    loading: 'Đang tải danh sách dịch vụ...',
    error: 'Không thể tải danh sách dịch vụ.',
    retry: 'Thử lại',
    empty: 'Trung tâm này chưa cập nhật dịch vụ nào.',
    noResults: 'Không có dịch vụ phù hợp với bộ lọc hiện tại.'
  },
  pagination: 'Phân trang dịch vụ',
  previous: 'Trang trước',
  next: 'Trang sau',
  page: 'Trang {{page, number}} / {{pages, number}}'
} as const

export const customerServicesEn = {
  documentTitle: 'Care services | CareConnect',
  breadcrumb: { label: 'Breadcrumb', home: 'Home', current: 'Care services' },
  badge: 'Home healthcare services',
  title: 'Care services at medical centers',
  subtitle:
    'Browse the care services on offer, the medical center providing each one and its prices to choose the right care for your loved one.',
  filters: {
    title: 'Filters',
    reset: 'Reset',
    search: 'Search services',
    searchPlaceholder: 'Service or category...',
    category: 'Service category',
    allCategories: 'All categories',
    hint: 'Prices shown are the base price of each plan. The final price is confirmed when you book.'
  },
  results: 'services',
  sort: {
    label: 'Sort by',
    name: 'Service name',
    priceAsc: 'Price: low to high',
    priceDesc: 'Price: high to low'
  },
  scope: {
    general: 'You are viewing services from all centers. Choose a center to see prices and book.'
  },
  reminder: {
    title: 'Choose a center to see services',
    text: 'Each center has its own services and prices. Choose one near you to get started.'
  },
  card: {
    plans: 'Price plans',
    planMeta: '{{unit}} · {{minutes, number}} min',
    morePlans: '+{{count, number}} more plans',
    from: 'From',
    contactPrice: 'Contact us for a quote',
    pricePerCenter: 'Prices vary by center',
    chooseCenter: 'Choose a center for prices',
    noCenter: 'No center chosen yet',
    findCaregivers: 'Find caregivers',
    details: 'View details',
    book: 'Book this service'
  },
  pricingUnits: { HOUR: 'Hourly', DAY: 'Daily', SHIFT: 'Per shift' },
  states: {
    loading: 'Loading services...',
    error: 'Services could not be loaded.',
    retry: 'Try again',
    empty: 'This center has not added any services yet.',
    noResults: 'No services match the current filters.'
  },
  pagination: 'Service pages',
  previous: 'Previous',
  next: 'Next',
  page: 'Page {{page, number}} / {{pages, number}}'
} as const
