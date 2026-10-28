
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { useStudentReports } from "../../api/students/hook";
import ReportsTable from "../reports/ReportsTable";

type StudentReportsTableProps = {
  studentId: number;
};



export default function StudentReportsTable({ studentId }: StudentReportsTableProps) {
  const reports = useStudentReports(studentId);

  function renderContent() {
    if (reports.isPending) return <LoadingState label="טוען דוחות" />;

    if (reports.isError) return <ErrorState error={reports.error} onRetry={() => reports.refetch()} />;

    if (reports.data.length === 0) return <EmptyState title="עוד לא הופקו דוחות" />;

    return <ReportsTable reports={reports.data} showStudent={false} />;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-ink">דוחות</h2>
      {renderContent()}
    </section>
  );
}