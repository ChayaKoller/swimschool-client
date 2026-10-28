import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { getErrorMessage, hasErrorCode } from "../../api/apiError"
import { useDeleteGroup } from "../../api/groups/hook"
import { queryKeys } from "../../api/queryKeys"
import { useToast } from "../../context/useToast"
import type { GroupDetailsDto } from "../../types/typesDtos"
import ConfirmDialog from "../ui/ConfirmDialog"

export type DeleteGroupDialogProps = {
    group: GroupDetailsDto
    isOpen: boolean,
    onClose: () => void,
}
export default function DeleteGroupDialog({ group, isOpen, onClose }: DeleteGroupDialogProps) {
    const toast = useToast()
    const deleteGroup = useDeleteGroup()
    const navigate=useNavigate()
    const queryClient=useQueryClient()
    function handleConfirm() {
        deleteGroup.mutate(
            { id: group.id, version: group.version },
            {
                onSuccess: () => {
                    toast.success("הקבוצה הוסרה");
                    navigate("/groups", { replace: true });
                },
                onError: (error) => {
                    toast.error(getErrorMessage(error));
                    onClose();
                    if (hasErrorCode(error, "DATA_CHANGED")) {
                        queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(group.id) });
                    }
                    
                },
            },
        );
    }
    return (
        <ConfirmDialog isOpen={isOpen} onClose={onClose} title="מחיקת קבוצה" confirmText="מחיקה"
            message={`למחוק את הקבוצה ${group.name} ?קבוצה שהיו בה תלמידות בעבר תועבר לארכיון וההיסטוריה שלה תשמר`}
            tone="danger"
            onConfirm={handleConfirm}
        ></ConfirmDialog>
    )
}