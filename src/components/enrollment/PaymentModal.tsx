import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import clsx from "clsx";
import { paymentSchema, type PaymentFormData } from "../../api/enrollments/schema";
import { useUpdatePayment } from "../../api/enrollments/hook";
import { useToast } from "../../context/useToast";
import { formatMoney } from "../../lib/format";
import type { StudentGroupDto } from "../../types/typesDtos";
import { useServerErrors } from "../form/useServerErrors";
import FormField from "../form/FormField";
import TextField from "../form/TextField";
import FormError from "../form/FormError";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export type PaymentModalProps = {
  onClose: () => void;
  enrollment: StudentGroupDto;
  student: { id: number; fullName: string };
};

const CODES = { PAYMENT_ABOVE_DUE: "amountPaid" } as const;
const FORM_ID = "payment-form";

export default function PaymentModal({ onClose, enrollment, student }: PaymentModalProps) {
  const updatePayment = useUpdatePayment();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amountDue: enrollment.amountDue,
      amountPaid: enrollment.amountPaid,
    },
  });
  const { formError, handleServerError } = useServerErrors(setError, CODES);

  const due = useWatch({ control, name: "amountDue" });
  const paid = useWatch({ control, name: "amountPaid" });
  const hasBoth = Number.isFinite(due) && Number.isFinite(paid);
  const balance = hasBoth ? due - paid : 0;

  const onSubmit = async (values: PaymentFormData) => {
    try {
      await updatePayment.mutateAsync({
        id: enrollment.enrollmentId,
        body: { amountDue: values.amountDue, amountPaid: values.amountPaid },
      });
      toast.success("התשלום עודכן");
      onClose();
    } catch (error) {
      handleServerError(error);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="עדכון תשלום"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSubmitting}>
            שמירה
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <p className="rounded-control bg-page px-3 py-2 text-sm text-ink">
          <strong className="font-semibold text-line">{student.fullName}</strong> · {enrollment.groupName}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="סכום לתשלום" htmlFor="amountDue" error={errors.amountDue?.message} required>
            <TextField
              id="amountDue"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              aria-describedby="amountDue-description"
              aria-required
              invalid={!!errors.amountDue}
              className="tabular-nums"
              {...register("amountDue", { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="שולם עד כה" htmlFor="amountPaid" error={errors.amountPaid?.message} required>
            <TextField
              id="amountPaid"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              aria-describedby="amountPaid-description"
              aria-required
              invalid={!!errors.amountPaid}
              className="tabular-nums"
              {...register("amountPaid", { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border-[1.5px] border-line/15 px-4 py-3">
          <p aria-live="polite" className="text-sm text-ink">
            {!hasBoth ? (
              <span className="text-ink/60">יש להזין את שני הסכומים</span>
            ) : balance === 0 ? (
              <span className="font-semibold text-success">שולם במלואו ✓</span>
            ) : (
              <>
                יתרה:{" "}
                <span className={clsx("font-bold tabular-nums", balance < 0 ? "text-danger" : "text-line")}>
                  {formatMoney(balance)}
                </span>
              </>
            )}
          </p>
          <Button
            variant="ghost"
            icon={<Check />}
            disabled={!Number.isFinite(due) || balance === 0}
            onClick={() => setValue("amountPaid", due, { shouldValidate: true, shouldDirty: true })}
          >
            שולם במלואו
          </Button>
        </div>

        <FormError message={formError} />
      </form>
    </Modal>
  );
}