import { useForm, useWatch, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { studentFormSchema, type studentFormData, type studentFormInput } from "../../api/students/schema";
import { healthFundLabels, toOptions } from "../../lib/labels";
import { useServerErrors } from "../form/useServerErrors";
import UnsavedChangesGuard from "../form/UnsavedChangesGuard";
import FormField from "../form/FormField";
import FormError from "../form/FormError";
import TextField from "../form/TextField";
import SelectField from "../form/SelectField";
import TextArea from "../form/TextArea";
import Checkbox from "../form/Checkbox";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { createFieldProps } from "../form/fieldProps";

export type StudentFormProps = {
  defaultValues: DefaultValues<studentFormInput>;
  isEdit: boolean;
  onSubmit: (values: studentFormData) => Promise<unknown>;
  onCancel: () => void;
};

const CODE_TO_FIELD = { DUPLICATE_IDENTITY: "identityNumber" } as const;
const healthFundOptions = toOptions(healthFundLabels);

export default function StudentForm({ defaultValues, isEdit, onSubmit, onCancel }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<studentFormInput, unknown, studentFormData>({ resolver: zodResolver(studentFormSchema), defaultValues });
  const fieldProps = createFieldProps(register, errors);

  const { withServerErrors, formError } = useServerErrors(setError, CODE_TO_FIELD);

  const submit = handleSubmit(withServerErrors(onSubmit));

  const placementLength = (useWatch({ control, name: "placementRequest" }) ?? "").length;

  return (
    <Card>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
          <FormField
            required
            label="תעודת זהות"
            htmlFor="identityNumber"
            hint={isEdit ? "לא ניתן לשנות" : undefined}
            error={errors.identityNumber?.message}
          >
            <TextField
              inputMode="numeric"
              maxLength={9}
              readOnly={isEdit}
              className="tabular-nums read-only:cursor-not-allowed read-only:bg-page read-only:text-slate-500"
              {...fieldProps("identityNumber")}
            />
          </FormField>

          <FormField required label="שם מלא" htmlFor="fullName" error={errors.fullName?.message}>
            <TextField autoComplete="off" {...fieldProps("fullName")} />
          </FormField>

          <FormField required label="טלפון" htmlFor="phone" error={errors.phone?.message}>
            <TextField type="tel" dir="ltr" autoComplete="off" className="text-end" {...fieldProps("phone")} />
          </FormField>

          <FormField label="אימייל" htmlFor="email" error={errors.email?.message}>
            <TextField type="email" dir="ltr" autoComplete="off" className="text-end" {...fieldProps("email")} />
          </FormField>

          <FormField
            required
            label="תאריך לידה"
            htmlFor="birthDate"
            hint={isEdit ? "לא ניתן לשנות" : undefined}
            error={errors.birthDate?.message}
          >
            <TextField
              type="date"
              readOnly={isEdit}
              className="read-only:cursor-not-allowed read-only:bg-page read-only:text-slate-500"
              {...fieldProps("birthDate")}
            />
          </FormField>

          <FormField required label="קופת חולים" htmlFor="healthFund" error={errors.healthFund?.message}>
            <SelectField options={healthFundOptions} placeholder="בחרי קופה" {...fieldProps("healthFund")} />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label="בקשת שיבוץ"
              htmlFor="placementRequest"
              hint={`${placementLength}/500`}
              error={errors.placementRequest?.message}
            >
              <TextArea
                placeholder="למשל: קבוצה מתקדמת, שעה מסוימת"
                maxLength={500}
                {...fieldProps("placementRequest")}
              />
            </FormField>
          </div>

          {isEdit && (
            <div className="md:col-span-2">
              <Checkbox label="פעילה" {...register("isActive")} />
            </div>
          )}
        </div>

        <FormError message={formError} />

        <div className="flex flex-wrap items-center justify-end gap-3 border-t-[1.5px] border-line/10 pt-5">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" isLoading={isSubmitting} icon={<Save />}>
            שמירה
          </Button>
        </div>
      </form>

      <UnsavedChangesGuard when={isDirty && !isSubmitting} />
    </Card>
  );
}