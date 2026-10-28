import { CalendarDays, Sun } from "lucide-react";
import { Link } from "react-router";
import { useWeekLessons } from "../../api/lessons/hook";
import { todayIsrael, toLocalInput } from "../../lib/format";
import ScheduleLessonCard from "../schedule/ScheduleLessonCard";
import Badge from "../ui/Badge";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";

export default function TodayLessons() {
    const lessons = useWeekLessons();
    const today = todayIsrael();
    // undefined בזמן הטעינה, ולכן ?. ולא data ישר
    const todayLessons = lessons.data?.filter((l) => toLocalInput(l.startTime).slice(0, 10) === today);

    function renderContent() {
        if (lessons.isPending) return <LoadingState label="טוען את השיעורים של היום" />;

        if (lessons.isError || !todayLessons) return <ErrorState error={lessons.error} onRetry={() => lessons.refetch()} />;

        if (todayLessons.length === 0) {
            return (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                    <Sun aria-hidden="true" className="size-10 text-coral" strokeWidth={1.5} />
                    <p className="font-semibold text-line">אין שיעורים היום</p>
                    <p className="text-sm text-ink/70">יום חופשי מהבריכה.</p>
                </div>
            );
        }

        return (
            <ul className="flex flex-col gap-3">
                {todayLessons.map((l) => (
                    <li key={l.lessonId}>
                        <ScheduleLessonCard lesson={l} />
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <section
            aria-labelledby="today-title"
            className="flex min-h-0 flex-col overflow-hidden rounded-card border-[1.5px] border-line bg-white animate-fade-up [animation-delay:0.3s]"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-line bg-page/60 px-5 py-3">
                <h2 id="today-title" className="flex items-center gap-2 text-lg font-bold text-ink">
                    <CalendarDays aria-hidden="true" className="size-5 text-primary" />
                    השיעורים של היום
                    {todayLessons && todayLessons.length > 0 && <Badge tone="info">{todayLessons.length}</Badge>}
                </h2>
                <Link
                    to="/schedule"
                    className="text-sm font-semibold text-primary-text underline-offset-2 hover:underline"
                >
                    לכל מערכת השעות
                </Link>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">{renderContent()}</div>
        </section>
    );
}