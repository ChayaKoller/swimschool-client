import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelEnrollment, enrollStudent, updatePayment } from "./api";
import { queryKeys } from "../queryKeys";

function useRefreshEnrollments() {
    const queryClient = useQueryClient();
    return ({ studentId, groupId }: { studentId: number; groupId: number }) =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.attendance.byGroup(groupId) }),
        ]);
}
export function useEnrollStudent() {
    const refresh = useRefreshEnrollments()
    return (
        useMutation({
            mutationFn: enrollStudent,
            onSuccess: (enrollment) => refresh({ studentId: enrollment.studentId, groupId: enrollment.groupId })
        })
    )
}
export function useUpdatePayment() {
    const refresh = useRefreshEnrollments()
    return useMutation({
        mutationFn: updatePayment,
        onSuccess: (enrollment) => refresh({ studentId: enrollment.studentId, groupId: enrollment.groupId }),

    })
}
export function useCancelEnrollment() {
    const refresh = useRefreshEnrollments()
    return useMutation({
        mutationFn: ({ id }: { id: number; studentId: number; groupId: number }) => cancelEnrollment(id),
        onSuccess: (_, variables) => refresh(variables),

    })
}