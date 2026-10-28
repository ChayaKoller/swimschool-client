import clsx from "clsx";
import { Check, X } from "lucide-react";

export type AttendanceRowProps = {
  fullName: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled: boolean;
};


const buttonClasses =
  "inline-flex min-h-11 min-w-24 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-line bg-white px-4 text-sm font-semibold text-line transition aria-[pressed=false]:hover:bg-page disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

export default function AttendanceRow({ fullName, value, onChange, disabled }: AttendanceRowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-card border-[1.5px] border-line bg-white px-4 py-3">
      <span className="min-w-0 flex-1 truncate font-semibold text-line">{fullName}</span>

      <div role="group" aria-label={`נוכחות של ${fullName}`} className="flex shrink-0 gap-2">
        <button
          type="button"
          aria-pressed={value === true}
          disabled={disabled}
          onClick={() => onChange(true)}
          className={clsx(buttonClasses, "aria-pressed:border-success aria-pressed:bg-success aria-pressed:text-white")}
        >
          <Check aria-hidden />
          נכחה
        </button>
        <button
          type="button"
          aria-pressed={value === false}
          disabled={disabled}
          onClick={() => onChange(false)}
          className={clsx(buttonClasses, "aria-pressed:border-danger aria-pressed:bg-danger aria-pressed:text-white")}
        >
          <X aria-hidden />
          נעדרה
        </button>
      </div>
    </li>
  );
}
