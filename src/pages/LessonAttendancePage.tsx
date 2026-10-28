import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowRight, CheckCheck, Info } from "lucide-react";
import { useLessonAttendance, useSaveLessonAttendance } from "../api/attendance/hook";
import { getErrorMessage, isNotFound } from "../api/apiError";
import { useToast } from "../context/useToast";
import { formatLessonTime, isFuture } from "../lib/format";
import useGoBack from "../lib/useGoBack";
import type { LessonAttendanceStudentDto } from "../types/typesDtos";
import AttendanceRow from "../components/attendance/AttendanceRow";
import UnsavedChangesGuard from "../components/form/UnsavedChangesGuard";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

export default function LessonAttendancePage() {
  const { id } = useParams();
  const lessonId = Number(id);
  const lessonAttendance = useLessonAttendance(lessonId);
  const saveLessonAttendance = useSaveLessonAttendance();
  const toast = useToast();
  const goBack = useGoBack("/schedule");
  const navigate = useNavigate();

 
  const [changes, setChanges] = useState<Map<number, boolean>>(new Map());

  // מה שמוצג: הלחיצה של המורה, ואם אין, מה שהגיע מהשרת
  const current = (s: LessonAttendanceStudentDto) => changes.get(s.enrollmentId) ?? s.wasPresent;

  function mark(s: LessonAttendanceStudentDto, value: boolean) {
    setChanges((prev) => {
      const next = new Map(prev);
      if (value === s.wasPresent) next.delete(s.enrollmentId); // חזרה למה שהיה = אין שינוי
      else next.set(s.enrollmentId, value);
      return next;
    });
  }

  const backButton = (
    <Button variant="ghost" onClick={goBack} icon={<ArrowRight />} className="-ms-3 mb-2 self-start">
      חזרה
    </Button>
  );

  if (lessonAttendance.isPending) return <LoadingState label="טוען את השיעור" />;

  if (lessonAttendance.isError) {
    return isNotFound(lessonAttendance.error) ? (
      <EmptyState
        title="השיעור לא נמצא"
        description="ייתכן שהוא נמחק."
        action={
          <Button variant="secondary" onClick={() => navigate("/schedule")}>
            למערכת השעות
          </Button>
        }
      />
    ) : (
      <ErrorState error={lessonAttendance.error} onRetry={() => lessonAttendance.refetch()} />
    );
  }

  const lesson = lessonAttendance.data;
  const isFutureLesson = isFuture(lesson.startTime);
  const students = [...lesson.students].sort((a, b) => a.fullName.localeCompare(b.fullName, "he"));
  const presentCount = students.filter((s) => current(s) === true).length;
  const items = students
    .map((s) => ({ enrollmentId: s.enrollmentId, wasPresent: current(s) }))
    .filter((item): item is { enrollmentId: number; wasPresent: boolean } => item.wasPresent !== null);

  function markAllPresent() {
    setChanges(new Map(students.filter((s) => s.wasPresent !== true).map((s) => [s.enrollmentId, true])));
  }

  function save() {
    saveLessonAttendance.mutate(
      { lessonId: lesson.lessonId, tookPlace: true, items },
      {
        onSuccess: () => {
          toast.success("הנוכחות נשמרה");
          goBack();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="flex flex-col">
      {backButton}

      <PageHeader title={lesson.groupName} />
      <p className="-mt-3 mb-6 text-sm font-medium text-ink/70 tabular-nums">{formatLessonTime(lesson.startTime)}</p>

      {isFutureLesson && (
        <p
          role="status"
          className="mb-4 flex items-center gap-2 rounded-card border-[1.5px] border-coral/50 bg-coral/10 px-4 py-3 text-sm font-medium text-[#b84a33]"
        >
          <Info aria-hidden className="size-4 shrink-0" />
          אי אפשר לסמן נוכחות לשיעור שעוד לא התקיים.
        </p>
      )}

      {students.length === 0 ? (
        <EmptyState title="אין תלמידות רשומות לקבוצה הזו" />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-ink tabular-nums">
              נכחו {presentCount} מתוך {students.length}
            </p>
            <Button variant="secondary" icon={<CheckCheck />} onClick={markAllPresent} disabled={isFutureLesson}>
              כולן נכחו
            </Button>
          </div>

          <ul className="flex flex-col gap-2">
            {students.map((s) => (
              <AttendanceRow
                key={s.enrollmentId}
                fullName={s.fullName}
                value={current(s)}
                onChange={(value) => mark(s, value)}
                disabled={isFutureLesson}
              />
            ))}
          </ul>

          <div className="sticky bottom-0 mt-6 flex flex-col gap-2 rounded-card border-[1.5px] border-line bg-white p-3 shadow-hard sm:flex-row sm:items-center sm:justify-end">
            {items.length === 0 && !isFutureLesson && (
              <p className="text-sm text-ink/70 sm:me-auto">יש לסמן לפחות תלמידה אחת.</p>
            )}
            <Button
              onClick={save}
              isLoading={saveLessonAttendance.isPending}
              disabled={isFutureLesson || items.length === 0}
              className="w-full sm:w-auto"
            >
              שמירת נוכחות
            </Button>
          </div>
        </>
      )}

      <UnsavedChangesGuard
        when={changes.size > 0 && !saveLessonAttendance.isPending && !saveLessonAttendance.isSuccess}
      />
    </div>
  );
}