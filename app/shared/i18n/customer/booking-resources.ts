export const bookingEn = {
  documentTitle: 'Create Home Care Appointment | CareConnect',
  breadcrumb: {
    home: 'Home',
    caregivers: 'Find Caregivers',
    current: 'New Care Booking'
  },
  header: {
    title: 'Schedule Home Healthcare Appointment',
    subtitle:
      'Professional nurse matching process, digitized vital signs monitoring, and personalized recovery path for your loved one.'
  },
  stepper: {
    step1Label: 'Step 1',
    step1Title: 'Patient',
    step2Label: 'Step 2',
    step2Title: 'Service Plan',
    step3Label: 'Step 3',
    step3Title: 'Caregiver',
    step4Label: 'Step 4',
    step4Title: 'Schedule & Time',
    step5Label: 'Step 5: Confirmation',
    step5Title: 'Summary & Book'
  },
  patientSection: {
    title: 'Care Recipient',
    subtitle: 'Medical records secured per HIPAA & Ministry of Health standards',
    switchPatientBtn: 'Change relative',
    ageText: '{{age}} years old',
    genderMale: 'Male',
    genderFemale: 'Female',
    bloodType: 'Blood Type {{type}}',
    underlyingLabel: 'Underlying conditions:',
    underlyingDesc: 'Grade 2 hypertension, Type 2 diabetes, mild post-stroke sequelae in 2022.',
    address: 'Apt 18.04 Landmark 2, Vinhomes Central Park, Ward 22, Binh Thanh, HCMC',
    patientFatherOption: 'Mr. Nguyen Van An (Father)',
    patientMotherOption: 'Mrs. Le Thi Mai - 74 years old (Mother)',
    addNewPatientLink: 'Add new patient profile'
  },
  servicesSection: {
    title: 'Medical Care Service Plan',
    subtitle: 'Select specialized care matching clinical status',
    activeBadge: 'Clinical protocol activated',
    plans: {
      stroke: {
        title: 'Post-Stroke Recovery & Chronic Care',
        desc: 'Focuses on motor recovery, muscle stimulation, pressure ulcer prevention, and standard blood pressure control.',
        f1: 'Measure vital signs (BP, SpO2, Blood glucose) 2x/shift',
        f2: 'Bedside physical therapy & rehabilitation 45 mins',
        f3: 'Administer prescribed meds & diabetic meal plan'
      },
      surgery: {
        title: 'Post-Surgical Care & Wound Management',
        desc: 'Sterile dressing changes, suture removal per orders, drain removal and infection surveillance.',
        f1: 'Hospital-grade sterile aseptic technique',
        f2: 'Nasogastric / Foley catheter management'
      },
      dementia: {
        title: 'Dementia & Alzheimer Care for Seniors',
        desc: 'Psychological dialogue therapy, memory stimulation, anti-wandering companionship, and comprehensive personal hygiene support.'
      },
      palliative: {
        title: 'Palliative Care & Bedridden Chronic Care',
        desc: 'Home oxygen support, suctioning, turning/repositioning for stage 3-4 ulcer prevention, and intensive pain control.'
      }
    }
  },
  caregiverSection: {
    title: 'Assigned Caregiver',
    subtitle: 'Vetted by professional licensing and specialized protocols',
    changeCaregiverBtn: 'Choose another nurse',
    onlineStatus: 'Ready for shifts',
    nurseName: 'Nurse Nguyen Thi Bich Loan',
    verifiedBadge: 'Verified',
    nurseBio: 'B.S. in Nursing, University of Medicine and Pharmacy HCMC • 6 years ICU & rehab experience',
    reviewsCount: '4.95 (186 5★ reviews)',
    distance: '2.4 km from home',
    priceLabel: 'Committed unit rate',
    priceRate: '1,450,000 đ',
    perShiftSuffix: '/ 8h shift',
    includedSupplies: 'Travel expenses & primary medical supplies included',
    smartMatchTitle: 'CareConnect SmartMatch (Auto-dispatch)',
    smartMatchDesc:
      'AI system automatically matches the nearest 5-star nurse if Nurse Loan has an unexpected emergency.'
  },
  scheduleSection: {
    title: 'Schedule & Shift Timing',
    subtitle: 'Select shift frequency and special instructions for the caregiver',
    weeklyTab: 'Weekly (Save 10%)',
    singleTab: 'Single shift',
    startDateLabel: 'Start date',
    firstShiftNotice: 'First shift: Monday, 21/10/2024',
    shiftHourLabel: 'Shift hours',
    shiftHourHint: 'Includes standard 60-minute lunch break',
    shifts: {
      day8h: 'Day shift 8 hours (08:00 - 17:00)',
      morning4h: 'Morning shift 4 hours (08:00 - 12:00)',
      afternoon4h: 'Afternoon shift 4 hours (13:30 - 17:30)',
      night12h: 'Night shift 12 hours (19:30 - 07:30)',
      full24h: 'In-home full time 24/24'
    },
    frequencyLabel: 'Days per week',
    frequencyHint: 'Eligible for Peace of Mind Weekly package',
    frequencies: {
      days5: '5 days (Monday to Friday)',
      days7: '7 days (Full week including Sat, Sun)',
      days3: '3 days (Monday, Wednesday, Friday)',
      custom: 'Custom schedule'
    },
    weeklyDaysLabel: 'Selected days this week:',
    notesLabel: 'Special instructions for the Caregiver:',
    notesLimit: 'Max 500 characters',
    notesPlaceholder: 'Enter special instructions for caregiver...',
    notesDefault:
      'My father has left-sided hemiparesis after a mild stroke. Please assist him with physical therapy for his arm and ankle for 30-45 minutes in the afternoon. He often forgets to take medication, so please check his blood pressure before administering Amlodipine 5mg after breakfast at 09:00.'
  },
  summary: {
    tag: 'Booking Summary',
    title: 'Shift Cost Confirmation',
    patientLabel: 'Patient',
    patientValue: 'Mr. Nguyen Van An (78 yrs)',
    caregiverLabel: 'Assigned Caregiver',
    caregiverValue: 'Nurse Nguyen Thi Bich Loan',
    timeLabel: 'Scheduled Time',
    timeValue: '5 shifts (21/10 - 25/10/2024 • 08:00 - 17:00)',
    rateLabel: 'Unit rate per 8h shift',
    rateValue: '1,450,000 đ / shift',
    shiftsCountLabel: 'Shifts subtotal (5 days)',
    shiftsCountValue: '7,250,000 đ',
    discountLabel: 'Weekly package discount (-10%)',
    discountValue: '- 725,000 đ',
    voucherLabel: 'Voucher FirstCare',
    voucherValue: '- 200,000 đ',
    insuranceLabel: 'Risk insurance & basic supplies',
    freeValue: 'Free (0 đ)',
    promoPlaceholder: 'PROMO CODE',
    applyBtn: 'Apply',
    totalEstimatedLabel: 'Estimated Total Payment',
    totalNote: 'Includes VAT & all-inclusive guarantee',
    currency: 'đ',
    totalAmount: '6,325,000',
    paymentMethodTitle: 'Payment Method:',
    recommendedBadge: 'Recommended',
    flexibleBadge: 'Flexible',
    paymentMethods: {
      napas: '24/7 Napas Bank Transfer QR',
      card: 'International Card (Visa / Master / JCB)',
      wallet: 'E-Wallet MoMo / ZaloPay',
      deposit30: '30% Deposit (Pay remainder after each shift)'
    },
    submitBtn: 'Confirm & Book Care Appointment',
    successTitle: 'Appointment Booked Successfully!',
    successDesc:
      'Your care appointment for {{patient}} with {{nurse}} has been confirmed. You can track this shift under My Bookings.',
    viewMyBookings: 'View My Bookings',
    backToCaregivers: 'Back to Find Caregivers',
    trustGuarantees: {
      g1: '100% refund if caregiver does not adhere to clinical protocol',
      g2: 'Free caregiver replacement at any time if unsatisfied',
      g3: 'Clinical data encrypted end-to-end with AES-256'
    }
  }
} as const

