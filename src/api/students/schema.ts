import z from "zod";
import { identityNumber, optionalEmail, optionalText, pastDate, phone, requiredText } from "../../lib/validation";
import type { CreateStudentRequest, StudentDetailsDto, UpdateStudentRequest } from "../../types/typesDtos";
export const studentFormSchema = z.object({
  identityNumber,
  fullName: requiredText(100),
  phone,
  email: optionalEmail,
  birthDate: pastDate,
  healthFund: z.enum(["Maccabi", "Clalit", "Meuhedet", "Leumit"], { error: "יש לבחור קופה" }),
  placementRequest: optionalText(500),
  isActive: z.boolean(),
});
export const STUDENT_FILTER_DEFAULTS = {
  name: "",
  groupId: "",
  onlyUnpaid: "",
  absent: "",
  includeInactive: "",
};
export const transferSchema = z.object({
  newTeacherId: z.string().min(1, { error: "יש לבחור מורה" }),
});
export type StudentFilterValues = typeof STUDENT_FILTER_DEFAULTS;
export type studentFormInput = z.input<typeof studentFormSchema>;
export type studentFormData = z.output<typeof studentFormSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
export function toStudentFormValues(student: StudentDetailsDto): studentFormInput {
  return {
    identityNumber: student.identityNumber,
    fullName: student.fullName,
    phone: student.phone,
    email: student.email ?? "",
    birthDate: student.birthDate,
    healthFund: student.healthFund,
    placementRequest: student.placementRequest ?? "",
    isActive: student.isActive,
  };
}
export function toCreateStudentRequest(values: studentFormData): CreateStudentRequest {
  const { isActive: _isActive, ...request } = values;
  return request;
}
export function toUpdateStudentRequest(values: studentFormData): UpdateStudentRequest {
  const { identityNumber: _identityNumber, birthDate: _birthDate, ...request } = values;
  return request;
}