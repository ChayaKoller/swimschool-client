import { Trash2, UserPlus, Wallet } from "lucide-react";
import { Link } from "react-router";
import { formatMoney } from "../../lib/format";
import { seasonLabels } from "../../lib/labels";
import type { StudentGroupDto } from "../../types/typesDtos";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import DataTable, { type Column } from "../ui/DataTable";
import EmptyState from "../ui/EmptyState";

type StudentGroupsTableProps = {
  groups: StudentGroupDto[];
  onUpdatePayment: (row: StudentGroupDto) => void;
  onCancel: (row: StudentGroupDto) => void;
  onEnroll?: () => void;
};

const balanceOf = (g: StudentGroupDto) => g.amountDue - g.amountPaid;

function actionsColumn(
  onUpdatePayment: (row: StudentGroupDto) => void,
  onCancel: (row: StudentGroupDto) => void,
): Column<StudentGroupDto> {
  return {
    key: "actions",
    header: "פעולות",
    render: (g) => (
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Button
          variant="ghost"
          icon={<Wallet />}
          aria-label={`עדכון תשלום ב${g.groupName}`}
          onClick={() => onUpdatePayment(g)}
          className="min-h-8 px-2.5"
        >
          עדכון תשלום
        </Button>
        <Button
          variant="ghost"
          icon={<Trash2 />}
          aria-label={`ביטול הרישום ל${g.groupName}`}
          onClick={() => onCancel(g)}
          className="min-h-8 px-2.5 text-danger hover:bg-danger/10"
        >
          ביטול רישום
        </Button>
      </div>
    ),
  };
}

const baseColumns: Column<StudentGroupDto>[] = [
  {
    key: "groupName",
    header: "קבוצה",
    render: (g) => (
      <Link
        to={`/groups/${g.groupId}`}
        onClick={(e) => e.stopPropagation()}
        className="font-semibold text-primary-text underline-offset-2 hover:underline"
      >
        {g.groupName}
      </Link>
    ),
  },
  { key: "season", header: "עונה ושנה", render: (g) => `${seasonLabels[g.season]} ${g.year}` },
  { key: "amountDue", header: "לתשלום", render: (g) => <span className="tabular-nums">{formatMoney(g.amountDue)}</span> },
  { key: "amountPaid", header: "שולם", render: (g) => <span className="tabular-nums">{formatMoney(g.amountPaid)}</span> },
  {
    key: "balance",
    header: "יתרה",
    render: (g) =>
      balanceOf(g) === 0 ? (
        <Badge tone="success">שולם ✓</Badge>
      ) : (
        <span className="font-semibold text-danger tabular-nums">{formatMoney(balanceOf(g))}</span>
      ),
  },
];

export default function StudentGroupsTable({ groups, onUpdatePayment, onCancel, onEnroll }: StudentGroupsTableProps) {
  const totalOwed = groups.reduce((sum, g) => sum + balanceOf(g), 0);
  const columns = [...baseColumns, actionsColumn(onUpdatePayment, onCancel)];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-ink">
        קבוצות ותשלומים <span className="text-sm font-medium text-ink/60 tabular-nums">({groups.length})</span>
      </h2>

      {groups.length === 0 ? (
        <EmptyState
          title="התלמידה לא רשומה לאף קבוצה"
          action={
            onEnroll && (
              <Button icon={<UserPlus />} onClick={onEnroll}>
                רישום לקבוצה
              </Button>
            )
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={groups}
          getRowKey={(g) => g.enrollmentId}
          footer={
            <>
              סה"כ חוב:{" "}
              <span className={totalOwed === 0 ? "font-semibold text-success" : "font-semibold text-danger tabular-nums"}>
                {totalOwed === 0 ? "אין חוב ✓" : formatMoney(totalOwed)}
              </span>
            </>
          }
        />
      )}
    </section>
  );
}