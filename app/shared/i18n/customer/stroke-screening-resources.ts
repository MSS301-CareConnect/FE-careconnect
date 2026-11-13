export const strokeScreeningVi = {
  documentTitle: 'Sàng lọc đột quỵ | CareConnect',
  title: 'Sàng lọc đặc điểm liên quan đến tiền sử đột quỵ',
  subtitle:
    'Trả lời 9 câu hỏi về sức khỏe của người thân để xem thông tin có tương đồng với nhóm từng ghi nhận đột quỵ hay không. Công cụ hỗ trợ sàng lọc, không thay thế bác sĩ.',
  breadcrumb: { label: 'Đường dẫn', home: 'Trang chủ', current: 'Sàng lọc đột quỵ' },
  emergency: {
    title: 'Có dấu hiệu đột quỵ cấp?',
    text: 'Méo miệng, yếu hoặc tê một bên tay chân, nói khó đột ngột: gọi cấp cứu ngay, đừng chờ kết quả sàng lọc.',
    call: 'Gọi 115'
  },
  recipient: {
    title: 'Người được sàng lọc',
    description: 'Chọn hồ sơ người thân để điền sẵn tuổi, giới tính và BMI, hoặc tự nhập thông tin.',
    label: 'Hồ sơ người thân',
    manual: 'Tự nhập thông tin',
    loading: 'Đang tải hồ sơ…',
    listError: 'Không tải được danh sách hồ sơ. Bạn vẫn có thể tự nhập thông tin.',
    fetchError: 'Không đọc được hồ sơ này. Vui lòng thử lại hoặc tự nhập thông tin.',
    empty: 'Chưa có hồ sơ người thân nào.',
    createLink: 'Tạo hồ sơ người thân',
    prefilled: 'Đã điền sẵn từ hồ sơ của {{name}}: {{fields}}.',
    prefilledNone: 'Hồ sơ của {{name}} chưa có đủ tuổi, giới tính hoặc chiều cao và cân nặng. Vui lòng nhập bên dưới.',
    fields: { age: 'tuổi', sex: 'giới tính', bmi: 'BMI' },
    conditions: 'Bệnh nền ghi trong hồ sơ',
    conditionsHint: 'Tham khảo để trả lời các câu hỏi tiền sử bên dưới.'
  },
  sections: {
    basic: { title: 'Thông tin cơ bản', description: 'Giới tính, tuổi và chỉ số khối cơ thể (BMI).' },
    metabolic: { title: 'Tiền sử chuyển hóa', description: 'Các bệnh đã được bác sĩ chẩn đoán.' },
    cardio: { title: 'Tiền sử tim mạch', description: 'Các bệnh tim mạch đã được bác sĩ chẩn đoán.' },
    habits: { title: 'Thói quen', description: 'Thói quen hiện tại của người được sàng lọc.' }
  },
  fields: {
    sex: { label: 'Giới tính', MALE: 'Nam', FEMALE: 'Nữ' },
    age: { label: 'Tuổi', hint: 'Từ 18 đến 120 tuổi.', unit: 'tuổi' },
    bmi: { label: 'Chỉ số BMI', hint: 'Từ 10 đến 80, ví dụ 22,5.' },
    hypertension: { label: 'Bị cao huyết áp?', hint: 'Huyết áp cao đã được chẩn đoán hoặc đang dùng thuốc hạ áp.' },
    highCholesterol: { label: 'Bị cholesterol (mỡ máu) cao?', hint: 'Đã được bác sĩ xác nhận qua xét nghiệm.' },
    diabetes: { label: 'Bị tiểu đường?', hint: 'Đái tháo đường type 1 hoặc type 2.' },
    myocardialInfarctionHistory: { label: 'Từng bị nhồi máu cơ tim?', hint: 'Còn gọi là cơn đau tim.' },
    anginaOrChdHistory: {
      label: 'Từng bị đau thắt ngực hoặc bệnh mạch vành?',
      hint: 'Bệnh tim mạch vành đã được chẩn đoán.'
    },
    currentSmoker: { label: 'Hiện đang hút thuốc?', hint: 'Thuốc lá điếu, thuốc lào hoặc thuốc lá điện tử.' }
  },
  answers: { yes: 'Có', no: 'Không' },
  bmiHelper: {
    toggle: 'Chưa biết BMI? Tính từ chiều cao và cân nặng',
    height: 'Chiều cao (cm)',
    weight: 'Cân nặng (kg)',
    result: 'BMI ước tính: {{value}}',
    apply: 'Dùng giá trị này',
    invalid: 'Nhập chiều cao từ 50 đến 250 cm và cân nặng từ 10 đến 300 kg.'
  },
  validation: {
    sexRequired: 'Vui lòng chọn giới tính.',
    answerRequired: 'Vui lòng chọn Có hoặc Không.',
    ageRequired: 'Vui lòng nhập tuổi.',
    ageWhole: 'Tuổi phải là số nguyên.',
    ageRange: 'Tuổi phải từ {{min}} đến {{max}}.',
    bmiRequired: 'Vui lòng nhập chỉ số BMI.',
    bmiNumber: 'BMI phải là một số, ví dụ 22,5.',
    bmiRange: 'BMI phải từ {{min}} đến {{max}}.'
  },
  progress: 'Đã trả lời {{answered}}/{{total}} mục',
  incomplete: 'Trả lời đủ {{total}} mục để thực hiện sàng lọc.',
  actions: {
    submit: 'Thực hiện sàng lọc',
    submitting: 'Đang phân tích…',
    reset: 'Xóa form',
    retry: 'Thử lại',
    edit: 'Sửa thông tin và đánh giá lại',
    openProfile: 'Mở hồ sơ sức khỏe của {{name}}'
  },
  errors: {
    unavailable: 'Dịch vụ sàng lọc tạm thời chưa sẵn sàng. Vui lòng thử lại sau ít phút.',
    network: 'Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại. Đây không phải kết quả sàng lọc.',
    session: 'Phiên đăng nhập vừa được làm mới. Vui lòng bấm Thử lại.',
    forbidden: 'Tài khoản của bạn không có quyền sử dụng chức năng sàng lọc.',
    invalid: 'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các mục đã nhập.',
    generic: 'Chưa thể hoàn tất sàng lọc. Vui lòng thử lại.'
  },
  idle: {
    eyebrow: 'Cách hoạt động',
    title: 'Kết quả sẽ hiển thị tại đây',
    steps: {
      answer: 'Trả lời 9 câu hỏi về người thân, hoặc chọn hồ sơ để điền sẵn.',
      compare: 'Mô hình so sánh thông tin với dữ liệu sức khỏe đã được huấn luyện.',
      read: 'Đọc khuyến nghị và trao đổi với bác sĩ khi cần.'
    },
    note: 'Thông tin chỉ dùng cho lần sàng lọc này và không được lưu vào hồ sơ.'
  },
  loading: 'Đang phân tích thông tin…',
  result: {
    eyebrow: 'Kết quả sàng lọc',
    announce: 'Đã có kết quả sàng lọc.',
    NEEDS_FURTHER_ASSESSMENT: {
      title: 'Nên được đánh giá thêm',
      lead: 'Thông tin được cung cấp có nhiều đặc điểm tương đồng với nhóm người từng khai báo có tiền sử đột quỵ trong dữ liệu nghiên cứu. Kết quả này không phải chẩn đoán và không thể hiện xác suất mắc bệnh trong tương lai.'
    },
    LOWER_SCREENING_PATTERN: {
      title: 'Mẫu sàng lọc hiện tại ở mức thấp hơn',
      lead: 'Thông tin được cung cấp có ít đặc điểm tương đồng với nhóm người từng khai báo có tiền sử đột quỵ trong dữ liệu nghiên cứu. Kết quả này không phải chẩn đoán và không thể hiện xác suất mắc bệnh trong tương lai.'
    },
    score: {
      label: 'Điểm sàng lọc của mô hình',
      caption: 'Điểm này thể hiện mức độ phù hợp với mẫu dữ liệu của mô hình, không phải xác suất bị đột quỵ.',
      threshold:
        'Ngưỡng {{threshold}}: điểm vượt ngưỡng cho kết quả “Nên được đánh giá thêm”, không vượt ngưỡng cho kết quả “Mẫu sàng lọc hiện tại ở mức thấp hơn”.',
      thresholdMark: 'Ngưỡng {{threshold}}'
    },
    recommendation: 'Khuyến nghị',
    nextSteps: 'Bước tiếp theo',
    steps: {
      NEEDS_FURTHER_ASSESSMENT: {
        first: 'Đặt lịch khám với bác sĩ nội khoa hoặc thần kinh để được đánh giá đầy đủ.',
        second: 'Theo dõi huyết áp, đường huyết và mỡ máu theo hướng dẫn của bác sĩ.',
        third: 'Gọi 115 ngay khi có dấu hiệu méo miệng, yếu tay chân hoặc nói khó.'
      },
      LOWER_SCREENING_PATTERN: {
        first: 'Duy trì khám sức khỏe định kỳ ít nhất mỗi năm một lần.',
        second: 'Giữ cân nặng hợp lý, vận động đều đặn và hạn chế thuốc lá.',
        third: 'Sàng lọc lại khi tình trạng sức khỏe thay đổi.'
      }
    },
    basedOn: 'Dựa trên thông tin',
    summary: {
      age: '{{age}} tuổi',
      bmi: 'BMI {{bmi}}',
      factors: '{{yes}}/{{total}} yếu tố tiền sử',
      smoker: 'Đang hút thuốc'
    },
    stale: 'Thông tin đã thay đổi sau lần sàng lọc này. Bấm "Thực hiện sàng lọc" để cập nhật kết quả.',
    disclaimer: 'Lưu ý quan trọng'
  }
} as const

