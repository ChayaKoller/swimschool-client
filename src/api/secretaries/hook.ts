import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { createSecretary, deactivateSecretary, getSecretaries, setSecretaryPassword } from "./api";

export function useSecretaries() {
    return useQuery({
        queryKey: queryKeys.secretaries,
        queryFn: getSecretaries

    })
}
export function useCreateSecretary() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createSecretary,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.secretaries })
    })
}
export function useDeactivateSecretary() {
      const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deactivateSecretary,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.secretaries })
    })

}
export function useSetSecretaryPassword() {
 return useMutation({
        mutationFn: setSecretaryPassword,
      
    })
}