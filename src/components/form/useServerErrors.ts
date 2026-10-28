import { useCallback, useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError, isGlobalError } from "../../api/apiError";

export function useServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  codeToField?: Partial<Record<string, Path<T>>>,
) {
  const [formError, setFormError] = useState<string | null>(null);

  const clearFormError = useCallback(() => {
    setFormError(null);
  }, []);

  const handleServerError = useCallback(
    (error: unknown) => {
      setFormError(null);

      if (!(error instanceof ApiError) || isGlobalError(error.status)) return;

      // שגיאות המשויכות ישירות לשדות
      for (const [key, messages] of Object.entries(error.fieldErrors)) {
        if (messages.length === 0) continue;
        setError(key as Path<T>, { type: "server", message: messages[0] });
      }

      // שגיאה לפי קוד עסקי
      const field = codeToField?.[error.code];
      if (field) {
        setError(field, { type: "server", message: error.message });
        return;
      }

      // שגיאה כללית בטופס
      if (Object.keys(error.fieldErrors).length === 0) {
        setFormError(error.message);
      }
    },
    [setError, codeToField],
  );

  return { formError, handleServerError, clearFormError };
}