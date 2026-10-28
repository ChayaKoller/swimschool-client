import type { TeacherOptionDto } from "../../types/typesDtos"
import { http } from "../http"

export async function getTeacherOptions(){
    const {data}=await http.get<TeacherOptionDto[]>("/teachers/options")
    return data
}