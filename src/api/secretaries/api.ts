import type { CreateSecretaryRequest, SecretaryDto, SetPasswordRequest } from "../../types/typesDtos"
import { http } from "../http"

export async function getSecretaries(){
    const {data}=await http.get<SecretaryDto[]>("/secretaries")
    return data
}
export async function createSecretary(body: CreateSecretaryRequest){
    const {data}=await http.post<SecretaryDto>("/secretaries", body)
    return data
}
export async function deactivateSecretary(id: number){
   await http.delete(`/secretaries/${id}`)
}
export async function setSecretaryPassword({ id, body }: { id: number; body: SetPasswordRequest }){
   await http.put(`/secretaries/${id}/password`, body)
   
}
