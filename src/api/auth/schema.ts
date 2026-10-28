import { z } from "zod";
import { newPasswordFields, password, passwordsMatch, passwordsMismatch, REQUIRED, requiredEmail } from "../../lib/validation";

export  const loginSchema=z.object({
 email:requiredEmail,
 password:password

})
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: REQUIRED }),
    ...newPasswordFields,
  })
  .refine(passwordsMatch, passwordsMismatch);

export type  loginSchemaData=z.infer<typeof loginSchema>;
export type  changePasswordSchemaData=z.infer<typeof changePasswordSchema>;


