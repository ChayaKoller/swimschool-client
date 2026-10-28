import  { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./useAuth";
import { getToken, removeToken, setToken } from "../api/tokenStorage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { getMe } from "../api/auth/api";
import type { AuthResponse } from "../types/typesDtos";
import { setUnauthorizedHandler } from "../api/http";

interface AuthProviderProps{
    children:ReactNode
}
export  function AuthProvider({children}:AuthProviderProps){
    
  const [token, setTokenState] = useState<string | null>(
  () => getToken());

   const [sessionExpired, setSessionExpired] = useState(false);
   const meQuery=useQuery({
    queryKey:queryKeys.auth.me,
    queryFn:getMe,
    enabled:token!==null,
    staleTime:Infinity,
    retry: false,
   })
   
const user = token !== null
  ? meQuery.data ?? null
  : null;

const isLoading = token !== null && meQuery.isPending;

const queryClient = useQueryClient();

const signIn = useCallback((response: AuthResponse) => {
  setToken(response.token);

  queryClient.setQueryData(
    queryKeys.auth.me,
    response.user
  );

  setTokenState(response.token);
  setSessionExpired(false);
}, [queryClient]);
const logout=useCallback(()=>{
    removeToken();
    queryClient.clear();
    setTokenState(null);
    setSessionExpired(false);

},[queryClient])

const expire = useCallback(() => {
  logout();
  setSessionExpired(true);
}, [logout]);
useEffect(()=>{
    setUnauthorizedHandler(expire)
    return ()=>setUnauthorizedHandler(null);
},[expire]);
const value=useMemo(()=>({
   token,
  user,
  isLoading,
  sessionExpired,
  signIn,
  logout, 
}),[token,
  user,
  isLoading,
  sessionExpired,
  signIn,
  logout
])

return(
    <AuthContext.Provider value={value}>
    {children}
    </AuthContext.Provider>
)


}