import clsx from "clsx";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useStudents } from "../api/students/hook";
import { STUDENT_FILTER_DEFAULTS } from "../api/students/schema";

import useDebounce from "../lib/useDebounce";
import useUrlFilters from "../lib/useUrlFilters";
import { formatMoney } from "../lib/format";
import { healthFundLabels } from "../lib/labels";
import type { StudentListItemDto } from "../types/typesDtos";
import PageHeader from "../components/layout/PageHeader";
import StudentFilters from "../components/students/StudentFilters";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import DataTable, { type Column } from "../components/ui/DataTable";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { useGroups } from "../api/groups/hook";

const PAGE_SIZE = 20;


function renderOwed(s: StudentListItemDto) {
  return s.amountOwed === 0 ? (
    <Badge tone="success">שולם</Badge>
  ) : (
    <span className="font-semibold whitespace-nowrap text-danger">{formatMoney(s.amountOwed)}</span>
  );
}

const studentColumns: Column<StudentListItemDto>[] = [
  { key: "fullName", header: "שם מלא", render: (s) => <span className="font-semibold text-line">{s.fullName}</span> },
  { key: "identityNumber", header: 'ת"ז', render: (s) => <span className="tabular-nums">{s.identityNumber}</span> },
  {
    key: "phone",
    header: "טלפון",
    render: (s) => (
      <a
        href={`tel:${s.phone}`}
        dir="ltr"
        onClick={(e) => e.stopPropagation()}
        className="tabular-nums hover:text-primary-text hover:underline"
      >
        {s.phone}
      </a>
    ),
  },
  { key: "healthFund", header: "קופה", render: (s) => <Badge tone="info">{healthFundLabels[s.healthFund]}</Badge> },
  { key: "amountOwed", header: "חוב", render: renderOwed },
  {
    key: "absencesCount",
    header: "היעדרויות",
    render: (s) => (
      <span className={clsx("tabular-nums", s.absencesCount >= 3 && "font-bold text-danger")}>{s.absencesCount}</span>
    ),
  },
];

const statusColumn: Column<StudentListItemDto> = {
  key: "isActive",
  header: "מצב",
  render: (s) => (s.isActive ? null : <Badge tone="neutral">בארכיון</Badge>),
};

export default function StudentsPage() {
  const navigate = useNavigate();
  const { values, page, setFilter, setPage, clearFilters, hasFilters } = useUrlFilters(STUDENT_FILTER_DEFAULTS);
  const debouncedName = useDebounce(values.name);

  const students = useStudents({
    name: debouncedName || undefined,
    groupId: values.groupId ? Number(values.groupId) : undefined,
    onlyUnpaid: values.onlyUnpaid === "true" || undefined,
    absentMoreThan: values.absent === "true" ? 2 : undefined,
    includeInactive: values.includeInactive === "true" || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const groups = useGroups({ isActive: true, page: 1, pageSize: 100 });
  const groupOptions = groups.data?.items.map((g) => ({ value: String(g.id), label: g.name ?? "" })) ?? [];

  const columns = values.includeInactive === "true" ? [...studentColumns, statusColumn] : studentColumns;
  const goToNew = () => navigate("/students/new");

  function renderContent() {
    if (students.isPending) return <Skeleton rows={8} />;

    if (students.isError) return <ErrorState error={students.error} onRetry={() => students.refetch()} />;

    const { items, totalCount, totalPages } = students.data;

    if (items.length === 0) {
      return hasFilters ? (
        <EmptyState
          title="לא נמצאו תלמידות שמתאימות לחיפוש"
          description="אפשר לשנות את הסינונים או לנקות אותם."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              ניקוי סינונים
            </Button>
          }
        />
      ) : (
        <EmptyState
          title="עוד אין תלמידות"
          description="כאן יופיעו כל התלמידות שלך, עם החוב וההיעדרויות של כל אחת."
          action={
            <Button onClick={goToNew} icon={<Plus />}>
              הוספת תלמידה ראשונה
            </Button>
          }
        />
      );
    }

    return (
      <>
        <p className="mb-3 text-sm text-slate-600">
          {totalCount === 1 ? (
            "נמצאה תלמידה אחת"
          ) : (
            <>
              נמצאו <span className="font-bold text-line tabular-nums">{totalCount}</span> תלמידות
            </>
          )}
        </p>

        <div className={clsx("transition-opacity", students.isPlaceholderData && "opacity-60")}>
          <DataTable
            columns={columns}
            rows={items}
            getRowKey={(s) => s.id}
            onRowClick={(s) => navigate(`/students/${s.id}`)}
            mobileCard={(s) => (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-line">{s.fullName}</p>
                  <p dir="ltr" className="text-end text-sm text-slate-500 tabular-nums">
                    {s.phone}
                  </p>
                </div>
                <div className="shrink-0">{renderOwed(s)}</div>
              </div>
            )}
          />
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="תלמידות"
        actions={
          <Button onClick={goToNew} icon={<Plus />}>
            תלמידה חדשה
          </Button>
        }
      />

      <StudentFilters
        values={values}
        onChange={setFilter}
        onClear={clearFilters}
        hasFilters={hasFilters}
        groupOptions={groupOptions}
      />

      {renderContent()}
    </div>
  );
}