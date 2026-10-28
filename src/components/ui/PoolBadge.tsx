import clsx from "clsx";
import { Check } from "lucide-react";

// תגית קטנה אחת שצפה ברקע: וי בעיגול, כרטיס עם עמודים זזים, או עוגה.
// המיקום והגודל נקבעים מבחוץ (למשל "absolute top-[12%] start-[8%] w-12").
type PoolBadgeProps = {
  kind: "check" | "bars" | "pie";
  className?: string;
};

const bars = [
  { x: 14, height: 14, color: "#1890a8", delay: "0s" },
  { x: 27, height: 22, color: "#ef5b95", delay: "-0.8s" },
  { x: 40, height: 17, color: "#f07860", delay: "-1.6s" },
];

export default function PoolBadge({ kind, className }: PoolBadgeProps) {
  const svgClass = clsx("overflow-visible", className);

  if (kind === "check") {
    return (
      <svg viewBox="0 0 44 44" aria-hidden="true" className={svgClass}>
        <circle cx="22" cy="22" r="21" fill="#1890a8" stroke="#14141f" strokeWidth="1.5" />
        <Check x="10" y="10" width="24" height="24" strokeWidth={3} className="text-white" />
      </svg>
    );
  }

  if (kind === "bars") {
    return (
      <svg viewBox="0 0 62 46" aria-hidden="true" className={svgClass}>
        <rect x="0.75" y="0.75" width="60.5" height="44.5" rx="12" fill="#ffffff" stroke="#14141f" strokeWidth="1.5" />
        {bars.map((b) => (
          <rect
            key={b.x}
            x={b.x}
            y={36 - b.height}
            width="8"
            height={b.height}
            rx="3"
            fill={b.color}
            className="origin-bottom animate-bars [transform-box:fill-box]"
            style={{ animationDelay: b.delay }}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={svgClass}>
      <circle cx="24" cy="24" r="23" fill="#f07860" />
      <circle
        cx="24"
        cy="24"
        r="11.5"
        fill="none"
        stroke="#ef5b95"
        strokeWidth="23"
        pathLength="100"
        strokeDasharray="38 62"
        transform="rotate(-90 24 24)"
      />
      <circle cx="24" cy="24" r="23" fill="none" stroke="#14141f" strokeWidth="1.5" />
    </svg>
  );
}
