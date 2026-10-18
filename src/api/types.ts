// Types that mirror the server DTOs (SwimSchool.Application). Enums arrive as strings.

export type UserRole = 'Teacher' | 'Secretary'
export type HealthFund = 'Maccabi' | 'Clalit' | 'Meuhedet' | 'Leumit'
export type Season = 'Winter' | 'Spring' | 'Summer' | 'Autumn'
export type TreatmentType = 'Group' | 'Individual'

export interface ErrorResponse {
  status: number
  code: string
  message: string
  errors?: Record<string, string[]>
  traceId: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CurrentUser {
  id: number
  fullName: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: CurrentUser
}

export interface Group {
  id: number
  name: string
  year: number
  season: Season
  lessonsCount: number
  price: number
  isActive: boolean
  maxStudents: number
  enrolledCount: number
  freeSpots: number
  version: number
}

export interface GroupStudent {
  id: number
  fullName: string
  amountOwed: number
}

export interface Lesson {
  lessonId: number
  groupId: number
  groupName: string
  startTime: string
  tookPlace: boolean
  isMakeup: boolean
}

export interface GroupDetails extends Group {
  students: GroupStudent[]
  lessons: Lesson[]
}

export interface StudentListItem {
  id: number
  identityNumber: string
  fullName: string
  phone: string
  healthFund: HealthFund
  isActive: boolean
  amountOwed: number
  absencesCount: number
}

export interface StudentGroup {
  enrollmentId: number
  groupId: number
  groupName: string
  season: Season
  year: number
  amountDue: number
  amountPaid: number
}

export interface StudentDetails {
  id: number
  identityNumber: string
  fullName: string
  phone: string
  email: string | null
  birthDate: string
  healthFund: HealthFund
  placementRequest: string | null
  isActive: boolean
  responsibleTeacherName: string
  groups: StudentGroup[]
}

export interface CreateStudentRequest {
  identityNumber: string
  fullName: string
  phone: string
  email: string | null
  birthDate: string
  healthFund: HealthFund
  placementRequest: string | null
}

export interface EnrollRequest {
  studentId: number
  groupId: number
  amountDue: number | null
}

export interface Enrollment {
  id: number
  studentId: number
  studentName: string
  groupId: number
  groupName: string
  enrolledAt: string
  amountDue: number
  amountPaid: number
  isActive: boolean
}

export interface Report {
  id: number
  studentId: number
  studentName: string
  healthFund: HealthFund
  insuranceCompany: string | null
  treatmentType: TreatmentType
  pricePerTreatment: number
  totalAmount: number
  serviceDescription: string
  issuedAt: string
  createdByName: string
  lessonDates: string[]
}

export interface CreateReportRequest {
  studentId: number
  treatmentType: TreatmentType
  pricePerTreatment: number
  serviceDescription: string
  insuranceCompany: string | null
  lessonDates: string[]
}

export interface ReportSettings {
  reportSignature: string | null
  defaultGroupPrice: number
  defaultIndividualPrice: number | null
  defaultTreatmentsCount: number
}
