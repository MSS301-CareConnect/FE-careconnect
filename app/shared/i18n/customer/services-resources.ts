export const customerServicesVi = {
  documentTitle: 'Dịch vụ chăm sóc tại nhà | CareConnect',
  breadcrumb: { label: 'Đường dẫn trang', home: 'Trang chủ', current: 'Dịch vụ' },
  badge: 'Dịch vụ y tế tại nhà',
  title: 'Dịch vụ chăm sóc tại nhà',
  subtitle: 'Chọn dịch vụ phù hợp cho người thân, xem giá rõ ràng và đặt lịch ngay.',
  count: '{{count, number}} dịch vụ',
  clearFilters: 'Xóa bộ lọc',
  priceUnit: { HOUR: 'giờ', DAY: 'ngày', SHIFT: 'ca' },
  filters: {
    title: 'Bộ lọc',
    reset: 'Đặt lại',
    search: 'Tìm dịch vụ',
    searchPlaceholder: 'Tên dịch vụ hoặc nhóm dịch vụ...',
    category: 'Nhóm dịch vụ',
    allCategories: 'Tất cả',
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
    book: 'Đặt lịch dịch vụ này',
    bookShort: 'Đặt lịch',
    detailsShort: 'Chi tiết',
    price: '{{price}} / {{unit}}',
    fromPrice: 'Từ {{price}}',
    minimum: 'Tối thiểu {{duration}}',
    plansCount: '{{count, number}} gói giá'
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
  documentTitle: 'Home care services | CareConnect',
  breadcrumb: { label: 'Breadcrumb', home: 'Home', current: 'Services' },
  badge: 'Home healthcare services',
  title: 'Home care services',
  subtitle: 'Pick the right care for your loved one, see clear prices and book right away.',
  count: '{{count, number}} services',
  clearFilters: 'Clear filters',
  priceUnit: { HOUR: 'hour', DAY: 'day', SHIFT: 'shift' },
  filters: {
    title: 'Filters',
    reset: 'Reset',
    search: 'Search services',
    searchPlaceholder: 'Service or category...',
    category: 'Service category',
    allCategories: 'All',
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
    book: 'Book this service',
    bookShort: 'Book',
    detailsShort: 'Details',
    price: '{{price}} / {{unit}}',
    fromPrice: 'From {{price}}',
    minimum: 'Min. {{duration}}',
    plansCount: '{{count, number}} price plans'
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
