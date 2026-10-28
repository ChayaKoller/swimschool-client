import { useState } from "react";
import { FormProvider, useForm, useWatch, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, Download, Save } from "lucide-react";
import { useStudent } from "../../api/students/hook";
import { priceFor, reportFormSchema, type ReportFormValues } from "../../api/reports/schema";
import type { ReportDto, ReportSettingsDto, TreatmentType } from "../../types/typesDtos";
import { healthFundLabels, toOptions, treatmentTypeLabels } from "../../lib/labels";
import { formatMoney } from "../../lib/format";
import { useServerErrors } from "../form/useServerErrors";
import UnsavedChangesGuard from "../form/UnsavedChangesGuard";
import FormError from "../form/FormError";
import FormField from "../form/FormField";
import TextField from "../form/TextField";
import Checkbox from "../form/Checkbox";
import RadioGroup from "../form/RadioGroup";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import StudentPicker from "../enrollment/StudentPicker";
import ReportDatesField from "./ReportDatesField";
import FillFromAttendanceModal from "./FillFromAttendanceModal";

export type ReportFormProps = {
    defaultValues: DefaultValues<ReportFormValues>;
    settings: ReportSettingsDto;
    report?: ReportDto;
    onSubmit: (values: ReportFormValues, download: boolean) => Promise<unknown>;
    onCancel: () => void;
};

const CODE_TO_FIELD = { STUDENT_NOT_FOUND: "studentId" } as const;
const TREATMENT_OPTIONS = toOptions(treatmentTypeLabels);

