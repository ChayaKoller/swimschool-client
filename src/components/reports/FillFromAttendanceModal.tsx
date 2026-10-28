import { useState, type FormEvent } from "react";
import { CalendarCheck } from "lucide-react";
import type { StudentGroupDto } from "../../types/typesDtos";
import { useAttendedDates } from "../../api/reports/hook";
import { MAX_REPORT_DATES, mergeDates } from "../../api/reports/schema";
import { getErrorMessage } from "../../api/apiError";
import { useToast } from "../../context/useToast";
import { seasonLabels } from "../../lib/labels";
import { todayIsrael } from "../../lib/format";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import FormField from "../form/FormField";
import SelectField from "../form/SelectField";
import TextField from "../form/TextField";
import FormError from "../form/FormError";

type FillFromAttendanceModalProps = {
    studentId: number;
    groups: StudentGroupDto[];
    currentDates: string[];
    onApply: (dates: string[]) => void;
    onClose: () => void;
};

const FORM_ID = "fill-dates-form";

export default function FillFromAttendanceModal({
    studentId,
    groups,
    currentDates,
    onApply,
    onClose,
}: FillFromAttendanceModalProps) {
    const [groupId, setGroupId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const attended = useAttendedDates();
    const toast = useToast();

    const today = todayIsrael();
    const rangeInvalid = fromDate !== "" && toDate !== "" && fromDate > toDate;
    const groupOptions = groups.map((g) => ({
        value: String(g.groupId),
        label: `${g.groupName} (${seasonLabels[g.season]} ${g.year})`,
    }));

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setMessage(null);
        attended.mutate(
            {
                studentId,
                filter: {
                    groupId: groupId ? Number(groupId) : undefined,
                    fromDate: fromDate || undefined,
                    toDate: toDate || undefined,
                },
            },
            {
                onSuccess: (found) => {
                    if (found.length === 0) {
                        setMessage("לא נמצאו שיעורים שהתלמידה נכחה בהם בטווח הזה.");
                        return;
                    }
                    const merged = mergeDates(currentDates, found);
                    const added = merged.length - currentDates.length;
                    if (added === 0) {
                        setMessage("כל התאריכים שנמצאו כבר נמצאים בדוח.");
                        return;
                    }
                    if (merged.length > MAX_REPORT_DATES) {
                        setMessage(`יחד עם התאריכים שכבר בדוח יש ${merged.length} תאריכים, ואפשר עד ${MAX_REPORT_DATES}. כדאי לצמצם את הטווח.`);
                        return;
                    }
                    onApply(merged);
                    toast.success(added === 1 ? "נוסף תאריך אחד" : `נוספו ${added} תאריכים`);
                    onClose();
                },
                onError: (error) => toast.error(getErrorMessage(error)),
            },
        );
    }

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="מילוי לפי הנוכחות"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        ביטול
                    </Button>
                    <Button
                        type="submit"
                        form={FORM_ID}
                        isLoading={attended.isPending}
                        disabled={rangeInvalid}
                        icon={<CalendarCheck />}
                    >
                        מילוי
                    </Button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
                <FormField
                    label="קבוצה"
                    htmlFor="fillGroup"
                    hint="בלי בחירה: מכל הקבוצות, גם קודמות."
                >
                    <SelectField
                        id="fillGroup"
                        aria-describedby="fillGroup-description"
                        placeholder="כל הקבוצות"
                        options={groupOptions}
                        value={groupId}
                        onChange={(event) => setGroupId(event.target.value)}
                    />
                </FormField>

                <FormField label="מתאריך" htmlFor="fillFrom">
                    <TextField
                        id="fillFrom"
                        type="date"
                        max={today}
                        value={fromDate}
                        onChange={(event) => setFromDate(event.target.value)}
                    />
                </FormField>

                <FormField
                    label="עד תאריך"
                    htmlFor="fillTo"
                    error={rangeInvalid ? "תאריך הסיום לפני תאריך ההתחלה" : undefined}
                >
                    <TextField
                        id="fillTo"
                        aria-describedby="fillTo-description"
                        type="date"
                        max={today}
                        invalid={rangeInvalid}
                        value={toDate}
                        onChange={(event) => setToDate(event.target.value)}
                    />
                </FormField>

                <FormError message={message} />
            </form>
        </Modal>
    );
}