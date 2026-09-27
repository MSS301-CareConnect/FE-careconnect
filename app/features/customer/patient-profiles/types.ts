export type RelationshipFilter = 'all' | 'parents' | 'grandparents' | 'children'
export type HealthStatusFilter = 'all' | 'special' | 'monitoring' | 'rehab'

export interface AttendingDoctor {
  name: string
  hospital: string
}

export interface PatientProfile {
  id: string
  name: string
  avatar: string
  relationship: 'parents' | 'grandparents' | 'children'
  relationshipLabel: string
  age: number
  gender: 'male' | 'female'
  bloodType: string
  weight: string
  height: string
  status: 'in-care' | 'stable' | 'post-op'
  statusCategory: 'special' | 'monitoring' | 'rehab'
  diagnosesTitleType: 'diagnoses' | 'primary' | 'current'
  diagnoses: string
  instructionsTitleType: 'special' | 'rehab' | 'diet'
  instructions: string
  attendingDoctor?: AttendingDoctor
}
