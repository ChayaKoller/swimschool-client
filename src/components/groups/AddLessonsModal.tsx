import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useAddLessons } from "../../api/lessons/hook";
import { addLessonsSchema, type AddLessonsFormValues } from "../../api/lessons/schema";
import { useToast } from "../../context/useToast";
import { toServerLocal } from "../../lib/format";
import { useServerErrors } from "../form/useServerErrors";
import Checkbox from "../form/Checkbox";
import FormError from "../form/FormError";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import LessonTimesField from "./LessonTimesField";

export type AddLessonsModalProps = {
  groupId: number;
  onClose: () => void;
};

const FORM_ID = "add-lessons-form";

function addedMessage(count: number) {
  return count === 1 ? "נוסף שיעור אחד" : `נוספו ${count} שיעורים`;
}

export default function AddLessonsModal({ groupId, onClose }: AddLessonsModalProps) {
  const addLessons = useAddLessons(groupId);
  const toast = useToast();

  const methods = useForm<AddLessonsFormValues>({
    resolver: zodResolver(addLessonsSchema),
    defaultValues: { lessonTimes: [{ value: "" }], isMakeup: false },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const { handleServerError, formError } = useServerErrors(setError);

  const submit = handleSubmit(async (values) => {
    try {
      await addLessons.mutateAsync({
        groupId,
        body: {
          lessonTimes: values.lessonTimes.map((time) => toServerLocal(time.value)),
          isMakeup: values.isMakeup,
        },
      });
      toast.success(addedMessage(values.lessonTimes.length));
      onClose();
    } catch (error) {
      handleServerError(error);
    }
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="הוספת שיעורים"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting} icon={<Plus />}>
            הוספה
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <form id={FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-5">
          <p className="text-sm text-ink/70">אפשר להוסיף כמה מועדים בבת אחת. מספר השיעורים בקבוצה יגדל בהתאם.</p>

          <LessonTimesField />

          <div className="border-t-[1.5px] border-line/10 pt-4">
            <Checkbox label="שיעור השלמה" {...register("isMakeup")} />
          </div>

          <FormError message={formError} />
        </form>
      </FormProvider>
    </Modal>
  );
}