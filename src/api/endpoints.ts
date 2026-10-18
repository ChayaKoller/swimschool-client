import { api } from './client'
import type {
  AuthResponse,
  CreateReportRequest,
  CreateStudentRequest,
  CurrentUser,
  Enrollment,
  EnrollRequest,
  Group,
  GroupDetails,
  HealthFund,
  PagedResult,
  Report,
  ReportSettings,
  Season,
  StudentDetails,
  StudentListItem,
} from './types'

export interface GroupFilter {
  name?: string
  season?: Season | ''
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface StudentFilter {
  name?: string
  groupId?: number
  onlyUnpaid?: boolean
  absentMoreThan?: number
  includeInactive?: boolean
  page?: number
  pageSize?: number
}

export interface ReportFilter {
  search?: string
  healthFund?: HealthFund | ''
  fromDate?: string
  toDate?: string
  page?: number
  pageSize?: number
}

export const authApi = {
  login: (email: string, password: string) => api.post<AuthResponse>('/api/auth/login', { email, password }),
  me: () => api.get<CurrentUser>('/api/auth/me'),
}

export const groupsApi = {
  list: (filter: GroupFilter) => api.get<PagedResult<Group>>('/api/groups', { ...filter }),
  get: (id: number) => api.get<GroupDetails>(`/api/groups/${id}`),
}

export const studentsApi = {
  list: (filter: StudentFilter) => api.get<PagedResult<StudentListItem>>('/api/students', { ...filter }),
  get: (id: number) => api.get<StudentDetails>(`/api/students/${id}`),
  create: (body: CreateStudentRequest) => api.post<StudentDetails>('/api/students', body),
  attendedDates: (id: number) => api.get<string[]>(`/api/students/${id}/attended-dates`),
  reports: (id: number) => api.get<Report[]>(`/api/students/${id}/reports`),
}

export const enrollmentsApi = {
  enroll: (body: EnrollRequest) => api.post<Enrollment>('/api/enrollments', body),
}

export const reportsApi = {
  list: (filter: ReportFilter) => api.get<PagedResult<Report>>('/api/reports', { ...filter }),
  create: (body: CreateReportRequest) => api.post<Report>('/api/reports', body),
  pdf: (id: number) => api.file(`/api/reports/${id}/pdf`),
  settings: () => api.get<ReportSettings>('/api/report-settings'),
}
