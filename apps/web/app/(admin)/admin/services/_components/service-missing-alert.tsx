"use client";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@phena/ui/components/alert";
import { Button } from "@phena/ui/components/button";
import { Skeleton } from "@phena/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { client } from "@/lib/api-client";

interface MissingService {
  teamId: number;
  teamName: string | null;
  challengeId: number;
  challengeTitle: string | null;
}

interface MissingServicesResponse {
  missing: MissingService[];
}

export function MissingServicesAlert({
  onAutoCreate,
  isAutoCreating,
}: {
  onAutoCreate: () => void;
  isAutoCreating: boolean;
}) {
  const { data: missingData, isLoading } = useQuery({
    queryKey: ["admin", "services", "missing"],
    queryFn: async () => {
      const res = await parseResponse(client.api.services.missing.$get());
      return res as MissingServicesResponse;
    },
  });

  const missingCount = missingData?.missing?.length ?? 0;

  if (isLoading) {
    return (
      <div className="mx-4 lg:mx-6">
        <Skeleton>
          <Alert>
            <AlertTriangle />
            <AlertTitle>Loading...</AlertTitle>
            <AlertDescription>Fetching missing services...</AlertDescription>
          </Alert>
        </Skeleton>
      </div>
    );
  }

  if (missingCount === 0) {
    return (
      <div className="mx-4 lg:mx-6">
        <Alert>
          <CheckCircle2 />
          <AlertTitle>All team-challenge pairs have services. No missing services.</AlertTitle>
          <AlertDescription>
            Teams and challenges exist without corresponding services.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-4 lg:mx-6">
      <Alert>
        <AlertTriangle />
        <AlertTitle>
          {missingCount} missing service{missingCount !== 1 ? "s" : ""} detected
        </AlertTitle>
        <AlertDescription>
          Teams and challenges exist without corresponding services.
        </AlertDescription>
        <AlertAction>
          <Button size="xs" onClick={onAutoCreate} disabled={isAutoCreating}>
            {isAutoCreating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Auto-create Missing Services"
            )}
          </Button>
        </AlertAction>
      </Alert>
    </div>
    // <div className="mx-4 flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 lg:mx-6">
    //   <div className="flex items-center gap-2">
    //     <AlertTriangle className="size-5" />
    //     <span className="text-sm font-medium">
    //       {missingCount} missing service{missingCount !== 1 ? "s" : ""} detected. Teams and
    //       challenges exist without corresponding services.
    //     </span>
    //   </div>
    //   <button
    //     onClick={onAutoCreate}
    //     disabled={isAutoCreating}
    //     className="flex items-center gap-2 rounded-md bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
    //   >
    //     {isAutoCreating ? (
    //       <>
    //         <Loader2 className="size-4 animate-spin" />
    //         Creating...
    //       </>
    //     ) : (
    //       "Auto-create Missing Services"
    //     )}
    //   </button>
    // </div>
  );
}
