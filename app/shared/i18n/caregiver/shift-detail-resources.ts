export const caregiverShiftDetailEn = {
  documentTitle: 'Care Session Detail #{{code}} | CareConnect',
  breadcrumb: {
    home: 'Home',
    schedule: 'Schedule',
    shiftCode: 'Shift #{{code}}'
  },
  header: {
    title: 'Care Session Detail #{{code}}',
    statusReady: 'Ready for shift',
    statusOngoing: 'Shift in progress',
    assignment: 'Direct assignment',
    hotline: 'Dispatch hotline',
    hotlineNumber: '1900 6868',
    print: 'Print sheet',
    share: 'Share',
    copiedToast: 'Shift link copied to clipboard.'
  },
  countdown: {
    label: 'Countdown to start',
    text: 'Shift starts in',
    locationReady: 'Location & route ready'
  },
  patient: {
    title: 'Care Recipient Profile',
    patientCode: 'Patient ID #{{code}}',
    name: 'Mr. Nguyen Van A',
    ageGender: 'Male, 78 years',
    bloodType: 'Blood type O+',
    summaryLabel: 'Medical summary:',
    summary:
      'Recovering from mild stroke, mobility weakness, requires passive range of motion exercise and routine blood pressure monitoring.',
    avatarAlt: 'Portrait of Mr. Nguyen Van A',
    guardianLabel: 'Guardian / Booked by:',
    guardianName: 'Mr. Nguyen Binh (Son)',
    guardianPhone: 'Phone: 0903 ••• 456',
    call: 'Call',
    chat: 'Message'
  },
  checklist: {
    title: 'Clinical Interventions & Task Checklist',
    packageBadge: '4-hour package',
    tasksCountBadge: '5 standard tasks',
    description:
      'Caregivers check off each item upon completing clinical procedures. Checklist records will be compiled for the guardian and updated to the CareConnect medical log.',
    completedCount: 'Completed {{completed}}/{{total}} tasks',
    items: {
      item1Title: '1. Initial vitals measurement',
      item1Time: '08:00 - 08:20',
      item1Desc: 'Measure Blood Pressure, Pulse, SpO2, Temperature and log into electronic care diary.',
      item2Title: '2. Physical therapy exercise support',
      item2Time: '08:30 - 09:15',
      item2Desc: 'Safely assist walking and passive/active movement for 30 minutes in living room/hallway.',
      item3Title: '3. Medication reminder & morning snack (09:30)',
      item3Time: '09:30 - 10:00',
      item3Desc: 'Assist warm porridge intake and antihypertensive medicine intake per doctor prescription.',
      item4Title: '4. Personal hygiene & restorative massage',
      item4Time: '10:15 - 11:15',
      item4Desc: 'Sponge bath, muscle atrophy prevention massage and pressure ulcer care on back/heels.',
      item5Title: '5. Handover & Care report completion',
      item5Time: '11:30 - 12:00',
      item5Desc: 'Re-check end-of-shift blood pressure, photograph handover and sign off on platform.'
    }
  },
  warnings: {
    title: 'Special Requirements & Clinical Warnings',
    urgentLabel: 'Urgent clinical precaution:',
    underlyingCondition: 'Underlying condition:',
    underlyingDesc:
      'Stage 2 Hypertension. Target BP < 140/90 mmHg. If systolic BP > 160 mmHg, rest patient for 15 minutes; if persistent, contact CareConnect Physician Hotline immediately.',
    allergyLabel: 'Recorded allergies:',
    allergyDesc:
      'Mild allergy to Penicillin antibiotics and shellfish (shrimp, sea crab). Thoroughly verify dietary supplement ingredients.',
    equipmentTitle: 'Medical equipment available at residence:',
    eqOmron: 'Omron digital BP monitor',
    eqSpo2: 'Fingertip pulse oximeter',
    eqBed: 'Adjustable manual medical bed'
  },
  familyNotes: {
    title: 'Family Notes & Caregiver Instructions',
    quote:
      '"He really enjoys gentle conversations and is very particular. The family has prepared minced meat porridge in a thermal pot on the kitchen counter; please warm it up for him at 9:30 AM."',
    meta: 'Note from Mr. Binh (Son) • Updated at 06:15 AM today'
  },
  timingEarnings: {
    title: 'Schedule & Remuneration',
    durationBadge: '4 hours',
    scheduleLabel: 'Confirmed schedule',
    scheduleDate: 'Tuesday, 20/09/2026',
    timeRangeLabel: 'Shift window:',
    timeRangeValue: '08:00 – 12:00',
    totalDurationLabel: 'Total duration:',
    totalDurationValue: '240 minutes',
    earningsLabel: 'Estimated earnings:',
    earningsAmount: '350,000',
    currency: 'VND',
    escrowNotice:
      'Guaranteed via CareConnect Escrow. Payout released immediately after shift completion and clinical report submission.'
  },
  locationMap: {
    title: 'Address & Location',
    distance: '1.8 km (~7 mins)',
    building: 'Apartment 804, Ruby Tower, Sunrise City Condominium',
    address: '23 Nguyen Huu Tho St., Tan Hung Ward, Dist. 7, Ho Chi Minh City',
    hint: 'Directions: Ring unit 804 at security desk or call the son to meet at Lobby A if elevator requires resident keycard.',
    coordinates: 'Coordinates: 10.7431° N, 106.7009° E',
    mapDirections: 'Maps Directions',
    arrived: 'Report Arrived',
    arrivedDone: 'Arrival Reported',
    arrivedAlert: 'Sent notification "Caregiver has arrived at Sunrise City lobby" to Mr. Nguyen Binh.'
  },
  shiftAction: {
    safetyTitle: 'Shift Safety & Verification',
    safetyDesc:
      'GPS coordinates are automatically logged when starting to protect your remuneration rights and record into professional clinical history.',
    startShiftBtn: 'START SHIFT NOW',
    ongoingBtn: 'SHIFT IN PROGRESS...',
    startConfirm: 'Confirm GPS activation and Start Shift #BK-8821 for Mr. Nguyen Van A?',
    startSuccess: 'Shift #BK-8821 has officially started. Please proceed with initial vitals measurement!',
    statusConfirmed: 'Assignment confirmed',
    shiftCodeLabel: 'Shift ID: #{{code}}',
    startNote: '* Only click start when physically present at the patient home with GPS enabled.',
    reportIncidentBtn: 'Report Incident / Request Shift Swap'
  },
  incidentModal: {
    title: 'Report Incident / Request Emergency Support',
    desc: 'Please describe the incident details or reason for shift swap. A coordinator will follow up within 3 minutes.',
    placeholder: 'Enter reason (health emergency, heavy traffic, patient unavailable...)',
    submit: 'Submit Support Request',
    cancel: 'Cancel',
    success:
      'Your request has been routed to CareConnect Lead Coordinator. Hotline 1900 6868 will call you within 3 minutes.'
  }
} as const

