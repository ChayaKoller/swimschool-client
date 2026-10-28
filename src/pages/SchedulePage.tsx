import clsx from "clsx";
import { useNavigate } from "react-router";
import { useWeekLessons } from "../api/lessons/hook";
import { formatShortDate, formatWeekday, formatWeekRange, todayIsrael, toLocalInput } from "../lib/format";
import type { LessonDto } from "../types/typesDtos";
import PageHeader from "../components/layout/PageHeader";
import ScheduleLessonCard from "../components/schedule/ScheduleLessonCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

type ScheduleDay = { date: string; lessons: LessonDto[] };

function groupByDay(lessons: LessonDto[]): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  for (const lesson of lessons) {
    const date = toLocalInput(lesson.startTime).slice(0, 10);
    const last = days.at(-1);
    if (last?.date === date) last.lessons.push(lesson);
    else days.push({ date, lessons: [lesson] });
  }
  return days;
}

export default function SchedulePage() {
  const lessons = useWeekLessons();
  const navigate = useNavigate();

  const header = (
    <>
      <PageHeader title="מערכת השעות" />
      <p className="-mt-3 mb-6 text-sm font-medium text-ink/70 tabular-nums">{formatWeekRange()}</p>
    </>
  );

  if (lessons.isPending) {
    return (
      <>
        {header}
        <LoadingState label="טוען את מערכת השעות" />
      </>
    );
  }

  if (lessons.isError) {
    return (
      <>
        {header}
        <ErrorState error={lessons.error} onRetry={() => lessons.refetch()} />
      </>
    );
  }

  const days = groupByDay(lessons.data);
  const today = todayIsrael();

  return (
    <div className="flex flex-col">
      {header}

      {days.length === 0 ? (
        <EmptyState
          title="אין שיעורים בשבוע הקרוב"
          action={
            <Button variant="secondary" onClick={() => navigate("/groups")}>
              לקבוצות
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {days.map((day) => {
            const isToday = day.date === today;
            const first = day.lessons[0].startTime;

            return (
              <section key={day.date} className="flex flex-col gap-3">
                <h2
                  className={clsx(
                    "flex items-center gap-2 text-lg font-bold",
                    isToday ? "text-primary-text" : "text-ink",
                  )}
                >
                  <span>
                    {formatWeekday(first)}, <span className="tabular-nums">{formatShortDate(first)}</span>
                  </span>
                  {isToday && <Badge tone="info">היום</Badge>}
                </h2>
                <ul className="flex flex-col gap-3">
                  {day.lessons.map((lesson) => (
                    <li key={lesson.lessonId}>
                      <ScheduleLessonCard lesson={lesson} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-sm text-ink/70">
        לעדכון נוכחות בשיעור מימים קודמים: פרטי הקבוצה ← טבלת נוכחות.
      </p>
    </div>
  );
}