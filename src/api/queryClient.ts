
import {  QueryClient,MutationCache,} from "@tanstack/react-query";

import { ApiError} from "./apiError";

export function createQueryClient(onGlobalError: (message: string) => void) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,

        retry: (failureCount, error) => {
          if (!(error instanceof ApiError)) {
            return false;
          }

          if (error.status === 0 || error.status >= 500) {
            return failureCount < 2;
          }

          return false;
        },
      },
    },

    mutationCache: new MutationCache({
      onError: (error) => {
        if (!(error instanceof ApiError)) {
          return;
        }

        const status = error.status;

        if (status === 0 || status === 403 ||
            status === 429 || status >= 500) {

          const message =
            status === 403
              ? "אין לך הרשאה לפעולה הזו"
              : error.message;

          const trace =
            status >= 500 && error.traceId
              ? ` (מזהה תקלה: ${error.traceId})`
              : "";

          onGlobalError(message + trace);
        }
      },
    }),
  });
}

