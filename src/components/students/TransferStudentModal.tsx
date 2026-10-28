import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { ArrowLeftRight } from "lucide-react";
import { transferSchema, type TransferFormData } from "../../api/students/schema";
import { useTransferStudent } from "../../api/students/hook";
import { useTeacherOptions } from "../../api/teachers/hook";
import { isNotFound } from "../../api/apiError";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { useServerErrors } from "../form/useServerErrors";
import FormError from "../form/FormError";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import SearchPicker from "../ui/SearchPicker";

export type TransferStudentModalProps = {
  onClose: () => void;
  student: { id: number; fullName: string };
};

const CODES = { SAME_TEACHER: "newTeacherId" } as const;
const FORM_ID = "transfer-form";

export default function TransferStudentModal({ onClose, student }: TransferStudentModalProps) {
  const transfer = useTransferStudent();
  const teachers = useTeacherOptions(true);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const methods = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: { newTeacherId: "" },
  });
  const {
    handleSubmit,
    setError,
    control,
    formState: { isSubmitting },
  } = methods;
  const { formError, handleServerError } = useServerErrors(setError, CODES);
  const selectedId = useWatch({ control, name: "newTeacherId" });

  const search = query.trim();
  const items = (teachers.data ?? []).filter(
    (t) => t.id !== user?.id && (search === "" || t.fullName.includes(search)),
  );

  const onSubmit = async (values: TransferFormData) => {
    const teacher = teachers.data?.find((t) => String(t.id) === values.newTeacherId);
    try {
      await transfer.mutateAsync({ id: student.id, body: { newTeacherId: Number(values.newTeacherId) } });
      navigate("/students", { replace: true });
      toast.success(`${student.fullName} הועברה ל${teacher?.fullName ?? "מורה אחרת"}`);
    } catch (error) {
      if (isNotFound(error)) void teachers.refetch(); // the teacher was removed meanwhile
      handleServerError(error);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="העברה למורה אחרת"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            isLoading={isSubmitting}
            disabled={!selectedId}
            icon={<ArrowLeftRight />}
          >
            העברה
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="rounded-control bg-page px-3 py-2 text-sm leading-relaxed text-ink">
            <strong className="font-semibold text-line">{student.fullName}</strong> תעבור למורה שתבחרי. אחרי
            ההעברה היא לא תופיע יותר אצלך.
          </p>

          <SearchPicker
            name="newTeacherId"
            label="בחירת מורה"
            placeholder="חיפוש לפי שם"
            query={query}
            onQueryChange={setQuery}
            items={items}
            getKey={(t) => t.id}
            isLoading={teachers.isLoading}
            error={teachers.error}
            emptyText={search ? "לא נמצאה מורה בשם הזה" : "אין מורות אחרות במערכת"}
            renderItem={(t) => (
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-semibold text-line">{t.fullName}</span>
                <span dir="ltr" className="shrink-0 text-xs text-ink/70 tabular-nums">
                  {t.phone}
                </span>
              </div>
            )}
          />

          <FormError message={formError} />
        </form>
      </FormProvider>
    </Modal>
  );
}