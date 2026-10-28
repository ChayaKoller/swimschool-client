import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

export type StatLinkProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  count: number | undefined;
  isError: boolean;
};

export default function StatLink({ to, label, icon: Icon, count, isError }: StatLinkProps) {
  function renderCount() {
    if (isError) return <span title="לא הצלחנו לטעון. לחיצה תפתח את הרשימה">—</span>;
    if (count === undefined) {
      return (
        <>
          <span aria-hidden="true">…</span>
          <span className="sr-only">טוען</span>
        </>
      );
    }
    return count;
  }

  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-card border-[1.5px] border-line bg-white p-4 shadow-hard transition hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-line bg-pink/20 text-line">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-3xl leading-none font-extrabold text-line tabular-nums">{renderCount()}</span>
        <span className="mt-1 truncate text-sm font-medium text-ink/70">{label}</span>
      </span>
    </Link>
  );
}