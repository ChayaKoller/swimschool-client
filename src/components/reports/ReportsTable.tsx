import { Link } from "react-router";
import type { ReportDto } from "../../types/typesDtos";
import { formatDateTime, formatMoney } from "../../lib/format";
import { healthFundLabels, treatmentTypeLabels } from "../../lib/labels";
import DataTable, { type Column } from "../ui/DataTable";
import Badge from "../ui/Badge";
import ReportActions from "./ReportActions";

export type ReportsTableProps = {
    reports: ReportDto[];
    showStudent: boolean;
};

function renderPayer(r: ReportDto) {
    return r.insuranceCompany ? (
        <span className="inline-flex flex-wrap items-center gap-1.5">
            {r.insuranceCompany}
            <Badge tone="info">ביטוח</Badge>
        </span>
    ) : (
        healthFundLabels[r.healthFund]
    );
}

const studentColumn: Column<ReportDto> = {
    key: "student",
    header: "תלמידה",
    render: (r) => (
        <Link
            to={`/students/${r.studentId}`}
            className="font-semibold text-ink underline-offset-4 hover:text-primary-text hover:underline"
        >
            {r.studentName}
        </Link>
    ),
};

const reportColumns: Column<ReportDto>[] = [
    { key: "issuedAt", header: "הונפק", render: (r) => <span className="tabular-nums">{formatDateTime(r.issuedAt)}</span> },
    { key: "payer", header: "משלם", render: renderPayer },
    { key: "treatmentType", header: "סוג", render: (r) => treatmentTypeLabels[r.treatmentType] },
    { key: "count", header: "טיפולים", render: (r) => <span className="tabular-nums">{r.lessonDates.length}</span> },
    {
        key: "totalAmount",
        header: 'סה"כ',
        render: (r) => <span className="font-semibold text-line tabular-nums">{formatMoney(r.totalAmount)}</span>,
    },
    { key: "createdBy", header: 'הופק ע"י', render: (r) => r.createdByName },
];

export default function ReportsTable({ reports, showStudent }: ReportsTableProps) {
    const editTo = (r: ReportDto) => (showStudent ? `/reports/${r.id}/edit` : `/reports/${r.id}/edit?from=student`);

    const actionsColumn: Column<ReportDto> = {
        key: "actions",
        header: "פעולות",
        render: (r) => <ReportActions report={r} editTo={editTo(r)} />,
    };

    const columns = showStudent
        ? [studentColumn, ...reportColumns, actionsColumn]
        : [...reportColumns, actionsColumn];

    return (
        <DataTable
            columns={columns}
            rows={reports}
            getRowKey={(r) => r.id}
            mobileCard={(r) => (
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col gap-0.5">
                            {showStudent && <p className="truncate font-semibold text-ink">{r.studentName}</p>}
                            <p className="text-sm text-ink/70">
                                <span className="tabular-nums">{formatDateTime(r.issuedAt)}</span> · {renderPayer(r)}
                            </p>
                        </div>
                        <span className="shrink-0 font-semibold text-line tabular-nums">{formatMoney(r.totalAmount)}</span>
                    </div>
                    <ReportActions report={r} editTo={editTo(r)} />
                </div>
            )}
        />
    );
}