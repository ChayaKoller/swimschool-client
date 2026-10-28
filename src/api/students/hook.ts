import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createStudent, deleteStudent, getStudentById, getStudentReports, getStudents, transferStudent, updateStudent } from "./api"
import type { StudentFilter } from "../../types/types"
import { queryKeys } from "../queryKeys"

export function useStudents(filter:StudentFilter){
   return useQuery({
        queryKey:queryKeys.students.list(filter),
        queryFn:()=>getStudents(filter),
        placeholderData: keepPreviousData
    })
}
export function useStudent(id:number|undefined){
   return useQuery({
        queryKey:queryKeys.students.detail(id!),
        queryFn:()=>getStudentById(id!),
        enabled: id !== undefined
    })
}
export function useStudentReports(id:number|undefined){
   return useQuery({
        queryKey:queryKeys.students.reports(id!),
        queryFn:()=>getStudentReports(id!),
        enabled: id !== undefined
    })
}
export function useCreateStudent(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:createStudent,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
    })
}
export function useUpdateStudent(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:updateStudent,
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) })
        }
    })
}
function useRemoveStudent() {
  const queryClient = useQueryClient();
  return (id: number) => {
    queryClient.removeQueries({ queryKey: queryKeys.students.detail(id) });
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.details }),
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
    ]);
  };
}
export function useTransferStudent() {
  const removeStudent = useRemoveStudent();
  return useMutation({
    mutationFn: transferStudent,
    onSuccess: (_, { id }) => removeStudent(id),
  });
}
export function useDeleteStudent(){
const removeStudent = useRemoveStudent();
  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: (_,  id ) => removeStudent(id),
  });
}


