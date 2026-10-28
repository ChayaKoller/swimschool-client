import type { KeyboardEvent, ReactNode } from "react";
import clsx from "clsx";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  mobileCard?: (row: T) => ReactNode;
  footer?: ReactNode;
};

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  mobileCard,
  footer,
}: DataTableProps<T>) {
  // אותן תכונות לחיצה לשורה בטבלה ולכרטיס בטלפון
  const clickProps = (row: T) =>
    onRowClick
      ? {
          onClick: () => onRowClick(row),
          tabIndex: 0,
          onKeyDown: (event: KeyboardEvent) => {
            if (event.key === "Enter") onRowClick(row);
          },
        }
      : {};

  const clickableClasses = onRowClick && "cursor-pointer transition-colors hover:bg-page focus-visible:bg-page focus-visible:-outline-offset-2";

  return (
    <div className="overflow-hidden rounded-card border-[1.5px] border-line bg-white">
      <div className={clsx("overflow-x-auto", mobileCard && "hidden md:block")}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-[1.5px] border-line bg-page/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-start text-xs font-bold tracking-wide whitespace-nowrap text-slate-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="[&>tr:last-child]:border-b-0">
            {rows.map((row) => (
              <tr key={getRowKey(row)} {...clickProps(row)} className={clsx("border-b border-line/10", clickableClasses)}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle text-slate-800">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mobileCard && (
        <ul className="divide-y divide-line/10 md:hidden">
          {rows.map((row) => (
            <li key={getRowKey(row)} {...clickProps(row)} className={clsx("px-4 py-3", clickableClasses)}>
              {mobileCard(row)}
            </li>
          ))}
        </ul>
      )}

      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-4 border-t-[1.5px] border-line bg-page/60 px-4 py-3 text-sm font-semibold text-line">
          {footer}
        </div>
      )}
    </div>
  );
}