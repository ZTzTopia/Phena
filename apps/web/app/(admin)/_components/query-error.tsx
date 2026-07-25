import { Button } from "@phena/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@phena/ui/components/empty";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

export function QueryError({
  onRetry,
  message = "Failed to load data",
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <Empty className="py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon className="size-4" />
        </EmptyMedia>
        <EmptyTitle>{message}</EmptyTitle>
        <EmptyDescription>Something went wrong. Please try again.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCwIcon className="size-4" />
            Try Again
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
