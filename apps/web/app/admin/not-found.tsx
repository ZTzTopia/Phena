import { Button } from "@phena/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@phena/ui/components/empty";
import { SearchIcon } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchIcon className="size-4" />
          </EmptyMedia>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist. Try searching for what you need
            below.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/admin">
            <Button>Return to Admin Dashboard</Button>
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
