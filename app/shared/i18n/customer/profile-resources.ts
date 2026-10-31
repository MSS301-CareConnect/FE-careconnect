export const profileEn = {
  live: {
    customerAccount: 'Customer account',
    overviewTitle: 'Account overview',
    memberSince: 'Member since {{date}}',
    notProvided: 'Not provided',
    formHint: 'Your name and phone number are saved to your CareConnect account.',
    securityHint: 'Manage your password and signed-in devices.',
    openSecurity: 'Open security settings',
    familyHint: 'View and manage the care profiles of your family members.',
    description: 'Update the account details used by CareConnect.',
    accountEmail: 'Account email',
    emailReadOnly: 'Your account email cannot be changed here.',
    passwordHelp: 'Need to set a new password?',
    invalidName: 'Enter a name of up to 255 characters.',
    invalidPhone: 'Enter a phone number with 10 or 11 digits.',
    saveFailed: 'Unable to save your profile. Please try again.'
  },
  documentTitle: 'My Profile | CareConnect',
  breadcrumb: {
    home: 'Home',
    myAccount: 'My Account',
    personalInfo: 'Personal Information'
  },
  badge: {
    verifiedAccount: 'Verified Account',
    online: 'Online',
    verified: 'Verified',
    securityLevel2: 'Level 2 Security'
  },
  header: {
    title: 'Personal Profile',
    subtitle:
      'Manage personal information, update address for coordinator support, and secure your CareConnect family account.'
  },
  overview: {
    verifiedIdentity: 'Verified primary account',
    memberId: 'CC-KH8842',
    memberSince: 'Member since Mar 2024',
    stats: {
      carePatients: 'Family members cared',
      completedShifts: 'Completed sessions',
      sentReviews: 'Reviews given'
    }
  },
  nav: {
    title: 'Account Management',
    personalInfo: 'Personal Info & Edit',
    security: 'Change Password & Security',
    familyProfiles: 'Family member health profiles',
    bookingHistory: 'Booking history',
    notifications: 'Notifications & Preferences'
  },
  support: {
    title: '24/7 Emergency Support',
    hotlineLabel: 'Priority hotline:'
  },
  form: {
    title: 'Detailed Information',
    subtitle: 'Update medical identification information and service delivery location.',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saveSuccess: 'Profile changes saved successfully!',
    autoSaved: 'Auto-saved 2 minutes ago',
    fullName: 'Full Name',
    matchCccd: 'Matches National ID',
    gender: 'Gender',
    genderFemale: 'Female',
    genderMale: 'Male',
    genderOther: 'Other',
    dob: 'Date of Birth',
    idNumber: 'National ID / Citizen ID',
    phone: 'Mobile Phone Number',
    email: 'Invoice & Report Email',
    change: 'Change',
    addressSectionTitle: 'Care delivery residential address',
    city: 'Province / City',
    district: 'District',
    ward: 'Ward',
    addressDetail: 'Specific address (House no., building, street)',
    notes: 'Directions / Emergency contact notes',
    notesHint: 'Exclusively for nurses & coordinators'
  },
  security: {
    title: 'Change Account Password',
    subtitle:
      'To secure your family account, please set a strong password of at least 8 characters including letters, numbers, and special characters.',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm New Password',
    confirmPasswordPlaceholder: 'Re-enter new password',
    securityLevel: 'Security level:',
    strengthStrong: 'Strong (Very secure)',
    standardsTitle: 'CareConnect password standards:',
    ruleMinLength: 'At least 8 characters',
    ruleCaseAndNumber: 'Contains uppercase & number',
    ruleSpecialChar: 'Contains special characters (!@#$%)',
    updatePassword: 'Update Password',
    updating: 'Updating...',
    updated: 'Password updated',
    twoFactorTitle: 'Two-factor authentication (2FA via SMS)',
    twoFactorDesc: 'Receive a verification code when signing in from an unfamiliar device to protect family profiles.'
  },
  familyInsight: {
    title: 'Family members with established health profiles',
    description: 'Mrs. Tran Thi Lan (Mother - 78 yrs), Mr. Nguyen Van Nam (Father - 82 yrs)',
    viewDetails: 'View profile details'
  }
} as const

