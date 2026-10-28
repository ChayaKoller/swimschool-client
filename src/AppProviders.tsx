import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ToastProvider } from "./context/ToastContext";
import { useToast } from "./context/useToast";
import { createQueryClient } from "./api/queryClient";
import { AuthProvider } from "./context/AuthContext";

function QueryProviders({ children }: { children: ReactNode }) {
  const toast = useToast();

  const [queryClient] = useState(() =>
    createQueryClient(toast.error)
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default function AppProviders({children,}: {children: ReactNode;}) {
  return (
    <ToastProvider>
      <QueryProviders>
        <AuthProvider >
          {children}
        </AuthProvider>
      </QueryProviders>
    </ToastProvider>
  );
}