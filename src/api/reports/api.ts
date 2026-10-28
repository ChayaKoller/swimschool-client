import type { AttendedDatesFilter, ReportFilter } from "../../types/types";
import type { CreateReportRequest, ReportDto, ReportDtoPagedResult, ReportSettingsDto, UpdateReportRequest, UpdateReportSettingsRequest } from "../../types/typesDtos";
import { http } from "../http";

export async function  getReports(filter:ReportFilter){
    const {data}= await http.get<ReportDtoPagedResult>("/reports",{params:filter})
    return data;
}
export async function  getReport(id:number){
    const {data}= await http.get<ReportDto>(`/reports/${id}`)
    return data;
}
export async function createReport(body: CreateReportRequest){
    const {data}= await http.post<ReportDto>(`/reports`,body)
    return data;
}
export async function updateReport({ id, body }: { id: number; body: UpdateReportRequest }) {
  const { data } = await http.put<ReportDto>(`/reports/${id}`, body);
  return data;
}
export async function getReportPdf(id:number){
const {data}= await http.get<Blob>(`/reports/${id}/pdf`,{responseType: "blob"})
    return data;
}
export async function getAttendedDates({ studentId, filter }: { studentId: number; filter: AttendedDatesFilter }) {
  const { data } = await http.get<string[]>(`/students/${studentId}/attended-dates`, { params: filter });
  return data;
}
export async function getReportSettings(){
     const {data}= await http.get<ReportSettingsDto>("/report-settings")
    return data;
}
export async function updateReportSettings(body: UpdateReportSettingsRequest){
     const {data}= await http.put<ReportSettingsDto>("/report-settings",body)
    return data;
}