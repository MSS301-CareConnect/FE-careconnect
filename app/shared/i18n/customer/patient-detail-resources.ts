export const patientDetailEn = {
  documentTitle: 'Medical Record Detail | CareConnect',
  breadcrumb: {
    home: 'Home',
    myAccount: 'My Account',
    patientProfiles: 'Family member health profiles',
    title: 'Medical Record Detail'
  },
  banner: {
    back: 'Back to profiles list',
    activeCareSession: 'Active care session in progress',
    titlePrefix: 'Medical Record: ',
    viewMode: 'View mode',
    editMode: 'Edit mode',
    saveUpdate: 'Save updates',
    bookNewCare: 'Book new care session',
    toastSuccess: 'Medical record updated and synchronized successfully!'
  },
  snapshot: {
    bloodType: 'Blood type',
    height: 'Height',
    weight: 'Weight',
    nationalIdLabel: 'National ID / Citizen ID:',
    insuranceIdLabel: 'Health Insurance ID:',
    dobLabel: 'Date of birth:',
    verifiedNotice: 'Electronic health record verified via VNeID database and UMC Hospital HCMC.',
    changeAvatar: 'Update profile picture',
    verifiedRecord: 'Verified identity profile'
  },
  caregiverWidget: {
    title: 'Current Assigned Nurse',
    shiftBadge: 'This afternoon shift',
    ratingCount: '{{rating}} ({{count}} sessions)',
    shiftTimeLabel: 'Shift hours:',
    shiftTimeValue: '08:00 - 17:00 (Daily)',
    chatButton: 'Chat with nurse'
  },
  emergencySection: {
    title: 'Emergency Contacts',
    priorityBadge: 'Priority 24/7',
    callButton: 'Call',
    primaryContact: {
      name: 'Nguyen Mai Anh (You - Daughter)',
      role: 'Primary Guardian • Binh Thanh Dist'
    },
    secondaryContact: {
      name: 'Nguyen Van Hung (Second Son)',
      role: 'Secondary Contact • 0988 123 456'
    },
    hotlineTitle: 'Emergency Medical Dispatch',
    hotlineDesc: '115 Emergency Dispatch & Rapid Response Team'
  },
  medicalBackground: {
    title: 'Underlying Conditions & Medical History',
    lastUpdated: 'Last updated: 3 days ago',
    chronicLabel: 'Chronic conditions under treatment',
    allergyLabel: 'Drug & Food allergy history',
    surgeryLabel: 'Surgical & Intervention history',
    attendingDoctorLabel: 'Attending specialist in charge',
    callDoctor: 'Tel: {{phone}}'
  },
  prescriptions: {
    title: 'Current Prescriptions & Schedule',
    regimenBadge: 'Applying October 2024 regimen',
    thMedication: 'Medication / Active ingredient',
    thDosage: 'Dosage',
    thTime: 'Administration time',
    thInstructions: 'Nurse instructions',
    addMedication: '+ Add medication to prescription'
  },
  carePlan: {
    title: 'Care Plan & Mandatory Vitals',
    standardBadge: 'Hospital standard • Daily cycle',
    mobilityTitle: 'Mobility & Rehabilitation',
    mobilityDesc:
      'Assistance needed when standing up for restroom. Left hand rehabilitation for 30 minutes every afternoon with medical rubber ball.',
    nutritionTitle: 'Dietary Management',
    nutritionDesc:
      'Low sodium diet (less than 3g salt/day), 3 main meals + 1 afternoon snack at 15:00. Ensure 1.5 - 1.8L of water daily.',
    vitalsTitle: 'Vitals twice daily',
    vitalsDesc: 'Measure BP & SpO2 at 07:00 and 17:00. Alert thresholds: Systolic BP > 145 mmHg or < 100 mmHg.',
    addressLabel: 'Home care residential address:'
  },
  historyAndDocs: {
    tabHistory: 'Recent Care Sessions History',
    tabDocs: 'Attached Documents & Lab Results (4)',
    viewSessionReport: 'View session report',
    previewDoc: 'Preview document',
    uploadTitle: 'Click to upload medical record or new referral',
    uploadSubtitle: 'Supports PDF, JPG, PNG up to 15MB'
  }
} as const

