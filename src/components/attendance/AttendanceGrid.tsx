import clsx from "clsx";
import { Check, X } from "lucide-react";
import { cellKey } from "../../lib/attendance";
import { formatShortDate, formatTime, isFuture } from "../../lib/format";
import type { GridCellDto, GridRowDto, GroupAttendanceGridDto } from "../../types/typesDtos";
import Badge from "../ui/Badge";

export type AttendanceGridProps = {
  grid: GroupAttendanceGridDto;
  changes: Map<string, boolean>;
  onToggle: (row: GridRowDto, cell: GridCellDto) => void;
};

export default function AttendanceGrid({ grid, changes, onToggle }: AttendanceGridProps) {
  return (
    <div className="overflow-x-auto rounded-card border-[1.5px] border-line bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-[1.5px] border-line bg-page">
            <th
              scope="col"
              className="sticky start-0 z-10 border-e-[1.5px] border-line bg-page px-4 py-2 text-start text-xs font-bold whitespace-nowrap text-slate-500"
            >
              תלמידה
            </th>
            {grid.lessons.map((l) => (
              <th
                key={l.lessonId}
                scope="col"
                className={clsx(
                  "border-e border-line/15 px-2 py-2 text-xs font-bold whitespace-nowrap",
                  isFuture(l.startTime) ? "text-ink/40" : "text-line",
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="tabular-nums">{formatShortDate(l.startTime)}</span>
                  <span className="font-medium tabular-nums opacity-70">{formatTime(l.startTime)}</span>
                  {l.isMakeup && <Badge tone="info">השלמה</Badge>}
                </div>
              </th>
            ))}
            <th scope="col" className="px-4 py-2 text-center text-xs font-bold whitespace-nowrap text-slate-500">
              היעדרויות
            </th>
          </tr>
        </thead>

        <tbody>
          {grid.rows.map((row) => (
            <tr key={row.enrollmentId} className="border-b border-line/15 last:border-b-0">
              <th
                scope="row"
                className="sticky start-0 z-10 border-e-[1.5px] border-line bg-white px-4 text-start font-semibold whitespace-nowrap text-line"
              >
                {row.fullName}
              </th>

              {row.cells.map((cell, index) => {
                const lesson = grid.lessons[index];
                const key = cellKey(row.enrollmentId, cell.lessonId);
                const value = changes.get(key) ?? cell.wasPresent;
                const isChanged = changes.has(key);
                const locked = isFuture(lesson.startTime);
                const label = value === true ? "נכחה" : value === false ? "נעדרה" : "לא סומן";

                return (
                  <td
                    key={cell.lessonId}
                    className={clsx("h-11 min-w-12 border-e border-line/15 p-0", locked && "bg-page/70")}
                  >
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => onToggle(row, cell)}
                      aria-label={`${row.fullName}, ${formatShortDate(lesson.startTime)}: ${label}`}
                      className={clsx(
                        "flex size-full min-h-11 items-center justify-center transition focus-visible:-outline-offset-2 disabled:cursor-not-allowed [&_svg]:size-5",
                        isChanged ? "bg-pink/25 hover:bg-pink/35" : "enabled:hover:bg-primary/10",
                      )}
                    >
                      {value === true && <Check aria-hidden className="text-success" strokeWidth={2.5} />}
                      {value === false && <X aria-hidden className="text-danger" strokeWidth={2.5} />}
                    </button>
                  </td>
                );
              })}

              <td
                className={clsx(
                  "px-4 text-center font-bold tabular-nums",
                  row.absencesCount > 0 ? "text-danger" : "text-ink/40",
                )}
              >
                {row.absencesCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}