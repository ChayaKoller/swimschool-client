import { zodResolver } from "@hookform/resolvers/zod";
import { useForm  } from "react-hook-form";
import { Save } from "lucide-react";
import type { ReportSettingsDto } from "../../types/typesDtos";
import {
  reportSettingsSchema,
  toReportSettingsFormValues,
  toUpdateReportSettingsRequest,
  type ReportSettingsFormValues,
} from "../../api/reports/schema";
import { useUpdateReportSettings } from "../../api/reports/hook";
import { useToast } from "../../context/useToast";
import { useServerErrors } from "../form/useServerErrors";
import UnsavedChangesGuard from "../form/UnsavedChangesGuard";
import FormField from "../form/FormField";
import FormError from "../form/FormError";
import TextArea from "../form/TextArea";
import TextField from "../form/TextField";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { createFieldProps } from "../form/fieldProps";

export type ReportSettingsFormProps = {
  settings: ReportSettingsDto;
};

export default function ReportSettingsForm({ settings }: ReportSettingsFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ReportSettingsFormValues>({
    resolver: zodResolver(reportSettingsSchema),
    defaultValues: toReportSettingsFormValues(settings),
  });
  const fieldProps = createFieldProps(register, errors);

  const { handleServerError, formError } = useServerErrors(setError);
  const updateSettings = useUpdateReportSettings();
  const toast = useToast();

  const submit = handleSubmit(async (values) => {
    try {
      const saved = await updateSettings.mutateAsync(toUpdateReportSettingsRequest(values));
      toast.success("ההגדרות נשמרו");
      reset(toReportSettingsFormValues(saved));
    } catch (error) {
      handleServerError(error);
    }
  });


  return (
    <Card title="הגדרות הדוח" className="max-w-2xl">
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <FormField
          label="שורת חתימה"
          htmlFor="reportSignature"
          error={errors.reportSignature?.message}
          hint="עד 200 תווים ושתי שורות. ריק = השם המלא שלך"
        >
          <TextArea
            rows={2}
            maxLength={200}
            placeholder={"למשל: ג. שינפלד\nהידרותרפיסטית"}
            {...fieldProps("reportSignature")}
          />
        </FormField>

        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <FormField
            required
            label="מחיר לטיפול קבוצתי"
            htmlFor="defaultGroupPrice"
            error={errors.defaultGroupPrice?.message}
            hint="בשקלים, בין 1 ל-10,000"
          >
            <TextField
              type="number"
              min={1}
              max={10000}
              step="any"
              inputMode="decimal"
              className="tabular-nums"
              {...fieldProps("defaultGroupPrice", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label="מחיר לטיפול פרטני"
            htmlFor="defaultIndividualPrice"
            error={errors.defaultIndividualPrice?.message}
            hint="אפשר להשאיר ריק"
          >
            <TextField
              type="number"
              min={1}
              max={10000}
              step="any"
              inputMode="decimal"
              className="tabular-nums"
              {...fieldProps("defaultIndividualPrice", {
                setValueAs: (value) => (value === "" ? null : Number(value)),
              })}
            />
          </FormField>

          <FormField
            required
            label="מספר שורות תאריך בדוח חדש"
            htmlFor="defaultTreatmentsCount"
            error={errors.defaultTreatmentsCount?.message}
            hint="בין 1 ל-34"
          >
            <TextField
              type="number"
              min={1}
              max={34}
              step={1}
              inputMode="numeric"
              className="tabular-nums sm:max-w-32"
              {...fieldProps("defaultTreatmentsCount", { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <FormError message={formError} />

        <div className="flex justify-end border-t-[1.5px] border-line/10 pt-5">
          <Button type="submit" isLoading={isSubmitting} icon={<Save />}>
            שמירת הגדרות
          </Button>
        </div>
      </form>

      <UnsavedChangesGuard when={isDirty && !isSubmitting} />
    </Card>
  );
}