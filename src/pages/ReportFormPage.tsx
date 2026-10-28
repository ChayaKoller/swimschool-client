import { useNavigate, useParams, useSearchParams } from "react-router";
import { isNotFound } from "../api/apiError";
import { useCreateReport, useDownloadReport, useReport, useReportSettings, useUpdateReport } from "../api/reports/hook";
import { getReportDefaults, toCreateReportRequest, toReportDetails, type ReportFormValues } from "../api/reports/schema";
import PageHeader from "../components/layout/PageHeader";
import ReportForm from "../components/reports/ReportForm";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../context/useToast";
import { formatDateTime } from "../lib/format";
import useGoBack from "../lib/useGoBack";

export default function ReportFormPage() {
  const { id } = useParams();
  const reportId = id === undefined ? undefined : Number(id);
  const isEdit = reportId !== undefined;
  const [searchParams] = useSearchParams();

  const report = useReport(reportId);
  const settings = useReportSettings();
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const downloadReport = useDownloadReport();
  const toast = useToast();
  const navigate = useNavigate();


  const studentParam = searchParams.get("studentId");
  const backTo = isEdit
    ? searchParams.get("from") === "student" && report.data
      ? `/students/${report.data.studentId}`
      : "/reports"
    : studentParam
      ? `/students/${studentParam}`
      : "/reports";
  const goBack = useGoBack(backTo);

  async function handleSave(values: ReportFormValues, download: boolean) {
    const saved =
      reportId === undefined
        ? await createReport.mutateAsync(toCreateReportRequest(values))
        : await updateReport.mutateAsync({ id: reportId, body: toReportDetails(values) });
    toast.success(isEdit ? "הדוח עודכן" : "הדוח נשמר");

    if (download) {

      try {
        await downloadReport.mutateAsync(saved);
      } catch {
        toast.error("הדוח נשמר, אבל ההורדה נכשלה. אפשר להוריד אותו מרשימת הדוחות.");
      }
    }
    navigate(backTo, { replace: true });
  }

  if ((isEdit && report.isPending) || settings.isPending) return <LoadingState label="טוען את הדוח" />;

  if (isEdit && report.isError) {
    return isNotFound(report.error) ? (
      <EmptyState
        title="הדוח לא נמצא"
        description="ייתכן שהתלמידה הועברה למורה אחרת."
        action={
          <Button variant="secondary" onClick={() => navigate("/reports")}>
            לרשימת הדוחות
          </Button>
        }
      />
    ) : (
      <ErrorState error={report.error} onRetry={() => report.refetch()} />
    );
  }

  if (settings.isError) return <ErrorState error={settings.error} onRetry={() => settings.refetch()} />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader title={isEdit ? `תיקון דוח: ${report.data?.studentName}` : "דוח חדש"} />

      {report.data && (
        <p className="-mt-3 mb-6 text-sm text-ink/70">
          הונפק ב-<span className="tabular-nums">{formatDateTime(report.data.issuedAt)}</span> על ידי{" "}
          {report.data.createdByName}. תאריך ההנפקה לא משתנה בתיקון.
        </p>
      )}

      <ReportForm
        key={reportId ?? "new"}
        defaultValues={getReportDefaults(settings.data, report.data, studentParam)}
        settings={settings.data}
        report={report.data}
        onSubmit={handleSave}
        onCancel={goBack}
      />
    </div>
  );
}