export const profileVi = {
  live: {
    customerAccount: 'Tài khoản khách hàng',
    overviewTitle: 'Tổng quan tài khoản',
    memberSince: 'Thành viên từ {{date}}',
    notProvided: 'Chưa cung cấp',
    formHint: 'Họ tên và số điện thoại được lưu vào tài khoản CareConnect của bạn.',
    securityHint: 'Quản lý mật khẩu và các phiên đăng nhập.',
    openSecurity: 'Mở cài đặt bảo mật',
    familyHint: 'Xem và quản lý hồ sơ chăm sóc của người thân.',
    description: 'Cập nhật thông tin tài khoản CareConnect của bạn.',
    accountEmail: 'Email tài khoản',
    emailReadOnly: 'Chưa thể đổi email tài khoản tại đây.',
    passwordHelp: 'Bạn cần đặt mật khẩu mới?',
    invalidName: 'Nhập họ tên tối đa 255 ký tự.',
    invalidPhone: 'Nhập số điện thoại gồm 10 hoặc 11 chữ số.',
    saveFailed: 'Không thể lưu hồ sơ. Vui lòng thử lại.'
  },
  documentTitle: 'Hồ sơ cá nhân | CareConnect',
  breadcrumb: {
    home: 'Trang chủ',
    myAccount: 'Tài khoản của tôi',
    personalInfo: 'Thông tin cá nhân'
  },
  badge: {
    verifiedAccount: 'Tài khoản đã xác minh',
    online: 'Đang trực tuyến',
    verified: 'Đã xác minh',
    securityLevel2: 'Đã bật bảo mật hai lớp'
  },
  header: {
    title: 'Hồ sơ cá nhân',
    subtitle: 'Quản lý thông tin cá nhân, địa chỉ nhận chăm sóc và bảo mật tài khoản CareConnect của gia đình.'
  },
  overview: {
    verifiedIdentity: 'Tài khoản chính chủ đã xác thực',
    memberId: 'CC-KH8842',
    memberSince: 'Thành viên từ T3/2024',
    stats: {
      carePatients: 'Người thân chăm sóc',
      completedShifts: 'Ca hoàn thành',
      sentReviews: 'Đánh giá gửi đi'
    }
  },
  nav: {
    title: 'Quản lý tài khoản',
    personalInfo: 'Thông tin cá nhân & Chỉnh sửa',
    security: 'Đổi mật khẩu & Bảo mật',
    familyProfiles: 'Hồ sơ người thân cần chăm sóc',
    bookingHistory: 'Lịch sử đặt lịch',
    notifications: 'Thông báo & Tùy chọn'
  },
  support: {
    title: 'Hỗ trợ khẩn cấp 24/7',
    hotlineLabel: 'Hotline ưu tiên:'
  },
  form: {
    title: 'Thông tin chi tiết',
    subtitle: 'Cập nhật thông tin cá nhân và địa chỉ nhận chăm sóc.',
    cancel: 'Hủy',
    saveChanges: 'Lưu thay đổi',
    saving: 'Đang lưu...',
    saveSuccess: 'Thay đổi hồ sơ vừa được lưu thành công!',
    autoSaved: 'Đã lưu tự động cách đây 2 phút',
    fullName: 'Họ và tên',
    matchCccd: 'Khớp với CCCD',
    gender: 'Giới tính',
    genderFemale: 'Nữ',
    genderMale: 'Nam',
    genderOther: 'Khác',
    dob: 'Ngày sinh',
    idNumber: 'Số CMND / CCCD',
    phone: 'Số điện thoại di động',
    email: 'Email nhận hóa đơn & báo cáo',
    change: 'Thay đổi',
    addressSectionTitle: 'Địa chỉ nhận chăm sóc',
    city: 'Tỉnh / Thành phố',
    district: 'Quận / Huyện',
    ward: 'Phường / Xã',
    addressDetail: 'Địa chỉ cụ thể (Số nhà, tòa nhà, tên đường)',
    notes: 'Ghi chú chỉ đường / Liên hệ khẩn cấp',
    notesHint: 'Chỉ điều dưỡng và nhân viên điều phối xem được'
  },
  security: {
    title: 'Đổi mật khẩu tài khoản',
    subtitle:
      'Để bảo mật tài khoản gia đình, vui lòng đặt mật khẩu mạnh tối thiểu 8 ký tự bao gồm chữ cái, số và ký tự đặc biệt.',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    newPasswordPlaceholder: 'Nhập mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu mới',
    confirmPasswordPlaceholder: 'Nhập lại mật khẩu mới',
    securityLevel: 'Độ bảo mật:',
    strengthStrong: 'Mạnh (Rất an toàn)',
    standardsTitle: 'Tiêu chuẩn mật khẩu CareConnect:',
    ruleMinLength: 'Tối thiểu 8 ký tự',
    ruleCaseAndNumber: 'Chứa chữ hoa & số',
    ruleSpecialChar: 'Chứa ký tự đặc biệt (!@#$%)',
    updatePassword: 'Cập nhật mật khẩu',
    updating: 'Cập nhật...',
    updated: 'Đã đổi mật khẩu',
    twoFactorTitle: 'Xác thực hai lớp qua tin nhắn SMS',
    twoFactorDesc: 'Nhận mã xác thực khi đăng nhập từ thiết bị lạ để bảo vệ hồ sơ người thân.'
  },
  familyInsight: {
    title: 'Người thân đã thiết lập hồ sơ sức khỏe',
    description: 'Bà Trần Thị Lan (Mẹ ruột - 78 tuổi), Ông Nguyễn Văn Nam (Bố ruột - 82 tuổi)',
    viewDetails: 'Xem chi tiết hồ sơ'
  }
} as const
