import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { enrollSchema, type EnrollFormData } from "../../api/enrollments/schema";
import { useEnrollStudent } from "../../api/enrollments/hook";
import { hasErrorCode } from "../../api/apiError";
import { queryKeys } from "../../api/queryKeys";
import { useToast } from "../../context/useToast";
import { formatMoney } from "../../lib/format";
import type { GroupDto } from "../../types/typesDtos";
import { useServerErrors } from "../form/useServerErrors";
import FormField from "../form/FormField";
import TextField from "../form/TextField";
import FormError from "../form/FormError";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StudentPicker from "./StudentPicker";
import GroupPicker from "./GroupPicker";

export type EnrollModalProps = {
  onClose: () => void;
  student?: { id: number; fullName: string };
  group?: { id: number; name: string; price: number };
};

const CODES_PICK_GROUP = {
  GROUP_FULL: "groupId",
  SPOT_TAKEN: "groupId",
  GROUP_INACTIVE: "groupId",
  ALREADY_ENROLLED: "groupId",
} as const;
const CODES_PICK_STUDENT = { ALREADY_ENROLLED: "studentId" } as const;
const FORM_ID = "enroll-form";

export default function EnrollModal({ onClose, student, group }: EnrollModalProps) {
  const enroll = useEnrollStudent();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pickedGroup, setPickedGroup] = useState<GroupDto | null>(null);

  const methods = useForm<EnrollFormData>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      studentId: student ? String(student.id) : "",
      groupId: group ? String(group.id) : "",
      amountDue: group?.price,
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;
  const { formError, handleServerError } = useServerErrors(setError, group ? CODES_PICK_STUDENT : CODES_PICK_GROUP);

  function handlePickGroup(picked: GroupDto) {
    setPickedGroup(picked);
    setValue("amountDue", picked.price, { shouldValidate: true });
  }

  const onSubmit = async (values: EnrollFormData) => {
    try {
      const enrollment = await enroll.mutateAsync({
        studentId: Number(values.studentId),
        groupId: Number(values.groupId),
        amountDue: values.amountDue,
      });
      toast.success(`${enrollment.studentName} נרשמה ל${enrollment.groupName}`);
      onClose();
    } catch (error) {
      if (hasErrorCode(error, "GROUP_FULL") || hasErrorCode(error, "SPOT_TAKEN")) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
        const groupId = group?.id ?? pickedGroup?.id;
        if (groupId !== undefined) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
        }
      }
      handleServerError(error);
    }
  };

  const groupPrice = group?.price ?? pickedGroup?.price;
  const priceHint =
    groupPrice === undefined ? undefined : `מחיר הקבוצה: ${formatMoney(groupPrice)}. אפשר לשנות (הנחה)`;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="רישום לקבוצה"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting} icon={<UserPlus />}>
            רישום
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="rounded-control bg-page px-3 py-2 text-sm text-ink">
            {group ? (
              <>
                רישום לקבוצה: <strong className="font-semibold text-line">{group.name}</strong>
              </>
            ) : (
              <>
                רישום של <strong className="font-semibold text-line">{student?.fullName}</strong> לקבוצה
              </>
            )}
          </p>

          {group ? <StudentPicker /> : <GroupPicker onPick={handlePickGroup} />}

          <div className="border-t-[1.5px] border-line/10 pt-4">
            <FormField
              label="סכום לתשלום"
              htmlFor="amountDue"
              error={errors.amountDue?.message}
              hint={priceHint}
              required
            >
              <TextField
                id="amountDue"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                aria-describedby="amountDue-description"
                aria-required
                invalid={!!errors.amountDue}
                className="max-w-48 tabular-nums"
                {...register("amountDue", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormError message={formError} />
        </form>
      </FormProvider>
    </Modal>
  );
}