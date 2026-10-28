import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { addLessons, deleteLesson, getWeekLessons, updateLesson } from "./api";

function useRefreshLessons(groupId: number) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),       // מספר השיעורים בכרטיס
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.week }),     // מערכת השעות (R6)
       queryClient.invalidateQueries({ queryKey: queryKeys.attendance.byGroup(groupId) }), // טבלת הנוכחות (R6)
    ]);
}
export function useAddLessons(groupId:number){
    const refresh = useRefreshLessons(groupId)
    return useMutation({
        mutationFn:addLessons,
        onSuccess: refresh

    })
}
export function useUpdateLesson(groupId:number){
     const refresh = useRefreshLessons(groupId)
    return useMutation({
        mutationFn:updateLesson,
        onSuccess: refresh

    })
}
export function useDeleteLesson(groupId:number){
     const refresh = useRefreshLessons(groupId)
    return useMutation({
        mutationFn:deleteLesson,
        onSuccess: refresh

    })
}
export function useWeekLessons(){
    return useQuery({
        queryKey: queryKeys.lessons.week,
        queryFn: getWeekLessons,
       
      });
}