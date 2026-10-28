import clsx from "clsx";
import { ClipboardCheck } from "lucide-react";
import { Link } from "react-router";
import { lessonStatus } from "../../lib/attendance";
import { formatTime, isFuture } from "../../lib/format";
import type { LessonDto } from "../../types/typesDtos";
import Badge from "../ui/Badge";

export type ScheduleLessonCardProps = {
    lesson: LessonDto;
};

export default function ScheduleLessonCard({ lesson }: ScheduleLessonCardProps) {
    const status = lessonStatus(lesson);
    const hasStarted = !isFuture(lesson.startTime);

    return (
        <article
            className={clsx(
                "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border-[1.5px] border-line p-4",
                hasStarted ? "bg-white" : "bg-page",
            )}
        >
    
            <span className="w-16 shrink-0 text-2xl font-extrabold text-line tabular-nums">
                {formatTime(lesson.startTime)}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Link
                    to={`/groups/${lesson.groupId}`}
                    className="truncate font-bold text-line underline-offset-2 hover:text-primary-text hover:underline"
                >
                    {lesson.groupName}
                </Link>
                <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={status.tone}>{status.label}</Badge>
                    {lesson.isMakeup && <Badge tone="info">השלמה</Badge>}
                </div>
            </div>

            {hasStarted && (
                <Link
                    to={`/lessons/${lesson.lessonId}/attendance`}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-line bg-pink px-5 text-sm font-semibold whitespace-nowrap text-line shadow-hard transition hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:w-auto [&_svg]:size-4"
                >
                    <ClipboardCheck aria-hidden />
                    {lesson.tookPlace ? "עדכון נוכחות" : "סימון נוכחות"}
                </Link>
            )}
        </article>
    );
}