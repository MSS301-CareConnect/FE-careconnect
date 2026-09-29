export const patientCreateEn = {
  documentTitle: 'Add New Care Recipient Profile | CareConnect',
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
    saveDraft: 'Save draft',
    saveProfile: 'Save patient profile'
  },
  draftNotice: {
    text: 'Draft has been automatically saved to your account at {{time}}.',
    close: 'Close notification'
  },
  sidebar: {
    avatarCard: {
      title: 'Patient Portrait Photo',
      subtitle: 'Caregiver recognition',
      uploadLabel: 'Upload portrait photo',
      uploadHint: 'Supports JPG, PNG under 5MB.',
      uploadNote: 'A clear face photo helps caregivers recognize the patient accurately upon arrival.',
      changePhoto: 'Change photo',
      uploadBtn: 'Upload photo'
    },
    stepper: {
      title: 'Form Progress',
      status: '{{completed}}/{{total}} Completed',
      step1Title: '1. Identity & Demographics',
      step1Subtitle: 'Name, age, National ID, blood type, BMI',
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
      desc: 'Take a clear photo of the recent hospital prescription to upload in step 3. The system will assist in digitizing medicine names and dosages.'
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
    genderOptions: {
      male: 'Male',
      female: 'Female',
      other: 'Other'
    },
    idNumberLabel: 'National ID / Citizen Identification',
    idNumberPlaceholder: 'Enter 12-digit chip ID',
    syncVNeID: 'Sync VNeID',
    bhytNumberLabel: 'Health Insurance Number (BHYT)',
    bhytNumberPlaceholder: 'Enter 15-character BHYT code',
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
    doctorNameLabel: 'Attending Physician / Hospital',
    doctorNamePlaceholder: 'E.g., Dr. Tran Huu Duc - UMC Hospital',
    doctorContactLabel: 'Doctor / Department Phone (if available)',
    doctorContactPlaceholder: '090x xxx xxx'
  },
  section3: {
    title: 'Current Prescriptions & Schedule',
    subtitle: 'List of medications caregivers should remind or administer',
    addMedicineBtn: '+ Add new medication',
    medicineNamePlaceholder: 'Brand or generic name...',
    dosageLabel: 'Dosage',
    dosagePlaceholder: 'E.g., 1 tablet / dose...',
    timeLabel: 'Administration time',
    timePlaceholder: 'Morning / Afternoon / Evening...',
    instructionsLabel: 'Caregiver notes',
    instructionsPlaceholder: 'After meals, spaced 2h apart...',
    deleteMedicine: 'Delete medication',
    uploadZoneTitle: 'Upload Hospital Prescription / Medical Report',
    uploadZoneDesc:
      'Drag & drop image files or click to browse (Supports JPG, PNG, PDF up to 10MB). CareConnect clinical pharmacists will verify for safety.',
    chooseFileBtn: 'Choose file from device'
  },
  bottomBar: {
    securityNotice: 'Data protected with multi-layer encryption per Vietnam healthcare standards',
    cancel: 'Cancel',
    saveDraft: 'Save draft',
    complete: 'Complete Patient Profile'
  },
  modal: {
    title: 'Profile Created Successfully!',
    desc: 'Health profile for {{name}} has been securely created and is ready for booking home care sessions now.',
    findCaregiver: 'Find caregivers for this patient',
    backToList: 'Back to profiles list'
  }
} as const

