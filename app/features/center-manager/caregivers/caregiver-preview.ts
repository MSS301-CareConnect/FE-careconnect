export type ManagerSpecialty =
  'rehab' | 'elderly' | 'therapy' | 'stroke' | 'postop' | 'infant' | 'emergency' | 'general'
export type ManagerStatus = 'active' | 'onduty' | 'disabled'
export type ManagerVerification = 'verified' | 'pending' | 'update'

export interface ManagerCaregiver {
  id: string
  name: string
  photo: string
  rating: number
  reviews: number
  joined: string | null
  specialties: readonly ManagerSpecialty[]
  years: number
  hospital: string
  status: ManagerStatus
  verification: ManagerVerification
  license: string | null
  phone: string
  email: string
  completed: number
}

export const managerCaregivers: readonly ManagerCaregiver[] = [
  {
    id: 'CG-1024',
    name: 'ĐD. Trần Thùy Dương',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDh5KJ65OtKwLg7sM2HYkbpQnXLwF8AY-lfu0d6cw066rUHXgZdgMpLxp55waa5M6mI-OK-n4UmIpGU0yCvvwMNZj64j2vR5yW1awZ6_luPt3T4UMewaxQdzkbgBnI8jcWUZidyM0On-nvWLfPk7XrthFxb6eF45y0ZQVlmJPZN9ho_9iJwiOpO8MQ18DghcrIX1oW1IZA9wYx4xcq7KncZMAKqIlATX7GuijEUSkG4D2ML8Czn-p_E-Q',
    rating: 4.98,
    reviews: 124,
    joined: '2022-03-14',
    specialties: ['rehab', 'elderly', 'therapy'],
    years: 6,
    hospital: 'BV Chợ Rẫy (Khoa Tim mạch)',
    status: 'active',
    verification: 'verified',
    license: 'CCHN-0482/BYT',
    phone: '0918 234 567',
    email: 'thuyduong.tran@careconnect.vn',
    completed: 280
  },
  {
    id: 'CG-1088',
    name: 'KTV. Hoàng Minh Tuấn',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA08GNOb7wFobl_-2th3eOB3hvTyGwNDkFY3x5rSLu6FHyva3-eeXWM6lvLOVnB3jXp3c_8J9mSoBJ38j9KwO1CpzSv0JT_vly3_BwOU7K__Dwzvb0iYlkHip8RLiB1qmAYq2IqkoA5IJGE7OE0VZj9fx3mWQXEEVhUs5W-Om1nzEdp7ioOJkQdEBfyC1LhhJ3o04dZJbvqK6PhWH3uj3n9Nl7DxpA5FVs0e53kzmhF21mr46gM2zy_ig',
    rating: 4.95,
    reviews: 98,
    joined: '2022-08-05',
    specialties: ['therapy', 'rehab', 'stroke'],
    years: 8,
    hospital: 'BV Bạch Mai (Khoa PHCN)',
    status: 'active',
    verification: 'verified',
    license: 'CCHN-0911/SYT-HN',
    phone: '0901 245 678',
    email: 'minhtuan.hoang@careconnect.vn',
    completed: 230
  },
  {
    id: 'CG-1150',
    name: 'ĐD. Lê Thị Hồng Hạnh',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjUEi0YFCLn3P544M16ePekeXGzPqBOFi802QJrursnSrfISS8SQt3ImAbHxrn0W0sHM0AoxNYb1EWXJ0SrQcko_N-a94lwTwZfETWZdiOgZhO44JOa3uZtb8PuHTarxbfii2zK2jSwQC9bCp0zIjgIUpcpZNXehT22cxDwrX0aLwGsSuiqNRr2cwHeE2o8NMZ93Wtx2eb4lmImZWopRGDSrK45HM-AHjK6ATo9XgWKspzxjZsmV9k6w',
    rating: 5,
    reviews: 16,
    joined: null,
    specialties: ['postop', 'general'],
    years: 4,
    hospital: 'BV Từ Dũ (Khoa Sản phụ)',
    status: 'active',
    verification: 'pending',
    license: null,
    phone: '0909 155 220',
    email: 'honghanh.le@careconnect.vn',
    completed: 21
  },
  {
    id: 'CG-0982',
    name: 'Y sĩ Phạm Quốc Bảo',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAyLl2-oSSE9b3GLk3ltlKzis8HfZrzBxso5BRaacNPlThE9HY10G0Idw3999T_etr9GTAa5mjp2UDwEJtit8DCj7QP3vssIi5PnxRbZNnaXV-bTNpVqSl3Zeay1WhWZLax22azBR8RoMLUn3S25Uz8ix-KplpXy2PtpWQt7beahdqt6gE25xbqVu6MEP6DRT93I0E1MKtUwB3qtbu7szqx3JlfiChkiiZHDQKLfVH_9-VtwCREjPOCPg',
    rating: 4.89,
    reviews: 210,
    joined: '2021-11-02',
    specialties: ['general', 'elderly'],
    years: 11,
    hospital: 'BV Thống Nhất (Nội khoa)',
    status: 'disabled',
    verification: 'verified',
    license: 'CCHN-0177/BYT',
    phone: '0903 118 221',
    email: 'quocbao.pham@careconnect.vn',
    completed: 400
  },
  {
    id: 'CG-1205',
    name: 'ĐD. Vũ Mai Linh',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5TbSvAMzCCJEr41eDUhrnk4K4MJkjbQzJXdEmZ349uzU78aJK_MIubfkHEQZFb6BXGGo-RfEZ7MIfmsu4m60lFSnZOp5T_DINFxv0IiifqSOP9lGm1NxAcJY9FneNPUKXOJvB3Xtz4KKngr7keRBI7f9gHVcItr5PeGiYSoVg_32TT6vRLCCQBklGsBEcVr_UngCoyFHUuS-HqPD2biD5CkNhW2SNkXE0dPaXuYemFe9zuaz_lx4AvQ',
    rating: 4.97,
    reviews: 84,
    joined: '2023-10-11',
    specialties: ['infant', 'general'],
    years: 3,
    hospital: 'BV Phụ sản Trung Ương',
    status: 'onduty',
    verification: 'verified',
    license: 'CCHN-1290/SYT-HN',
    phone: '0904 120 555',
    email: 'mailinh.vu@careconnect.vn',
    completed: 140
  },
  {
    id: 'CG-1042',
    name: 'ĐD. Đặng Văn Khang',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD9ol7PV24GGBx90peBPho-ElA4YRi8hxhsKNmmeON7yPa6CTdZUF6Z3RhGuXg04iE0RJ3J4erU68wn0tJ3wKu379cVo0qCp_2CmjUCa74mKU_s98YTr5WYZov-iXpYtB8WOUqmx3VjOh6Cr3rZtza-YAgyGgf5O24B1K2VhL6P_VEgBS0SsBnA2NJ3tNrWbjuOqBSyihLkVRteurt_zz5ESSC5MFSHDQmARESmnyS3E4h30OxALx43uA',
    rating: 4.62,
    reviews: 42,
    joined: '2022-05-03',
    specialties: ['emergency', 'general'],
    years: 5,
    hospital: 'BV Nhân dân 115 (Khoa HSTC)',
    status: 'disabled',
    verification: 'update',
    license: 'CCHN-0834/BYT',
    phone: '0912 888 102',
    email: 'vankhang.dang@careconnect.vn',
    completed: 102
  }
]

export function findManagerCaregiver(id: string) {
  return managerCaregivers.find((person) => person.id === id)
}
