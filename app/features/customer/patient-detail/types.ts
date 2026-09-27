export interface MedicationItem {
  id: string
  name: string
  subtitle: string
  dosage: string
  time: string
  instructions: string
}

export interface CareSessionHistoryItem {
  id: string
  date: string
  title: string
  nurse: string
  objectiveAchieved: string
  vitals: string
  notes: string
}

export interface AttachedDocItem {
  id: string
  fileName: string
  fileSize: string
  uploadDate: string
}

export interface PatientDetailData {
  id: string
  code: string
  name: string
  relationshipLabel: string
  age: number
  gender: 'male' | 'female'
  bloodType: string
  height: string
  weight: string
  nationalId: string
  insuranceId: string
  dob: string
  avatar: string
  isVerified: boolean
  caregiver: {
    name: string
    title: string
    rating: number
    reviewCount: number
    shiftTime: string
    avatar: string
  }
  emergencyContacts: {
    primary: {
      name: string
      role: string
      phone: string
    }
    secondary: {
      name: string
      role: string
      phone: string
    }
    hotline: string
  }
  medicalBackground: {
    chronicIllnesses: string[]
    chronicIllnessesText: string
    allergyText: string
    surgeryText: string
    attendingDoctor: {
      name: string
      department: string
      hospital: string
      phone: string
    }
  }
  medications: MedicationItem[]
  carePlan: {
    mobility: string
    nutrition: string
    vitals: string
    address: string
  }
  sessionHistory: CareSessionHistoryItem[]
  attachedDocs: AttachedDocItem[]
}
