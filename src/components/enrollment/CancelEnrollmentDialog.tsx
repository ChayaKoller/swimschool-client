import { getErrorMessage } from "../../api/apiError";
import { useCancelEnrollment } from "../../api/enrollments/hook";
import { useToast } from "../../context/useToast";
import type { StudentGroupDto } from "../../types/typesDtos";
import ConfirmDialog from "../ui/ConfirmDialog";

export type CancelEnrollmentDialogProps = {
  onClose: () => void;
  enrollment: StudentGroupDto;
  student: { id: number; fullName: string };
};

export default function CancelEnrollmentDialog({ onClose, enrollment, student }: CancelEnrollmentDialogProps) {
  const cancel = useCancelEnrollment();
  const toast = useToast();

  function handleConfirm() {
    cancel.mutate(
      { id: enrollment.enrollmentId, studentId: student.id, groupId: enrollment.groupId },
      {
        onSuccess: () => {
          toast.success("הרישום בוטל");
          onClose();
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
          onClose();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={handleConfirm}
      tone="danger"
      title="ביטול רישום"
      confirmText="ביטול רישום"
      cancelText="חזרה"
      isLoading={cancel.isPending}
      message={`לבטל את הרישום של ${student.fullName} ל${enrollment.groupName}? המקום בקבוצה יתפנה. התשלומים והנוכחות נשמרים.`}
    />
  );
}