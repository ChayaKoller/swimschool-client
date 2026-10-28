import { Link } from "react-router";
import { Download, Eye, Pencil } from "lucide-react";
import { getErrorMessage } from "../../api/apiError";
import { useDownloadReport, usePreviewReport } from "../../api/reports/hook";
import { useToast } from "../../context/useToast";
import type { ReportDto } from "../../types/typesDtos";
import Button from "../ui/Button";

export type ReportActionsProps = {
  report: ReportDto;
  editTo: string;
};

// כפתורים קטנים ושקופים, שמתאימים לשורה בטבלה
const actionClasses = "min-h-8 px-2.5";

export default function ReportActions({ report, editTo }: ReportActionsProps) {
  const download = useDownloadReport();
  const preview = usePreviewReport();
  const toast = useToast();

  function handleDownload() {
    download.mutate(report, { onError: (error) => toast.error(getErrorMessage(error)) });
  }

  function handlePreview() {
    const tab = window.open("", "_blank");
    if (!tab) {
      toast.error("הדפדפן חסם את הלשונית החדשה. אפשר לאשר חלונות קופצים לאתר, או להוריד את הקובץ.");
      return;
    }
    preview.mutate({ reportId: report.id, tab }, { onError: (error) => toast.error(getErrorMessage(error)) });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button
        variant="ghost"
        icon={<Download />}
        onClick={handleDownload}
        isLoading={download.isPending}
        aria-label={`הורדת הדוח של ${report.studentName}`}
        className={actionClasses}
      >
        הורדה
      </Button>
      <Button
        variant="ghost"
        icon={<Eye />}
        onClick={handlePreview}
        isLoading={preview.isPending}
        aria-label={`תצוגה של הדוח של ${report.studentName}`}
        className={actionClasses}
      >
        תצוגה
      </Button>
      <Link
        to={editTo}
        aria-label={`תיקון הדוח של ${report.studentName}`}
        className="inline-flex min-h-8 items-center gap-2 rounded-full px-2.5 text-sm font-semibold whitespace-nowrap text-primary-text transition hover:bg-primary/10 [&_svg]:size-4"
      >
        <Pencil aria-hidden />
        תיקון
      </Link>
    </div>
  );
}