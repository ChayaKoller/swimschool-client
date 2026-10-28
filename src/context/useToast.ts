import { createContext,useContext } from "react";
export type ToastMessage={
    message: string;
    id: string;
    kind: "success" | "error" | "info";
}
export type ToastApi={
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}
export const ToastContext=createContext<ToastApi | null>(null);
export function useToast(): ToastApi {
    const context=useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}