export const patientCreateVi = {
  documentTitle: 'Thêm hồ sơ người bệnh mới | CareConnect',
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
    saveDraft: 'Lưu nháp',
    saveProfile: 'Lưu hồ sơ người bệnh'
  },
  draftNotice: {
    text: 'Bản nháp đã được tự động lưu vào tài khoản của bạn lúc {{time}}.',
    close: 'Đóng thông báo'
  },
  sidebar: {
    avatarCard: {
      title: 'Ảnh chân dung người bệnh',
      subtitle: 'Nhận diện điều dưỡng viên',
      uploadLabel: 'Tải ảnh chụp chân dung',
      uploadHint: 'Hỗ trợ định dạng JPG, PNG dung lượng dưới 5MB.',
      uploadNote:
        'Ảnh chụp rõ mặt, không đeo khẩu trang giúp điều dưỡng viên nhận diện chính xác và thân thiện khi tới chăm sóc.',
      changePhoto: 'Đổi ảnh',
      uploadBtn: 'Tải ảnh lên'
    },
    stepper: {
      title: 'Tiến trình hoàn thiện',
      status: '{{completed}}/{{total}} Hoàn thành',
      step1Title: '1. Định danh & Nhân khẩu học',
      step1Subtitle: 'Tên, tuổi, CCCD, nhóm máu, BMI',
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
      desc: 'Hãy chụp lại đơn thuốc gần nhất tại bệnh viện để tải lên ở mục 3. Hệ thống sẽ hỗ trợ số hóa tự động tên thuốc và liều dùng.'
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
    genderOptions: {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác'
    },
    idNumberLabel: 'Số CCCD / Mã định danh',
    idNumberPlaceholder: 'Nhập 12 số CCCD gắn chip',
    syncVNeID: 'Đồng bộ VNeID',
    bhytNumberLabel: 'Số thẻ Bảo hiểm y tế (BHYT)',
    bhytNumberPlaceholder: 'Nhập mã 15 ký tự thẻ BHYT',
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
    doctorNameLabel: 'Bác sĩ / Bệnh viện theo dõi định kỳ',
    doctorNamePlaceholder: 'Ví dụ: BS.CK2 Trần Hữu Đức - BV ĐH Y Dược',
    doctorContactLabel: 'Số điện thoại liên hệ Bác sĩ / Khoa (nếu có)',
    doctorContactPlaceholder: '090x xxx xxx'
  },
  section3: {
    title: 'Đơn thuốc đang sử dụng & Lịch uống',
    subtitle: 'Lập danh mục thuốc điều dưỡng viên cần nhắc nhở hoặc hỗ trợ cho uống',
    addMedicineBtn: '+ Thêm thuốc mới',
    medicineNamePlaceholder: 'Tên biệt dược / hoạt chất...',
    dosageLabel: 'Liều lượng',
    dosagePlaceholder: 'Ví dụ: 1 viên / lần...',
    timeLabel: 'Thời điểm uống',
    timePlaceholder: 'Sáng / Trưa / Tối...',
    instructionsLabel: 'Lưu ý điều dưỡng',
    instructionsPlaceholder: 'Sau ăn, cách 2h...',
    deleteMedicine: 'Xóa thuốc',
    uploadZoneTitle: 'Tải lên ảnh chụp Đơn thuốc / Bệnh án bệnh viện',
    uploadZoneDesc:
      'Kéo thả tập tin ảnh hoặc bấm để duyệt từ thiết bị (Hỗ trợ JPG, PNG, PDF tối đa 10MB). Đội ngũ dược sĩ lâm sàng của CareConnect sẽ đối chiếu và rà soát an toàn.',
    chooseFileBtn: 'Chọn tệp từ máy tính'
  },
  bottomBar: {
    securityNotice: 'Dữ liệu được bảo vệ đa tầng theo tiêu chuẩn Y tế Việt Nam',
    cancel: 'Hủy bỏ',
    saveDraft: 'Lưu bản nháp',
    complete: 'Hoàn tất tạo hồ sơ người bệnh'
  },
  modal: {
    title: 'Tạo hồ sơ thành công!',
    desc: 'Hồ sơ người bệnh {{name}} đã được khởi tạo an toàn và sẵn sàng để bạn đặt lịch chăm sóc tại nhà ngay bây giờ.',
    findCaregiver: 'Tìm điều dưỡng cho người bệnh này',
    backToList: 'Quay về danh sách hồ sơ'
  }
} as const
