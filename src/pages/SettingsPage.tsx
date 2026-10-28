import { useReportSettings } from "../api/reports/hook";
import PageHeader from "../components/layout/PageHeader";
import ReportSettingsForm from "../components/settings/ReportSettingsForm";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

export default function SettingsPage() {
  const settings = useReportSettings();

  function renderContent() {
    if (settings.isPending) return <LoadingState label="טוען את ההגדרות" />;

    if (settings.isError) return <ErrorState error={settings.error} onRetry={() => settings.refetch()} />;

    return <ReportSettingsForm settings={settings.data} />;
  }

  return (
    <div>
      <PageHeader title="הגדרות" />
      <p className="-mt-3 mb-6 max-w-2xl text-sm text-ink/70">
        ההגדרות ממלאות מראש כל דוח חדש. בכל דוח אפשר לשנות אותן, ודוחות שכבר הופקו לא משתנים.
      </p>

      {renderContent()}
    </div>
  );
}