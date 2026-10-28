import { useMutation } from "@tanstack/react-query";
import { changePassword, login } from "./api";

export function useLogin() {
  return useMutation({ mutationFn: login });
}
export function useChangePassword()	{
    return useMutation({ mutationFn: changePassword })
}
