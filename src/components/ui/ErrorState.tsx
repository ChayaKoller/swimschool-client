import { TriangleAlert } from "lucide-react";
import { ApiError, getErrorMessage } from "../../api/apiError";
import Button from "./Button";

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
};

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const traceId = error instanceof ApiError ? error.traceId : undefined;

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-card border-[1.5px] border-danger/40 bg-white px-6 py-10 text-center"
    >
      <TriangleAlert aria-hidden="true" className="mb-1 size-10 text-danger" strokeWidth={1.5} />
      <p className="font-medium text-ink">{getErrorMessage(error)}</p>
      {traceId && (
        <p className="text-xs text-ink/50" dir="ltr">
          קוד תקלה: {traceId}
        </p>
      )}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-3">
          נסי שוב
        </Button>
      )}
    </div>
  );
}