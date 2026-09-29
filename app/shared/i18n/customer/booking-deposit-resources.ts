export const bookingDepositEn = {
  documentTitle: 'Booking Confirmation & Deposit Payment | CareConnect',
  breadcrumb: {
    home: 'Home',
    myBookings: 'My Bookings',
    current: 'Confirm Appointment & Pay Deposit (#CC-BK-9284)'
  },
  banner: {
    title: 'Appointment is temporarily reserved',
    exclusiveBadge: 'Exclusive Shift',
    desc: 'Please complete the 30% deposit payment so the caregiver can accept the shift and lock in travel arrangements.',
    reservedTimeLabel: 'Reservation time left',
    expired: 'Expired'
  },
  overview: {
    title: 'Medical Appointment Details',
    pendingDepositBadge: 'Awaiting Deposit',
    fileCodePrefix: 'File Code: ',
    fileCodeValue: '#CC-BK-9284',
    createdTime: ' • Created at 09:15, 24/10/2024',
    insuranceBadge: 'Standard Medical Insurance',
    caregiver: {
      avatarAlt: 'Portrait of friendly Vietnamese nurse Nguyen Thi Bich Loan in jade scrubs',
      name: 'Nurse Nguyen Thi Bich Loan',
      verifiedBadge: 'Medical License & VNeID',
      bio: 'Bachelor of Nursing • University of Medicine and Pharmacy HCMC (7 years clinical experience)',
      ratingValue: '4.9',
      reviewsCount: '(124 reviews)',
      chatAfterDeposit: 'Private chat available after deposit'
    },
    patient: {
      title: 'Care Recipient Information',
      name: 'Mr. Nguyen Van An (78 yrs • Biological Father)',
      conditionLabel: 'Condition:',
      conditionDesc: 'Hypertension, Type 2 Diabetes, motor rehabilitation after mild left hemiparesis stroke.'
    },
    location: {
      title: 'Care Delivery Address',
      building: 'Apartment 18.04 • Landmark 2 Tower',
      address: 'Vinhomes Central Park, 208 Nguyen Huu Canh, Ward 22, Binh Thanh Dist., Ho Chi Minh City'
    },
    schedule: {
      title: 'Care Regimen & Shift Schedule',
      shiftsCountBadge: '5 consecutive shifts • 40 hours',
      datesLabel: 'Execution Dates',
      datesValue: '28/10 - 01/11/2024',
      shiftHoursLabel: 'Shift Hours',
      shiftHoursValue: '08:00 - 16:00 (Day shift)',
      reportFrequencyLabel: 'Clinical Report',
      reportFrequencyValue: 'Updated every 4 hours',
      protocolsTitle: 'Package Care Scope Items:',
      protocols: {
        vitals: 'Continuous vitals monitoring: Blood Pressure, SpO2, Blood Glucose',
        physio: 'Motor rehabilitation & physical therapy for limbs 45 mins/shift',
        meds: 'Medication reminders and dosage log documentation',
        nutrition: 'Clinical nutrition care & gentle mobility to prevent pressure ulcers'
      }
    }
  },
  policies: {
    title: 'Commitment Policy & Rights Protection',
    items: {
      refundTitle: 'Flexible 100% Deposit Refund',
      refundDesc:
        'Free cancellation and 100% deposit refund if cancelled at least 12 hours before the first shift start time.',
      insuranceTitle: 'Medical Liability Insurance',
      insuranceDesc:
        'All shifts are covered by a medical liability insurance policy worth 2,000,000,000 VND from partner Bao Viet.',
      escrowTitle: 'Safe Deposit Escrow',
      escrowDesc: 'Deposit is safely held in CareConnect escrow account until the caregiver checks in on time.',
      supportTitle: '24/7 Care Coordinator Support',
      supportDesc:
        'Clinical hotline and consultant doctors ready to dispatch immediate replacement if caregiver has emergency.'
    }
  },
  payment: {
    stepLabel: 'Final Step',
    title: 'Pay Deposit',
    subtitle: 'Reserve shift schedule and activate caregiver preparation record',
    shiftsCostLabel: 'Shift costs (5 shifts × 8h)',
    shiftsCostValue: '$95 (2,375,000 đ)',
    suppliesCostLabel: 'Basic medical supplies & shift insurance',
    suppliesCostValue: '$15 (375,000 đ)',
    promoLabel: 'New Customer Promo Code',
    promoValue: '-$10 (-250,000 đ)',
    totalPackageLabel: 'Total All-inclusive Package:',
    totalUsd: '$100',
    totalVnd: '2,500,000 đ',
    depositTitle: 'Required Deposit (30%)',
    depositRemaining: 'Remaining after shifts: $70 (1,750,000 đ)',
    depositUsd: '$30',
    depositVnd: '750,000 đ',
    methodTitle: 'Select deposit payment method',
    methods: {
      vietqr: {
        label: 'Scan VietQR 24/7',
        freeBadge: 'Zero fee',
        desc: 'Instant bank transfer across all banks',
        bankAccountLabel: 'Account: ',
        bankAccountValue: '0381000599999 (Vietcombank)',
        transferNoteLabel: 'Transfer note: ',
        transferNoteValue: 'CC 9284 COC'
      },
      card: {
        label: 'International Card (Visa / Master / JCB)',
        desc: 'PCI-DSS 3D-Secure certified security'
      },
      wallet: {
        label: 'MoMo / ZaloPay E-Wallet',
        desc: 'Instant verification via app'
      }
    },
    payButton: 'Pay Deposit $30 (750,000 đ)',
    processing: 'Processing transaction...',
    successText: 'Deposit Successful!',
    agreementPrefix: 'By paying you agree to CareConnect ',
    termsLink: 'Terms of Service',
    andText: ' and ',
    refundLink: 'Cancellation & Refund Policy',
    agreementSuffix: '.',
    sslNotice: '256-bit SSL banking-standard encrypted checkout',
    caregiverNotice:
      'Nurse Bich Loan has received the schedule reservation notice and is preparing medical equipment upon successful deposit.',
    modalTitle: 'Deposit Confirmed Successfully!',
    modalDesc:
      'Confirmation successful! Nurse Nguyen Thi Bich Loan has officially accepted the shift. CareConnect sent confirmation code & details via SMS / Email.',
    viewBookingsBtn: 'View My Bookings',
    closeModalBtn: 'Close'
  }
} as const

