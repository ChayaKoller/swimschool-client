import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Save } from "lucide-react";
import { useUpdateLesson } from "../../api/lessons/hook";
import { moveLessonSchema, type MoveLessonFormValues } from "../../api/lessons/schema";
import { useToast } from "../../context/useToast";
import { formatLessonTime, formatLocalLessonTime, toLocalInput, toServerLocal } from "../../lib/format";
import type { LessonDto } from "../../types/typesDtos";
import { useServerErrors } from "../form/useServerErrors";
import FormError from "../form/FormError";
import FormField from "../form/FormField";
import TextField from "../form/TextField";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export type MoveLessonModalProps = {
  lesson: LessonDto;
  onClose: () => void;
};

const FORM_ID = "move-lesson-form";

export default function MoveLessonModal({ lesson, onClose }: MoveLessonModalProps) {
  const updateLesson = useUpdateLesson(lesson.groupId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MoveLessonFormValues>({
    resolver: zodResolver(moveLessonSchema),
    defaultValues: { startTime: toLocalInput(lesson.startTime) },
  });

  const { handleServerError, formError } = useServerErrors(setError);

  const submit = handleSubmit(async (values) => {
    try {
      await updateLesson.mutateAsync({
        id: lesson.lessonId,
        body: { startTime: toServerLocal(values.startTime) },
      });
      toast.success(`השיעור הוזז ל${formatLocalLessonTime(values.startTime)}`);
      onClose();
    } catch (error) {
      handleServerError(error);
    }
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="הזזת שיעור"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting} icon={<Save />}>
            שמירה
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-4">
        <p className="flex items-center gap-2 rounded-control bg-page px-3 py-2 text-sm text-line">
          <CalendarClock aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span>
            המועד הנוכחי: <span className="font-semibold tabular-nums">{formatLessonTime(lesson.startTime)}</span>
          </span>
        </p>

        <FormField required label="מועד חדש" htmlFor="startTime" error={errors.startTime?.message}>
          <TextField
            id="startTime"
            type="datetime-local"
            aria-describedby="startTime-description"
            invalid={Boolean(errors.startTime)}
            autoFocus
            {...register("startTime")}
          />
        </FormField>

        <FormError message={formError} />
      </form>
    </Modal>
  );
}