export const patientProfilesEn = {
  documentTitle: 'Family Profiles | CareConnect',
  breadcrumb: {
    home: 'Home',
    myAccount: 'My Account',
    title: 'Family member health profiles'
  },
  header: {
    title: 'Profiles of Care Recipients',
    subtitle:
      'Manage medical records, underlying conditions, dietary regimen, and treatment history to ensure the best care from caregivers.',
    addPatient: '+ Add family profile'
  },
  toolbar: {
    searchLabel: 'Search profiles',
    searchPlaceholder: 'Search by full name...',
    searchButton: 'Search',
    filterStatusLabel: 'Profile status',
    filterStatus: {
      all: 'Status: All'
    },
    totalCount: '{{count, number}} profiles'
  },
  card: {
    genderLabel: 'Gender:',
    birthDate: 'Born {{date}}',
    createdAt: 'Created {{date}}',
    viewDetails: 'View details',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'This profile will be archived and hidden from your list. Continue?',
    confirmDeleteButton: 'Confirm delete',
    cancelDelete: 'Cancel',
    deleting: 'Deleting...',
    deleteError: 'Unable to delete this profile. Please try again.',
    bookCare: 'Book care session',
    avatarAlt: 'Profile photo of {{name}}'
  },
  states: {
    loading: 'Loading care recipient profiles...',
    error: 'Unable to load care recipient profiles.',
    forbidden: 'Your account is not allowed to view these profiles.',
    retry: 'Try again',
    emptyTitle: 'No family profiles yet',
    emptyDescription: 'Create a profile so caregivers know the medical needs of your loved one.',
    noResults: 'No profiles match the current search or filter.'
  },
  pagination: {
    label: 'Profile pages',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {{page, number}} of {{total, number}}'
  },
  guidelines: {
    title: 'CareConnect Safe Medical Profile Guidelines',
    description:
      'Fully updated medical records (including current prescriptions, allergy history, and doctor contacts) enable caregivers to establish accurate care plans from day one.',
    badgeHipaa: 'Encrypted data',
    badgePrivacy: 'Medical Privacy Security',
    badgeSync: 'Shared with your care team',
    viewDoc: 'View documentation'
  },
  sidebar: {
    accountFallback: 'CareConnect account',
    familyMetric: 'Family profiles',
    emergencyTitle: 'Emergency Medical Hotline',
    emergencySubtitle: '24/7 Toll-free Support',
    emergencyDesc: 'Emergency contact with lead nurse when health condition changes unexpectedly.',
    hotlineNumber: '1900 6868'
  }
} as const

export const patientProfilesVi = {
  documentTitle: 'Hồ sơ người thân | CareConnect',
  breadcrumb: {
    home: 'Trang chủ',
    myAccount: 'Tài khoản của tôi',
    title: 'Hồ sơ người thân cần chăm sóc'
  },
  header: {
    title: 'Hồ sơ người cần chăm sóc',
    subtitle:
      'Quản lý thông tin y tế, bệnh nền, chế độ dinh dưỡng và lịch sử điều trị của người thân để nhân viên chăm sóc tiếp cận chu đáo nhất.',
    addPatient: '+ Thêm hồ sơ người thân'
  },
  toolbar: {
    searchLabel: 'Tìm hồ sơ',
    searchPlaceholder: 'Tìm theo họ tên...',
    searchButton: 'Tìm kiếm',
    filterStatusLabel: 'Trạng thái hồ sơ',
    filterStatus: {
      all: 'Trạng thái: Tất cả'
    },
    totalCount: '{{count, number}} hồ sơ'
  },
  card: {
    genderLabel: 'Giới tính:',
    birthDate: 'Sinh ngày {{date}}',
    createdAt: 'Tạo ngày {{date}}',
    viewDetails: 'Xem chi tiết',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    confirmDelete: 'Hồ sơ sẽ được lưu trữ và ẩn khỏi danh sách của bạn. Tiếp tục?',
    confirmDeleteButton: 'Xác nhận xóa',
    cancelDelete: 'Hủy',
    deleting: 'Đang xóa...',
    deleteError: 'Không thể xóa hồ sơ này. Vui lòng thử lại.',
    bookCare: 'Đặt lịch chăm sóc',
    avatarAlt: 'Ảnh đại diện của {{name}}'
  },
  states: {
    loading: 'Đang tải hồ sơ người cần chăm sóc...',
    error: 'Không thể tải danh sách hồ sơ.',
    forbidden: 'Tài khoản của bạn không có quyền xem các hồ sơ này.',
    retry: 'Thử lại',
    emptyTitle: 'Chưa có hồ sơ người thân',
    emptyDescription: 'Tạo hồ sơ để nhân viên chăm sóc nắm rõ nhu cầu y tế của người thân bạn.',
    noResults: 'Không có hồ sơ phù hợp với từ khóa hoặc bộ lọc hiện tại.'
  },
  pagination: {
    label: 'Phân trang hồ sơ',
    previous: 'Trang trước',
    next: 'Trang sau',
    pageOf: 'Trang {{page, number}} / {{total, number}}'
  },
  guidelines: {
    title: 'Vì sao nên cập nhật hồ sơ đầy đủ?',
    description:
      'Hồ sơ y tế được cập nhật đầy đủ (bao gồm toa thuốc hiện dùng, tiền sử dị ứng thuốc và số liên lạc bác sĩ điều trị) giúp người chăm sóc lên kế hoạch chăm sóc phù hợp ngay từ buổi đầu tiên.',
    badgeHipaa: 'Thông tin được mã hóa',
    badgePrivacy: 'Bảo mật quyền riêng tư y khoa',
    badgeSync: 'Chia sẻ với đội ngũ chăm sóc',
    viewDoc: 'Xem tài liệu hướng dẫn'
  },
  sidebar: {
    accountFallback: 'Tài khoản CareConnect',
    familyMetric: 'Hồ sơ người thân',
    emergencyTitle: 'Hotline Y Tế Khẩn Cấp',
    emergencySubtitle: 'Hỗ trợ 24/7 miễn cước',
    emergencyDesc: 'Liên hệ khẩn cấp với điều dưỡng viên trưởng khi người thân có biến chuyển sức khỏe bất ngờ.',
    hotlineNumber: '1900 6868'
  }
} as const
