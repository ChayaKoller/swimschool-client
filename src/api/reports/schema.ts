import z from "zod";
import { todayIsrael } from "../../lib/format";
import { requiredText, treatmentPrice, wholeNumber } from "../../lib/validation";
import type { CreateReportRequest, ReportDto, ReportSettingsDto, TreatmentType, UpdateReportRequest, UpdateReportSettingsRequest } from "../../types/typesDtos";
import type { DefaultValues } from "react-hook-form";

export const MAX_REPORT_DATES = 34;                       
export const SERVICE_DESCRIPTION_DEFAULT = "טיפול רגשי במים";
export const REPORT_FILTER_DEFAULTS = { search: "", healthFund: "", fromDate: "", toDate: "" };
export type ReportFilterValues = typeof REPORT_FILTER_DEFAULTS;
type DateRow = { date: string };

function checkReportDates(rows: DateRow[], ctx: z.RefinementCtx) {
  if (!rows.some((row) => row.date)) {
    ctx.addIssue({ code: "custom", message: "יש להזין לפחות תאריך טיפול אחד" });
    return;
  }
  const today = todayIsrael();
  const seen = new Set<string>();
  rows.forEach((row, index) => {
    if (!row.date) return;                            
    if (row.date > today) {
      ctx.addIssue({ code: "custom", path: [index, "date"], message: "אי אפשר להכניס תאריך עתידי" });
    } else if (seen.has(row.date)) {
      ctx.addIssue({ code: "custom", path: [index, "date"], message: "התאריך הזה כבר מופיע בדוח" });
    }
    seen.add(row.date);
  });
}
export const reportFormSchema = z
  .object({
    studentId: z.string().min(1, { error: "יש לבחור תלמידה" }),
    hasInsurance: z.boolean(),
    insuranceCompany: z.string().trim().max(100, { error: "עד 100 תווים" }),
    treatmentType: z.enum(["Group", "Individual"], { error: "יש לבחור סוג טיפול" }),
    pricePerTreatment: treatmentPrice,
    serviceDescription: requiredText(100),
    lessonDates: z.array(z.object({ date: z.string() })).superRefine(checkReportDates),
  })
  .superRefine((values, ctx) => {
    if (values.hasInsurance && !values.insuranceCompany) {
      ctx.addIssue({ code: "custom", path: ["insuranceCompany"], message: "יש להזין את שם חברת הביטוח" });
    }
  });

export type ReportFormValues = z.infer<typeof reportFormSchema>;
export function getReportDefaults(
  settings: ReportSettingsDto,
  report?: ReportDto,
  studentId?: string | null,
): DefaultValues<ReportFormValues>{
    if(report){
      return{
        studentId: String(report.studentId), 
        hasInsurance: report.insuranceCompany !== null, 
        insuranceCompany: report.insuranceCompany ?? "",
        pricePerTreatment: report.pricePerTreatment, 
        serviceDescription: report.serviceDescription, 
        lessonDates:report.lessonDates.map((date) => ({ date }))

      }  
    }
    return{
        studentId: studentId ?? "", 
        hasInsurance: false, 
        insuranceCompany: "", treatmentType: "Group", 
        pricePerTreatment: settings.defaultGroupPrice, 
        serviceDescription: SERVICE_DESCRIPTION_DEFAULT, 
        lessonDates: Array.from({ length: settings.defaultTreatmentsCount }, () => ({ date: "" }))


    }
}
export function priceFor(type: TreatmentType, settings: ReportSettingsDto): number | null {
  return type === "Group" ? settings.defaultGroupPrice : settings.defaultIndividualPrice;
}
export function mergeDates(current: string[], found: string[]): string[] {
  return [...new Set([...current, ...found])].sort();
}
export function toReportDetails(values: ReportFormValues): UpdateReportRequest {
  return {
    treatmentType: values.treatmentType,
    pricePerTreatment: values.pricePerTreatment,
    serviceDescription: values.serviceDescription,
    insuranceCompany: values.hasInsurance ? values.insuranceCompany : null,
    lessonDates: values.lessonDates.map((row) => row.date).filter(Boolean),
  };
}

export function toCreateReportRequest(values: ReportFormValues): CreateReportRequest {
  return { ...toReportDetails(values), studentId: Number(values.studentId) };
}

export const reportSettingsSchema = z.object({
  reportSignature: z
    .string()
    .trim()
    .max(200, { error: "עד 200 תווים" })
    .refine((value) => value.split("\n").length <= 2, { error: "עד שתי שורות" }),
  defaultGroupPrice: treatmentPrice,
  defaultIndividualPrice: treatmentPrice.nullable(),
  defaultTreatmentsCount: wholeNumber(1, MAX_REPORT_DATES),
});
export type ReportSettingsFormValues = z.infer<typeof reportSettingsSchema>;
// הגדרות מהשרת -> ערכי ההתחלה של הטופס
export function toReportSettingsFormValues(settings: ReportSettingsDto): ReportSettingsFormValues {
  return {
    reportSignature: settings.reportSignature ?? "",
    defaultGroupPrice: settings.defaultGroupPrice,
    defaultIndividualPrice: settings.defaultIndividualPrice,
    defaultTreatmentsCount: settings.defaultTreatmentsCount,
  };
}
// ערכי הטופס -> הבקשה לשרת
export function toUpdateReportSettingsRequest(values: ReportSettingsFormValues): UpdateReportSettingsRequest {
  return {
    ...values,
    reportSignature: values.reportSignature || null,
  };
}