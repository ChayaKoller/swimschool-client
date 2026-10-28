import clsx from "clsx";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useReports } from "../api/reports/hook";
import { REPORT_FILTER_DEFAULTS } from "../api/reports/schema";
import useDebounce from "../lib/useDebounce";
import useUrlFilters from "../lib/useUrlFilters";
import { isHealthFund } from "../lib/labels";
import PageHeader from "../components/layout/PageHeader";
import ReportFilters from "../components/reports/ReportFilters";
import ReportsTable from "../components/reports/ReportsTable";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";

const PAGE_SIZE = 20;

export default function ReportsPage() {
  const navigate = useNavigate();
  const { values, page, setFilter, setPage, clearFilters, hasFilters } = useUrlFilters(REPORT_FILTER_DEFAULTS);
  const debouncedSearch = useDebounce(values.search);

  // טווח הפוך לא נשלח לשרת. ההודעה מופיעה ליד "עד תאריך"
  const rangeInvalid = values.fromDate !== "" && values.toDate !== "" && values.fromDate > values.toDate;

  const reports = useReports({
    search: debouncedSearch || undefined,
    healthFund: isHealthFund(values.healthFund) ? values.healthFund : undefined,
    fromDate: rangeInvalid ? undefined : values.fromDate || undefined,
    toDate: rangeInvalid ? undefined : values.toDate || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const goToNew = () => navigate("/reports/new");

  function renderContent() {
    if (reports.isPending) return <Skeleton rows={8} />;

    if (reports.isError) return <ErrorState error={reports.error} onRetry={() => reports.refetch()} />;

    const { items, totalCount, totalPages } = reports.data;

    if (items.length === 0) {
      return hasFilters ? (
        <EmptyState
          title="לא נמצאו דוחות שמתאימים לחיפוש"
          description="אפשר לשנות את הסינונים או לנקות אותם."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              ניקוי סינונים
            </Button>
          }
        />
      ) : (
        <EmptyState
          title="עוד לא הופקו דוחות"
          description="דוח לקופה מפיקים מכאן, או מדף התלמידה."
          action={
            <Button onClick={goToNew} icon={<Plus />}>
              דוח חדש
            </Button>
          }
        />
      );
    }

    return (
      <>
        <p className="mb-3 text-sm text-slate-600">
          {totalCount === 1 ? (
            "נמצא דוח אחד"
          ) : (
            <>
              נמצאו <span className="font-bold text-line tabular-nums">{totalCount}</span> דוחות
            </>
          )}
        </p>

        <div className={clsx("transition-opacity", reports.isPlaceholderData && "opacity-60")}>
          <ReportsTable reports={items} showStudent />
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="דוחות לקופות"
        actions={
          <Button onClick={goToNew} icon={<Plus />}>
            דוח חדש
          </Button>
        }
      />

      <ReportFilters
        values={values}
        onChange={setFilter}
        onClear={clearFilters}
        hasFilters={hasFilters}
        rangeInvalid={rangeInvalid}
      />

      {renderContent()}
    </div>
  );
}