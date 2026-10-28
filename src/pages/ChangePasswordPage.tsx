import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useChangePassword } from "../api/auth/hook";
import { changePasswordSchema, type changePasswordSchemaData } from "../api/auth/schema";
import { createFieldProps } from "../components/form/fieldProps";
import FormError from "../components/form/FormError";
import FormField from "../components/form/FormField";
import NewPasswordFields from "../components/form/NewPasswordFields";
import PasswordField from "../components/form/PasswordField";
import { useServerErrors } from "../components/form/useServerErrors";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

const CODE_TO_FIELD = { WRONG_PASSWORD: "currentPassword" } as const;

const ChangePasswordPage = () => {
  const { signIn } = useAuth();
  const toast = useToast();
  const changePassword = useChangePassword();
  const methods = useForm<changePasswordSchemaData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = methods;
  const fieldProps = createFieldProps(register, errors);
  const { formError, handleServerError } = useServerErrors(setError, CODE_TO_FIELD);

  const onHandleSubmit = (data: changePasswordSchemaData) => {
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: (response) => {
          signIn(response);
          toast.success("הסיסמה הוחלפה");
          reset();
        },
        onError: handleServerError,
      },
    );
  };

  return (
    <>
      <PageHeader title="החלפת סיסמה" />
      <p className="-mt-3 mb-6 text-sm text-slate-600">
        אחרי ההחלפה נשארים מחוברים. בכניסה הבאה נכנסים עם הסיסמה החדשה.
      </p>

      <Card className="max-w-lg">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onHandleSubmit)} noValidate className="flex flex-col gap-5">
            <FormField label="סיסמה נוכחית" required htmlFor="currentPassword" error={errors.currentPassword?.message}>
              <PasswordField autoComplete="current-password" {...fieldProps("currentPassword")} />
            </FormField>

            {/* הסיסמה החדשה, מופרדת בקו דק מהסיסמה הנוכחית */}
            <div className="flex flex-col gap-5 border-t-[1.5px] border-line/10 pt-5">
              <NewPasswordFields label="סיסמה חדשה" />
            </div>

            <FormError message={formError} />

            <div className="flex justify-end border-t-[1.5px] border-line/10 pt-5">
              <Button type="submit" isLoading={changePassword.isPending} icon={<KeyRound />} className="w-full sm:w-auto">
                החלפת סיסמה
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>
    </>
  );
};

export default ChangePasswordPage;
