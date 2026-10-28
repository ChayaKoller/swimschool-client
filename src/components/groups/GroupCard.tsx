import clsx from "clsx";
import { Banknote, CalendarDays } from "lucide-react";
import { Link } from "react-router";
import { formatMoney } from "../../lib/format";
import { seasonLabels } from "../../lib/labels";
import type { GroupDto } from "../../types/typesDtos";
import Badge from "../ui/Badge";
import OccupancyBar from "./OccupancyBar";

export type GroupCardProps = {
  group: GroupDto;
};

function lessonsLabel(count: number) {
  return count === 1 ? "שיעור אחד" : `${count} שיעורים`;
}

export default function GroupCard({ group }: GroupCardProps) {
  const isFull = group.freeSpots === 0;

  return (
    <Link
      to={`/groups/${group.id}`}
      className={clsx("group flex flex-1 flex-col gap-4 rounded-card border-[1.5px] border-line bg-white p-5 transition",
        "hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        !group.isActive && "bg-page",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-extrabold text-line group-hover:text-primary-text">{group.name}</h3>
          <p className="text-sm font-medium text-ink">
            {seasonLabels[group.season]} {group.year}
          </p>
        </div>

        {(isFull || !group.isActive) && (
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {isFull && <Badge tone="danger">מלאה</Badge>}
            {!group.isActive && <Badge tone="neutral">לא פעילה</Badge>}
          </div>
        )}
      </div>

      <OccupancyBar enrolled={group.enrolledCount} max={group.maxStudents} />

      <div className="mt-auto flex items-center gap-4 border-t border-line/15 pt-3 text-sm text-line">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-primary" aria-hidden />
          {lessonsLabel(group.lessonsCount)}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
          <Banknote className="size-4 text-primary" aria-hidden />
          {formatMoney(group.price)}
        </span>
      </div>
    </Link>
  );
}