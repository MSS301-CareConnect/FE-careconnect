export const patientCreateEn = {
  documentTitle: 'Add New Care Recipient Profile | CareConnect',
  submitting: 'Saving profile...',
  submitInvalid: 'Some information is not valid. Please review the fields and try again.',
  submitFailed: 'Unable to create the profile right now. Please try again.',
  breadcrumb: {
    home: 'Home',
    myAccount: 'My Account',
    patientProfiles: 'Family member health profiles',
    current: 'Add new patient profile',
    backToList: 'Back to profiles list'
  },
  header: {
    badge: 'CareConnect Electronic Medical Record (EMR)',
    title: 'Create New Care Recipient Health Profile',
    subtitle:
      'Please provide accurate medical history, underlying conditions, and daily habits so nurses and caregivers can establish the safest care plan.',
    cancel: 'Cancel',
    saveProfile: 'Save patient profile'
  },
  validation: {
    fullNameRequired: 'Please enter the patient full name.',
    fullNameTooLong: 'The full name must be at most 255 characters.',
    relationshipRequired: 'Please choose how the patient is related to you.',
    birthDateRequired: 'Please enter the date of birth.',
    birthDateFuture: 'The date of birth cannot be in the future.',
    genderRequired: 'Please choose a gender.',
    heightRange: 'Enter a height from 1 to 300 cm.',
    weightRange: 'Enter a weight from 1 to 500 kg.',
    textTooLong: 'This content exceeds 5,000 characters.',
    medicationNameRequired: 'Enter the medication name, or delete this row.',
    medicationStartDateRequired: 'Choose the start date.',
    emergencyNameRequired: 'Enter the contact name, or clear the other contact fields.',
    emergencyRelationshipRequired: 'Enter how this person is related to the patient.',
    emergencyPhoneRequired: 'Enter the contact phone number.',
    emergencyPhoneInvalid: 'The phone number must have 10 or 11 digits.'
  },
  sidebar: {
    stepper: {
      title: 'Form Progress',
      status: '{{completed}}/{{total}} Completed',
      step1Title: '1. Identity & Demographics',
      step1Subtitle: 'Name, date of birth, blood type, BMI',
      step2Title: '2. Physical & Pathologies',
      step2Subtitle: 'Chronic illnesses, allergy history',
      step3Title: '3. Prescriptions & Schedule',
      step3Subtitle: 'Dosages and critical instructions'
    },
    security: {
      badge: 'Medical Grade Security',
      desc: 'Health records encrypted with AES-256 complying with HIPAA and personal data protection regulations.',
      subdesc: 'Only caregivers approved for the active shift are granted monitoring access.'
    },
    hotline: {
      label: '24/7 Nursing Hotline',
      phone: '1900 6868',
      call: 'Call hotline'
    },
    tips: {
      title: 'Quick tips',
      desc: 'Copy medication names, dosages, and start dates from the most recent prescription so caregivers can remind doses accurately.'
    }
  },
  section1: {
    title: 'Identity & Basic Information',
    subtitle: 'Demographics and initial biometric metrics',
    requiredNote: '* Required fields',
    fullNameLabel: 'Patient full name',
    fullNamePlaceholder: 'E.g., NGUYEN VAN AN',
    fullNameHint: 'Enter exactly as shown on National ID or Health Insurance card',
    relationshipLabel: 'Relationship to you',
    relationshipPlaceholder: 'Choose a relationship',
    relationshipOptions: {
      father: 'Father',
      mother: 'Mother',
      spouse: 'Spouse',
      child: 'Child',
      grandparent: 'Grandparent',
      sibling: 'Sibling',
      other: 'Other relative'
    },
    birthDateLabel: 'Date of birth',
    genderLabel: 'Gender',
    heightLabel: 'Height (cm)',
    weightLabel: 'Weight (kg)',
    bmiLabel: 'BMI Score:',
    bmiStatus: {
      underweight: 'Underweight',
      normal: 'Normal',
      overweight: 'Overweight',
      obese: 'Obese'
    },
    bloodTypeLabel: 'Blood type (ABO & Rh system)',
    bloodTypeUnknown: 'Unknown'
  },
  section2: {
    title: 'Chronic Pathologies & Medical Background',
    subtitle: 'Crucial history providing early warning for shock or drug interactions',
    chronicLabel: 'Chronic conditions under treatment',
    multiSelectHint: 'Select all that apply',
    chronicOptions: {
      hypertension: 'Primary hypertension',
      diabetes: 'Type 2 diabetes',
      strokeHistory: 'History of stroke / cerebrovascular accident',
      heartDisease: 'Coronary artery / cardiovascular disease',
      dementia: 'Dementia / Alzheimer / Parkinson',
      osteoarthritis: 'Knee osteoarthritis / spinal degeneration',
      kidneyDisease: 'Chronic kidney disease',
      copd: 'Chronic obstructive pulmonary disease (COPD)'
    },
    otherChronicPlaceholder: 'Add other conditions (if any, comma-separated)...',
    allergiesTitle: 'DRUG & FOOD ALLERGY HISTORY',
    allergiesBadge: 'Crucial',
    allergiesDesc: 'Record any anaphylaxis, rashes, urticaria, or bronchospasm caused by antibiotics, NSAIDs, or food.',
    allergyInputPlaceholder: 'Enter drug or food allergen name...',
    addAllergyBtn: '+ Add allergy',
    removeAllergy: 'Remove allergy',
    surgeryHistoryLabel: 'Surgical & Intervention History',
    surgeryHistoryPlaceholder:
      'E.g., Right total knee replacement (2021, Cho Ray Hospital); Laparoscopic cholecystectomy (2018)...',
    emergencyTitle: 'Emergency contact',
    emergencyDesc:
      'The caregiver calls this person if something urgent happens during care. Optional; you can add more contacts later.',
    emergencyNameLabel: 'Contact full name',
    emergencyNamePlaceholder: 'E.g., Nguyen Mai Anh',
    emergencyRelationshipLabel: 'Relationship to the patient',
    emergencyRelationshipPlaceholder: 'E.g., Daughter',
    emergencyPhoneLabel: 'Phone number',
    emergencyPhonePlaceholder: '0901234567'
  },
  section3: {
    title: 'Current Prescriptions & Schedule',
    subtitle: 'List of medications caregivers should remind or administer',
    addMedicineBtn: '+ Add new medication',
    empty: 'No medications added. Use "+ Add new medication" if the patient is currently taking any.',
    medicineNameLabel: 'Medication name',
    medicineNamePlaceholder: 'Brand or generic name...',
    dosageLabel: 'Dosage',
    dosagePlaceholder: 'E.g., 1 tablet / dose...',
    timeLabel: 'Administration time',
    timePlaceholder: 'Morning / Afternoon / Evening...',
    startDateLabel: 'Start date',
    instructionsLabel: 'Caregiver notes',
    instructionsPlaceholder: 'After meals, spaced 2h apart...',
    deleteMedicine: 'Delete medication'
  },
  bottomBar: {
    securityNotice: 'Data protected with multi-layer encryption per Vietnam healthcare standards',
    cancel: 'Cancel',
    complete: 'Complete Patient Profile'
  },
  modal: {
    title: 'Profile Created Successfully!',
    desc: 'Health profile for {{name}} has been securely created and is ready for booking home care sessions now.',
    viewProfile: 'View the new profile',
    findCaregiver: 'Find caregivers for this patient',
    backToList: 'Back to profiles list'
  }
} as const

