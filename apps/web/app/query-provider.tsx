"use client";

import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { DetailedError } from "hono/client";
import { useState } from "react";
import { toast } from "sonner";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      skipGlobalError?: boolean;
      extraErrorMessage?: string;
    };
  }
}

function formatApiError(error: unknown): string {
  if (Array.isArray(error)) {
    return error.map((e) => (typeof e === "string" ? e : (e?.message ?? String(e)))).join(", ");
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

// TODO: When in production, remove the verbose error messages
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.skipGlobalError) {
              return;
            }

            const extraErrorMessage = query.meta?.extraErrorMessage as string | undefined;
            const message =
              error instanceof DetailedError
                ? formatApiError(error.detail.data.error)
                : error instanceof Error
                  ? error.message
                  : (extraErrorMessage ?? "An unexpected error occurred");

            console.error(message);
            toast.error(message, {
              id: `query-error-${query.queryHash}`,
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.skipGlobalError) {
              return;
            }

            const extraErrorMessage = mutation.meta?.extraErrorMessage as string | undefined;
            const message =
              error instanceof DetailedError
                ? formatApiError(error.detail.data.error)
                : error instanceof Error
                  ? error.message
                  : (extraErrorMessage ?? "An unexpected error occurred");

            console.error(message);
            toast.error(message, {
              id: `mutation-error-${mutation.mutationId}`,
            });
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
