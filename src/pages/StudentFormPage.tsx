import { useNavigate, useParams } from "react-router";
import { isNotFound } from "../api/apiError";
import { useCreateStudent, useStudent, useUpdateStudent } from "../api/students/hook";
import {
    toCreateStudentRequest,
    toStudentFormValues,
    toUpdateStudentRequest,
    type studentFormData,
} from "../api/students/schema";
import PageHeader from "../components/layout/PageHeader";
import StudentForm from "../components/students/StudentForm";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../context/useToast";
import useGoBack from "../lib/useGoBack";

export default function StudentFormPage() {
  const { id } = useParams();
  const studentId = id === undefined ? undefined : Number(id);
  const isEdit = studentId !== undefined;
  const student = useStudent(studentId);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const toast = useToast();
  const navigate = useNavigate();
  const goBack = useGoBack(isEdit ? `/students/${studentId}` : "/students");

  async function handleCreate(values: studentFormData) {
    const created = await createStudent.mutateAsync(toCreateStudentRequest(values));
    toast.success("התלמידה נוספה בהצלחה");
    navigate(`/students/${created.id}`, { replace: true });
  }

  async function handleUpdate(values: studentFormData) {
    if (studentId === undefined) return;
    await updateStudent.mutateAsync({ id: studentId, body: toUpdateStudentRequest(values) });
    toast.success("הפרטים נשמרו");
    navigate(`/students/${studentId}`, { replace: true });
  }

  if (isEdit && student.isPending) return <LoadingState label="טוען את פרטי התלמידה" />;

  if (isEdit && student.isError) {
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

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader title={isEdit ? `עריכת תלמידה: ${student.data?.fullName}` : "תלמידה חדשה"} />

      <StudentForm
        key={studentId ?? "new"}
        isEdit={isEdit}
        defaultValues={student.data ? toStudentFormValues(student.data) : { isActive: true }}
        onSubmit={isEdit ? handleUpdate : handleCreate}
        onCancel={goBack}
      />
    </div>
  );
}