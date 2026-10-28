import clsx from "clsx";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useGroups } from "../api/groups/hook";
import { GROUP_FILTER_DEFAULTS } from "../api/groups/schema";
import { isSeason } from "../lib/labels";
import useDebounce from "../lib/useDebounce";
import useUrlFilters from "../lib/useUrlFilters";
import PageHeader from "../components/layout/PageHeader";
import GroupCard from "../components/groups/GroupCard";
import GroupFilters from "../components/groups/GroupFilters";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";

const PAGE_SIZE = 12;

export default function GroupsPage() {
  const navigate = useNavigate();
  const { values, page, setFilter, setPage, clearFilters, hasFilters } = useUrlFilters(GROUP_FILTER_DEFAULTS);
  const debouncedName = useDebounce(values.name);

  const groups = useGroups({
    name: debouncedName || undefined,
    season: isSeason(values.season) ? values.season : undefined,
    year: values.year === "all" ? undefined : Number(values.year),
    isActive: values.status === "all" ? undefined : values.status === "active",
    page,
    pageSize: PAGE_SIZE,
  });

  const goToNew = () => navigate("/groups/new");

  function renderContent() {
    if (groups.isPending) return <Skeleton rows={6} />;

    if (groups.isError) return <ErrorState error={groups.error} onRetry={() => groups.refetch()} />;

    const { items, totalCount, totalPages } = groups.data;

    if (items.length === 0) {
      return hasFilters ? (
        <EmptyState
          title="לא נמצאו קבוצות שמתאימות לחיפוש"
          description="אפשר לשנות את הסינונים או לנקות אותם."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              ניקוי סינונים
            </Button>
          }
        />
      ) : (
        <EmptyState
          title={`אין קבוצות פעילות ב-${values.year}`}
          description="כאן יופיעו הקבוצות שלך, עם התפוסה של כל אחת."
          action={
            <Button onClick={goToNew} icon={<Plus />}>
              קבוצה חדשה
            </Button>
          }
        />
      );
    }

    return (
      <>
        <p className="mb-3 text-sm text-slate-600">
          {totalCount === 1 ? (
            "נמצאה קבוצה אחת"
          ) : (
            <>
              נמצאו <span className="font-bold text-line tabular-nums">{totalCount}</span> קבוצות
            </>
          )}
        </p>

        <ul
          className={clsx(
            "grid gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-3",
            groups.isPlaceholderData && "opacity-60",
          )}
        >
          {items.map((group) => (
            <li key={group.id} className="flex">
              <GroupCard group={group} />
            </li>
          ))}
        </ul>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="קבוצות"
        actions={
          <Button onClick={goToNew} icon={<Plus />}>
            קבוצה חדשה
          </Button>
        }
      />

      <GroupFilters values={values} onChange={setFilter} onClear={clearFilters} hasFilters={hasFilters} />

      {renderContent()}
    </div>
  );
}