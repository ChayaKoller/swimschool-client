import { ArrowRight, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getErrorMessage, isNotFound } from "../api/apiError";
import { useGroupAttendance, useSaveGroupAttendance } from "../api/attendance/hook";
import AttendanceGrid from "../components/attendance/AttendanceGrid";
import UnsavedChangesGuard from "../components/form/UnsavedChangesGuard";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../context/useToast";
import { cellKey, nextMark } from "../lib/attendance";
import useGoBack from "../lib/useGoBack";
import type { GridCellDto, GridRowDto } from "../types/typesDtos";

export default function GroupAttendancePage() {
  const { id } = useParams();
  const groupId = Number(id);
  const groupAttendance = useGroupAttendance(groupId);
  const saveGroupAttendance = useSaveGroupAttendance();
  const toast = useToast();
  const goBack = useGoBack(`/groups/${groupId}`);
  const navigate = useNavigate();


  const [changes, setChanges] = useState<Map<string, boolean>>(new Map());

  const backButton = (
    <Button variant="ghost" onClick={goBack} icon={<ArrowRight />} className="-ms-3 mb-2 self-start">
      חזרה לקבוצה
    </Button>
  );

  if (groupAttendance.isPending) return <LoadingState label="טוען את טבלת הנוכחות" />;

  if (groupAttendance.isError) {
    return isNotFound(groupAttendance.error) ? (
      <EmptyState
        title="הקבוצה לא נמצאה"
        description="ייתכן שהיא נמחקה."
        action={
          <Button variant="secondary" onClick={() => navigate("/groups")}>
            לכל הקבוצות
          </Button>
        }
      />
    ) : (
      <ErrorState error={groupAttendance.error} onRetry={() => groupAttendance.refetch()} />
    );
  }

  function toggle(row: GridRowDto, cell: GridCellDto) {
    const key = cellKey(row.enrollmentId, cell.lessonId);
    setChanges((prev) => {
      const next = new Map(prev);
      const value = nextMark(prev.get(key) ?? cell.wasPresent, cell.wasPresent);
      if (value === cell.wasPresent) next.delete(key); // חזרה לערך המקורי = אין שינוי
      else next.set(key, value as boolean);
      return next;
    });
  }

  const grid = groupAttendance.data;

  const changedItems = grid.rows.flatMap((row) =>
    row.cells.flatMap((cell) => {
      const value = changes.get(cellKey(row.enrollmentId, cell.lessonId));
      return value === undefined ? [] : [{ lessonId: cell.lessonId, enrollmentId: row.enrollmentId, wasPresent: value }];
    }),
  );
  const changedCount = changedItems.length;

  function save() {
    saveGroupAttendance.mutate(
      { groupId, body: { items: changedItems } },
      {
        onSuccess: () => {
          toast.success("הנוכחות נשמרה");
          setChanges(new Map());
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="flex flex-col">
      {backButton}

      <PageHeader title={`נוכחות: ${grid.groupName}`} />

      {grid.lessons.length === 0 ? (
        <EmptyState title="אין שיעורים בקבוצה" />
      ) : grid.rows.length === 0 ? (
        <EmptyState title="אין תלמידות רשומות לקבוצה הזו" />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-lg font-bold text-ink">טבלת נוכחות</h2>
              <p className="text-sm text-ink/70">לחיצה על תא מחליפה: ריק ← נכחה ← נעדרה.</p>
            </div>
            <AttendanceGrid grid={grid} changes={changes} onToggle={toggle} />
          </section>

        
          {changedCount > 0 && (
            <div className="sticky bottom-0 mt-6 flex flex-col gap-2 rounded-card border-[1.5px] border-line bg-white p-3 shadow-hard sm:flex-row sm:items-center sm:justify-end">
              <p className="text-sm font-medium text-ink sm:me-auto">
                {changedCount === 1 ? "שינוי אחד שעוד לא נשמר" : `${changedCount} שינויים שעוד לא נשמרו`}
              </p>
              <Button
                variant="secondary"
                icon={<RotateCcw />}
                onClick={() => setChanges(new Map())}
                disabled={saveGroupAttendance.isPending}
              >
                ביטול שינויים
              </Button>
              <Button icon={<Save />} onClick={save} isLoading={saveGroupAttendance.isPending}>
                {changedCount === 1 ? "שמירת שינוי אחד" : `שמירת ${changedCount} שינויים`}
              </Button>
            </div>
          )}
        </>
      )}

      <UnsavedChangesGuard when={changedCount > 0} />
    </div>
  );
}