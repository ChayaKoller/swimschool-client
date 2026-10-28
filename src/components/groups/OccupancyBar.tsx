import clsx from "clsx";

export type OccupancyBarProps = {
  enrolled: number;
  max: number;
};

type OccupancyState = "open" | "few" | "full";

const stateText = {
  open: "text-success",
  few: "text-coral",
  full: "text-pink",
} satisfies Record<OccupancyState, string>;

function spotsLabel(free: number) {
  if (free === 0) return "מלאה";
  if (free === 1) return "מקום אחד פנוי";
  return `${free} מקומות פנויים`;
}

export default function OccupancyBar({ enrolled, max }: OccupancyBarProps) {
  const free = Math.max(0, max - enrolled);
  const percent = max > 0 ? Math.min(100, Math.round((enrolled / max) * 100)) : 100;
  const state: OccupancyState = free === 0 ? "full" : free <= 2 ? "few" : "open";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-bold text-line tabular-nums">
          {enrolled} מתוך {max}
        </span>
        <span className={clsx("text-xs font-semibold", stateText[state])}>{spotsLabel(free)}</span>
      </div>

      <div
        role="meter"
        aria-label="תפוסה"
        aria-valuenow={enrolled}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${enrolled} מתוך ${max}, ${spotsLabel(free)}`}
        className="h-2.5 overflow-hidden rounded-full border-[1.5px] border-line bg-white"
      >
        <div
          className={clsx(
            "h-full rounded-full transition-[width] duration-500",
            state === "full" ? "bg-pink" : "bg-inflate",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}