export const bookingDepositVi = {
  documentTitle: 'Xác nhận lịch hẹn & Thanh toán cọc | CareConnect',
  breadcrumb: {
    home: 'Trang chủ',
    myBookings: 'Lịch đặt của tôi',
    current: 'Xác nhận lịch hẹn & Thanh toán cọc (#CC-BK-9284)'
  },
  banner: {
    title: 'Lịch hẹn đang được giữ chỗ tạm thời',
    exclusiveBadge: 'Ca trực độc quyền',
    desc: 'Vui lòng hoàn tất thanh toán tiền cọc 30% để điều dưỡng viên tiếp nhận ca và chốt lịch di chuyển.',
    reservedTimeLabel: 'Thời gian giữ chỗ',
    expired: 'Hết hạn'
  },
  overview: {
    title: 'Chi tiết lịch hẹn y tế',
    pendingDepositBadge: 'Chờ đặt cọc',
    fileCodePrefix: 'Mã hồ sơ: ',
    fileCodeValue: '#CC-BK-9284',
    createdTime: ' • Khởi tạo lúc 09:15, 24/10/2024',
    insuranceBadge: 'Bảo hiểm y khoa tiêu chuẩn',
    caregiver: {
      avatarAlt: 'Chân dung nữ điều dưỡng viên Việt Nam thân thiện Nguyễn Thị Bích Loan trong đồng phục ngọc bích',
      name: 'ĐĐ. Nguyễn Thị Bích Loan',
      verifiedBadge: 'CCHN & VNeID',
      bio: 'Cử nhân Điều dưỡng • ĐH Y Dược TP.HCM (7 năm kinh nghiệm lâm sàng)',
      ratingValue: '4.9',
      reviewsCount: '(124 đánh giá)',
      chatAfterDeposit: 'Trao đổi riêng sau cọc'
    },
    patient: {
      title: 'Thông tin người nhận chăm sóc',
      name: 'Cụ Nguyễn Văn An (78 tuổi • Bố ruột)',
      conditionLabel: 'Tình trạng:',
      conditionDesc: 'Tăng huyết áp, Đái tháo đường Type 2, phục hồi vận động sau tai biến nhẹ nửa người bên trái.'
    },
    location: {
      title: 'Địa chỉ tiếp nhận chăm sóc',
      building: 'Căn hộ 18.04 • Tòa Landmark 2',
      address: 'Khu đô thị Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh'
    },
    schedule: {
      title: 'Phác đồ chăm sóc & Lịch trình',
      shiftsCountBadge: '5 ca liên tục • 40 giờ',
      datesLabel: 'Ngày thực hiện',
      datesValue: '28/10 - 01/11/2024',
      shiftHoursLabel: 'Khung giờ mỗi ca',
      shiftHoursValue: '08:00 - 16:00 (Ca ngày)',
      reportFrequencyLabel: 'Báo cáo lâm sàng',
      reportFrequencyValue: 'Cập nhật mỗi 4 giờ',
      protocolsTitle: 'Hạng mục công việc trong gói:',
      protocols: {
        vitals: 'Đo sinh hiệu liên tục: Huyết áp, SpO2, Đường huyết',
        physio: 'Vật lý trị liệu phục hồi chức năng tay chân 45 phút/ca',
        meds: 'Hỗ trợ nhắc thuốc và ghi chép nhật ký dùng thuốc',
        nutrition: 'Chăm sóc dinh dưỡng y tế & vận động nhẹ phòng loét tì đè'
      }
    }
  },
  policies: {
    title: 'Chính sách cam kết & Bảo vệ quyền lợi',
    items: {
      refundTitle: 'Hoàn cọc 100% linh hoạt',
      refundDesc:
        'Miễn phí hủy và nhận hoàn lại 100% tiền đặt cọc nếu hủy trước 12 giờ so với thời gian bắt đầu ca đầu tiên.',
      insuranceTitle: 'Bảo hiểm y tế trách nhiệm',
      insuranceDesc:
        'Toàn bộ ca trực được bảo vệ bởi gói bảo hiểm trách nhiệm y tế trị giá 2.000.000.000 đ từ đối tác Bảo Việt.',
      escrowTitle: 'Bảo lưu tiền cọc an toàn',
      escrowDesc:
        'Tiền cọc được tạm giữ an toàn trong tài khoản trung gian của CareConnect cho đến khi điều dưỡng viên check-in đúng giờ.',
      supportTitle: 'Điều phối viên hỗ trợ 24/7',
      supportDesc:
        'Tổng đài lâm sàng và bác sĩ cố vấn sẵn sàng hỗ trợ đổi nhân sự ngay tức thì nếu điều dưỡng viên gặp sự cố y tế khẩn cấp.'
    }
  },
  payment: {
    stepLabel: 'Bước cuối cùng',
    title: 'Thanh toán tiền cọc',
    subtitle: 'Giữ lịch ca trực và kích hoạt hồ sơ chuẩn bị của điều dưỡng',
    shiftsCostLabel: 'Chi phí ca trực (5 ca × 8h)',
    shiftsCostValue: '$95 (2.375.000 đ)',
    suppliesCostLabel: 'Vật tư y tế cơ bản & Bảo hiểm ca',
    suppliesCostValue: '$15 (375.000 đ)',
    promoLabel: 'Mã ưu đãi Khách hàng mới',
    promoValue: '-$10 (-250.000 đ)',
    totalPackageLabel: 'Tổng chi phí trọn gói:',
    totalUsd: '$100',
    totalVnd: '2.500.000 đ',
    depositTitle: 'Tiền cọc yêu cầu (30%)',
    depositRemaining: 'Còn lại sau ca: $70 (1.750.000 đ)',
    depositUsd: '$30',
    depositVnd: '750.000 đ',
    methodTitle: 'Chọn phương thức thanh toán cọc',
    methods: {
      vietqr: {
        label: 'Quét mã VietQR 24/7',
        freeBadge: 'Miễn phí GD',
        desc: 'Chuyển khoản tức thì mọi ngân hàng',
        bankAccountLabel: 'Tài khoản: ',
        bankAccountValue: '0381000599999 (Vietcombank)',
        transferNoteLabel: 'Nội dung CK: ',
        transferNoteValue: 'CC 9284 COC'
      },
      card: {
        label: 'Thẻ quốc tế (Visa / Master / JCB)',
        desc: 'Bảo mật chuẩn PCI-DSS 3D-Secure'
      },
      wallet: {
        label: 'Ví MoMo / ZaloPay',
        desc: 'Xác thực nhanh trên ứng dụng'
      }
    },
    payButton: 'Thanh toán đặt cọc $30 (750.000 đ)',
    processing: 'Đang xử lý giao dịch...',
    successText: 'Đặt cọc thành công!',
    agreementPrefix: 'Nhấn thanh toán đồng nghĩa với việc bạn đồng ý với ',
    termsLink: 'Điều khoản dịch vụ',
    andText: ' và ',
    refundLink: 'Chính sách hủy hoàn cọc',
    agreementSuffix: ' của CareConnect.',
    sslNotice: 'Mã hóa thanh toán SSL 256-bit tiêu chuẩn ngân hàng',
    caregiverNotice:
      'Điều dưỡng viên ĐĐ. Bích Loan đã nhận thông báo giữ lịch và sẵn sàng trang thiết bị ngay khi giao dịch cọc thành công.',
    modalTitle: 'Đặt cọc thành công!',
    modalDesc:
      'Xác nhận đặt cọc thành công! Điều dưỡng viên ĐĐ. Nguyễn Thị Bích Loan đã chính thức nhận ca trực. CareConnect đã gửi mã xác nhận & thông tin qua SMS / Email của bạn.',
    viewBookingsBtn: 'Xem Lịch đặt của tôi',
    closeModalBtn: 'Đóng'
  }
} as const
