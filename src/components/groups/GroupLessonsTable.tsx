import { ClipboardCheck, Pencil, Trash2 } from "lucide-react";
import { formatLessonTime, isFuture } from "../../lib/format";
import type { LessonDto } from "../../types/typesDtos";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import DataTable, { type Column } from "../ui/DataTable";
import { lessonStatus } from "../../lib/attendance";
import { Link } from "react-router";


export type GroupLessonsTableProps = {
    lessons: LessonDto[];
    canManage: boolean;
    onMove: (lesson: LessonDto) => void;
    onDelete: (lesson: LessonDto) => void;
};

const baseColumns: Column<LessonDto>[] = [
    {
        key: "startTime",
        header: "מועד",
        render: (l) => <span className="whitespace-nowrap text-line tabular-nums">{formatLessonTime(l.startTime)}</span>,
    },
    {
        key: "isMakeup",
        header: "סוג",
        render: (l) => (l.isMakeup ? <Badge tone="info">השלמה</Badge> : <span className="text-slate-500">רגיל</span>),
    },
    {
        key: "status",
        header: "מצב",
        render: (l) => {
            const status = lessonStatus(l);
            return <Badge tone={status.tone}>{status.label}</Badge>;
        },
    },
];


function actionsColumn(onMove: (lesson: LessonDto) => void, onDelete: (lesson: LessonDto) => void,): Column<LessonDto> {
    return {
        key: "actions",
        header: "פעולות",
        render: (l) => (
            <div className="flex items-center gap-1">
                {!isFuture(l.startTime) && (
                    <Link
                        to={`/lessons/${l.lessonId}/attendance`}
                        aria-label={`נוכחות לשיעור של ${formatLessonTime(l.startTime)}`}
                        className="inline-flex min-h-8 items-center gap-2 rounded-full px-2.5 text-sm font-semibold whitespace-nowrap text-primary-text transition hover:bg-primary/10 [&_svg]:size-4"
                    >
                        <ClipboardCheck aria-hidden />
                        נוכחות
                    </Link>
                )}
                {!l.tookPlace && (
                    <>
                       
                        <Button
                        variant="ghost"
                        icon={<Pencil />}
                        aria-label={`הזזת השיעור של ${formatLessonTime(l.startTime)}`}
                        onClick={() => onMove(l)}
                        className="min-h-8 px-2.5"
                    >
                        הזזה
                    </Button>
                    <Button
                        variant="ghost"
                        icon={<Trash2 />}
                        aria-label={`מחיקת השיעור של ${formatLessonTime(l.startTime)}`}
                        onClick={() => onDelete(l)}
                        className="min-h-8 px-2.5 text-danger hover:bg-danger/10"
                    >
                        מחיקה
                    </Button>
                    </>
                )}
            </div>
        ),
        
    };
}
export default function GroupLessonsTable({ lessons, canManage, onMove, onDelete }: GroupLessonsTableProps) {
    const columns = canManage ? [...baseColumns, actionsColumn(onMove, onDelete)] : baseColumns;

    return (
        <DataTable columns={columns} rows={lessons} getRowKey={(l) => l.lessonId} />
    )

}
