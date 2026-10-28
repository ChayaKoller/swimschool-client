import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import TextField from "../form/TextField";
import Button from "../ui/Button";

// מה הרכיב צריך לדעת על הטופס: רק שיש בו רשימה בשם lessonTimes
type LessonTimesForm = { lessonTimes: { value: string }[] };

export default function LessonTimesField() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LessonTimesForm>();
  const { fields, append, remove } = useFieldArray({ control, name: "lessonTimes" });
  const listError = errors.lessonTimes?.root?.message;

  return (
    <div className="flex flex-col gap-3">
      {fields.length > 0 && (
        <ol className="flex flex-col gap-2">
          {fields.map((field, index) => {
            const rowError = errors.lessonTimes?.[index]?.value?.message;
            return (
              <li key={field.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-ink/60 tabular-nums">
                    {index + 1}
                  </span>
                  <TextField
                    type="datetime-local"
                    aria-label={`מועד ${index + 1}`}
                    invalid={Boolean(rowError)}
                    className="min-w-0 flex-1 sm:max-w-64"
                    {...register(`lessonTimes.${index}.value`)}
                  />
                  <Button
                    variant="ghost"
                    aria-label={`מחיקת מועד ${index + 1}`}
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
      )}

      {listError && (
        <p role="alert" className="text-xs font-medium text-danger">
          {listError}
        </p>
      )}

      <Button variant="secondary" onClick={() => append({ value: "" })} icon={<Plus />} className="self-start">
        הוספת מועד
      </Button>
    </div>
  );
}