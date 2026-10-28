import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReportDto } from "../../types/typesDtos";
import { queryKeys } from "../queryKeys";
import type { ReportFilter } from "../../types/types";
import { createReport, getAttendedDates, getReport, getReportPdf, getReports, getReportSettings, updateReport, updateReportSettings } from "./api";
import { toLocalInput } from "../../lib/format";
import { downloadBlob } from "../../lib/files";

function useRefreshReports() {
  const queryClient = useQueryClient();
  return (report: ReportDto) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(report.id) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.students.reports(report.studentId) }),
    ]);
}
export function useReports(filter:ReportFilter){
 return useQuery({
        queryKey:queryKeys.reports.list(filter),
        queryFn:()=>getReports(filter),
        placeholderData: keepPreviousData
    })

}
export function useReport(id: number | undefined){
return useQuery({
        queryKey:queryKeys.reports.detail(id!),
        queryFn:()=>getReport(id!),
        enabled: id !== undefined
    })
}

export function useReportSettings(){
return useQuery({
        queryKey:queryKeys.reportSettings,
        queryFn:getReportSettings,
      
    })

}
export function useCreateReport() {
  const refresh = useRefreshReports();
  return useMutation({
    mutationFn: createReport,
    onSuccess: refresh,
  });
}
export function useUpdateReport(){
 const refresh = useRefreshReports();
  return useMutation({
    mutationFn:updateReport,
    onSuccess: refresh,
  });

}
export function useUpdateReportSettings(){
const queryClient = useQueryClient()
    return useMutation({
        mutationFn:updateReportSettings,
        onSuccess: (settings) => queryClient.setQueryData(queryKeys.reportSettings, settings)
    })
  
}
export function useAttendedDates(){
return useMutation({
    mutationFn:getAttendedDates
})

}

export function usePreviewReport() {
  return useMutation({
    mutationFn: async ({ reportId, tab }: { reportId: number; tab: Window }) => {
      const blob = await getReportPdf(reportId);
      tab.location.href = URL.createObjectURL(blob);
    },
    onError: (_error, { tab }) => tab.close(),
  });
}


function reportFileName(report: ReportDto) {
  return `דוח-${report.studentName}-${toLocalInput(report.issuedAt).slice(0, 10)}.pdf`;
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async (report: ReportDto) => downloadBlob(await getReportPdf(report.id), reportFileName(report)),
  });
}