export const bookingVi = {
  documentTitle: 'Tạo lịch hẹn chăm sóc y tế tại nhà | CareConnect',
  breadcrumb: {
    home: 'Trang chủ',
    caregivers: 'Tìm người chăm sóc',
    current: 'Đặt lịch chăm sóc mới'
  },
  header: {
    title: 'Tạo lịch hẹn chăm sóc y tế tại nhà',
    subtitle:
      'Quy trình ghép nối điều dưỡng chuyên nghiệp, theo dõi sinh hiệu số hóa và cá nhân hóa lộ trình hồi phục cho người thân.'
  },
  stepper: {
    step1Label: 'Bước 1',
    step1Title: 'Người bệnh',
    step2Label: 'Bước 2',
    step2Title: 'Gói dịch vụ',
    step3Label: 'Bước 3',
    step3Title: 'Điều dưỡng viên',
    step4Label: 'Bước 4',
    step4Title: 'Lịch trình & Giờ',
    step5Label: 'Bước 5: Xác nhận',
    step5Title: 'Tổng kết & Đặt lịch'
  },
  patientSection: {
    title: 'Người nhận chăm sóc',
    subtitle: 'Hồ sơ y tế được bảo mật theo tiêu chuẩn HIPAA & Bộ Y Tế',
    switchPatientBtn: 'Đổi người thân',
    ageText: '{{age}} tuổi',
    genderMale: 'Nam',
    genderFemale: 'Nữ',
    bloodType: 'Nhóm máu {{type}}',
    underlyingLabel: 'Bệnh nền:',
    underlyingDesc: 'Tăng huyết áp độ 2, Đái tháo đường Type 2, Di chứng tai biến mạch máu não nhẹ năm 2022.',
    address: 'Căn hộ 18.04 Tòa Landmark 2, Vinhomes Central Park, P. 22, Bình Thạnh, TP.HCM',
    patientFatherOption: 'Cụ Nguyễn Văn An (Bố)',
    patientMotherOption: 'Bà Lê Thị Mai - 74 tuổi (Mẹ)',
    addNewPatientLink: 'Thêm hồ sơ người bệnh mới'
  },
  servicesSection: {
    title: 'Gói dịch vụ chăm sóc y tế',
    subtitle: 'Lựa chọn chuyên khoa phù hợp với tình trạng lâm sàng',
    activeBadge: 'Đã kích hoạt phác đồ',
    plans: {
      stroke: {
        title: 'Chăm sóc Phục hồi sau Tai biến & Mãn tính',
        desc: 'Tập trung tái tạo vận động, kích thích cơ, phòng loét tì đè và kiểm soát huyết áp chuẩn mực.',
        f1: 'Đo sinh hiệu (HA, SPO2, Đường huyết) 2 lần/ca',
        f2: 'Hỗ trợ tập vật lý trị liệu & PHCN tại giường 45 phút',
        f3: 'Cho dùng thuốc đúng chỉ định & thực đơn tiểu đường'
      },
      surgery: {
        title: 'Hậu phẫu Ngoại khoa & Chăm sóc Vết thương',
        desc: 'Thay băng vô khuẩn, cắt chỉ theo y lệnh, rút dẫn lưu và theo dõi nguy cơ nhiễm trùng.',
        f1: 'Kỹ thuật tiệt trùng vô khuẩn chuẩn viện',
        f2: 'Chăm sóc ống thông Sonde dạ dày / Foley'
      },
      dementia: {
        title: 'Sa sút trí tuệ & Alzheimer Người già',
        desc: 'Trò chuyện trị liệu tâm lý, kích thích trí nhớ, đồng hành chống lạc và hỗ trợ vệ sinh cá nhân toàn diện.'
      },
      palliative: {
        title: 'Chăm sóc Giảm nhẹ & Bệnh nặng tại giường',
        desc: 'Thở oxy gia đình, hút đờm dãi, xoay trở chống loét độ 3-4 và quản lý cơn đau chuyên sâu.'
      }
    }
  },
  caregiverSection: {
    title: 'Điều dưỡng viên phụ trách',
    subtitle: 'Được tuyển chọn theo chứng chỉ hành nghề và phác đồ chuyên khoa',
    changeCaregiverBtn: 'Chọn người khác',
    onlineStatus: 'Đang sẵn sàng nhận ca',
    nurseName: 'ĐD. Nguyễn Thị Bích Loan',
    verifiedBadge: 'Đã xác thực',
    nurseBio: 'Cử nhân Điều dưỡng Đại học Y Dược TP.HCM • 6 năm kinh nghiệm hồi sức & PHCN',
    reviewsCount: '4.95 (186 đánh giá 5★)',
    distance: 'Cách nhà 2.4 km',
    priceLabel: 'Đơn giá cam kết',
    priceRate: '1.450.000 đ',
    perShiftSuffix: '/ ca 8h',
    includedSupplies: 'Đã bao gồm chi phí đi lại & vật tư y tế sơ cấp',
    smartMatchTitle: 'CareConnect SmartMatch (Gợi ý tự động)',
    smartMatchDesc: 'Hệ thống AI tự động điều phối điều dưỡng viên chuẩn 5 sao gần nhất nếu ĐD. Loan có ca đột xuất.'
  },
  scheduleSection: {
    title: 'Lịch trình & Khung giờ chăm sóc',
    subtitle: 'Lựa chọn tần suất ca trực và dặn dò chuyên biệt cho điều dưỡng',
    weeklyTab: 'Theo tuần (Tiết kiệm 10%)',
    singleTab: 'Ca lẻ đơn ngày',
    startDateLabel: 'Ngày bắt đầu',
    firstShiftNotice: 'Ca đầu tiên: Thứ 2, 21/10/2024',
    shiftHourLabel: 'Khung giờ ca trực',
    shiftHourHint: 'Bao gồm 60 phút nghỉ trưa tiêu chuẩn',
    shifts: {
      day8h: 'Ca Ngày 8 tiếng (08:00 - 17:00)',
      morning4h: 'Ca Sáng 4 tiếng (08:00 - 12:00)',
      afternoon4h: 'Ca Chiều 4 tiếng (13:30 - 17:30)',
      night12h: 'Ca Trực Đêm 12 tiếng (19:30 - 07:30)',
      full24h: 'Nội trú Toàn thời gian 24/24'
    },
    frequencyLabel: 'Số buổi trong tuần',
    frequencyHint: 'Được áp dụng gói ưu đãi Tuần An Tâm',
    frequencies: {
      days5: '5 ngày (Thứ Hai đến Thứ Sáu)',
      days7: '7 ngày (Trọn vẹn tuần kể cả T7, CN)',
      days3: '3 ngày (Thứ Hai, Tư, Sáu)',
      custom: 'Tùy chỉnh lịch cụ thể'
    },
    weeklyDaysLabel: 'Các ngày trong tuần này:',
    notesLabel: 'Ghi chú dặn dò đặc biệt cho Điều dưỡng viên:',
    notesLimit: 'Tối đa 500 ký tự',
    notesPlaceholder: 'Nhập ghi chú đặc biệt cho điều dưỡng viên...',
    notesDefault:
      'Bố tôi bị yếu nửa người bên trái sau di chứng tai biến nhẹ, nhờ điều dưỡng Loan hỗ trợ tập vật lý trị liệu cánh tay và cổ chân 30-45 phút vào buổi chiều. Bố hay quên uống thuốc, nhờ điều dưỡng kiểm tra huyết áp trước khi cho cụ uống viên hạ áp Amlodipine 5mg sau ăn sáng lúc 09:00.'
  },
  summary: {
    tag: 'Tóm tắt đơn đặt lịch',
    title: 'Xác nhận chi phí ca trực',
    patientLabel: 'Người bệnh',
    patientValue: 'Cụ Nguyễn Văn An (78 tuổi)',
    caregiverLabel: 'Điều dưỡng phụ trách',
    caregiverValue: 'ĐD. Nguyễn Thị Bích Loan',
    timeLabel: 'Thời gian thực hiện',
    timeValue: '5 ca (21/10 - 25/10/2024 • 08:00 - 17:00)',
    rateLabel: 'Đơn giá ca trực 8h',
    rateValue: '1.450.000 đ / ca',
    shiftsCountLabel: 'Số lượng ca trực (5 ngày)',
    shiftsCountValue: '7.250.000 đ',
    discountLabel: 'Ưu đãi gói tuần (-10%)',
    discountValue: '- 725.000 đ',
    voucherLabel: 'Voucher FirstCare',
    voucherValue: '- 200.000 đ',
    insuranceLabel: 'Bảo hiểm rủi ro & Vật tư sơ cấp',
    freeValue: 'Miễn phí (0 đ)',
    promoPlaceholder: 'MÃ GIẢM GIÁ',
    applyBtn: 'Áp dụng',
    totalEstimatedLabel: 'Tổng thanh toán dự kiến',
    totalNote: 'Đã bao gồm VAT & cam kết trọn gói',
    currency: 'đ',
    totalAmount: '6.325.000',
    paymentMethodTitle: 'Phương thức thanh toán:',
    recommendedBadge: 'Khuyên dùng',
    flexibleBadge: 'Linh hoạt',
    paymentMethods: {
      napas: 'Chuyển khoản QR Napas 24/7',
      card: 'Thẻ Quốc tế (Visa / Master / JCB)',
      wallet: 'Ví điện tử MoMo / ZaloPay',
      deposit30: 'Cọc 30% (Thanh toán sau mỗi ca)'
    },
    submitBtn: 'Xác nhận & Đặt lịch chăm sóc',
    successTitle: 'Đặt lịch chăm sóc thành công!',
    successDesc:
      'Lịch hẹn chăm sóc cho {{patient}} với {{nurse}} đã được ghi nhận. Bạn có thể theo dõi tiến độ ca trực tại mục Lịch đặt của tôi.',
    viewMyBookings: 'Xem Lịch đặt của tôi',
    backToCaregivers: 'Quay về Tìm người chăm sóc',
    trustGuarantees: {
      g1: 'Hoàn tiền 100% nếu điều dưỡng không đúng phác đồ',
      g2: 'Miễn phí đổi điều dưỡng viên bất kỳ lúc nào nếu chưa phù hợp',
      g3: 'Dữ liệu lâm sàng được mã hóa AES-256 đầu cuối'
    }
  }
} as const
