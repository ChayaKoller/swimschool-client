import z from "zod";
import { identityNumber, newPasswordFields, passwordsMatch, passwordsMismatch, phone, requiredEmail, requiredText } from "../../lib/validation";
import type { CreateSecretaryRequest } from "../../types/typesDtos";

export const secretaryFormSchema = z
  .object({
    identityNumber,
    fullName: requiredText(100),
    email: requiredEmail,
    phone,
    ...newPasswordFields,
  })
  .refine(passwordsMatch, passwordsMismatch);

export const secretaryPasswordSchema = z.object(newPasswordFields).refine(passwordsMatch, passwordsMismatch);

export type SecretaryFormValues = z.infer<typeof secretaryFormSchema>;
export type SecretaryPasswordValues = z.infer<typeof secretaryPasswordSchema>;
export function toCreateSecretaryRequest(values: SecretaryFormValues): CreateSecretaryRequest {
  return {
    identityNumber: values.identityNumber,
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    password: values.newPassword,
  };
}