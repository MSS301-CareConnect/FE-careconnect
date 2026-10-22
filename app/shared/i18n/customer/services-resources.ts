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
    searchPlaceholder: 'Tên dịch vụ, nhóm hoặc cơ sở...',
    center: 'Cơ sở y tế',
    allCenters: 'Tất cả cơ sở',
    category: 'Nhóm dịch vụ',
    allCategories: 'Tất cả nhóm',
    hint: 'Giá hiển thị là giá cơ bản của từng gói. Giá cuối cùng được xác nhận khi bạn đặt lịch.'
  },
  results: 'dịch vụ',
  sort: {
    label: 'Sắp xếp',
    center: 'Theo cơ sở y tế',
    name: 'Theo tên dịch vụ',
    priceAsc: 'Giá thấp đến cao',
    priceDesc: 'Giá cao đến thấp'
  },
  groupCount: '{{count, number}} dịch vụ',
  unassignedGroup: 'Sắp có tại các cơ sở',
  card: {
    plans: 'Bảng giá',
    planMeta: '{{unit}} · {{minutes, number}} phút',
    morePlans: '+{{count, number}} gói khác',
    from: 'Từ',
    contactPrice: 'Liên hệ để nhận báo giá',
    comingSoon: 'Sắp ra mắt',
    noCenter: 'Chưa có cơ sở y tế cung cấp',
    findCaregivers: 'Tìm người chăm sóc'
  },
  pricingUnits: { HOUR: 'Theo giờ', DAY: 'Theo ngày', SHIFT: 'Theo ca' },
  states: {
    loading: 'Đang tải danh sách dịch vụ...',
    error: 'Không thể tải danh sách dịch vụ.',
    partial: 'Một số cơ sở y tế chưa tải được dịch vụ.',
    retry: 'Thử lại',
    empty: 'Chưa có dịch vụ nào được cập nhật.',
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
    searchPlaceholder: 'Service, category or center...',
    center: 'Medical center',
    allCenters: 'All centers',
    category: 'Service category',
    allCategories: 'All categories',
    hint: 'Prices shown are the base price of each plan. The final price is confirmed when you book.'
  },
  results: 'services',
  sort: {
    label: 'Sort by',
    center: 'Medical center',
    name: 'Service name',
    priceAsc: 'Price: low to high',
    priceDesc: 'Price: high to low'
  },
  groupCount: '{{count, number}} services',
  unassignedGroup: 'Coming soon to centers',
  card: {
    plans: 'Price plans',
    planMeta: '{{unit}} · {{minutes, number}} min',
    morePlans: '+{{count, number}} more plans',
    from: 'From',
    contactPrice: 'Contact us for a quote',
    comingSoon: 'Coming soon',
    noCenter: 'Not yet offered by a medical center',
    findCaregivers: 'Find caregivers'
  },
  pricingUnits: { HOUR: 'Hourly', DAY: 'Daily', SHIFT: 'Per shift' },
  states: {
    loading: 'Loading services...',
    error: 'Services could not be loaded.',
    partial: 'Services from some medical centers could not be loaded.',
    retry: 'Try again',
    empty: 'No services have been added yet.',
    noResults: 'No services match the current filters.'
  },
  pagination: 'Service pages',
  previous: 'Previous',
  next: 'Next',
  page: 'Page {{page, number}} / {{pages, number}}'
} as const
