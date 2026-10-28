import type { ReactNode } from "react";

export type DetailListProps = {
  items: { label: string; value: ReactNode }[];
};

function isEmpty(value: ReactNode) {
  return value === null || value === undefined || value === "";
}

export default function DetailList({ items }: DetailListProps) {
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs font-semibold text-slate-500">{item.label}</dt>
          <dd className="mt-1 text-sm font-medium break-words text-line">
            {isEmpty(item.value) ? <span className="text-slate-400">—</span> : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}