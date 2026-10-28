import clsx from "clsx";

// מסלולי שחייה: שלושה פסים צבעוניים שמתמלאים מימין, וחבלי מסלול שזזים ביניהם.
// הגודל נקבע מבחוץ ברוחב בלבד (למשל w-56).
const lanes = [
  { y: 14, width: 170, color: "#1890a8", delay: "0.2s" },
  { y: 62, width: 120, color: "#ef5b95", delay: "0.45s" },
  { y: 110, width: 200, color: "#f07860", delay: "0.7s" },
];

const ropes = [50, 98];

type PoolLanesProps = {
  className?: string;
};

export default function PoolLanes({ className }: PoolLanesProps) {
  return (
    <svg viewBox="0 0 232 144" aria-hidden="true" className={clsx("overflow-visible", className)}>
      {lanes.map((lane) => (
        <g key={lane.y}>
          <rect x="6" y={lane.y} width="220" height="24" rx="12" fill="#ffffffb3" stroke="#14141f" strokeWidth="1.5" />
          <rect
            x={226 - lane.width}
            y={lane.y}
            width={lane.width}
            height="24"
            rx="12"
            fill={lane.color}
            stroke="#14141f"
            className="origin-right animate-grow [transform-box:fill-box]"
            strokeWidth="1.5"
            style={{ animationDelay: lane.delay }}
          />
        </g>
      ))}

      {ropes.map((y) => (
        <line
          key={y}
          x1="14"
          x2="218"
          y1={y}
          y2={y}
          stroke="#c078d8"
          className="animate-rope"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="0 12"
        />
      ))}
    </svg>
  );
}
