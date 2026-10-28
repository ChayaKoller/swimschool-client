import type { AuthResponse, CurrentUserDto } from "../types/typesDtos";

export type AuthApi={
    token: string|null,
    user: CurrentUserDto|null,
    isLoading:boolean,
    sessionExpired:boolean,
    signIn:(response: AuthResponse) => void,
    logout:()=>void

}
import { createContext, useContext } from "react";

export const AuthContext = createContext<AuthApi | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}