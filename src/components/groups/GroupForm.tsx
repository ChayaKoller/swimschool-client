import { FormProvider, useForm, useWatch, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { groupFormSchema, weeklyTimes, type GroupFormValues } from "../../api/groups/schema";
import { seasonLabels, toOptions } from "../../lib/labels";
import { useServerErrors } from "../form/useServerErrors";
import UnsavedChangesGuard from "../form/UnsavedChangesGuard";
import FormField from "../form/FormField";
import FormError from "../form/FormError";
import TextField from "../form/TextField";
import SelectField from "../form/SelectField";
import Checkbox from "../form/Checkbox";
import RadioGroup from "../form/RadioGroup";
import Button from "../ui/Button";
import Card from "../ui/Card";
import LessonTimesField from "./LessonTimesField";
import LessonPreview from "./LessonPreview";
import { createFieldProps } from "../form/fieldProps";

export type GroupFormProps = {
  defaultValues: DefaultValues<GroupFormValues>;
  isEdit: boolean;
  enrolledCount?: number;
  onSubmit: (values: GroupFormValues) => Promise<unknown>;
  onCancel: () => void;
};

const CODE_TO_FIELD = { MAX_BELOW_ENROLLED: "maxStudents" } as const;
const SEASON_OPTIONS = toOptions(seasonLabels);
const LESSON_MODE_OPTIONS = [
  { value: "weekly", label: "כל שבוע באותו יום ושעה" },
  { value: "manual", label: "רשימת מועדים ידנית" },
];
const READ_ONLY_CLASSES = "read-only:cursor-not-allowed read-only:bg-page read-only:text-slate-500";
export default function GroupForm({ defaultValues, isEdit, enrolledCount, onSubmit, onCancel }: GroupFormProps) {
  const methods = useForm<GroupFormValues>({ resolver: zodResolver(groupFormSchema), defaultValues });
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = methods;
  const fieldProps = createFieldProps(register, errors);

  const { handleServerError, formError } = useServerErrors(setError, CODE_TO_FIELD);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      handleServerError(error);
    }
  });



  const [mode, season, year, firstLessonAt, weeklyCount, lessonTimes] = useWatch({
    control,
    name: ["lessonMode", "season", "year", "firstLessonAt", "weeklyCount", "lessonTimes"],
  });
  const previewTimes =
    mode === "weekly"
      ? weeklyTimes(firstLessonAt, Number(weeklyCount))
      : lessonTimes
          .map((time) => time.value)
          .filter(Boolean)
          .sort();

  return (
    <FormProvider {...methods}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <Card title="פרטי הקבוצה">
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField required label="שם הקבוצה" htmlFor="name" error={errors.name?.message}>
                <TextField autoComplete="off" placeholder="למשל: מתחילות, ראשון 17:00" {...fieldProps("name")} />
              </FormField>
            </div>

            {isEdit ? (
              <div className="md:col-span-2">
                <FormField label="עונה ושנה" htmlFor="seasonYear" hint="לא ניתן לשנות">
                  <TextField
                    id="seasonYear"
                    aria-describedby="seasonYear-description"
                    value={`${seasonLabels[season]} ${year}`}
                    readOnly
                    className={READ_ONLY_CLASSES}
                  />
                </FormField>
              </div>
            ) : (
              <>
                <FormField required label="עונה" htmlFor="season" error={errors.season?.message}>
                  <SelectField options={SEASON_OPTIONS} {...fieldProps("season")} />
                </FormField>

                <FormField required label="שנה" htmlFor="year" error={errors.year?.message}>
                  <TextField
                    type="number"
                    inputMode="numeric"
                    className="tabular-nums"
                    {...fieldProps("year", { valueAsNumber: true })}
                  />
                </FormField>
              </>
            )}

            <FormField
              required
              label="מחיר (₪)"
              htmlFor="price"
              hint="מחיר ברירת המחדל ברישום. אפשר לתת הנחה לכל תלמידה"
              error={errors.price?.message}
            >
              <TextField
                type="number"
                inputMode="decimal"
                min={0}
                className="tabular-nums"
                {...fieldProps("price", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              required
              label="מקסימום תלמידות"
              htmlFor="maxStudents"
              hint={isEdit ? `רשומות כרגע: ${enrolledCount ?? 0}` : undefined}
              error={errors.maxStudents?.message}
            >
              <TextField
                type="number"
                inputMode="numeric"
                min={1}
                className="tabular-nums"
                {...fieldProps("maxStudents", { valueAsNumber: true })}
              />
            </FormField>

            {isEdit && (
              <div className="md:col-span-2">
                <Checkbox label="פעילה" {...register("isActive")} />
              </div>
            )}
          </div>
        </Card>

        {!isEdit && (
          <Card title="שיעורים">
            <div className="flex flex-col gap-5">
              <RadioGroup
                legend="איך נקבעים השיעורים?"
                options={LESSON_MODE_OPTIONS}
                registration={register("lessonMode")}
                error={errors.lessonMode?.message}
              />

              <div className="grid items-start gap-x-6 gap-y-5 md:grid-cols-2">
                {mode === "weekly" ? (
                  <div className="flex flex-col gap-5">
                    <FormField
                      required
                      label="מועד השיעור הראשון"
                      htmlFor="firstLessonAt"
                      error={errors.firstLessonAt?.message}
                    >
                      <TextField type="datetime-local" {...fieldProps("firstLessonAt")} />
                    </FormField>

                    <FormField
                      required
                      label="מספר שיעורים"
                      htmlFor="weeklyCount"
                      hint="שיעור אחד בכל שבוע, באותו יום ובאותה שעה"
                      error={errors.weeklyCount?.message}
                    >
                      <TextField
                        type="number"
                        inputMode="numeric"
                        min={1}
                        className="tabular-nums"
                        {...fieldProps("weeklyCount")}
                      />
                    </FormField>
                  </div>
                ) : (
                  <LessonTimesField />
                )}

                <LessonPreview times={previewTimes} />
              </div>
            </div>
          </Card>
        )}

        <FormError message={formError} />

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" isLoading={isSubmitting} icon={isEdit ? <Save /> : <Plus />}>
            {isEdit ? "שמירת שינויים" : "יצירת קבוצה"}
          </Button>
        </div>
      </form>

      <UnsavedChangesGuard when={isDirty && !isSubmitting} />
    </FormProvider>
  );
}