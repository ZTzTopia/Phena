"use client";

import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { DetailedError } from "hono/client";
import { useState } from "react";
import { toast } from "sonner";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      skipGlobalError?: boolean;
    };
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.skipGlobalError) {
              return;
            }

            toast.error(
              error instanceof DetailedError
                ? error.detail.data.error
                : error instanceof Error
                  ? error.message
                  : "An unexpected error occurred",
              {
                id: `query-error-${query.queryHash}`,
              },
            );
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.skipGlobalError) {
              return;
            }

            toast.error(
              error instanceof DetailedError
                ? error.detail.data.error
                : error instanceof Error
                  ? error.message
                  : "An unexpected error occurred",
              {
                id: `mutation-error-${mutation.mutationId}`,
              },
            );
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
