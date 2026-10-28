import { Link } from "react-router";
import type { GroupStudentDto } from "../../types/typesDtos";
import { formatMoney } from "../../lib/format";
import DataTable, { type Column } from "../ui/DataTable";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";

export type GroupStudentsTableProps = {
  students: GroupStudentDto[];
};

const columns: Column<GroupStudentDto>[] = [
  {
    key: "fullName",
    header: "שם",
    render: (s) => (
      <Link
        to={`/students/${s.id}`}
        onClick={(e) => e.stopPropagation()}
        className="font-semibold text-primary-text underline-offset-2 hover:underline"
      >
        {s.fullName}
      </Link>
    ),
  },
  {
    key: "amountOwed",
    header: "חוב",
    render: (s) =>
      s.amountOwed === 0 ? (
        <Badge tone="success">שולם</Badge>
      ) : (
        <span className="font-semibold text-danger tabular-nums">{formatMoney(s.amountOwed)}</span>
      ),
  },
];

export default function GroupStudentsTable({ students }: GroupStudentsTableProps) {
  const totalOwed = students.reduce((sum, s) => sum + s.amountOwed, 0);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-ink">
        תלמידות בקבוצה <span className="text-sm font-medium text-ink/60 tabular-nums">({students.length})</span>
      </h2>

      {students.length === 0 ? (
        <EmptyState title="אין עדיין תלמידות בקבוצה" />
      ) : (
        <DataTable
          columns={columns}
          rows={students}
          getRowKey={(s) => s.id}
          footer={
            <>
              סה"כ חוב בקבוצה:
              <span className={totalOwed === 0 ? "text-success" : "text-danger tabular-nums"}>
                {totalOwed === 0 ? "אין חוב ✓" : formatMoney(totalOwed)}
              </span>
            </>
          }
        />
      )}
    </section>
  );
}