export const strokeScreeningEn = {
  documentTitle: 'Stroke screening | CareConnect',
  title: 'Screening for traits linked to a history of stroke',
  subtitle:
    'Answer 9 questions about your family member’s health to see whether it resembles the group with a recorded stroke. A screening aid, not a replacement for a doctor.',
  breadcrumb: { label: 'Breadcrumb', home: 'Home', current: 'Stroke screening' },
  emergency: {
    title: 'Signs of a stroke right now?',
    text: 'A drooping face, weakness or numbness on one side, sudden trouble speaking: call an ambulance now, do not wait for a screening result.',
    call: 'Call 115'
  },
  recipient: {
    title: 'Person being screened',
    description: 'Pick a family profile to prefill age, sex and BMI, or enter the details yourself.',
    label: 'Family profile',
    manual: 'Enter details myself',
    loading: 'Loading profile…',
    listError: 'Family profiles could not be loaded. You can still enter the details yourself.',
    fetchError: 'This profile could not be read. Try again or enter the details yourself.',
    empty: 'No family profiles yet.',
    createLink: 'Create a family profile',
    prefilled: 'Prefilled from {{name}}’s profile: {{fields}}.',
    prefilledNone: '{{name}}’s profile has no age, sex or height and weight yet. Please fill them in below.',
    fields: { age: 'age', sex: 'sex', bmi: 'BMI' },
    conditions: 'Chronic conditions in the profile',
    conditionsHint: 'Use them to answer the history questions below.'
  },
  sections: {
    basic: { title: 'Basic information', description: 'Sex, age and body mass index (BMI).' },
    metabolic: { title: 'Metabolic history', description: 'Conditions diagnosed by a doctor.' },
    cardio: { title: 'Heart history', description: 'Heart conditions diagnosed by a doctor.' },
    habits: { title: 'Habits', description: 'Current habits of the person being screened.' }
  },
  fields: {
    sex: { label: 'Sex', MALE: 'Male', FEMALE: 'Female' },
    age: { label: 'Age', hint: 'From 18 to 120 years.', unit: 'years' },
    bmi: { label: 'BMI', hint: 'From 10 to 80, e.g. 22.5.' },
    hypertension: {
      label: 'High blood pressure?',
      hint: 'Diagnosed high blood pressure or taking blood pressure medicine.'
    },
    highCholesterol: { label: 'High cholesterol?', hint: 'Confirmed by a doctor through a blood test.' },
    diabetes: { label: 'Diabetes?', hint: 'Type 1 or type 2 diabetes.' },
    myocardialInfarctionHistory: { label: 'Ever had a heart attack?', hint: 'Also called myocardial infarction.' },
    anginaOrChdHistory: {
      label: 'Ever had angina or coronary heart disease?',
      hint: 'Coronary heart disease diagnosed by a doctor.'
    },
    currentSmoker: { label: 'Currently smokes?', hint: 'Cigarettes, pipe tobacco or e-cigarettes.' }
  },
  answers: { yes: 'Yes', no: 'No' },
  bmiHelper: {
    toggle: 'Not sure about BMI? Work it out from height and weight',
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    result: 'Estimated BMI: {{value}}',
    apply: 'Use this value',
    invalid: 'Enter a height of 50–250 cm and a weight of 10–300 kg.'
  },
  validation: {
    sexRequired: 'Please choose a sex.',
    answerRequired: 'Please choose Yes or No.',
    ageRequired: 'Please enter the age.',
    ageWhole: 'Age must be a whole number.',
    ageRange: 'Age must be between {{min}} and {{max}}.',
    bmiRequired: 'Please enter the BMI.',
    bmiNumber: 'BMI must be a number, e.g. 22.5.',
    bmiRange: 'BMI must be between {{min}} and {{max}}.'
  },
  progress: '{{answered}}/{{total}} answered',
  incomplete: 'Answer all {{total}} items to run the screening.',
  actions: {
    submit: 'Run screening',
    submitting: 'Analysing…',
    reset: 'Clear form',
    retry: 'Try again',
    edit: 'Edit details and screen again',
    openProfile: 'Open {{name}}’s health profile'
  },
  errors: {
    unavailable: 'The screening service is not available right now. Please try again in a few minutes.',
    network: 'Could not reach the server. Check your connection and try again. This is not a screening result.',
    session: 'Your session was just refreshed. Please press Try again.',
    forbidden: 'Your account is not allowed to use the screening tool.',
    invalid: 'Some details are not valid. Please check what you entered.',
    generic: 'The screening could not be completed. Please try again.'
  },
  idle: {
    eyebrow: 'How it works',
    title: 'Your result will appear here',
    steps: {
      answer: 'Answer 9 questions about your family member, or pick a profile to prefill.',
      compare: 'The model compares the answers with the health data it was trained on.',
      read: 'Read the recommendation and talk to a doctor when needed.'
    },
    note: 'The answers are used for this screening only and are not saved to the profile.'
  },
  loading: 'Analysing the details…',
  result: {
    eyebrow: 'Screening result',
    announce: 'The screening result is ready.',
    NEEDS_FURTHER_ASSESSMENT: {
      title: 'Further assessment advised',
      lead: 'The details provided share many traits with people who reported a history of stroke in the research data. This is not a diagnosis and does not show the probability of having a stroke in the future.'
    },
    LOWER_SCREENING_PATTERN: {
      title: 'Current screening pattern is lower',
      lead: 'The details provided share few traits with people who reported a history of stroke in the research data. This is not a diagnosis and does not show the probability of having a stroke in the future.'
    },
    score: {
      label: 'Model screening score',
      caption: 'This score shows how closely the details fit the model’s data pattern, not the probability of having a stroke.',
      threshold:
        'Threshold {{threshold}}: a score above it gives “Further assessment advised”; a score at or below it gives “Current screening pattern is lower”.',
      thresholdMark: 'Threshold {{threshold}}'
    },
    recommendation: 'Recommendation',
    nextSteps: 'Next steps',
    steps: {
      NEEDS_FURTHER_ASSESSMENT: {
        first: 'Book a visit with an internist or neurologist for a full assessment.',
        second: 'Monitor blood pressure, blood sugar and cholesterol as your doctor advises.',
        third: 'Call 115 at once for a drooping face, weak limbs or trouble speaking.'
      },
      LOWER_SCREENING_PATTERN: {
        first: 'Keep a health check-up at least once a year.',
        second: 'Keep a healthy weight, stay active and limit tobacco.',
        third: 'Screen again when the person’s health changes.'
      }
    },
    basedOn: 'Based on',
    summary: {
      age: '{{age}} years',
      bmi: 'BMI {{bmi}}',
      factors: '{{yes}}/{{total}} history factors',
      smoker: 'Smokes'
    },
    stale: 'The details changed after this screening. Press "Run screening" to update the result.',
    disclaimer: 'Important'
  }
} as const
