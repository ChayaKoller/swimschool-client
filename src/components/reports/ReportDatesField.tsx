import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { MAX_REPORT_DATES } from "../../api/reports/schema";
import { todayIsrael } from "../../lib/format";
import TextField from "../form/TextField";
import Button from "../ui/Button";

type ReportDatesForm = { lessonDates: { date: string }[] };

export default function ReportDatesField() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ReportDatesForm>();
  const { fields, append, remove } = useFieldArray({ control, name: "lessonDates" });
  const today = todayIsrael();
  const listError = errors.lessonDates?.root?.message ?? errors.lessonDates?.message;
  const isFull = fields.length >= MAX_REPORT_DATES;

  return (
    <div className="flex flex-col gap-4">
      <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {fields.map((field, index) => {
          const rowError = errors.lessonDates?.[index]?.date?.message;
          return (
            <li key={field.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center text-xs font-bold text-ink/60 tabular-nums">
                  {index + 1}
                </span>
                <TextField
                  type="date"
                  max={today}
                  aria-label={`תאריך טיפול ${index + 1}`}
                  invalid={Boolean(rowError)}
                  className="min-w-0 flex-1"
                  {...register(`lessonDates.${index}.date`)}
                />
                <Button
                  variant="ghost"
                  aria-label={`מחיקת שורה ${index + 1}`}
                  onClick={() => remove(index)}
                  icon={<Trash2 />}
                  className="size-10 shrink-0 px-0 text-danger hover:bg-danger/10"
                />
              </div>
              {rowError && (
                <p role="alert" className="ps-8 text-xs font-medium text-danger">
                  {rowError}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {listError && (
        <p role="alert" className="text-sm font-medium text-danger">
          {listError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" icon={<Plus />} onClick={() => append({ date: "" })} disabled={isFull}>
          הוספת תאריך
        </Button>
        {isFull && <span className="text-xs text-ink/60">אפשר עד {MAX_REPORT_DATES} תאריכים בדוח</span>}
      </div>
    </div>
  );
}