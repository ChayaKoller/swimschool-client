import type {  AddLessonsRequest, LessonDto, UpdateLessonRequest } from "../../types/typesDtos";
import { http } from "../http";

export async function addLessons({groupId,body}:{groupId:number,body:AddLessonsRequest}){
    const {data}=await http.post<LessonDto[]>(`/groups/${groupId}/lessons`,body)
    return data
}

export async function updateLesson({body,id}:{id:number,body:UpdateLessonRequest}){
    const {data}=await http.put<LessonDto>(`/lessons/${id}` ,body)
    return data
}
export async function deleteLesson( id :number ){
    await http.delete(`/lessons/${id}` )
}
export async function getWeekLessons(){
    const {data}=await http.get<LessonDto[]>(`/lessons/week`)
    return data
}