export const patientCreateVi = {
  documentTitle: 'Thêm hồ sơ người bệnh mới | CareConnect',
  submitting: 'Đang lưu hồ sơ...',
  submitInvalid: 'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các trường và thử lại.',
  submitFailed: 'Không thể tạo hồ sơ lúc này. Vui lòng thử lại.',
  breadcrumb: {
    home: 'Trang chủ',
    myAccount: 'Tài khoản của tôi',
    patientProfiles: 'Hồ sơ người thân cần chăm sóc',
    current: 'Thêm hồ sơ người bệnh mới',
    backToList: 'Quay lại danh sách hồ sơ'
  },
  header: {
    badge: 'Hồ sơ y tế điện tử CareConnect (EMR)',
    title: 'Tạo mới Hồ sơ Người bệnh cần chăm sóc',
    subtitle:
      'Vui lòng cung cấp đầy đủ và chính xác thông tin y tế, bệnh nền và thói quen sinh hoạt để nhân viên y tế / điều dưỡng xây dựng phác đồ chăm sóc phù hợp và an toàn nhất.',
    cancel: 'Hủy bỏ',
    saveProfile: 'Lưu hồ sơ người bệnh'
  },
  validation: {
    fullNameRequired: 'Vui lòng nhập họ và tên người bệnh.',
    fullNameTooLong: 'Họ tên tối đa 255 ký tự.',
    relationshipRequired: 'Vui lòng chọn mối quan hệ của người bệnh với bạn.',
    birthDateRequired: 'Vui lòng nhập ngày sinh.',
    birthDateFuture: 'Ngày sinh không được ở tương lai.',
    genderRequired: 'Vui lòng chọn giới tính.',
    heightRange: 'Nhập chiều cao từ 1 đến 300 cm.',
    weightRange: 'Nhập cân nặng từ 1 đến 500 kg.',
    textTooLong: 'Nội dung vượt quá 5.000 ký tự.',
    medicationNameRequired: 'Nhập tên thuốc hoặc xóa dòng này.',
    medicationStartDateRequired: 'Chọn ngày bắt đầu dùng.',
    emergencyNameRequired: 'Nhập họ tên người liên hệ, hoặc xóa các ô liên hệ còn lại.',
    emergencyRelationshipRequired: 'Nhập quan hệ của người này với người bệnh.',
    emergencyPhoneRequired: 'Nhập số điện thoại người liên hệ.',
    emergencyPhoneInvalid: 'Số điện thoại phải có 10 hoặc 11 chữ số.'
  },
  sidebar: {
    stepper: {
      title: 'Tiến trình hoàn thiện',
      status: '{{completed}}/{{total}} Hoàn thành',
      step1Title: '1. Định danh & Nhân khẩu học',
      step1Subtitle: 'Tên, ngày sinh, nhóm máu, BMI',
      step2Title: '2. Thể chất & Bệnh nền',
      step2Subtitle: 'Bệnh mạn tính, tiền sử dị ứng',
      step3Title: '3. Đơn thuốc & Lịch uống',
      step3Subtitle: 'Liều dùng và lưu ý quan trọng'
    },
    security: {
      badge: 'Bảo mật chuẩn y tế',
      desc: 'Dữ liệu y tế được mã hóa AES-256 theo chuẩn HIPAA & Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.',
      subdesc: 'Chỉ điều dưỡng viên được phê duyệt trong ca trực mới được cấp quyền truy cập theo dõi.'
    },
    hotline: {
      label: 'Tổng đài điều dưỡng 24/7',
      phone: '1900 6868',
      call: 'Gọi tổng đài'
    },
    tips: {
      title: 'Mẹo nhỏ khi điền hồ sơ',
      desc: 'Hãy ghi đúng tên thuốc, liều dùng và ngày bắt đầu theo đơn thuốc gần nhất để điều dưỡng nhắc thuốc chính xác.'
    }
  },
  section1: {
    title: 'Thông tin định danh & Cơ bản',
    subtitle: 'Thông tin nhân khẩu học và các chỉ số sinh trắc ban đầu',
    requiredNote: '* Trường bắt buộc',
    fullNameLabel: 'Họ và tên người bệnh',
    fullNamePlaceholder: 'Ví dụ: NGUYỄN VĂN AN',
    fullNameHint: 'Ghi đúng như trên thẻ Căn cước công dân hoặc Thẻ BHYT',
    relationshipLabel: 'Mối quan hệ với bạn',
    relationshipPlaceholder: 'Chọn mối quan hệ',
    relationshipOptions: {
      father: 'Bố ruột (Cha)',
      mother: 'Mẹ ruột',
      spouse: 'Vợ / Chồng',
      child: 'Con cái',
      grandparent: 'Ông / Bà',
      sibling: 'Anh / Chị / Em',
      other: 'Người thân khác'
    },
    birthDateLabel: 'Ngày sinh',
    genderLabel: 'Giới tính',
    heightLabel: 'Chiều cao (cm)',
    weightLabel: 'Cân nặng (kg)',
    bmiLabel: 'Chỉ số BMI:',
    bmiStatus: {
      underweight: 'Thiếu cân',
      normal: 'Bình thường',
      overweight: 'Tiền béo phì',
      obese: 'Béo phì'
    },
    bloodTypeLabel: 'Nhóm máu (Hệ ABO & Rh)',
    bloodTypeUnknown: 'Chưa rõ'
  },
  section2: {
    title: 'Tình trạng Bệnh nền & Tiền sử Y khoa',
    subtitle: 'Hồ sơ bệnh án quan trọng giúp cảnh báo sớm nguy cơ sốc hoặc tương tác thuốc',
    chronicLabel: 'Bệnh lý nền đang điều trị',
    multiSelectHint: 'Có thể chọn nhiều mục',
    chronicOptions: {
      hypertension: 'Tăng huyết áp vô căn',
      diabetes: 'Đái tháo đường Type 2 (Tiểu đường)',
      strokeHistory: 'Tiền sử Tai biến / Đột quỵ não',
      heartDisease: 'Bệnh mạch vành / Tim mạch',
      dementia: 'Sa sút trí tuệ / Alzheimer / Parkinson',
      osteoarthritis: 'Thoái hóa khớp gối / Cột sống',
      kidneyDisease: 'Bệnh thận mạn tính',
      copd: 'Bệnh phổi tắc nghẽn mạn tính (COPD)'
    },
    otherChronicPlaceholder: 'Thêm bệnh nền khác (nếu có, cách nhau bằng dấu phẩy)...',
    allergiesTitle: 'Tiền sử dị ứng THUỐC & THỰC PHẨM',
    allergiesBadge: 'Tối quan trọng',
    allergiesDesc:
      'Ghi nhận các phản ứng phản vệ, ngứa, mề đay, co thắt phế quản khi dùng thuốc kháng sinh, giảm đau hoặc thức ăn.',
    allergyInputPlaceholder: 'Nhập tên thuốc hoặc thực phẩm gây dị ứng...',
    addAllergyBtn: '+ Thêm dị ứng',
    removeAllergy: 'Xóa dị ứng',
    surgeryHistoryLabel: 'Tiền sử phẫu thuật & Can thiệp ngoại khoa',
    surgeryHistoryPlaceholder:
      'Ví dụ: Thay khớp gối nhân tạo chân phải (Năm 2021, Bệnh viện Chợ Rẫy); Mổ sỏi túi mật nội soi (Năm 2018)...',
    emergencyTitle: 'Người liên hệ khẩn cấp',
    emergencyDesc:
      'Điều dưỡng sẽ gọi người này khi có tình huống khẩn cấp trong ca chăm sóc. Không bắt buộc, có thể bổ sung thêm sau.',
    emergencyNameLabel: 'Họ tên người liên hệ',
    emergencyNamePlaceholder: 'Ví dụ: Nguyễn Mai Anh',
    emergencyRelationshipLabel: 'Quan hệ với người bệnh',
    emergencyRelationshipPlaceholder: 'Ví dụ: Con gái',
    emergencyPhoneLabel: 'Số điện thoại',
    emergencyPhonePlaceholder: '0901234567'
  },
  section3: {
    title: 'Đơn thuốc đang sử dụng & Lịch uống',
    subtitle: 'Lập danh mục thuốc điều dưỡng viên cần nhắc nhở hoặc hỗ trợ cho uống',
    addMedicineBtn: '+ Thêm thuốc mới',
    empty: 'Chưa có thuốc nào. Bấm "+ Thêm thuốc mới" nếu người bệnh đang dùng thuốc.',
    medicineNameLabel: 'Tên thuốc',
    medicineNamePlaceholder: 'Tên biệt dược / hoạt chất...',
    dosageLabel: 'Liều lượng',
    dosagePlaceholder: 'Ví dụ: 1 viên / lần...',
    timeLabel: 'Thời điểm uống',
    timePlaceholder: 'Sáng / Trưa / Tối...',
    startDateLabel: 'Ngày bắt đầu dùng',
    instructionsLabel: 'Lưu ý điều dưỡng',
    instructionsPlaceholder: 'Sau ăn, cách 2h...',
    deleteMedicine: 'Xóa thuốc'
  },
  bottomBar: {
    securityNotice: 'Dữ liệu được bảo vệ đa tầng theo tiêu chuẩn Y tế Việt Nam',
    cancel: 'Hủy bỏ',
    complete: 'Hoàn tất tạo hồ sơ người bệnh'
  },
  modal: {
    title: 'Tạo hồ sơ thành công!',
    desc: 'Hồ sơ người bệnh {{name}} đã được khởi tạo an toàn và sẵn sàng để bạn đặt lịch chăm sóc tại nhà ngay bây giờ.',
    viewProfile: 'Xem hồ sơ vừa tạo',
    findCaregiver: 'Tìm điều dưỡng cho người bệnh này',
    backToList: 'Quay về danh sách hồ sơ'
  }
} as const
