import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowRight, ClipboardCheck, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { useGroup } from "../api/groups/hook";
import { useDeleteLesson } from "../api/lessons/hook";
import { getErrorMessage, isNotFound } from "../api/apiError";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { formatLessonTime, formatMoney } from "../lib/format";
import { seasonLabels } from "../lib/labels";
import useGoBack from "../lib/useGoBack";
import type { LessonDto } from "../types/typesDtos";
import PageHeader from "../components/layout/PageHeader";
import EnrollModal from "../components/enrollment/EnrollModal";
import AddLessonsModal from "../components/groups/AddLessonsModal";
import DeleteGroupDialog from "../components/groups/DeleteGroupDialog";
import GroupLessonsTable from "../components/groups/GroupLessonsTable";
import GroupStudentsTable from "../components/groups/GroupStudentsTable";
import MoveLessonModal from "../components/groups/MoveLessonModal";
import OccupancyBar from "../components/groups/OccupancyBar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import DetailList from "../components/ui/DetailList";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const groupId = Number(id);
  const group = useGroup(groupId);
  const deleteLesson = useDeleteLesson(groupId);
  const { user } = useAuth();
  const isTeacher = user?.role === "Teacher";
  const toast = useToast();
  const navigate = useNavigate();
  const goBack = useGoBack("/groups");

 
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [movingLesson, setMovingLesson] = useState<LessonDto | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonDto | null>(null);

  function confirmDeleteLesson() {
    if (!deletingLesson) return;
    deleteLesson.mutate(deletingLesson.lessonId, {
      onSuccess: () => {
        toast.success("השיעור נמחק");
        setDeletingLesson(null);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
        setDeletingLesson(null);
      },
    });
  }

  const backButton = (
    <Button variant="ghost" onClick={goBack} icon={<ArrowRight />} className="-ms-3 mb-2 self-start">
      חזרה לרשימה
    </Button>
  );

  if (group.isPending) return <LoadingState label="טוען את פרטי הקבוצה" />;

  if (group.isError) {
    return isNotFound(group.error) ? (
      <EmptyState
        title="הקבוצה לא נמצאה"
        description="ייתכן שהיא נמחקה."
        action={
          <Button variant="secondary" onClick={() => navigate("/groups")}>
            לרשימת הקבוצות
          </Button>
        }
      />
    ) : (
      <ErrorState error={group.error} onRetry={() => group.refetch()} />
    );
  }

  const g = group.data;
  const hasStudents = g.students.length > 0;

  // למה אי אפשר לרשום עכשיו. null = אפשר
  const enrollBlocked = !g.isActive
    ? "הקבוצה אינה פעילה."
    : g.freeSpots === 0
      ? "הקבוצה מלאה. כדי לרשום תלמידה נוספת, יש להעלות את מספר המקומות בעדכון הקבוצה, או לבטל רישום קיים."
      : null;

  const detailItems = [
    { label: "מחיר", value: <span className="tabular-nums">{formatMoney(g.price)}</span> },
    {
      label: "מספר שיעורים",
      value: <span className="tabular-nums">{g.lessonsCount === 1 ? "שיעור אחד" : `${g.lessonsCount} שיעורים`}</span>,
    },
    { label: "תפוסה", value: <OccupancyBar enrolled={g.enrolledCount} max={g.maxStudents} /> },
  ];

  return (
    <div className="flex flex-col">
      {backButton}

      <PageHeader
        title={g.name}
        actions={
          <>
            <Button icon={<UserPlus />} onClick={() => setEnrollOpen(true)} disabled={enrollBlocked !== null}>
              רישום תלמידה
            </Button>
            <Button variant="secondary" icon={<Pencil />} onClick={() => navigate(`/groups/${g.id}/edit`)}>
              עדכון
            </Button>
            {isTeacher && (
              <Button
                variant="ghost"
                icon={<Trash2 />}
                onClick={() => setDeleteOpen(true)}
                disabled={hasStudents}
                className="text-danger hover:bg-danger/10"
              >
                מחיקה
              </Button>
            )}
            {isTeacher && (
              <Button variant="secondary" icon={<ClipboardCheck />} onClick={() => navigate(`/groups/${g.id}/attendance`)}>
                טבלת נוכחות
              </Button>
            )}
          </>
        }
      />

      {/* שורת התגיות מתחת לשם, ומתחתיה ההסברים לכפתורים הנעולים */}
      <div className="-mt-3 mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info">
            {seasonLabels[g.season]} {g.year}
          </Badge>
          {!g.isActive && <Badge tone="neutral">לא פעילה</Badge>}
          {g.freeSpots === 0 && <Badge tone="danger">מלאה</Badge>}
        </div>
        {enrollBlocked && <p className="text-xs text-slate-500">{enrollBlocked}</p>}
        {isTeacher && hasStudents && (
          <p className="text-xs text-slate-500">כדי למחוק את הקבוצה, יש לבטל קודם את הרישום של התלמידות.</p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <Card title="פרטים">
          <DetailList items={detailItems} />
        </Card>

        <GroupStudentsTable students={g.students} />

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">
              שיעורים <span className="text-sm font-medium text-ink/60 tabular-nums">({g.lessons.length})</span>
            </h2>
            {isTeacher && (
              <Button variant="secondary" icon={<Plus />} onClick={() => setAddOpen(true)}>
                הוספת שיעורים
              </Button>
            )}
          </div>

          {g.lessons.length === 0 ? (
            <EmptyState title="אין שיעורים בקבוצה" />
          ) : (
            <GroupLessonsTable
              lessons={g.lessons}
              canManage={isTeacher}
              onMove={setMovingLesson}
              onDelete={setDeletingLesson}
            />
          )}
        </section>
      </div>

      {/* החלונות עם טופס: קיימים רק כשהם פתוחים, כדי שכל פתיחה תתחיל מטופס נקי */}
      {enrollOpen && (
        <EnrollModal
          onClose={() => setEnrollOpen(false)}
          group={{ id: g.id, name: g.name, price: g.price }}
        />
      )}
      {addOpen && <AddLessonsModal groupId={g.id} onClose={() => setAddOpen(false)} />}
      {movingLesson && <MoveLessonModal lesson={movingLesson} onClose={() => setMovingLesson(null)} />}

      <ConfirmDialog
        isOpen={deletingLesson !== null}
        onClose={() => setDeletingLesson(null)}
        onConfirm={confirmDeleteLesson}
        title="מחיקת שיעור"
        message={
          deletingLesson
            ? `למחוק את השיעור של ${formatLessonTime(deletingLesson.startTime)}? מספר השיעורים בקבוצה יקטן באחד.`
            : ""
        }
        confirmText="מחיקה"
        isLoading={deleteLesson.isPending}
      />

      {isTeacher && <DeleteGroupDialog group={g} isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} />}
    </div>
  );
}