import type { GroupFilter } from "../../types/types"
import type { CreateGroupRequest, GroupDetailsDto, GroupDto, GroupDtoPagedResult, UpdateGroupRequest } from "../../types/typesDtos"
import { http } from "../http"

export async function getGroups(filter:GroupFilter){
    const {data}=await http.get<GroupDtoPagedResult>("/groups",{params:filter})
    return data
}
export async function getGroup(id:number){
    const {data}=await http.get<GroupDetailsDto>(`/groups/${id}`)
    return data
}

export async function createGroup(body: CreateGroupRequest) {
    const { data } = await http.post<GroupDetailsDto>("/groups", body);
    return data;
}
export async function updateGroup({body,id}:{id:number,body:UpdateGroupRequest}){
    const {data}=await http.put<GroupDto>(`/groups/${id}` ,body)
    return data
}
export async function deleteGroup({ id, version }: { id: number; version: number }){
    await http.delete(`/groups/${id}` ,{params:{version}})
}