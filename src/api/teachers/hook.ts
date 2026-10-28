import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { getTeacherOptions } from "./api";

export function useTeacherOptions(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.teacherOptions,
    queryFn: getTeacherOptions,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}