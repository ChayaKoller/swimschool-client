import type { EnrollmentDto, EnrollRequest, UpdatePaymentRequest } from "../../types/typesDtos"
import { http } from "../http"

export async function enrollStudent(body:EnrollRequest){
   const {data}=await http.post<EnrollmentDto>("/enrollments",body)
   return data
}
export async function updatePayment({body,id}:{id:number,body:UpdatePaymentRequest}){
    const {data}=await http.put<EnrollmentDto>(`/enrollments/${id}/payment` ,body)
    return data
}
export async function cancelEnrollment( id :number ){
    await http.delete(`/enrollments/${id}` )
}
