import type { GroupAttendanceGridDto, LessonAttendanceDto ,UpdateAttendanceRequest, UpdateGroupAttendanceRequest} from "../../types/typesDtos"
import { http } from "../http"

export async function getLessonAttendance(lessonId:number){
    const {data}=await http.get<LessonAttendanceDto>(`/lessons/${lessonId}/attendance`)
    return data
}

export async function saveLessonAttendance(body: UpdateAttendanceRequest) {
  await http.put("/attendance", body);
}
export async function getGroupAttendance(groupId:number){
    const {data}=await http.get<GroupAttendanceGridDto>(`/groups/${groupId}/attendance`)
    return data
}
export async function saveGroupAttendance({ groupId, body }: { groupId: number; body: UpdateGroupAttendanceRequest }) {
  await http.put(`/groups/${groupId}/attendance`, body);
}