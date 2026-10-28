import clsx from "clsx";
import { Waves } from "lucide-react";

// טבעת צבעונית שקופה, בלי לוח ובלי רקע: כל קטע נמתח בתורו, והטבעת כולה מסתובבת לאט.
// הגודל נקבע מבחוץ ברוחב בלבד (למשל w-32), והכל בפנים גדל ביחד איתו.
const segments = [
  { color: "#1890a8", start: 0, length: 33, delay: "0s" },
  { color: "#ef5b95", start: 35, length: 25, delay: "0.25s" },
  { color: "#f07860", start: 62, length: 17, delay: "0.5s" },
  { color: "#8a6fd8", start: 81, length: 17, delay: "0.75s" },
];

type PoolIllustrationProps = {
  className?: string;
};

export default function PoolIllustration({ className }: PoolIllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={clsx("aspect-square overflow-visible", className)}>
      <g className="origin-center animate-[spin_48s_linear_infinite] [transform-box:fill-box]">
        {/* קו שחור דק מבחוץ ומבפנים, כמו בשאר המערכת */}
        <circle cx="100" cy="100" r="85" fill="none" stroke="#14141f" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="55" fill="none" stroke="#14141f" strokeWidth="1.5" />
        {segments.map((s) => (
          <circle
            key={s.color}
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke={s.color}
            strokeWidth="24"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${s.length} ${100 - s.length}`}
            strokeDashoffset={-s.start}
            className="animate-draw"
            style={{ animationDelay: s.delay }}
          />
        ))}
      </g>

      {/* עיגול לבן עם גלים באמצע */}
      <circle cx="100" cy="100" r="34" fill="#ffffff" stroke="#14141f" strokeWidth="1.5" />
      <Waves x="80" y="80" width="40" height="40" strokeWidth={2.2} className="text-primary" />
    </svg>
  );
}
