import { useState } from "react";
import { Plus } from "lucide-react";
import { getErrorMessage } from "../api/apiError";
import { useDeactivateSecretary, useSecretaries } from "../api/secretaries/hook";
import { useToast } from "../context/useToast";
import type { SecretaryDto } from "../types/typesDtos";
import PageHeader from "../components/layout/PageHeader";
import AddSecretaryModal from "../components/secretaries/AddSecretaryModal";
import SecretariesTable from "../components/secretaries/SecretariesTable";
import SetSecretaryPasswordModal from "../components/secretaries/SetSecretaryPasswordModal";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";

export default function SecretariesPage() {
    const secretaries = useSecretaries();
    const deactivate = useDeactivateSecretary();
    const toast = useToast();

    const [addOpen, setAddOpen] = useState(false);
    const [passwordFor, setPasswordFor] = useState<SecretaryDto | null>(null);
    const [deactivating, setDeactivating] = useState<SecretaryDto | null>(null);

    const openAdd = () => setAddOpen(true);

    function confirmDeactivate() {
        if (!deactivating) return;
        deactivate.mutate(deactivating.id, {
            onSuccess: () => {
                toast.success(`הגישה של ${deactivating.fullName} בוטלה`);
                setDeactivating(null);
            },
            onError: (error) => {
                toast.error(getErrorMessage(error));
                setDeactivating(null);
            },
        });
    }

    function renderContent() {
        if (secretaries.isPending) return <Skeleton rows={3} />;

        if (secretaries.isError) return <ErrorState error={secretaries.error} onRetry={() => secretaries.refetch()} />;

        if (secretaries.data.length === 0) {
            return (
                <EmptyState
                    title="עוד אין מזכירות"
                    description="מזכירה שתוסיפי תוכל להיכנס עם האימייל והסיסמה שתקבעי לה."
                    action={
                        <Button onClick={openAdd} icon={<Plus />}>
                            הוספת מזכירה ראשונה
                        </Button>
                    }
                />
            );
        }

        return (
            <SecretariesTable
                secretaries={secretaries.data}
                onSetPassword={setPasswordFor}
                onDeactivate={setDeactivating}
            />
        );
    }

    return (
        <div>
            <PageHeader
                title="מזכירות"
                actions={
                    <Button onClick={openAdd} icon={<Plus />}>
                        מזכירה חדשה
                    </Button>
                }
            />
            <p className="-mt-3 mb-6 max-w-2xl text-sm leading-relaxed text-ink/70">
                מזכירה רואה את התלמידות, הקבוצות והדוחות שלך, ויכולה לרשום תלמידות ולהפיק דוחות. היא לא רואה נוכחות, מערכת
                שעות, מזכירות והגדרות.
            </p>

            {renderContent()}

            {/* החלונות עם טופס: קיימים רק כשהם פתוחים, כדי שכל פתיחה תתחיל מטופס ריק */}
            {addOpen && <AddSecretaryModal onClose={() => setAddOpen(false)} />}
            {passwordFor && <SetSecretaryPasswordModal secretary={passwordFor} onClose={() => setPasswordFor(null)} />}

            <ConfirmDialog
                isOpen={deactivating !== null}
                onClose={() => setDeactivating(null)}
                onConfirm={confirmDeactivate}
                title="ביטול גישה"
                message={
                    deactivating
                        ? `${deactivating.fullName} לא תוכל להיכנס יותר למערכת, לתמיד. אי אפשר להחזיר לה את הגישה.`
                        : ""
                }
                confirmText="ביטול הגישה"
                cancelText="חזרה"
                tone="danger"
                isLoading={deactivate.isPending}
            />
        </div>
    );
}