export default function ReportForm({ defaultValues, settings, report, onSubmit, onCancel }: ReportFormProps) {
    const methods = useForm<ReportFormValues>({ resolver: zodResolver(reportFormSchema), defaultValues });
    const {
        register,
        handleSubmit,
        setError,
        setValue,
        getValues,
        control,
        formState: { errors, isSubmitting, isDirty },
    } = methods;

    const { handleServerError, formError } = useServerErrors(setError, CODE_TO_FIELD);
    const [fillOpen, setFillOpen] = useState(false);

    const [studentId, hasInsurance, lessonDates, price] = useWatch({
        control,
        name: ["studentId", "hasInsurance", "lessonDates", "pricePerTreatment"],
    });
    const student = useStudent(studentId ? Number(studentId) : undefined);

    const isEdit = report !== undefined;
    const pickStudent = !isEdit && !defaultValues.studentId; // דוח חדש בלי תלמידה מהכתובת
    const healthFund = report?.healthFund ?? student.data?.healthFund;
    const count = lessonDates.filter((row) => row.date).length;
    const hasPrice = Number.isFinite(price);

    const treatmentRegistration = register("treatmentType", {
        onChange: (event) => {
            const type = event.target.value as TreatmentType;
            const otherType: TreatmentType = type === "Group" ? "Individual" : "Group";
            const current = getValues("pricePerTreatment");
            const newPrice = priceFor(type, settings);
            const wasDefault = !Number.isFinite(current) || current === priceFor(otherType, settings);
            if (newPrice !== null && wasDefault) {
                setValue("pricePerTreatment", newPrice, { shouldValidate: true });
            }
        },
    });


    const save = (download: boolean) =>
        handleSubmit(async (values) => {
            try {
                await onSubmit(values, download);
            } catch (error) {
                handleServerError(error);
            }
        });

    function applyDates(dates: string[]) {
        setValue(
            "lessonDates",
            dates.map((date) => ({ date })),
            { shouldDirty: true, shouldValidate: true },
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={save(false)} noValidate className="flex flex-col gap-6">
                <Card title="למי הדוח">
                    <div className="flex flex-col gap-4">
                        {pickStudent ? (
                            <StudentPicker />
                        ) : (
                            <div className="flex flex-col gap-1">
                                <p className="text-ink/70">
                                    תלמידה:{" "}
                                    <strong className="text-lg font-bold text-ink">
                                        {report?.studentName ?? student.data?.fullName}
                                    </strong>
                                </p>
                                {errors.studentId && (
                                    <p role="alert" className="text-xs font-medium text-danger">
                                        {errors.studentId.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {healthFund && (
                            <p className="flex items-center gap-2 text-sm text-ink/70">
                                קופת חולים: <Badge tone="info">{healthFundLabels[healthFund]}</Badge>
                            </p>
                        )}

                        <Checkbox label="ביטוח פרטי (במקום קופת החולים)" {...register("hasInsurance")} />

                        {hasInsurance && (
                            <FormField
                                label="שם חברת הביטוח"
                                htmlFor="insuranceCompany"
                                error={errors.insuranceCompany?.message}
                                required
                            >
                                <TextField
                                    id="insuranceCompany"
                                    aria-describedby="insuranceCompany-description"
                                    maxLength={100}
                                    invalid={Boolean(errors.insuranceCompany)}
                                    className="sm:max-w-sm"
                                    {...register("insuranceCompany")}
                                />
                            </FormField>
                        )}
                    </div>
                </Card>

                <Card title="הטיפול">
                    <div className="flex flex-col gap-4">
                        <RadioGroup
                            legend="סוג הטיפול"
                            options={TREATMENT_OPTIONS}
                            registration={treatmentRegistration}
                            error={errors.treatmentType?.message}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="מחיר לטיפול"
                                htmlFor="pricePerTreatment"
                                error={errors.pricePerTreatment?.message}
                                hint="ממולא לפי סוג הטיפול מההגדרות. אפשר לשנות (הנחה)."
                                required
                            >
                                <TextField
                                    id="pricePerTreatment"
                                    aria-describedby="pricePerTreatment-description"
                                    type="number"
                                    min={1}
                                    max={10000}
                                    step="any"
                                    inputMode="decimal"
                                    invalid={Boolean(errors.pricePerTreatment)}
                                    {...register("pricePerTreatment", { valueAsNumber: true })}
                                />
                            </FormField>

                            <FormField
                                label="תיאור השירות"
                                htmlFor="serviceDescription"
                                error={errors.serviceDescription?.message}
                                hint='מודפס בדוח בשורה "עבור"'
                                required
                            >
                                <TextField
                                    id="serviceDescription"
                                    aria-describedby="serviceDescription-description"
                                    maxLength={100}
                                    invalid={Boolean(errors.serviceDescription)}
                                    {...register("serviceDescription")}
                                />
                            </FormField>
                        </div>
                    </div>
                </Card>

                <Card
                    title="תאריכי הטיפולים"
                    actions={
                        <Button
                            variant="secondary"
                            icon={<CalendarCheck />}
                            onClick={() => setFillOpen(true)}
                            disabled={!student.data}
                        >
                            מילוי לפי הנוכחות
                        </Button>
                    }
                >
                    <ReportDatesField />
                </Card>

                <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-line bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                    <p aria-live="polite" className="font-semibold text-ink tabular-nums">
                        {hasPrice ? (
                            <>
                                {count === 1 ? "טיפול אחד" : `${count} טיפולים`} × {formatMoney(price)} ={" "}
                                <span className="text-lg font-black">{formatMoney(count * price)}</span>
                            </>
                        ) : (
                            <>
                                {count} טיפולים. <span className="text-danger">יש להזין מחיר לטיפול.</span>
                            </>
                        )}
                    </p>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                            ביטול
                        </Button>
                        <Button variant="secondary" type="submit" isLoading={isSubmitting} icon={<Save />}>
                            שמירה
                        </Button>
                        <Button onClick={save(true)} isLoading={isSubmitting} icon={<Download />}>
                            שמירה והורדת PDF
                        </Button>
                    </div>
                </div>

                <FormError message={formError} />
            </form>

            {fillOpen && student.data && (
                <FillFromAttendanceModal
                    studentId={student.data.id}
                    groups={student.data.groups}
                    currentDates={lessonDates.map((row) => row.date).filter(Boolean)}
                    onApply={applyDates}
                    onClose={() => setFillOpen(false)}
                />
            )}

            <UnsavedChangesGuard when={isDirty && !isSubmitting} />
        </FormProvider>
    );
}