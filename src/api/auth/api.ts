import type { AuthResponse, ChangePasswordRequest, CurrentUserDto, LoginRequest } from "../../types/typesDtos";
import { http } from "../http";
import { setToken } from "../tokenStorage";

export async function login(values:LoginRequest){
   
    const response=await http.post<AuthResponse>("/auth/login",values)
    
    if(response.data.token)
    {
        setToken(response.data.token)
    }
    return response.data
}
export async function getMe() {
  const { data } = await http.get<CurrentUserDto>("/auth/me");
  return data;
}

export async function changePassword(values: ChangePasswordRequest) {
  const response = await http.post<AuthResponse>("/auth/change-password", values);
  return response.data;
}