export const caregiverShiftDetailVi = {
  documentTitle: 'Chi tiết Ca trực #{{code}} | CareConnect',
  breadcrumb: {
    home: 'Trang chủ',
    schedule: 'Lịch trực',
    shiftCode: 'Ca #{{code}}'
  },
  header: {
    title: 'Chi tiết Ca trực #{{code}}',
    statusReady: 'Sẵn sàng vào ca',
    statusOngoing: 'Đang trong ca trực',
    assignment: 'Phân công cá nhân',
    hotline: 'Hotline điều phối',
    hotlineNumber: '1900 6868',
    print: 'In phiếu',
    share: 'Chia sẻ',
    copiedToast: 'Đã sao chép liên kết ca trực vào bộ nhớ tạm.'
  },
  countdown: {
    label: 'Đếm ngược giờ bắt đầu',
    text: 'Ca trực bắt đầu sau',
    locationReady: 'Tọa độ di chuyển đã sẵn sàng'
  },
  patient: {
    title: 'Hồ sơ người cần chăm sóc',
    patientCode: 'Mã BN #{{code}}',
    name: 'Cụ Nguyễn Văn A',
    ageGender: 'Nam, 78 tuổi',
    bloodType: 'Nhóm máu O+',
    summaryLabel: 'Tóm tắt bệnh lý:',
    summary:
      'Hồi phục sau tai biến mạch máu não nhẹ, đi lại còn yếu, cần hỗ trợ vận động thụ động và theo dõi huyết áp định kỳ.',
    avatarAlt: 'Ảnh chân dung Cụ Nguyễn Văn A',
    guardianLabel: 'Người giám hộ / Đặt lịch:',
    guardianName: 'Anh Nguyễn Bình (Con trai)',
    guardianPhone: 'SĐT liên hệ: 0903 ••• 456',
    call: 'Gọi điện',
    chat: 'Nhắn tin'
  },
  checklist: {
    title: 'Dịch vụ can thiệp y tế & Checklist nhiệm vụ',
    packageBadge: 'Gói 4 giờ',
    tasksCountBadge: '5 mục công việc tiêu chuẩn',
    description:
      'Điều dưỡng viên tích chọn từng hạng mục sau khi hoàn thành quy trình y tế. Dữ liệu checklist sẽ được tổng hợp gửi cho người giám hộ và cập nhật bệnh án CareConnect.',
    completedCount: 'Đã hoàn thành {{completed}}/{{total}} mục',
    items: {
      item1Title: '1. Đo sinh hiệu đầu ca',
      item1Time: '08:00 - 08:20',
      item1Desc: 'Đo Huyết áp, Mạch, SpO2, Thân nhiệt và lưu vào sổ tay chăm sóc điện tử.',
      item2Title: '2. Hỗ trợ tập vật lý trị liệu',
      item2Time: '08:30 - 09:15',
      item2Desc: 'Tập đi lại và vận động thụ động/chủ động 30 phút an toàn trong phòng khách/hành lang.',
      item3Title: '3. Nhắc thuốc & Bữa phụ sáng (09:30)',
      item3Time: '09:30 - 10:00',
      item3Desc: 'Hỗ trợ ăn cháo ấm và uống thuốc hạ áp theo toa có sẵn của bác sĩ.',
      item4Title: '4. Vệ sinh cá nhân & Xoa bóp phục hồi',
      item4Time: '10:15 - 11:15',
      item4Desc: 'Lau người, mát-xa cơ chống teo và phòng chống loét tỳ đè vùng lưng/gót chân.',
      item5Title: '5. Bàn giao & Lập phiếu báo cáo',
      item5Time: '11:30 - 12:00',
      item5Desc: 'Đo lại huyết áp cuối ca, chụp ảnh bàn giao và ký xác nhận trên hệ thống.'
    }
  },
  warnings: {
    title: 'Yêu cầu đặc biệt & Cảnh báo lâm sàng',
    urgentLabel: 'Lưu ý lâm sàng khẩn cấp:',
    underlyingCondition: 'Bệnh lý nền:',
    underlyingDesc:
      'Tăng huyết áp độ 2. Huyết áp mục tiêu < 140/90 mmHg. Nếu HA tâm thu > 160 mmHg, cho cụ nghỉ ngơi 15 phút, nếu không giảm gọi ngay Hotline Bác sĩ CareConnect.',
    allergyLabel: 'Dị ứng ghi nhận:',
    allergyDesc:
      'Dị ứng nhẹ với kháng sinh nhóm Penicillin và đồ ăn có vỏ (tôm, cua biển). Tuyệt đối kiểm tra thành phần thực phẩm bổ sung.',
    equipmentTitle: 'Thiết bị y tế có sẵn tại gia đình:',
    eqOmron: 'Máy đo HA điện tử Omron',
    eqSpo2: 'Máy đo SpO2 kẹp ngón',
    eqBed: 'Giường y tế tay quay nâng hạ'
  },
  familyNotes: {
    title: 'Ghi chú & Dặn dò điều dưỡng',
    quote:
      '"Cụ rất thích nói chuyện nhẹ nhàng, tính tình cẩn thận. Bữa sáng gia đình đã nấu sẵn cháo thịt bằm để trong nồi giữ nhiệt trên bếp ăn, điều dưỡng chỉ cần hâm ấm lại giúp cụ lúc 9h30 ạ."',
    meta: 'Ghi chú từ Anh Bình (Con trai) • Cập nhật lúc 06:15 sáng nay'
  },
  timingEarnings: {
    title: 'Thời gian & Thù lao',
    durationBadge: '4 giờ',
    scheduleLabel: 'Lịch trình ấn định',
    scheduleDate: 'Thứ Ba, 20/09/2026',
    timeRangeLabel: 'Khung giờ ca:',
    timeRangeValue: '08:00 – 12:00',
    totalDurationLabel: 'Tổng thời lượng:',
    totalDurationValue: '240 phút',
    earningsLabel: 'Thu nhập dự kiến nhận được:',
    earningsAmount: '350.000',
    currency: 'VNĐ',
    escrowNotice: 'Đã bảo chứng qua Escrow CareConnect. Nhận thanh toán ngay sau khi hoàn tất ca và gửi báo cáo y tế.'
  },
  locationMap: {
    title: 'Địa chỉ & Định vị',
    distance: '1.8 km (~7 phút)',
    building: 'Căn hộ 804, Tháp Ruby, Chung cư Sunrise City',
    address: '23 Đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh',
    hint: 'Chỉ dẫn: Bấm chuông căn 804 ở sảnh bảo vệ hoặc gọi con trai đón tại sảnh A nếu thang máy cần thẻ cư dân.',
    coordinates: 'Tọa độ: 10.7431° N, 106.7009° E',
    mapDirections: 'Chỉ đường Maps',
    arrived: 'Báo đã đến nơi',
    arrivedDone: 'Đã báo tới nơi',
    arrivedAlert: 'Đã gửi thông báo "Điều dưỡng viên đã có mặt tại sảnh Sunrise City" đến Anh Nguyễn Bình.'
  },
  shiftAction: {
    safetyTitle: 'Bảo đảm an toàn ca trực',
    safetyDesc:
      'Hệ thống ghi nhận GPS tự động khi ấn Bắt đầu để bảo vệ quyền lợi thù lao của bạn và lưu vào lịch sử trực chuyên môn.',
    startShiftBtn: 'BẮT ĐẦU VÀO CA',
    ongoingBtn: 'ĐANG TRONG CA TRỰC...',
    startConfirm: 'Xác nhận kích hoạt GPS và Bắt đầu ca trực #BK-8821 cho Cụ Nguyễn Văn A?',
    startSuccess: 'Ca trực #BK-8821 đã được ghi nhận bắt đầu. Hãy tiến hành đo sinh hiệu đầu ca!',
    statusConfirmed: 'Đã xác nhận phân công',
    shiftCodeLabel: 'Mã ca: #{{code}}',
    startNote: '* Chỉ bấm bắt đầu khi đã có mặt tại nhà bệnh nhân và bật định vị GPS.',
    reportIncidentBtn: 'Báo sự cố / Hỗ trợ đổi ca trực'
  },
  incidentModal: {
    title: 'Báo sự cố / Yêu cầu hỗ trợ khẩn cấp',
    desc: 'Vui lòng mô tả chi tiết sự cố hoặc lý do cần đổi ca trực. Điều phối viên sẽ hỗ trợ trong vòng 3 phút.',
    placeholder: 'Nhập lý do sự cố (sức khỏe, tắc đường khẩn cấp, bệnh nhân vắng mặt...)',
    submit: 'Gửi yêu cầu hỗ trợ',
    cancel: 'Hủy bỏ',
    success:
      'Yêu cầu hỗ trợ của bạn đã được chuyển tới Điều phối viên trưởng CareConnect. Hotline 1900 6868 sẽ gọi lại trong 3 phút.'
  }
} as const