export const patientDetailVi = {
  documentTitle: 'Chi tiết hồ sơ bệnh án | CareConnect',
  breadcrumb: {
    home: 'Trang chủ',
    myAccount: 'Tài khoản của tôi',
    patientProfiles: 'Hồ sơ người thân cần chăm sóc',
    title: 'Chi tiết hồ sơ bệnh án'
  },
  banner: {
    back: 'Quay lại danh sách hồ sơ',
    activeCareSession: 'Đang có ca chăm sóc hoạt động',
    titlePrefix: 'Hồ sơ y tế: ',
    viewMode: 'Chế độ xem',
    editMode: 'Chế độ chỉnh sửa',
    saveUpdate: 'Lưu cập nhật',
    bookNewCare: 'Đặt lịch chăm sóc mới',
    toastSuccess: 'Đã lưu và đồng bộ thông tin hồ sơ người bệnh thành công!'
  },
  snapshot: {
    bloodType: 'Nhóm máu',
    height: 'Chiều cao',
    weight: 'Cân nặng',
    nationalIdLabel: 'Số định danh / CCCD:',
    insuranceIdLabel: 'Mã thẻ BHYT:',
    dobLabel: 'Ngày sinh:',
    verifiedNotice: 'Hồ sơ y bạ điện tử đã được xác thực qua cơ sở dữ liệu VNeID và Bệnh viện ĐHYD TP.HCM.',
    changeAvatar: 'Cập nhật ảnh đại diện',
    verifiedRecord: 'Hồ sơ được xác thực danh tính'
  },
  caregiverWidget: {
    title: 'Điều dưỡng phụ trách hiện tại',
    shiftBadge: 'Ca trưa nay',
    ratingCount: '{{rating}} ({{count}} ca)',
    shiftTimeLabel: 'Thời gian ca:',
    shiftTimeValue: '08:00 - 17:00 (Hàng ngày)',
    chatButton: 'Nhắn tin với điều dưỡng'
  },
  emergencySection: {
    title: 'Liên hệ khẩn cấp',
    priorityBadge: 'Ưu tiên 24/7',
    callButton: 'Gọi điện',
    primaryContact: {
      name: 'Nguyễn Mai Anh (Bạn - Con gái)',
      role: 'Người giám hộ chính • Q.Bình Thạnh'
    },
    secondaryContact: {
      name: 'Nguyễn Văn Hùng (Con trai thứ)',
      role: 'Người liên hệ thứ 2 • 0988 123 456'
    },
    hotlineTitle: 'Tổng đài Y tế Khẩn cấp',
    hotlineDesc: 'Điều phối cấp cứu 115 & Đội phản ứng nhanh'
  },
  medicalBackground: {
    title: 'Tình trạng bệnh nền & Tiền sử y khoa',
    lastUpdated: 'Cập nhật lần cuối: 3 ngày trước',
    chronicLabel: 'Bệnh lý nền đang điều trị',
    allergyLabel: 'Tiền sử dị ứng thuốc & Thực phẩm',
    surgeryLabel: 'Tiền sử phẫu thuật & Can thiệp',
    attendingDoctorLabel: 'Bác sĩ chuyên khoa phụ trách theo dõi',
    callDoctor: 'SĐT: {{phone}}'
  },
  prescriptions: {
    title: 'Đơn thuốc hiện tại & Lịch uống định kỳ',
    regimenBadge: 'Đang áp dụng theo phác đồ tháng 10/2024',
    thMedication: 'Tên biệt dược / Hoạt chất',
    thDosage: 'Liều lượng',
    thTime: 'Thời điểm uống',
    thInstructions: 'Chỉ dẫn của điều dưỡng',
    addMedication: '+ Thêm loại thuốc vào đơn'
  },
  carePlan: {
    title: 'Kế hoạch chăm sóc & Chỉ số sinh hiệu bắt buộc',
    standardBadge: 'Quy chuẩn BV • Chu kỳ ngày',
    mobilityTitle: 'Vận động & Phục hồi',
    mobilityDesc:
      'Cần hỗ trợ dìu khi đứng dậy đi vệ sinh. Tập phục hồi vận động bàn tay trái 30 phút mỗi chiều với bóng cao su gai y tế.',
    nutritionTitle: 'Dinh dưỡng tiết chế',
    nutritionDesc:
      'Ăn nhạt (dưới 3g muối/ngày), chia 3 bữa chính + 1 bữa phụ hạt dinh dưỡng lúc 15h. Đảm bảo uống đủ 1.5 - 1.8L nước/ngày.',
    vitalsTitle: 'Đo sinh hiệu 2 lần/ngày',
    vitalsDesc:
      'Đo huyết áp & SpO2 vào 07:00 sáng và 17:00 chiều. Ngưỡng cảnh báo: HA tâm thu > 145 mmHg hoặc < 100 mmHg.',
    addressLabel: 'Địa chỉ lưu trú chăm sóc tại nhà:'
  },
  historyAndDocs: {
    tabHistory: 'Lịch sử các ca chăm sóc gần nhất',
    tabDocs: 'Tài liệu & Kết quả xét nghiệm đính kèm (4)',
    viewSessionReport: 'Xem báo cáo ca',
    previewDoc: 'Xem trước tài liệu',
    uploadTitle: 'Bấm để tải thêm sổ khám bệnh hoặc phiếu chỉ định mới',
    uploadSubtitle: 'Hỗ trợ định dạng PDF, JPG, PNG dung lượng tối đa 15MB'
  }
} as const
