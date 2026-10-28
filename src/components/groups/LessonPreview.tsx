import { CalendarDays } from "lucide-react";
import { formatLocalLessonTime } from "../../lib/format";

export type LessonPreviewProps = {
  times: string[];
};

const MAX_SHOWN = 6;

export default function LessonPreview({ times }: LessonPreviewProps) {
  if (times.length === 0) {
    return (
      <div className="rounded-control border-[1.5px] border-dashed border-line/20 px-4 py-6 text-center text-sm text-ink/50">
        המועדים יופיעו כאן
      </div>
    );
  }

  const isLong = times.length > MAX_SHOWN + 1;
  const shown = isLong ? times.slice(0, MAX_SHOWN) : times; // 6 הראשונים, או הכל אם הרשימה קצרה
  const last = times[times.length - 1];

  return (
    <div className="flex flex-col gap-3 rounded-control border-[1.5px] border-line/15 bg-page/50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
        {times.length === 1 ? "ייווצר שיעור אחד" : `ייווצרו ${times.length} שיעורים`}
      </p>

      <ol className="flex list-decimal flex-col gap-1 ps-6 text-sm text-line tabular-nums marker:text-xs marker:font-bold marker:text-ink/50">
        {shown.map((time, index) => (
          <li key={index}>{formatLocalLessonTime(time)}</li>
        ))}
        {isLong && (
          <li aria-hidden="true" className="list-none text-ink/40">
            …
          </li>
        )}
        {isLong && <li value={times.length}>{formatLocalLessonTime(last)}</li>}
      </ol>
    </div>
  );
}