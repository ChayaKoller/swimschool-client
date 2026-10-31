import { useState, type FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import { addedDatesMessage, addReportDates, MAX_REPORT_DATES } from "../../api/reports/schema";
import { recurringDates, secondDayError } from "../../lib/recurringDates";
import { formatDate, todayIsrael } from "../../lib/format";
import { useToast } from "../../context/useToast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import FormField from "../form/FormField";
import TextField from "../form/TextField";
import FormError from "../form/FormError";

type FillByScheduleModalProps = {
    timesPerWeek: 1 | 2;
    defaultCount: number;
    currentDates: string[];
    onApply: (dates: string[]) => void;
    onClose: () => void;
};

const FORM_ID = "fill-schedule-form";
const DATE_FORMAT = "YYYY-MM-DD";

export default function FillByScheduleModal({
    timesPerWeek,
    defaultCount,
    currentDates,
    onApply,
    onClose,
}: FillByScheduleModalProps) {
    const [firstDate, setFirstDate] = useState("");
    const [secondDate, setSecondDate] = useState("");
    const [count, setCount] = useState(String(defaultCount));
    const [message, setMessage] = useState<string | null>(null);
    const toast = useToast();

    const today = todayIsrael();
    const isTwice = timesPerWeek === 2;
    const secondError = isTwice ? secondDayError(firstDate, secondDate) : null;

    function findError(total: number): string | null {
        if (!firstDate) return "יש לבחור את תאריך הטיפול הראשון.";
        if (isTwice && !secondDate) return "יש לבחור את תאריך הטיפול הראשון ביום השני.";
        if (secondError) return secondError;
        if (!Number.isInteger(total) || total < 1 || total > MAX_REPORT_DATES) {
            return `יש להזין מספר טיפולים שלם בין 1 ל-${MAX_REPORT_DATES}.`;
        }
        return null;
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const total = Number(count);
        const error = findError(total);
        if (error) {
            setMessage(error);
            return;
        }

        const starts = isTwice ? [firstDate, secondDate] : [firstDate];
        const dates = recurringDates(starts, total, DATE_FORMAT);
        const last = dates[dates.length - 1];
        if (last > today) {
            setMessage(
                `הטיפול האחרון יוצא בתאריך ${formatDate(last)}, וזה אחרי היום. אי אפשר לדווח על טיפול עתידי, כדאי להקטין את מספר הטיפולים.`,
            );
            return;
        }

        const result = addReportDates(currentDates, dates);
        if (!result.ok) {
            setMessage(result.message);
            return;
        }
        onApply(result.dates);
        toast.success(addedDatesMessage(result.added));
        onClose();
    }

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={isTwice ? "מילוי פעמיים בשבוע" : "מילוי פעם בשבוע"}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        ביטול
                    </Button>
                    <Button type="submit" form={FORM_ID} icon={<CalendarDays />}>
                        מילוי
                    </Button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <p className="text-sm text-ink/70">
                    {isTwice
                        ? "בוחרים את הטיפול הראשון בכל אחד משני הימים, וכמה טיפולים בסך הכול. התאריכים יתווספו לדוח, ממוינים ובלי כפילויות."
                        : "בוחרים את תאריך הטיפול הראשון וכמה טיפולים. בכל שבוע יתווסף תאריך באותו יום. התאריכים יתווספו לדוח, ממוינים ובלי כפילויות."}
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField required label={isTwice ? "טיפול ראשון ביום הראשון" : "טיפול ראשון"} htmlFor="scheduleFirst">
                        <TextField
                            id="scheduleFirst"
                            type="date"
                            max={today}
                            value={firstDate}
                            onChange={(event) => setFirstDate(event.target.value)}
                        />
                    </FormField>

                    {isTwice && (
                        <FormField
                            required
                            label="טיפול ראשון ביום השני"
                            htmlFor="scheduleSecond"
                            error={secondError ?? undefined}
                        >
                            <TextField
                                id="scheduleSecond"
                                aria-describedby="scheduleSecond-description"
                                type="date"
                                max={today}
                                invalid={Boolean(secondError)}
                                value={secondDate}
                                onChange={(event) => setSecondDate(event.target.value)}
                            />
                        </FormField>
                    )}

                    <FormField
                        required
                        label="מספר טיפולים"
                        htmlFor="scheduleCount"
                        hint={isTwice ? "סך הכול, בשני הימים יחד" : undefined}
                    >
                        <TextField
                            id="scheduleCount"
                            aria-describedby="scheduleCount-description"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={MAX_REPORT_DATES}
                            className="tabular-nums"
                            value={count}
                            onChange={(event) => setCount(event.target.value)}
                        />
                    </FormField>
                </div>

                <FormError message={message} />
            </form>
        </Modal>
    );
}
