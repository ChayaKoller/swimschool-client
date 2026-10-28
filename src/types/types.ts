import type { HealthFund, Season } from "./typesDtos";

export type StudentFilter = {
  name?: string;
  groupId?: number;
  onlyUnpaid?: boolean;
  absentMoreThan?: number;
  includeInactive?: boolean;
  page: number;
  pageSize: number;
};
export type GroupFilter = {
  name?: string;
  season?: Season;
  year?: number;
  isActive?: boolean;
  page: number;
  pageSize: number;
};
export type ReportFilter = {
  search?: string;
  healthFund?: HealthFund;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
};

export type AttendedDatesFilter = {
  groupId?: number;
  fromDate?: string;
  toDate?: string;
};