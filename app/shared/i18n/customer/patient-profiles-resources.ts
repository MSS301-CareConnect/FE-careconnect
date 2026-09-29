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
    searchPlaceholder: 'Search by name, ID or health insurance number...',
    filterRelationship: {
      all: 'Relationship: All',
      parents: 'Parents',
      grandparents: 'Grandparents',
      children: 'Children'
    },
    filterStatus: {
      all: 'Status: All',
      special: 'Special care needed',
      monitoring: 'Periodic monitoring',
      rehab: 'Rehabilitation'
    },
    activeCount: '{{count}} active profiles'
  },
  card: {
    yearsOld: '{{age}} yrs',
    genderLabel: 'Gender:',
    genderMale: 'Male',
    genderFemale: 'Female',
    statusInCare: 'Active care session',
    statusStable: 'Stable health',
    statusPostOp: 'Post-op recovery monitoring',
    diagnoses: 'Conditions & Complications',
    primaryDiagnosis: 'Primary condition',
    currentStatus: 'Current condition',
    specialInstructions: 'Special instructions',
    rehabInstructions: 'Recovery & Medication notes',
    dietInstructions: 'Dietary & Warnings',
    attendingDoctor: 'Attending doctor',
    viewDetails: 'View details',
    edit: 'Edit',
    delete: 'Delete',
    bookCareNow: 'Book care now',
    bookCare: 'Book care session',
    readyTooltip: 'Ready for care',
    activeTooltip: 'Active profile'
  },
  guidelines: {
    title: 'CareConnect Safe Medical Profile Guidelines',
    description:
      'Fully updated medical records (including current prescriptions, allergy history, and doctor contacts) enable caregivers to establish accurate care plans from day one.',
    badgeHipaa: 'HIPAA Data Encryption',
    badgePrivacy: 'Medical Privacy Security',
    badgeSync: 'Direct sync with Nurse handbook',
    viewDoc: 'View documentation'
  },
  sidebar: {
    accountCode: 'Account ID:',
    verifiedIdentity: 'Verified identity',
    familyMetric: 'Family',
    shiftsMetric: 'Sessions',
    reviewsMetric: 'Reviews',
    emergencyTitle: 'Emergency Medical Hotline',
    emergencySubtitle: '24/7 Toll-free Support',
    emergencyDesc: 'Emergency contact with lead nurse when health condition changes unexpectedly.'
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
    searchPlaceholder: 'Tìm theo họ tên, CCCD hoặc mã BHYT...',
    filterRelationship: {
      all: 'Mối quan hệ: Tất cả',
      parents: 'Bố mẹ',
      grandparents: 'Ông bà',
      children: 'Con cái'
    },
    filterStatus: {
      all: 'Tình trạng: Tất cả',
      special: 'Cần chăm sóc đặc biệt',
      monitoring: 'Theo dõi định kỳ',
      rehab: 'Phục hồi chức năng'
    },
    activeCount: '{{count}} hồ sơ kích hoạt'
  },
  card: {
    yearsOld: '{{age}} tuổi',
    genderLabel: 'Giới tính:',
    genderMale: 'Nam',
    genderFemale: 'Nữ',
    statusInCare: 'Đang có ca chăm sóc',
    statusStable: 'Sức khỏe ổn định',
    statusPostOp: 'Theo dõi phục hồi hậu phẫu',
    diagnoses: 'Bệnh nền & Di chứng',
    primaryDiagnosis: 'Bệnh nền chính',
    currentStatus: 'Tình trạng hiện tại',
    specialInstructions: 'Lưu ý đặc biệt',
    rehabInstructions: 'Lưu ý phục hồi & Dược liệu',
    dietInstructions: 'Chế độ dinh dưỡng & Cảnh báo',
    attendingDoctor: 'Bác sĩ phụ trách',
    viewDetails: 'Xem chi tiết',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    bookCareNow: 'Đặt lịch chăm sóc ngay',
    bookCare: 'Đặt lịch chăm sóc',
    readyTooltip: 'Sẵn sàng tiếp nhận chăm sóc',
    activeTooltip: 'Hồ sơ hoạt động'
  },
  guidelines: {
    title: 'Quy chuẩn cập nhật hồ sơ y tế an toàn CareConnect',
    description:
      'Hồ sơ y tế được cập nhật đầy đủ (bao gồm toa thuốc hiện dùng, tiền sử dị ứng thuốc và số liên lạc bác sĩ điều trị) giúp Điều dưỡng viên và Chuyên viên chăm sóc xây dựng phác đồ can thiệp chuẩn xác nhất ngay từ buổi đầu tiên.',
    badgeHipaa: 'Mã hóa dữ liệu HIPAA',
    badgePrivacy: 'Bảo mật quyền riêng tư y khoa',
    badgeSync: 'Đồng bộ trực tiếp với sổ tay Điều dưỡng',
    viewDoc: 'Xem tài liệu hướng dẫn'
  },
  sidebar: {
    accountCode: 'Mã tài khoản:',
    verifiedIdentity: 'Đã xác thực danh tính',
    familyMetric: 'Người thân',
    shiftsMetric: 'Ca xong',
    reviewsMetric: 'Đánh giá',
    emergencyTitle: 'Hotline Y Tế Khẩn Cấp',
    emergencySubtitle: 'Hỗ trợ 24/7 miễn cước',
    emergencyDesc: 'Liên hệ khẩn cấp với điều dưỡng viên trưởng khi người thân có biến chuyển sức khỏe bất ngờ.'
  }
} as const
