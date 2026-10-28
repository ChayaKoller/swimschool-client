import { useFormContext } from "react-hook-form";
import { createFieldProps } from "./fieldProps";
import FormField from "./FormField";
import PasswordField from "./PasswordField";
 
type NewPasswordValues = { newPassword: string; confirmPassword: string };
 
export type NewPasswordFieldsProps = {
  label: string;
};
 
// שני שדות בלי עטיפה: הסידור (טור אחד או שני טורים) נקבע בטופס שמעליהם
export default function NewPasswordFields({ label }: NewPasswordFieldsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<NewPasswordValues>();
  const fieldProps = createFieldProps(register, errors);
 
  return (
    <>
      <FormField
        label={label}
        required
        htmlFor="newPassword"
        error={errors.newPassword?.message}
        hint="לפחות 8 תווים, ובהם אות אחת וספרה אחת"
      >
        <PasswordField autoComplete="new-password" {...fieldProps("newPassword")} />
      </FormField>
 
      <FormField label="אימות הסיסמה" required htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
        <PasswordField autoComplete="new-password" {...fieldProps("confirmPassword")} />
      </FormField>
    </>
  );
}
 