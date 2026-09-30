export type ManagerBookingStatus = 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled'
export type ManagerBookingService = 'elderly' | 'stroke' | 'dressing' | 'motherBaby' | 'night' | 'postop'
export type ManagerBookingArea = 'q7' | 'q1' | 'bt' | 'cg' | 'hk'

export interface ManagerBookingPreview {
  id: string
  createdAt: string
  customer: string
  customerCode: string
  phone: string
  patient: string
  patientAge: number
  patientGender: 'male' | 'female'
  condition: string
  caregiver: string | null
  caregiverId: string | null
  service: ManagerBookingService
  serviceName: string
  area: ManagerBookingArea
  date: string
  start: string | null
  end: string | null
  status: ManagerBookingStatus
  urgent: boolean
  package: 'hourly' | 'night' | 'weekly'
  note: string | null
}

// Deterministic preview snapshot, anchored to 2026-09-20. No backend state is inferred.
export const managerBookingReferenceDate = '2026-09-20'
export const managerBookingPreviews: readonly ManagerBookingPreview[] = [
  {
    id: 'BK-8821',
    createdAt: '2026-09-20T18:30:00+07:00',
    customer: 'Chị Nguyễn Mai Anh',
    customerCode: 'CUST-1024',
    phone: '0912345678',
    patient: 'Cụ Nguyễn Văn Hùng',
    patientAge: 78,
    patientGender: 'male',
    condition: 'Phục hồi sau tai biến & Huyết áp',
    caregiver: 'ĐD. Trần Thùy Dương',
    caregiverId: 'CG-1024',
    service: 'night',
    serviceName: 'Chăm sóc người cao tuổi toàn diện (12h)',
    area: 'q7',
    date: '2026-09-20',
    start: '19:00',
    end: '07:00',
    status: 'inProgress',
    urgent: false,
    package: 'night',
    note: null
  },
  {
    id: 'BK-8822',
    createdAt: '2026-09-20T18:20:00+07:00',
    customer: 'Anh Trần Quang Huy',
    customerCode: 'CUST-1045',
    phone: '0988776655',
    patient: 'Bé Gia Khang',
    patientAge: 0,
    patientGender: 'male',
    condition: 'Chăm sóc cuống rốn & Tắm bé sơ sinh',
    caregiver: null,
    caregiverId: null,
    service: 'motherBaby',
    serviceName: 'Chăm sóc Mẹ & Bé sơ sinh chuyên sâu',
    area: 'q1',
    date: '2026-09-21',
    start: '08:30',
    end: '11:30',
    status: 'pending',
    urgent: true,
    package: 'hourly',
    note: null
  },
  {
    id: 'BK-8823',
    createdAt: '2026-09-20T16:30:00+07:00',
    customer: 'Bác Vũ Đình Trọng',
    customerCode: 'CUST-1078',
    phone: '0903112233',
    patient: 'Cụ Lê Thị Mai',
    patientAge: 74,
    patientGender: 'female',
    condition: 'Đái tháo đường & Tiêm truyền y lệnh',
    caregiver: 'KTV. Hoàng Minh Tuấn',
    caregiverId: 'CG-1088',
    service: 'stroke',
    serviceName: 'Phục hồi chức năng vận động khớp',
    area: 'bt',
    date: '2026-09-21',
    start: '14:00',
    end: '18:00',
    status: 'confirmed',
    urgent: false,
    package: 'weekly',
    note: null
  },
  {
    id: 'BK-8820',
    createdAt: '2026-09-20T17:00:00+07:00',
    customer: 'Chị Phạm Thanh Hà',
    customerCode: 'CUST-0988',
    phone: '0934567890',
    patient: 'Bà Đỗ Thị Xuân',
    patientAge: 68,
    patientGender: 'female',
    condition: 'Thay băng vết loét vô khuẩn',
    caregiver: 'ĐD. Vũ Mai Linh',
    caregiverId: 'CG-1205',
    service: 'dressing',
    serviceName: 'Tiêm truyền & Chăm sóc vết loét vô khuẩn',
    area: 'q7',
    date: '2026-09-20',
    start: '15:00',
    end: '17:00',
    status: 'completed',
    urgent: false,
    package: 'hourly',
    note: null
  },
  {
    id: 'BK-8819',
    createdAt: '2026-09-19T21:15:00+07:00',
    customer: 'Anh Hoàng Quốc Việt',
    customerCode: 'CUST-1032',
    phone: '0977223344',
    patient: 'Cụ Hoàng Văn Nam',
    patientAge: 82,
    patientGender: 'male',
    condition: 'Sa sút trí tuệ nhẹ & Hỗ trợ sinh hoạt',
    caregiver: 'ĐD. Lê Thị Hồng Hạnh',
    caregiverId: 'CG-1150',
    service: 'elderly',
    serviceName: 'Chăm sóc người cao tuổi & Nhắc thuốc',
    area: 'q7',
    date: '2026-09-22',
    start: '08:00',
    end: '12:00',
    status: 'confirmed',
    urgent: false,
    package: 'hourly',
    note: null
  },
  {
    id: 'BK-8815',
    createdAt: '2026-09-19T14:20:00+07:00',
    customer: 'Chị Lê Thu Trang',
    customerCode: 'CUST-0912',
    phone: '0966554433',
    patient: 'Ông Vũ Đình Khoa',
    patientAge: 65,
    patientGender: 'male',
    condition: 'Hậu phẫu chỉnh hình',
    caregiver: 'ĐD. Đặng Văn Khang',
    caregiverId: 'CG-1042',
    service: 'postop',
    serviceName: 'Chăm sóc hậu phẫu tại nhà',
    area: 'hk',
    date: '2026-09-19',
    start: null,
    end: null,
    status: 'cancelled',
    urgent: false,
    package: 'night',
    note: 'Khách báo nhập viện tuyến trên'
  }
]
