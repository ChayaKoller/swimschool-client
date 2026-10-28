import { ArrowLeftRight, ArrowRight, FilePlus2, Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getErrorMessage, isNotFound } from "../api/apiError";
import { useStudent, useUpdateStudent } from "../api/students/hook";
import { studentFormSchema, toStudentFormValues, toUpdateStudentRequest } from "../api/students/schema";
import CancelEnrollmentDialog from "../components/enrollment/CancelEnrollmentDialog";
import EnrollModal from "../components/enrollment/EnrollModal";
import PaymentModal from "../components/enrollment/PaymentModal";
import PageHeader from "../components/layout/PageHeader";
import DeleteStudentDialog from "../components/students/DeleteStudentDialog";
import StudentGroupsTable from "../components/students/StudentGroupsTable";
import StudentReportsTable from "../components/students/StudentReportsTable";
import TransferStudentModal from "../components/students/TransferStudentModal";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import DetailList from "../components/ui/DetailList";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { ageFrom, formatDate } from "../lib/format";
import { healthFundLabels } from "../lib/labels";
import useGoBack from "../lib/useGoBack";
import type { StudentGroupDto } from "../types/typesDtos";

export default function StudentDetailsPage() {
  const { id } = useParams();
  const studentId = Number(id);
  const student = useStudent(studentId);
  const updateStudent = useUpdateStudent();
  const { user } = useAuth();
  const isTeacher = user?.role === "Teacher";
  const toast = useToast();
  const navigate = useNavigate();
  const goBack = useGoBack("/students");

  // החלונות: false / null = סגור
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [payingRow, setPayingRow] = useState<StudentGroupDto | null>(null);
  const [cancelingRow, setCancelingRow] = useState<StudentGroupDto | null>(null);

  const backButton = (
    <Button variant="ghost" onClick={goBack} icon={<ArrowRight />} className="-ms-3 mb-2 self-start">
      חזרה לרשימה
    </Button>
  );

  if (student.isPending) return <LoadingState label="טוען את פרטי התלמידה" />;

  if (student.isError) {
    return isNotFound(student.error) ? (
      <EmptyState
        title="התלמידה לא נמצאה"
        description="ייתכן שהיא נמחקה או הועברה למורה אחרת."
        action={
          <Button variant="secondary" onClick={() => navigate("/students")}>
            לרשימת התלמידות
          </Button>
        }
      />
    ) : (
      <ErrorState error={student.error} onRetry={() => student.refetch()} />
    );
  }

  const s = student.data;
  const studentRef = { id: s.id, fullName: s.fullName };

  const detailItems = [
    { label: "תעודת זהות", value: <span className="tabular-nums">{s.identityNumber}</span> },
    { label: "טלפון", value: <span dir="ltr" className="tabular-nums">{s.phone}</span> },
    { label: "אימייל", value: s.email && <span dir="ltr">{s.email}</span> },
    { label: "תאריך לידה", value: `${formatDate(s.birthDate)} (גיל ${ageFrom(s.birthDate)})` },
    { label: "קופת חולים", value: healthFundLabels[s.healthFund] },
    { label: "המורה האחראית", value: s.responsibleTeacherName },
    { label: "בקשת שיבוץ", value: s.placementRequest },
  ];

  function reactivate() {
    const values = studentFormSchema.parse({ ...toStudentFormValues(s), isActive: true });
    updateStudent.mutate(
      { id: s.id, body: toUpdateStudentRequest(values) },
      {
        onSuccess: () => {
          toast.success(`${s.fullName} חזרה לפעילות`);
          setConfirmOpen(false);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
          setConfirmOpen(false);
        },
      },
    );
  }

  return (
    <div className="flex flex-col">
      {backButton}

      <PageHeader
        title={s.fullName}
        actions={
          <>
            <Button icon={<UserPlus />} onClick={() => setEnrollOpen(true)} disabled={!s.isActive}>
              רישום לקבוצה
            </Button>
            <Button variant="secondary" icon={<FilePlus2 />} onClick={() => navigate(`/reports/new?studentId=${s.id}`)}>
              דוח חדש
            </Button>
            <Button variant="secondary" icon={<Pencil />} onClick={() => navigate(`/students/${s.id}/edit`)}>
              עריכה
            </Button>
            {isTeacher && (
              <Button variant="secondary" icon={<ArrowLeftRight />} onClick={() => setTransferOpen(true)}>
                העברה למורה אחרת
              </Button>
            )}
            {isTeacher && s.isActive && (
              <Button
                variant="ghost"
                icon={<Trash2 />}
                onClick={() => setDeleteOpen(true)}
                className="text-danger hover:bg-danger/10"
              >
                מחיקה
              </Button>
            )}
          </>
        }
      />

    
      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-2">
        <Badge tone="info">{healthFundLabels[s.healthFund]}</Badge>
        {!s.isActive && <Badge tone="neutral">בארכיון</Badge>}
      </div>


      {!s.isActive && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border-[1.5px] border-line/25 bg-page px-4 py-3">
          <p className="text-sm text-ink/80">
            התלמידה בארכיון ולא מופיעה ברשימה הרגילה. כדי לרשום אותה לקבוצה, יש להחזיר אותה לפעילות.
          </p>
          <Button onClick={() => setConfirmOpen(true)}>החזרה לפעילות</Button>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <Card title="פרטים">
          <DetailList items={detailItems} />
        </Card>

        <StudentGroupsTable
          groups={s.groups}
          onUpdatePayment={setPayingRow}
          onCancel={setCancelingRow}
          onEnroll={s.isActive ? () => setEnrollOpen(true) : undefined}
        />

        <StudentReportsTable studentId={s.id} />
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={reactivate}
        title="החזרה לפעילות"
        message={`להחזיר את ${s.fullName} לפעילות? הרישומים לקבוצות שבוטלו בהעברה לארכיון לא חוזרים, ואפשר לרשום אותה מחדש.`}
        confirmText="החזרה לפעילות"
        tone="primary"
        isLoading={updateStudent.isPending}
      />
      {enrollOpen && <EnrollModal onClose={() => setEnrollOpen(false)} student={studentRef} />}
      {payingRow && <PaymentModal onClose={() => setPayingRow(null)} enrollment={payingRow} student={studentRef} />}
      {cancelingRow && (
        <CancelEnrollmentDialog onClose={() => setCancelingRow(null)} enrollment={cancelingRow} student={studentRef} />
      )}
      {transferOpen && <TransferStudentModal onClose={() => setTransferOpen(false)} student={studentRef} />}
      {deleteOpen && <DeleteStudentDialog isOpen onClose={() => setDeleteOpen(false)} student={studentRef} />}
    </div>
  );
}