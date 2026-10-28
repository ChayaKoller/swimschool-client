import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { useCreateGroup, useGroup, useUpdateGroup } from "../api/groups/hook";
import { getGroupDefaults, toCreateGroupRequest, toUpdateGroupRequest, type GroupFormValues } from "../api/groups/schema";
import { hasErrorCode, isNotFound } from "../api/apiError";
import { useToast } from "../context/useToast";
import useGoBack from "../lib/useGoBack";
import PageHeader from "../components/layout/PageHeader";
import GroupForm from "../components/groups/GroupForm";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

export default function GroupFormPage() {
  const { id } = useParams();
  const groupId = id === undefined ? undefined : Number(id);
  const isEdit = groupId !== undefined;

  const group = useGroup(groupId);
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const toast = useToast();
  const navigate = useNavigate();
  const goBack = useGoBack(isEdit ? `/groups/${groupId}` : "/groups");
  const [staleVersion, setStaleVersion] = useState<number | null>(null);
  
  async function handleCreate(values: GroupFormValues) {
    const created = await createGroup.mutateAsync(toCreateGroupRequest(values));
    toast.success("הקבוצה נוצרה");
    navigate(`/groups/${created.id}`, { replace: true });
  }

  async function handleUpdate(values: GroupFormValues) {
    if (groupId === undefined || !group.data) return;
    const loaded = group.data;

    try {
      await updateGroup.mutateAsync({ id: groupId, body: toUpdateGroupRequest(values, loaded) });
    } catch (error) {
      if (hasErrorCode(error, "DATA_CHANGED")) {
        setStaleVersion(loaded.version);
        return; 
      }
      throw error; 
    }

    toast.success("השינויים נשמרו");
    navigate(`/groups/${groupId}`, { replace: true });
  }

  if (isEdit && group.isPending) return <LoadingState />;

  if (isEdit && group.isError) {
    return isNotFound(group.error) ? (
      <EmptyState
        title="הקבוצה לא נמצאה"
        description="ייתכן שהיא נמחקה."
        action={
          <Button variant="secondary" onClick={() => navigate("/groups")}>
            חזרה לרשימה
          </Button>
        }
      />
    ) : (
      <ErrorState error={group.error} onRetry={() => group.refetch()} />
    );
  }

  const isStale = group.data !== undefined && staleVersion === group.data.version;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PageHeader title={isEdit ? `עדכון קבוצה: ${group.data?.name}` : "קבוצה חדשה"} />

      {isStale && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-control border-[1.5px] border-coral/60 bg-coral/10 px-4 py-3 sm:flex-row sm:items-center"
        >
          <TriangleAlert aria-hidden="true" className="hidden size-5 shrink-0 text-coral sm:block" />
          <p className="flex-1 text-sm text-line">
            <span className="font-semibold">הנתונים של הקבוצה שונו בינתיים.</span> טעינה מחדש תביא את הנתונים
            העדכניים (השינויים שלך לא יישמרו).
          </p>
          <Button
            variant="secondary"
            icon={<RefreshCw />}
            isLoading={group.isFetching}
            onClick={() => group.refetch()}
            className="shrink-0 self-start sm:self-auto"
          >
            טעינה מחדש
          </Button>
        </div>
      )}

      <GroupForm
        key={group.data ? `${groupId}-${group.data.version}` : "new"}
        isEdit={isEdit}
        defaultValues={getGroupDefaults(group.data)}
        enrolledCount={group.data?.enrolledCount}
        onSubmit={isEdit ? handleUpdate : handleCreate}
        onCancel={goBack}
      />
    </div>
  );
}