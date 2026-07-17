"use client";

import { Button } from "@phena/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@phena/ui/components/empty";
import { AlertTriangleIcon } from "lucide-react";

export function AdminError({
  error,
  unstable_retry,
  description = "An unexpected error occurred while loading this page.",
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  description?: string;
}) {
  const handleRetry = unstable_retry ?? (() => window.location.reload());

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon className="size-4" />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={handleRetry}>Try Again</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
