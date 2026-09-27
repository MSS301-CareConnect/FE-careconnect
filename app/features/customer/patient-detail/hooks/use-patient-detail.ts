import { useState } from 'react'
import { useSearchParams } from 'react-router'

import type { PatientDetailData } from '../types'

export const INITIAL_PATIENT_DETAIL: PatientDetailData = {
  id: 'P-001',
  code: 'CC-MED-0941',
  name: 'Nguyễn Văn A',
  relationshipLabel: 'Bố ruột',
  age: 78,
  gender: 'male',
  bloodType: 'O (Rh+)',
  height: '1m68',
  weight: '62 kg',
  nationalId: '001046002931',
  insuranceId: 'GD4790123984712',
  dob: '15/04/1946 (78 tuổi)',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBDgy45AFun1DTD_GjztCtgcsXkTloTOtQgtQBBrXUfWcgJNWxpibWEAfeZgHnHDvfxVxuPrGio34jau8J1wna58eYLy9yrAZlpvRsT9k31odWyDo4U5nlPr-oFxHhwZW8voiUf3I7sYb0wd21Y5sAK0V2LiLxAdUs5HQOXVS9DhTMChpTsTQc9KO18guyZK88kgDm4VEjXVavjizoN7Xe0eldoCnTzlwKdCInNL890QpLigCU8ZeIdlQ',
  isVerified: true,
  caregiver: {
    name: 'Trần Thị Bích Loan',
    title: 'Điều dưỡng ĐH Y Dược • 6 năm KN',
    rating: 4.98,
    reviewCount: 124,
    shiftTime: '08:00 - 17:00 (Hàng ngày)',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC05uHzqF_w7e0MEn0iZfSon2gA7gvL085Y9Gj2-wY8raCtqKnywrxlFP7CHVLLvNNj0_Oitywvc_fS5QA-YZbyWv_zA3nKrhoAVmWW0rwZitdGRpwHez5ja48Aphi_9rUXtB9hId5wTv4_tUaR2rCzuUOY_2EGRPO-5c7sQoWaYGS4UeMoCYh4-WqAAh_oXB99DbduKYsRfyBMRsMTffF2Q1A4ofCUiqfA3cMJsZtWDLafa6JiWkz1JA'
  },
  emergencyContacts: {
    primary: {
      name: 'Nguyễn Mai Anh (Bạn - Con gái)',
      role: 'Người giám hộ chính • Q.Bình Thạnh',
      phone: '0908123789'
    },
    secondary: {
      name: 'Nguyễn Văn Hùng (Con trai thứ)',
      role: 'Người liên hệ thứ 2 • 0988 123 456',
      phone: '0988123456'
    },
    hotline: '1900 6868'
  },
  medicalBackground: {
    chronicIllnesses: [
      'Tăng huyết áp vô căn (Độ 2)',
      'Đái tháo đường Type 2',
      'Di chứng tai biến mạch máu não nhẹ (yếu cơ bàn tay trái)'
    ],
    chronicIllnessesText:
      'Tăng huyết áp vô căn (Độ 2), Đái tháo đường Type 2, Di chứng tai biến mạch máu não nhẹ (yếu cơ bàn tay trái)',
    allergyText: 'Dị ứng Penicillin (nổi mề đay), mẫn cảm tôm biển',
    surgeryText: 'Mổ nội soi tán sỏi thận (2018 tại BV Chợ Rẫy)',
    attendingDoctor: {
      name: 'BS.CKII Lê Hoàng Nam',
      department: 'Khoa Tim mạch Can thiệp',
      hospital: 'Bệnh viện Đại học Y Dược TP.HCM (Cơ sở 1)',
      phone: '0912 445 566'
    }
  },
  medications: [
    {
      id: 'med-1',
      name: 'Amlodipine 5mg',
      subtitle: 'Hạ áp chẹn kênh canxi',
      dosage: '1 viên/ngày',
      time: '07:30 Sáng (Sau ăn)',
      instructions: 'Đo huyết áp trước khi uống, ghi vào sổ tay.'
    },
    {
      id: 'med-2',
      name: 'Glucophage XR 750mg',
      subtitle: 'Metformin phóng thích kéo dài',
      dosage: '1 viên/ngày',
      time: '18:30 Tối (Trong bữa ăn)',
      instructions: 'Uống nguyên viên với nước ấm, không nhai bẻ viên.'
    },
    {
      id: 'med-3',
      name: 'Aspirin 81mg (Enteric coated)',
      subtitle: 'Phòng ngừa thứ phát huyết khối',
      dosage: '1 viên/ngày',
      time: '12:30 Trưa (Sau ăn no)',
      instructions: 'Theo dõi nếu có biểu hiện đau tức thượng vị dạ dày.'
    },
    {
      id: 'med-4',
      name: 'Ginkgo Biloba 120mg',
      subtitle: 'Tuần hoàn não hỗ trợ',
      dosage: '2 viên/ngày',
      time: 'Sáng 1v, Chiều 1v',
      instructions: 'Uống cách các thuốc đặc trị tối thiểu 1 giờ.'
    }
  ],
  carePlan: {
    mobility:
      'Cần hỗ trợ dìu khi đứng dậy đi vệ sinh. Tập phục hồi vận động bàn tay trái 30 phút mỗi chiều với bóng cao su gai y tế.',
    nutrition:
      'Ăn nhạt (dưới 3g muối/ngày), chia 3 bữa chính + 1 bữa phụ hạt dinh dưỡng lúc 15h. Đảm bảo uống đủ 1.5 - 1.8L nước/ngày.',
    vitals: 'Đo huyết áp & SpO2 vào 07:00 sáng và 17:00 chiều. Ngưỡng cảnh báo: HA tâm thu > 145 mmHg hoặc < 100 mmHg.',
    address:
      'Căn hộ 18.04, Tòa Landmark 2, Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh.'
  },
  sessionHistory: [
    {
      id: 'sess-1',
      date: '18/10',
      title: 'Ca chăm sóc bán trú 8 tiếng (Hôm qua)',
      nurse: 'Trần Thị Bích Loan',
      objectiveAchieved: 'Đạt 100% mục tiêu',
      vitals: 'HA: 128/82 • SpO2: 98%',
      notes: 'Cụ tinh thần minh mẫn, ăn hết suất trưa'
    },
    {
      id: 'sess-2',
      date: '17/10',
      title: 'Ca chăm sóc bán trú 8 tiếng',
      nurse: 'Trần Thị Bích Loan',
      objectiveAchieved: 'Hỗ trợ phục hồi cơ',
      vitals: 'HA: 132/85 • Đường huyết đói: 6.2',
      notes: 'Tập co bóp bóng tay trái tốt trong 35 phút'
    }
  ],
  attachedDocs: [
    {
      id: 'doc-1',
      fileName: 'Don-thuoc-BV-DHYD-T10-2024.pdf',
      fileSize: 'PDF • 1.4 MB',
      uploadDate: '02/10/2024'
    },
    {
      id: 'doc-2',
      fileName: 'Xet-nghiem-mau-Sinh-hoa-Q3.pdf',
      fileSize: 'PDF • 2.8 MB',
      uploadDate: '28/09/2024'
    }
  ]
}

export function usePatientDetail() {
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<PatientDetailData>(INITIAL_PATIENT_DETAIL)
  const [isEditMode, setIsEditMode] = useState(() => searchParams.get('mode') === 'edit')
  const [showToast, setShowToast] = useState(false)
  const [activeTab, setActiveTab] = useState<'history' | 'docs'>('history')

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev)
  }

  const updateData = (partial: Partial<PatientDetailData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }

  const handleSave = () => {
    setIsEditMode(false)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3500)
  }

  return {
    data,
    updateData,
    isEditMode,
    toggleEditMode,
    handleSave,
    showToast,
    activeTab,
    setActiveTab
  }
}
