import clsx from "clsx";

const MANY_ABSENCES = 3;

export default function AbsencesCount({ count }: { count: number }) {
  return <span className={clsx("tabular-nums", count >= MANY_ABSENCES && "font-bold text-danger")}>{count}</span>;
}