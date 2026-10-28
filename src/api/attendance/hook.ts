import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { getGroupAttendance, getLessonAttendance, saveGroupAttendance, saveLessonAttendance } from "./api";

function useRefreshAttendance() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.details }),
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.week }),
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all }),
    ]);
}
export function useLessonAttendance(lessonId:number){
    return useQuery({
        queryKey:queryKeys.attendance.lesson(lessonId),
        queryFn:()=>getLessonAttendance(lessonId)

    })
}
export function useGroupAttendance(groupId:number){
    return useQuery({
        queryKey:queryKeys.attendance.byGroup(groupId),
        queryFn:()=>getGroupAttendance(groupId)

    })
}
export function useSaveLessonAttendance() {
    const refresh = useRefreshAttendance()
    return (
        useMutation({
            mutationFn: saveLessonAttendance,
            onSettled: refresh
        })
    )
}
export function useSaveGroupAttendance() {
    const refresh = useRefreshAttendance()
    return (
        useMutation({
            mutationFn: saveGroupAttendance,
            onSettled: refresh
        })
    )
}
