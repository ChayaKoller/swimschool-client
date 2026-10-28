import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GroupFilter } from "../../types/types";
import { queryKeys } from "../queryKeys";
import { createGroup, deleteGroup, getGroup, getGroups, updateGroup } from "./api";


export  function useGroups(filter: GroupFilter) {
    return useQuery({
        queryKey: queryKeys.groups.list(filter),
        queryFn: () => getGroups(filter),
        placeholderData: keepPreviousData
    })
}
export function useGroup(id: number | undefined) {
    return useQuery({
        queryKey: queryKeys.groups.detail(id!),
        queryFn: () => getGroup(id!),
        enabled: id !== undefined
    })
}

export function useCreateGroup() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createGroup,
        onSuccess: (group) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
            queryClient.setQueryData(queryKeys.groups.detail(group.id), group);
        },

    })
}
export function useUpdateGroup() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateGroup,
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(id) })
        }
    })
}
export function useDeleteGroup() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteGroup,
        onSuccess: (_ ,{ id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
            queryClient.removeQueries({ queryKey: queryKeys.groups.detail(id) })
        }
    })
}